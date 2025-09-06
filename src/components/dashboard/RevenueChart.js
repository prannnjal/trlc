'use client'

import SimpleChart from './SimpleChart'

const data = [
  { month: 'Jan', revenue: 12000 },
  { month: 'Feb', revenue: 15000 },
  { month: 'Mar', revenue: 18000 },
  { month: 'Apr', revenue: 22000 },
  { month: 'May', revenue: 25000 },
  { month: 'Jun', revenue: 28000 },
  { month: 'Jul', revenue: 32000 },
  { month: 'Aug', revenue: 35000 },
  { month: 'Sep', revenue: 38000 },
  { month: 'Oct', revenue: 42000 },
  { month: 'Nov', revenue: 45000 },
  { month: 'Dec', revenue: 48000 }
]

export default function RevenueChart() {
  return (
    <div className="h-64">
      <SimpleChart data={data} type="line" />
    </div>
  )
}