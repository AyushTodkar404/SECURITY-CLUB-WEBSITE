const email = String(process.env.ADMIN_EMAIL ?? '').trim().toLowerCase()
const password = String(process.env.ADMIN_PASSWORD ?? '')
const displayName = String(process.env.ADMIN_NAME ?? 'Club Administrator').trim()

if (!email || password.length < 8 || !displayName) {
    throw new Error('Set ADMIN_EMAIL, ADMIN_PASSWORD (at least 8 characters), and ADMIN_NAME in .env')
}

process.env.ADMIN_EMAIL = ''
process.env.ADMIN_PASSWORD = ''

const { db, hashPassword, now, transaction } = await import('./db.js')
const roleId = db.prepare("SELECT id FROM roles WHERE key='admin'").get().id
const userId = transaction(() => {
    const existing = db.prepare('SELECT id FROM users WHERE lower(email)=lower(?)').get(email)
    const firstAdmin = db.prepare(`SELECT u.id FROM users u JOIN roles r ON r.id=u.role_id
    WHERE u.id=1 AND r.key='admin'`).get()
    const bootstrap = firstAdmin ?? existing ?? db.prepare(`SELECT u.id FROM users u JOIN roles r ON r.id=u.role_id
    WHERE r.key='admin' AND u.display_name='Club Administrator' ORDER BY u.id LIMIT 1`).get()
    const timestamp = now()

    if (existing && bootstrap && existing.id !== bootstrap.id) {
        const retiredEmail = `disabled-admin-${existing.id}-${Date.now()}@legacy.invalid`
        db.prepare(`UPDATE users SET email=?,status='disabled',display_name='Disabled legacy administrator',updated_at=? WHERE id=?`)
            .run(retiredEmail, timestamp, existing.id)
        db.prepare('DELETE FROM sessions WHERE user_id=?').run(existing.id)
    }

    if (bootstrap) {
        db.prepare(`UPDATE users SET email=?,password_hash=?,display_name=?,role_id=?,status='active',
      email_verified_at=COALESCE(email_verified_at,?),updated_at=? WHERE id=?`)
            .run(email, hashPassword(password), displayName, roleId, timestamp, timestamp, bootstrap.id)
        db.prepare('DELETE FROM sessions WHERE user_id=?').run(bootstrap.id)
        return bootstrap.id
    }

    const result = db.prepare(`INSERT INTO users(email,password_hash,display_name,role_id,status,email_verified_at,created_at,updated_at)
    VALUES(?,?,?,?,?,?,?,?)`).run(email, hashPassword(password), displayName, roleId, 'active', timestamp, timestamp, timestamp)
    return Number(result.lastInsertRowid)
})

console.log(`Administrator provisioned in SQLite (user ID ${userId}).`)
db.close()