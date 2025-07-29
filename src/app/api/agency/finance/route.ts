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
      .select('id, commission_rate')
      .eq('user_id', user.id)
      .single();
    
    if (agencyError || !agency) {
      return new Response(JSON.stringify({ error: 'Agency profile not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // 'day', 'week', 'month', 'year'
    
    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        // Start from Monday of current week
        startDate = new Date(now.setDate(now.getDate() - now.getDay() + 1));
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    // Get agency helpers
    const { data: agencyHelpers, error: helpersError } = await supabase
      .from('agency_helpers')
      .select('helper_id, salary')
      .eq('agency_id', agency.id);
    
    if (helpersError) {
      console.error('Error fetching agency helpers:', helpersError);
      return new Response(JSON.stringify({ error: 'Failed to fetch agency helpers.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get payments to agency
    const { data: agencyPayments, error: agencyPaymentsError } = await supabase
      .from('payments')
      .select('id, amount, created_at, payer_id, payee_id')
      .eq('payee_id', user.id)
      .gte('created_at', startDate.toISOString())
      .eq('status', 'completed');
    
    if (agencyPaymentsError) {
      console.error('Error fetching agency payments:', agencyPaymentsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch agency payments.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get payments to helpers (agency's responsibility)
    const helperIds = agencyHelpers?.map(h => h.helper_id) || [];
    const { data: helperPayments, error: helperPaymentsError } = await supabase
      .from('payments')
      .select('id, amount, created_at, payer_id, payee_id')
      .in('payee_id', helperIds)
      .gte('created_at', startDate.toISOString())
      .eq('status', 'completed');
    
    if (helperPaymentsError) {
      console.error('Error fetching helper payments:', helperPaymentsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch helper payments.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Calculate totals
    const totalCommissionEarned = agencyPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const totalSalariesPaid = helperPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    
    // Get pending payments to helpers
    const { data: pendingHelperPayments, error: pendingHelperPaymentsError } = await supabase
      .from('payments')
      .select('id, amount, created_at, payer_id, payee_id')
      .in('payee_id', helperIds)
      .gte('created_at', startDate.toISOString())
      .eq('status', 'pending');
    
    if (pendingHelperPaymentsError) {
      console.error('Error fetching pending helper payments:', pendingHelperPaymentsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch pending helper payments.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const totalPendingSalaries = pendingHelperPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    
    // Get upcoming salary obligations
    const upcomingSalaries = agencyHelpers?.reduce((sum, h) => sum + (h.salary || 0), 0) || 0;
    
    // Get revenue analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('agency_analytics')
      .select('*')
      .eq('agency_id', agency.id)
      .gte('period_start', startDate.toISOString())
      .order('period_start', { ascending: false });
    
    if (analyticsError) {
      console.error('Error fetching agency analytics:', analyticsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch agency analytics.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      finance: {
        period,
        start_date: startDate.toISOString(),
        end_date: now.toISOString(),
        commission_rate: agency.commission_rate,
        commission_earned: totalCommissionEarned,
        salaries_paid: totalSalariesPaid,
        pending_salaries: totalPendingSalaries,
        upcoming_salary_obligations: upcomingSalaries,
        net_revenue: totalCommissionEarned - totalSalariesPaid,
        analytics: analytics || []
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('Agency finance error:', error);
    
    return new Response(JSON.stringify({ error: 'An error occurred while fetching agency finance data.' }), {
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
    const { helper_ids, amount, description } = body;
    
    // Validate required fields
    if (!helper_ids || !Array.isArray(helper_ids) || helper_ids.length === 0) {
      return new Response(JSON.stringify({ error: 'At least one helper ID is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Valid amount is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if helpers belong to agency
    const { data: agencyHelpers, error: helpersError } = await supabase
      .from('agency_helpers')
      .select('helper_id')
      .eq('agency_id', agency.id)
      .in('helper_id', helper_ids);
    
    if (helpersError) {
      console.error('Error fetching agency helpers:', helpersError);
      return new Response(JSON.stringify({ error: 'Failed to verify helpers.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Verify all helpers belong to agency
    const agencyHelperIds = agencyHelpers?.map(h => h.helper_id) || [];
    const invalidHelpers = helper_ids.filter(id => !agencyHelperIds.includes(id));
    
    if (invalidHelpers.length > 0) {
      return new Response(JSON.stringify({ error: 'One or more helpers do not belong to your agency.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create payment records for each helper
    const paymentRecords = helper_ids.map(helper_id => ({
      match_id: null,
      payer_id: user.id,
      payee_id: helper_id,
      amount: amount / helper_ids.length, // Divide amount equally among helpers
      currency: 'NGN',
      status: 'pending',
      payment_method: 'agency_wallet',
      description: description || 'Bulk payment from agency',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    const { error: insertError } = await supabase
      .from('payments')
      .insert(paymentRecords);
    
    if (insertError) {
      console.error('Error creating bulk payments:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to create bulk payments.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: `Bulk payment created for ${helper_ids.length} helpers.`,
      payment_count: helper_ids.length
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('Agency finance POST error:', error);
    
    return new Response(JSON.stringify({ error: 'An error occurred while creating bulk payments.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
