import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    // Get the reference from the URL query parameters
    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get('reference');
    
    if (!reference) {
      return new Response(
        JSON.stringify({ success: false, message: 'No reference provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify the transaction with Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    
    if (!paystackSecretKey) {
      return new Response(
        JSON.stringify({ success: false, message: 'Payment gateway configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    const responseData = await response.json();
    
    if (!responseData.status || responseData.data.status !== 'success') {
      return new Response(
        JSON.stringify({ success: false, message: 'Payment verification failed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Update payment record in the database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_ref', reference)
      .single();
    
    if (paymentError || !payment) {
      return new Response(
        JSON.stringify({ success: false, message: 'Payment record not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Update payment status to completed
    const { error: updateError } = await supabase
      .from('payments')
      .update({ payment_status: 'completed' })
      .eq('id', payment.id);
    
    if (updateError) {
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to update payment status' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: 'Payment verified successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error: any) {
    console.error('Payment verification error:', error);
    
    return new Response(
      JSON.stringify({ success: false, message: 'An error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}



// Handle Paystack webhook
export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    // Verify that the request is from Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    
    if (!paystackSecretKey) {
      return new Response(
        JSON.stringify({ error: 'Payment gateway configuration error.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the signature from the headers
    const signature = request.headers.get('x-paystack-signature');
    
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook signature.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the request body
    const body = await request.json();
    
    // Process the webhook event
    const event = body.event;
    
    if (event === 'charge.success') {
      const reference = body.data.reference;
      
      // Update payment record in the database
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('transaction_ref', reference)
        .single();
      
      if (!paymentError && payment) {
        // Update payment status to completed
        await supabase
          .from('payments')
          .update({ payment_status: 'completed' })
          .eq('id', payment.id);
      }
    }
    
    return new Response(
      JSON.stringify({ status: 'success' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing the webhook.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
