import { Tag } from 'antd'
import type { AiRiskLevel } from '../types/aiAnalysis'

interface RiskBadgeProps {
  level: AiRiskLevel
}

export function RiskBadge({ level }: RiskBadgeProps) {
  const key = String(level ?? '').toUpperCase()
  let color: string = 'default'
  if (key === 'LOW') color = 'success'
  else if (key === 'MEDIUM') color = 'warning'
  else if (key === 'HIGH') color = 'error'

  return (
    <Tag color={color} className="m-0 font-medium uppercase tracking-wide">
      {key || '—'}
    </Tag>
  )
}
