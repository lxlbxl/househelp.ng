import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized. Please log in to continue.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get request body
    const body = await request.json();
    const {
      business_name,
      business_registration_number,
      tax_identification_number,
      contact_person,
      contact_email,
      contact_phone,
      address,
      city,
      state,
      country,
      website,
      description
    } = body;
    
    // Validate required fields
    if (!business_name || !business_registration_number || !tax_identification_number || 
        !contact_person || !contact_email || !contact_phone || !address || !city || !state) {
      return new Response(JSON.stringify({ error: 'All required fields must be filled.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if user already has an agency profile
    const { data: existingAgency, error: existingError } = await supabase
      .from('agency_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (existingAgency) {
      return new Response(JSON.stringify({ error: 'You already have an agency profile.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Insert agency profile
    const { data: agency, error: insertError } = await supabase
      .from('agency_profiles')
      .insert({
        user_id: user.id,
        business_name,
        business_registration_number,
        tax_identification_number,
        contact_person,
        contact_email,
        contact_phone,
        address,
        city,
        state,
        country: country || 'Nigeria',
        website,
        description,
        verification_status: 'pending',
        tier: 'basic'
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error inserting agency profile:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to create agency profile.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Update user role to agency
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'agency' })
      .eq('id', user.id);
    
    if (profileError) {
      console.error('Error updating user role:', profileError);
      // Don't return error as agency profile was created successfully
    }
    
    return new Response(JSON.stringify({ success: true, agency }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('Agency registration error:', error);
    
    return new Response(JSON.stringify({ error: 'An error occurred while registering your agency.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
