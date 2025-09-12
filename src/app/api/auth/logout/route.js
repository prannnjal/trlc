import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    // Since we're using JWT tokens, logout is handled on the client side
    // by removing the token from storage. This endpoint is mainly for
    // consistency and potential future server-side token blacklisting.
    
    return Response.json({
      success: true,
      message: 'Logged out successfully'
    })
    
  } catch (error) {
    console.error('Logout error:', error)
    return Response.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
