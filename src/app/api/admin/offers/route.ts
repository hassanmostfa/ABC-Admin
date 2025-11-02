import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = "https://abc.ghazlaapp.com/api";

// Helper function to build full URL
const buildUrl = (endpoint: string) => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${API_BASE_URL}/${cleanEndpoint}`;
};

// GET - Fetch specific offer by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        const response = await fetch(buildUrl(`admin/offers/${id}`), {
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
        console.error('Error fetching offer:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch offer' },
            { status: 500 }
        );
    }
}

// PUT - Update offer
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const formData = await request.formData();
        
        const response = await fetch(buildUrl(`admin/offers/${id}`), {
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
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        const response = await fetch(buildUrl(`admin/offers/${id}`), {
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