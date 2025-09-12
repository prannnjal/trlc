import jsPDF from 'jspdf'

/**
 * Generate a PDF for the itinerary
 * @param {Object} itinerary - The itinerary data
 * @param {Object} lead - The lead/customer data
 * @returns {Promise<void>}
 */
export const generateItineraryPDF = async (itinerary, lead) => {
  try {
    // Create new PDF document
    const doc = new jsPDF('p', 'mm', 'a4')
    
    // Set up colors
    const primaryColor = '#2563eb' // Blue
    const secondaryColor = '#64748b' // Gray
    const accentColor = '#10b981' // Green
    
    // Helper function to add text with styling
    const addText = (text, x, y, options = {}) => {
      const {
        size = 12,
        color = '#000000',
        weight = 'normal',
        align = 'left'
      } = options
      
      doc.setFontSize(size)
      doc.setTextColor(color)
      doc.setFont('helvetica', weight)
      doc.text(text, x, y, { align })
    }
    
    // Helper function to add a line
    const addLine = (x1, y1, x2, y2, color = '#e5e7eb') => {
      doc.setDrawColor(color)
      doc.line(x1, y1, x2, y2)
    }
    
    // Helper function to add a filled rectangle
    const addRect = (x, y, width, height, color = primaryColor) => {
      doc.setFillColor(color)
      doc.rect(x, y, width, height, 'F')
    }
    
    let yPosition = 20
    
    // Header Section
    addRect(0, 0, 210, 35, primaryColor)
    addText('TRAVEL ITINERARY', 105, 15, { 
      size: 24, 
      color: '#ffffff', 
      weight: 'bold', 
      align: 'center' 
    })
    addText('Your Dream Journey Awaits', 105, 25, { 
      size: 12, 
      color: '#ffffff', 
      align: 'center' 
    })
    
    yPosition = 50
    
    // Trip Overview Section
    addText('TRIP OVERVIEW', 20, yPosition, { 
      size: 16, 
      color: primaryColor, 
      weight: 'bold' 
    })
    yPosition += 10
    
    addLine(20, yPosition, 190, yPosition, secondaryColor)
    yPosition += 8
    
    // Trip details
    const tripName = itinerary.tripName || 'Adventure Trip'
    const destination = itinerary.destination || 'Destination'
    const startDate = itinerary.startDate ? new Date(itinerary.startDate).toLocaleDateString() : 'TBD'
    const endDate = itinerary.endDate ? new Date(itinerary.endDate).toLocaleDateString() : 'TBD'
    const duration = itinerary.duration || 0
    const nights = itinerary.nights || 0
    const travelers = itinerary.travelers || 1
    const adults = itinerary.adults || 1
    const children = itinerary.children || 0
    
    addText(`Trip Name: ${tripName}`, 20, yPosition, { size: 12, weight: 'bold' })
    yPosition += 7
    addText(`Destination: ${destination}`, 20, yPosition, { size: 12 })
    yPosition += 7
    addText(`Travel Dates: ${startDate} - ${endDate}`, 20, yPosition, { size: 12 })
    yPosition += 7
    addText(`Duration: ${duration} ${duration === 1 ? 'Day' : 'Days'}, ${nights} ${nights === 1 ? 'Night' : 'Nights'}`, 20, yPosition, { size: 12 })
    yPosition += 7
    addText(`Travelers: ${adults} ${adults === 1 ? 'Adult' : 'Adults'}${children > 0 ? `, ${children} ${children === 1 ? 'Child' : 'Children'}` : ''} (Total: ${travelers})`, 20, yPosition, { size: 12 })
    
    yPosition += 15
    
    // Customer Information
    if (lead) {
      addText('CUSTOMER INFORMATION', 20, yPosition, { 
        size: 16, 
        color: primaryColor, 
        weight: 'bold' 
      })
      yPosition += 10
      addLine(20, yPosition, 190, yPosition, secondaryColor)
      yPosition += 8
      
      addText(`Name: ${lead.name || 'N/A'}`, 20, yPosition, { size: 12 })
      yPosition += 7
      addText(`Email: ${lead.email || 'N/A'}`, 20, yPosition, { size: 12 })
      yPosition += 7
      addText(`Phone: ${lead.phone || 'N/A'}`, 20, yPosition, { size: 12 })
      
      yPosition += 15
    }
    
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 20
    }
    
    // Accommodation Section
    if (itinerary.hotels && itinerary.hotels.length > 0) {
      addText('ACCOMMODATION', 20, yPosition, { 
        size: 16, 
        color: primaryColor, 
        weight: 'bold' 
      })
      yPosition += 10
      addLine(20, yPosition, 190, yPosition, secondaryColor)
      yPosition += 8
      
      itinerary.hotels.forEach((hotel, index) => {
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }
        
        addText(`${index + 1}. ${hotel.name}`, 20, yPosition, { size: 14, weight: 'bold' })
        yPosition += 7
        addText(`Location: ${hotel.location || 'N/A'}`, 20, yPosition, { size: 11 })
        yPosition += 6
        addText(`Check-in: ${hotel.checkIn}`, 20, yPosition, { size: 11 })
        yPosition += 6
        addText(`Check-out: ${hotel.checkOut}`, 20, yPosition, { size: 11 })
        yPosition += 6
        addText(`Room Type: ${hotel.roomType}`, 20, yPosition, { size: 11 })
        yPosition += 6
        addText(`Guests: ${hotel.guests} ${hotel.guests === 1 ? 'Guest' : 'Guests'}`, 20, yPosition, { size: 11 })
        yPosition += 6
        addText(`Price: ₹${hotel.price || 0}`, 20, yPosition, { size: 11, color: accentColor, weight: 'bold' })
        yPosition += 10
      })
    }
    
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 20
    }
    
    // Activities Section
    if (itinerary.activities && itinerary.activities.length > 0) {
      addText('ACTIVITIES & ATTRACTIONS', 20, yPosition, { 
        size: 16, 
        color: primaryColor, 
        weight: 'bold' 
      })
      yPosition += 10
      addLine(20, yPosition, 190, yPosition, secondaryColor)
      yPosition += 8
      
      itinerary.activities.forEach((activity, index) => {
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }
        
        addText(`${index + 1}. ${activity.name}`, 20, yPosition, { size: 14, weight: 'bold' })
        yPosition += 7
        addText(`Date: ${activity.date}`, 20, yPosition, { size: 11 })
        yPosition += 6
        addText(`Time: ${activity.time}`, 20, yPosition, { size: 11 })
        yPosition += 6
        addText(`Duration: ${activity.duration}`, 20, yPosition, { size: 11 })
        yPosition += 6
        if (activity.description) {
          // Split long descriptions into multiple lines
          const words = activity.description.split(' ')
          let line = ''
          const maxWidth = 170 // Maximum width in mm
          
          for (const word of words) {
            const testLine = line + word + ' '
            const textWidth = doc.getTextWidth(testLine)
            
            if (textWidth > maxWidth && line !== '') {
              addText(line.trim(), 20, yPosition, { size: 11 })
              yPosition += 6
              line = word + ' '
            } else {
              line = testLine
            }
          }
          if (line.trim()) {
            addText(line.trim(), 20, yPosition, { size: 11 })
            yPosition += 6
          }
        }
        addText(`Price: ₹${activity.price || 0}`, 20, yPosition, { size: 11, color: accentColor, weight: 'bold' })
        yPosition += 10
      })
    }
    
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 20
    }
    
    // Transportation Section
    if (itinerary.transportation && itinerary.transportation.length > 0) {
      addText('TRANSPORTATION', 20, yPosition, { 
        size: 16, 
        color: primaryColor, 
        weight: 'bold' 
      })
      yPosition += 10
      addLine(20, yPosition, 190, yPosition, secondaryColor)
      yPosition += 8
      
      itinerary.transportation.forEach((transport, index) => {
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }
        
        addText(`${index + 1}. ${transport.type}`, 20, yPosition, { size: 14, weight: 'bold' })
        yPosition += 7
        addText(`Route: ${transport.from} → ${transport.to}`, 20, yPosition, { size: 11 })
        yPosition += 6
        addText(`Date: ${transport.date}`, 20, yPosition, { size: 11 })
        yPosition += 6
        addText(`Time: ${transport.time}`, 20, yPosition, { size: 11 })
        yPosition += 6
        if (transport.details) {
          // Split long details into multiple lines
          const words = transport.details.split(' ')
          let line = ''
          const maxWidth = 170
          
          for (const word of words) {
            const testLine = line + word + ' '
            const textWidth = doc.getTextWidth(testLine)
            
            if (textWidth > maxWidth && line !== '') {
              addText(line.trim(), 20, yPosition, { size: 11 })
              yPosition += 6
              line = word + ' '
            } else {
              line = testLine
            }
          }
          if (line.trim()) {
            addText(line.trim(), 20, yPosition, { size: 11 })
            yPosition += 6
          }
        }
        addText(`Price: ₹${transport.price || 0}`, 20, yPosition, { size: 11, color: accentColor, weight: 'bold' })
        yPosition += 10
      })
    }
    
    // Check if we need a new page
    if (yPosition > 200) {
      doc.addPage()
      yPosition = 20
    }
    
    // Pricing Section
    addText('COST BREAKDOWN', 20, yPosition, { 
      size: 16, 
      color: primaryColor, 
      weight: 'bold' 
    })
    yPosition += 10
    addLine(20, yPosition, 190, yPosition, secondaryColor)
    yPosition += 8
    
    const breakdown = itinerary.costBreakdown || {}
    const costs = [
      { label: 'Accommodation', amount: breakdown.accommodation || 0 },
      { label: 'Activities', amount: breakdown.activities || 0 },
      { label: 'Transportation', amount: breakdown.transportation || 0 },
      { label: 'Meals', amount: breakdown.meals || 0 },
      { label: 'Other', amount: breakdown.other || 0 }
    ]
    
    costs.forEach(cost => {
      addText(`${cost.label}:`, 20, yPosition, { size: 12 })
      addText(`₹${cost.amount.toFixed(2)}`, 170, yPosition, { size: 12, align: 'right' })
      yPosition += 7
    })
    
    yPosition += 5
    addLine(20, yPosition, 190, yPosition, secondaryColor)
    yPosition += 8
    
    addText('TOTAL COST:', 20, yPosition, { size: 14, weight: 'bold' })
    addText(`₹${itinerary.totalCost?.toFixed(2) || '0.00'}`, 170, yPosition, { 
      size: 16, 
      color: accentColor, 
      weight: 'bold', 
      align: 'right' 
    })
    
    yPosition += 20
    
    // Special Requests and Notes
    if (itinerary.specialRequests || itinerary.notes) {
      if (yPosition > 180) {
        doc.addPage()
        yPosition = 20
      }
      
      addText('ADDITIONAL INFORMATION', 20, yPosition, { 
        size: 16, 
        color: primaryColor, 
        weight: 'bold' 
      })
      yPosition += 10
      addLine(20, yPosition, 190, yPosition, secondaryColor)
      yPosition += 8
      
      if (itinerary.specialRequests) {
        addText('Special Requests:', 20, yPosition, { size: 12, weight: 'bold' })
        yPosition += 7
        
        // Split long text into multiple lines
        const words = itinerary.specialRequests.split(' ')
        let line = ''
        const maxWidth = 170
        
        for (const word of words) {
          const testLine = line + word + ' '
          const textWidth = doc.getTextWidth(testLine)
          
          if (textWidth > maxWidth && line !== '') {
            addText(line.trim(), 20, yPosition, { size: 11 })
            yPosition += 6
            line = word + ' '
          } else {
            line = testLine
          }
        }
        if (line.trim()) {
          addText(line.trim(), 20, yPosition, { size: 11 })
          yPosition += 6
        }
        yPosition += 5
      }
      
      if (itinerary.notes) {
        addText('Additional Notes:', 20, yPosition, { size: 12, weight: 'bold' })
        yPosition += 7
        
        // Split long text into multiple lines
        const words = itinerary.notes.split(' ')
        let line = ''
        const maxWidth = 170
        
        for (const word of words) {
          const testLine = line + word + ' '
          const textWidth = doc.getTextWidth(testLine)
          
          if (textWidth > maxWidth && line !== '') {
            addText(line.trim(), 20, yPosition, { size: 11 })
            yPosition += 6
            line = word + ' '
          } else {
            line = testLine
          }
        }
        if (line.trim()) {
          addText(line.trim(), 20, yPosition, { size: 11 })
        }
      }
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      addText(`Generated on ${new Date().toLocaleDateString()}`, 20, 285, { 
        size: 8, 
        color: secondaryColor 
      })
      addText(`Page ${i} of ${pageCount}`, 170, 285, { 
        size: 8, 
        color: secondaryColor, 
        align: 'right' 
      })
    }
    
    // Generate filename
    const customerName = lead?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Customer'
    const fileNameTripName = itinerary.tripName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Itinerary'
    const filename = `${customerName}_${fileNameTripName}_${new Date().toISOString().split('T')[0]}.pdf`
    
    // Save the PDF
    doc.save(filename)
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF. Please try again.')
  }
}

/**
 * Generate a simple itinerary preview for testing
 * @param {Object} itinerary - The itinerary data
 * @param {Object} lead - The lead/customer data
 * @returns {Promise<void>}
 */
export const generateSimpleItineraryPDF = async (itinerary, lead) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4')
    
    // Header
    doc.setFontSize(20)
    doc.text('Travel Itinerary', 20, 30)
    
    // Basic info
    doc.setFontSize(12)
    doc.text(`Trip: ${itinerary.tripName || 'Adventure Trip'}`, 20, 50)
    doc.text(`Destination: ${itinerary.destination || 'Destination'}`, 20, 60)
    doc.text(`Customer: ${lead?.name || 'N/A'}`, 20, 70)
    doc.text(`Total Cost: ₹${itinerary.totalCost?.toFixed(2) || '0.00'}`, 20, 80)
    
    // Save
    const filename = `itinerary_${new Date().getTime()}.pdf`
    doc.save(filename)
    
  } catch (error) {
    console.error('Error generating simple PDF:', error)
    throw new Error('Failed to generate PDF. Please try again.')
  }
}
