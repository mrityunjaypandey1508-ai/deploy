import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    const response = await fetch(
      `${BACKEND_URL}/api/issues/admin${queryString ? `?${queryString}` : ''}`,
      {
        method: 'GET',
        headers: {
          'Authorization': request.headers.get('Authorization') || '',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000), // 10 second timeout
      }
    );

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching admin issues:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while fetching admin issues' },
      { status: 500 }
    );
  }
}



