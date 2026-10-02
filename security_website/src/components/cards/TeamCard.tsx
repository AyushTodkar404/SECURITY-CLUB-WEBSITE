import type { TeamMember } from '../../types'
import BaseCard from './BaseCard'

interface TeamCardProps {
  member: TeamMember
}

function TeamCard({ member }: TeamCardProps) {
  return (
    <BaseCard>
      <img className="avatar" src={member.image} alt={`${member.name} portrait`} />
      <h3>{member.name}</h3>
      <p className="role">{member.role}</p>
      {member.description && <p className="team-description">{member.description}</p>}
      {member.quote && <p>{member.quote}</p>}
      {member.linkedin && (
        <a href={member.linkedin} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
      )}
    </BaseCard>
  )
}

export default TeamCard
