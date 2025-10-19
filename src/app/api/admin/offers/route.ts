import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = "http://127.0.0.1:8000/api";

// Helper function to build full URL
const buildUrl = (endpoint: string) => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${API_BASE_URL}/${cleanEndpoint}`;
};

// GET - Fetch all offers with pagination and search
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const queryParams = new URLSearchParams();
        
        // Add all query parameters
        searchParams.forEach((value, key) => {
            queryParams.append(key, value);
        });

        const response = await fetch(buildUrl(`admin/offers?${queryParams.toString()}`), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'browserrefreshed': 'false',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching offers:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch offers' },
            { status: 500 }
        );
    }
}

// POST - Create new offer
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        
        const response = await fetch(buildUrl('admin/offers'), {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating offer:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create offer' },
            { status: 500 }
        );
    }
}

// PUT - Update offer
export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const offerId = searchParams.get('id');
        
        if (!offerId) {
            return NextResponse.json(
                { success: false, message: 'Offer ID is required' },
                { status: 400 }
            );
        }

        const formData = await request.formData();
        
        const response = await fetch(buildUrl(`admin/offers/${offerId}`), {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating offer:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update offer' },
            { status: 500 }
        );
    }
}

// DELETE - Delete offer
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const offerId = searchParams.get('id');
        
        if (!offerId) {
            return NextResponse.json(
                { success: false, message: 'Offer ID is required' },
                { status: 400 }
            );
        }

        const response = await fetch(buildUrl(`admin/offers/${offerId}`), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error deleting offer:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete offer' },
            { status: 500 }
        );
    }
}
