'use client'

import SimpleChart from './SimpleChart'

const data = [
  { name: 'New', value: 45, color: '#3b82f6' },
  { name: 'In Progress', value: 32, color: '#f59e0b' },
  { name: 'Converted', value: 28, color: '#10b981' },
  { name: 'On Trip', value: 18, color: '#8b5cf6' },
  { name: 'Cancelled', value: 12, color: '#ef4444' }
]

export default function LeadStatusChart() {
  return (
    <div className="h-64">
      <SimpleChart data={data} type="pie" />
    </div>
  )
}