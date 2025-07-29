import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to continue.' },
        { status: 401 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { email, amount, metadata } = body;
    
    if (!email || !amount) {
      return NextResponse.json(
        { error: 'Email and amount are required.' },
        { status: 400 }
      );
    }
    
    // Initialize Paystack transaction
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    
    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: 'Payment gateway configuration error.' },
        { status: 500 }
      );
    }
    
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/verify`,
        metadata,
      }),
    });
    
    const responseData = await response.json();
    
    if (!responseData.status) {
      return NextResponse.json(
        { error: responseData.message || 'Payment initialization failed.' },
        { status: 400 }
      );
    }
    
    // Update payment record with transaction reference
    if (metadata?.payment_id) {
      await supabase
        .from('payments')
        .update({ transaction_ref: responseData.data.reference })
        .eq('id', metadata.payment_id);
    }
    
    return NextResponse.json(responseData.data);
    
  } catch (error: any) {
    console.error('Payment initialization error:', error);
    
    return NextResponse.json(
      { error: 'An error occurred while initializing payment.' },
      { status: 500 }
    );
  }
}