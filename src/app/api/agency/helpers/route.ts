import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
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
    
    // Check if user has an agency profile
    const { data: agency, error: agencyError } = await supabase
      .from('agency_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (agencyError || !agency) {
      return new Response(JSON.stringify({ error: 'Agency profile not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get agency helpers with their profiles
    const { data: helpers, error: helpersError } = await supabase
      .from('agency_helpers')
      .select(`
        id,
        employment_status,
        contract_start_date,
        contract_end_date,
        salary,
        helper:helper_profiles(
          id,
          user_id,
          skills,
          experience_years,
          bio,
          availability,
          availability_date,
          work_preference,
          location,
          languages,
          verification_status,
          rating,
          user:profiles(full_name, email, avatar_url)
        )
      `)
      .eq('agency_id', agency.id)
      .order('created_at', { ascending: false });
    
    if (helpersError) {
      console.error('Error fetching agency helpers:', helpersError);
      return new Response(JSON.stringify({ error: 'Failed to fetch agency helpers.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      helpers: helpers || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('Agency helpers error:', error);
    
    return new Response(JSON.stringify({ error: 'An error occurred while fetching agency helpers.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

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
    
    // Check if user has an agency profile
    const { data: agency, error: agencyError } = await supabase
      .from('agency_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (agencyError || !agency) {
      return new Response(JSON.stringify({ error: 'Agency profile not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get request body
    const body = await request.json();
    const {
      helper_id,
      employment_status,
      contract_start_date,
      contract_end_date,
      salary
    } = body;
    
    // Validate required fields
    if (!helper_id) {
      return new Response(JSON.stringify({ error: 'Helper ID is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if helper exists and is not already managed by another agency
    const { data: helper, error: helperError } = await supabase
      .from('helper_profiles')
      .select('id, user_id')
      .eq('id', helper_id)
      .single();
    
    if (helperError || !helper) {
      return new Response(JSON.stringify({ error: 'Helper not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if helper is already managed by another agency
    const { data: existingAgencyHelper, error: existingError } = await supabase
      .from('agency_helpers')
      .select('id, agency_id')
      .eq('helper_id', helper_id)
      .single();
    
    if (existingAgencyHelper && existingAgencyHelper.agency_id !== agency.id) {
      return new Response(JSON.stringify({ error: 'Helper is already managed by another agency.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Insert or update agency helper
    const { data: agencyHelper, error: insertError } = await supabase
      .from('agency_helpers')
      .upsert({
        agency_id: agency.id,
        helper_id: helper.id,
        employment_status: employment_status || 'active',
        contract_start_date: contract_start_date || new Date().toISOString(),
        contract_end_date: contract_end_date,
        salary: salary || 0
      }, {
        onConflict: 'agency_id,helper_id'
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error upserting agency helper:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to add helper to agency.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      helper: agencyHelper
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('Agency helpers POST error:', error);
    
    return new Response(JSON.stringify({ error: 'An error occurred while adding helper to agency.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT(request: NextRequest) {
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
    
    // Check if user has an agency profile
    const { data: agency, error: agencyError } = await supabase
      .from('agency_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (agencyError || !agency) {
      return new Response(JSON.stringify({ error: 'Agency profile not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get request body
    const body = await request.json();
    const {
      id,
      employment_status,
      contract_start_date,
      contract_end_date,
      salary
    } = body;
    
    // Validate required fields
    if (!id) {
      return new Response(JSON.stringify({ error: 'Agency helper ID is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Update agency helper
    const { data: agencyHelper, error: updateError } = await supabase
      .from('agency_helpers')
      .update({
        employment_status,
        contract_start_date,
        contract_end_date,
        salary
      })
      .eq('id', id)
      .eq('agency_id', agency.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating agency helper:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update agency helper.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      helper: agencyHelper
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
      });
    
  } catch (error: any) {
    console.error('Agency helpers PUT error:', error);
    
    return new Response(JSON.stringify({ error: 'An error occurred while updating agency helper.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE(request: NextRequest) {
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
    
    // Check if user has an agency profile
    const { data: agency, error: agencyError } = await supabase
      .from('agency_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (agencyError || !agency) {
      return new Response(JSON.stringify({ error: 'Agency profile not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get agency helper ID from URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Agency helper ID is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Delete agency helper
    const { error: deleteError } = await supabase
      .from('agency_helpers')
      .delete()
      .eq('id', id)
      .eq('agency_id', agency.id);
    
    if (deleteError) {
      console.error('Error deleting agency helper:', deleteError);
      return new Response(JSON.stringify({ error: 'Failed to remove helper from agency.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Helper removed from agency successfully.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('Agency helpers DELETE error:', error);
    
    return new Response(JSON.stringify({ error: 'An error occurred while removing helper from agency.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
