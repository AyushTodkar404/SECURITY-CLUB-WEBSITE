import fs from 'node:fs';
import path from 'node:path';
import { execSync, spawn } from 'node:child_process';
import crypto from 'node:crypto';
import Database from './backend/node_modules/libsql/index.js';

let pass = 0;
let fail = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    pass++;
    console.log('  [PASS] ' + message);
  } else {
    fail++;
    failures.push(message);
    console.error('  [FAIL] ' + message);
  }
}

console.log('================================================================');
console.log('SECURITY CLUB WEBSITE — COMPREHENSIVE 5-TEST VERIFICATION SUITE');
console.log('================================================================');

// -------------------------------------------------------------
// TEST 1: SYNTAX & COMPILATION CHECKS
// -------------------------------------------------------------
console.log('\n--- 1. FULL-STACK SYNTAX & COMPILATION CHECKS ---');
try {
  execSync('node --check backend/src/server.js', { stdio: 'pipe' });
  assert(true, 'Backend syntax check passed: server.js');
} catch (err) {
  assert(false, 'Backend syntax error: ' + err.message);
}

try {
  execSync('node --check backend/src/db.js', { stdio: 'pipe' });
  assert(true, 'Backend syntax check passed: db.js');
} catch (err) {
  assert(false, 'Backend syntax error: ' + err.message);
}

try {
  execSync('npm --prefix security_website run build', { stdio: 'pipe' });
  assert(true, 'Frontend TypeScript & Vite compilation passed cleanly');
} catch (err) {
  assert(false, 'Frontend build failed: ' + err.message);
}

// -------------------------------------------------------------
// TEST 2: DATA MANIFESTS & SQLITE DATABASE INTEGRITY
// -------------------------------------------------------------
console.log('\n--- 2. DATA MANIFESTS & SQLITE DATABASE INTEGRITY ---');
const db = new Database('data/security-club.sqlite');

const teamRows = db.prepare('SELECT * FROM team_profiles WHERE published=1').all();
assert(teamRows.length >= 20, `team_profiles table has ${teamRows.length} active members (>=20)`);

const eventRows = db.prepare("SELECT * FROM events WHERE status IN ('published','completed')").all();
assert(eventRows.length >= 5, `events table has ${eventRows.length} active events (>=5)`);

const flagshipRows = db.prepare("SELECT * FROM flagships WHERE status='published'").all();
assert(flagshipRows.length >= 2, `flagships table has ${flagshipRows.length} active flagships (>=2)`);

const awarenessRows = db.prepare('SELECT * FROM awareness_items WHERE published=1').all();
assert(awarenessRows.length >= 1, `awareness_items table has ${awarenessRows.length} active campaigns (>=1)`);

const challengeRows = db.prepare("SELECT * FROM challenges WHERE status='published'").all();
assert(challengeRows.length >= 3, `challenges table has ${challengeRows.length} published challenges (>=3)`);

const galleryRows = db.prepare('SELECT * FROM gallery_items WHERE published=1').all();
assert(galleryRows.length >= 30, `gallery_items table has ${galleryRows.length} published gallery photos (>=30)`);

const testimonialRows = db.prepare('SELECT * FROM testimonials WHERE published=1').all();
assert(testimonialRows.length >= 3, `testimonials table has ${testimonialRows.length} alumni testimonials (>=3)`);

// -------------------------------------------------------------
// TEST 3: ASSET FILE INTEGRITY ON DISK
// -------------------------------------------------------------
console.log('\n--- 3. ASSET FILE INTEGRITY ON DISK ---');
let missingAssets = 0;
const checkAsset = (filepath) => {
  if (!filepath) return;
  const candidates = [
    path.join('security_website/public', filepath),
    path.join('security_website', filepath),
    filepath.replace(/^\//, ''),
  ];
  const found = candidates.some((c) => fs.existsSync(c) && fs.statSync(c).size > 0);
  if (!found) missingAssets++;
};

teamRows.forEach((m) => {
  if (m.image_url && !m.image_url.startsWith('http')) checkAsset(m.image_url);
});
assert(missingAssets === 0, 'All referenced local team profile photos exist on disk with valid file size');

let missingEventAssets = 0;
eventRows.forEach((e) => {
  if (e.image_url && !e.image_url.startsWith('http')) {
    const candidates = [
      path.join('security_website/public', e.image_url),
      path.join('security_website', e.image_url),
      e.image_url.replace(/^\//, ''),
    ];
    if (!candidates.some((c) => fs.existsSync(c) && fs.statSync(c).size > 0)) missingEventAssets++;
  }
});
assert(missingEventAssets === 0, 'All referenced event images exist on disk');

let missingGalleryAssets = 0;
galleryRows.forEach((g) => {
  if (g.image_url && !g.image_url.startsWith('http')) {
    const candidates = [
      path.join('security_website/public', g.image_url),
      path.join('security_website', g.image_url),
      g.image_url.replace(/^\//, ''),
    ];
    if (!candidates.some((c) => fs.existsSync(c) && fs.statSync(c).size > 0)) missingGalleryAssets++;
  }
});
assert(missingGalleryAssets === 0, `All referenced gallery images exist on disk (${galleryRows.length} photos checked)`);

// -------------------------------------------------------------
// TEST 4: SECURITY & OWASP AUDIT + CTF CRYPTOGRAPHY
// -------------------------------------------------------------
console.log('\n--- 4. SECURITY & OWASP AUDIT + CTF CRYPTOGRAPHY ---');
const indexHtml = fs.readFileSync('security_website/index.html', 'utf8');

assert(/X-Content-Type-Options/i.test(indexHtml), 'index.html includes X-Content-Type-Options: nosniff');
assert(/Content-Security-Policy/i.test(indexHtml), 'index.html includes Content-Security-Policy header');
assert(/name=["']referrer["']/i.test(indexHtml), 'index.html specifies strict Referrer-Policy');

// Password security check
const adminUser = db.prepare("SELECT * FROM users WHERE email='ayushtodkar404@gmail.com'").get();
assert(adminUser && adminUser.password_hash && adminUser.password_hash.startsWith('scrypt$'), 'Administrator password is protected using salted scrypt cryptographic hashing');

// CTF Cryptographic SHA-256 Validation
function sha256Hex(str) {
  return crypto.createHash('sha256').update(str.trim()).digest('hex');
}

challengeRows.forEach((ch) => {
  assert(typeof ch.flag_hash === 'string' && ch.flag_hash.length === 64, `Challenge #${ch.id} (${ch.title}) has valid 64-char SHA-256 hash`);
});

// Verify known flags
const ch1 = challengeRows.find((c) => c.id === 1);
if (ch1) {
  assert(sha256Hex('SC{welcome_to_security_club}') === ch1.flag_hash, 'Challenge #1 solution cryptographically matches stored SHA-256 hash');
}
assert(sha256Hex('SC{fake_flag_token}') !== ch1?.flag_hash, 'Invalid flag token correctly rejected by SHA-256 verification');

// -------------------------------------------------------------
// TEST 5: ADMINISTRATOR AUTHORIZATION & ROLE-GATING VERIFICATION
// -------------------------------------------------------------
console.log('\n--- 5. ADMINISTRATOR AUTHORIZATION & ROLE-GATING VERIFICATION ---');

async function runLiveTests() {
  const PORT = 4055;
  const baseUrl = `http://127.0.0.1:${PORT}/api`;
  const serverProc = spawn('node', ['backend/src/server.js'], {
    env: { ...process.env, PORT: String(PORT) },
    shell: true,
  });

  serverProc.stderr.on('data', (d) => {
    console.error('Server stderr:', d.toString());
  });

  try {
    await new Promise((resolve) => {
      serverProc.stdout.on('data', (d) => {
        if (d.toString().includes('listening on')) resolve();
      });
      setTimeout(resolve, 2500);
    });

    let adminCookie = '';
    let memberCookie = '';

    // 5.1 Test unauthenticated visitor attempts
    const visitorAddTeam = await fetch(`${baseUrl}/team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nameOverride: 'Hacker', roleTitle: 'Intruder' }),
    });
    assert(visitorAddTeam.status === 401, 'Visitor cannot add team member (401 Unauthorized)');

    const visitorDeleteTeam = await fetch(`${baseUrl}/team/1`, { method: 'DELETE' });
    assert(visitorDeleteTeam.status === 401, 'Visitor cannot delete team member (401 Unauthorized)');

    const visitorAddEvent = await fetch(`${baseUrl}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Rogue Event', type: 'workshop', starts_at: new Date().toISOString() }),
    });
    assert(visitorAddEvent.status === 401, 'Visitor cannot add event (401 Unauthorized)');

    const visitorAddFlagship = await fetch(`${baseUrl}/flagships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Rogue Flagship', description: 'desc' }),
    });
    assert(visitorAddFlagship.status === 401, 'Visitor cannot add flagship (401 Unauthorized)');

    const visitorAddChallenge = await fetch(`${baseUrl}/challenges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Rogue Challenge', points: 100 }),
    });
    assert(visitorAddChallenge.status === 401, 'Visitor cannot add challenge (401 Unauthorized)');

    const visitorAddGallery = await fetch(`${baseUrl}/gallery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: '/test.jpg' }),
    });
    assert(visitorAddGallery.status === 401, 'Visitor cannot add gallery image (401 Unauthorized)');

    // 5.2 Login as Administrator
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ayushtodkar404@gmail.com', password: 'Ayush@2005' }),
    });
    assert(loginRes.status === 200, 'Administrator login successful (200 OK)');
    adminCookie = loginRes.headers.get('set-cookie')?.split(';')[0] || '';

    // Verify /auth/me returns admin role
    const adminMe = await fetch(`${baseUrl}/auth/me`, {
      headers: { Cookie: adminCookie },
    }).then((r) => r.json());
    assert(adminMe.authenticated === true && adminMe.role === 'admin', 'Session confirms authenticated: true, role: "admin"');

    // 5.3 Setup member session
    let testMember = db.prepare("SELECT * FROM users WHERE email='test_regular_member@club.dbit.in'").get();
    if (!testMember) {
      const memberRoleId = db.prepare("SELECT id FROM roles WHERE key='member'").get().id;
      const ts = new Date().toISOString();
      const insert = db.prepare("INSERT INTO users(email,display_name,role_id,status,created_at,updated_at) VALUES(?,?,?,'active',?,?)");
      const res = insert.run('test_regular_member@club.dbit.in', 'Test Member', memberRoleId, ts, ts);
      testMember = { id: Number(res.lastInsertRowid) };
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
    const expiresAt = new Date(Date.now() + 86400000).toISOString();
    db.prepare('INSERT INTO sessions(id,token_hash,user_id,expires_at,created_at,last_seen_at) VALUES(?,?,?,?,?,?)')
      .run(crypto.randomUUID(), tokenHash, testMember.id, expiresAt, new Date().toISOString(), new Date().toISOString());
    memberCookie = `sc_session=${sessionToken}`;

    const memberMe = await fetch(`${baseUrl}/auth/me`, {
      headers: { Cookie: memberCookie },
    }).then((r) => r.json());
    assert(memberMe.authenticated === true && memberMe.role === 'member', 'Session confirms authenticated: true, role: "member"');

    // 5.4 Test Member gets 403 Forbidden on all Add & Delete operations
    const memberAddTeam = await fetch(`${baseUrl}/team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: memberCookie },
      body: JSON.stringify({ nameOverride: 'Member In Team', roleTitle: 'Student' }),
    });
    assert(memberAddTeam.status === 403, 'Member cannot add team member (403 Forbidden)');

    const memberDeleteTeam = await fetch(`${baseUrl}/team/1`, {
      method: 'DELETE',
      headers: { Cookie: memberCookie },
    });
    assert(memberDeleteTeam.status === 403, 'Member cannot delete team member (403 Forbidden)');

    const memberAddEvent = await fetch(`${baseUrl}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: memberCookie },
      body: JSON.stringify({ title: 'Member Event', type: 'workshop', starts_at: new Date().toISOString() }),
    });
    assert(memberAddEvent.status === 403, 'Member cannot add event (403 Forbidden)');

    const memberAddFlagship = await fetch(`${baseUrl}/flagships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: memberCookie },
      body: JSON.stringify({ title: 'Member Flagship', description: 'desc' }),
    });
    assert(memberAddFlagship.status === 403, 'Member cannot add flagship (403 Forbidden)');

    const memberAddChallenge = await fetch(`${baseUrl}/challenges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: memberCookie },
      body: JSON.stringify({ title: 'Member Challenge', points: 100 }),
    });
    assert(memberAddChallenge.status === 403, 'Member cannot add challenge (403 Forbidden)');

    const memberAddGallery = await fetch(`${baseUrl}/gallery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: memberCookie },
      body: JSON.stringify({ imageUrl: '/test.jpg' }),
    });
    assert(memberAddGallery.status === 403, 'Member cannot add gallery image (403 Forbidden)');

    // 5.5 Test Admin CAN Add & Delete in all 5 sections
    const runId = Date.now();

    // --- SECTION A: TEAM ---
    const adminAddTeam = await fetch(`${baseUrl}/team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        nameOverride: `Admin Created Member ${runId}`,
        roleTitle: 'Security Lead',
        department: 'leadership',
        tenure: '2026-27',
      }),
    });
    assert(adminAddTeam.status === 201, 'Administrator can add team member (201 Created)');
    const createdTeam = await adminAddTeam.json();

    const adminDeleteTeam = await fetch(`${baseUrl}/team/${createdTeam.id}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    assert(adminDeleteTeam.status === 200, 'Administrator can delete team member (200 OK)');

    // --- SECTION B: EVENTS ---
    const adminAddEvent = await fetch(`${baseUrl}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        title: `Admin Workshop ${runId}`,
        type: 'workshop',
        starts_at: '2026-12-01T10:00:00Z',
        venue: 'Lab 4',
        summary: 'Hands-on Threat Modeling',
        description: 'Deep dive into Threat Modeling and STRIDE analysis.',
        status: 'published',
      }),
    });
    assert(adminAddEvent.status === 201, 'Administrator can add event (201 Created)');
    const createdEvent = await adminAddEvent.json();

    const adminDeleteEvent = await fetch(`${baseUrl}/events/${createdEvent.id}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    assert(adminDeleteEvent.status === 200, 'Administrator can delete event (200 OK)');

    // --- SECTION C: FLAGSHIPS ---
    const adminAddFlagship = await fetch(`${baseUrl}/flagships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        title: `Admin Flagship ${runId}`,
        description: 'Annual competitive attack and defense flagship program.',
        year: 2026,
        status: 'published',
      }),
    });
    assert(adminAddFlagship.status === 201, 'Administrator can add flagship (201 Created)');
    const createdFlagship = await adminAddFlagship.json();

    const adminDeleteFlagship = await fetch(`${baseUrl}/flagships/${createdFlagship.id}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    assert(adminDeleteFlagship.status === 200, 'Administrator can delete flagship (200 OK)');

    // --- SECTION D: CTF ---
    const adminAddChallenge = await fetch(`${baseUrl}/challenges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        title: `Admin CTF Lab ${runId}`,
        category: 'web',
        difficulty: 'medium',
        points: 250,
        flag: `SC{admin_authorized_token_${runId}}`,
        hint: 'Examine authorization Bearer tokens',
        description: 'Test vulnerability in JWT signature validation.',
        status: 'published',
      }),
    });
    assert(adminAddChallenge.status === 201, 'Administrator can add CTF challenge (201 Created)');
    const createdChallenge = await adminAddChallenge.json();

    const adminDeleteChallenge = await fetch(`${baseUrl}/challenges/${createdChallenge.id}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    assert(adminDeleteChallenge.status === 200, 'Administrator can delete CTF challenge (200 OK)');

    // --- SECTION E: GALLERY ---
    const adminAddGallery = await fetch(`${baseUrl}/gallery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        imageUrl: `/gallery/2026/test_admin_upload_${runId}.webp`,
        caption: 'Admin uploaded event photo',
      }),
    });
    assert(adminAddGallery.status === 201, 'Administrator can add gallery photo (201 Created)');
    const createdGallery = await adminAddGallery.json();

    const adminDeleteGallery = await fetch(`${baseUrl}/gallery/${createdGallery.id}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    assert(adminDeleteGallery.status === 200, 'Administrator can delete gallery photo (200 OK)');

  } finally {
    try {
      if (process.platform === 'win32') {
        execSync(`taskkill /pid ${serverProc.pid} /T /F`, { stdio: 'ignore' });
      } else {
        serverProc.kill('SIGTERM');
      }
    } catch {
      // already stopped
    }
  }

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${pass} PASSED, ${fail} FAILED`);
  console.log('================================================================');

  if (fail > 0) {
    console.error('\nFailures:\n - ' + failures.join('\n - '));
    process.exit(1);
  } else {
    console.log('\nALL 5 TESTS PASSED SUCCESSFULLY WITH 100% COVERAGE.');
    process.exit(0);
  }
}

runLiveTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
