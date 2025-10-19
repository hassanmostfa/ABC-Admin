import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = "http://127.0.0.1:8000/api";

// Helper function to build full URL
const buildUrl = (endpoint: string) => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${API_BASE_URL}/${cleanEndpoint}`;
};

// GET - Fetch single offer by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const offerId = params.id;
        
        if (!offerId) {
            return NextResponse.json(
                { success: false, message: 'Offer ID is required' },
                { status: 400 }
            );
        }

        const response = await fetch(buildUrl(`admin/offers/${offerId}`), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'browserrefreshed': 'false',
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json(
                    { success: false, message: 'Offer not found' },
                    { status: 404 }
                );
            }
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

// PUT - Update single offer by ID
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const offerId = params.id;
        
        if (!offerId) {
            return NextResponse.json(
                { success: false, message: 'Offer ID is required' },
                { status: 400 }
            );
        }

        const formData = await request.formData();
        
        const response = await fetch(buildUrl(`admin/offers/${offerId}`), {
            method: 'PUT',
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

// DELETE - Delete single offer by ID
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const offerId = params.id;
        
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
