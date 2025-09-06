'use client'

export default function SimpleChart({ data, type = 'bar' }) {
  const maxValue = Math.max(...data.map(item => item.value))
  
  if (type === 'pie') {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600 mb-2">Chart Data</div>
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded mr-2" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  if (type === 'line') {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600 mb-2">Revenue Chart</div>
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.month}</span>
                <div className="flex items-center">
                  <div 
                    className="bg-blue-500 h-2 mr-2" 
                    style={{ width: `${(item.revenue / maxValue) * 200}px` }}
                  ></div>
                  <span className="text-sm font-medium">${item.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="h-64 flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-600 mb-2">Chart Data</div>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{item.name || item.month}</span>
              <span className="text-sm font-medium">{item.value || item.revenue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
