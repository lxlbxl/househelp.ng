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
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (agencyError || !agency) {
      return new Response(JSON.stringify({ error: 'Agency profile not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get agency helpers count
    const { count: helpersCount, error: helpersError } = await supabase
      .from('agency_helpers')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agency.id);
    
    if (helpersError) {
      console.error('Error fetching helpers count:', helpersError);
      return new Response(JSON.stringify({ error: 'Failed to fetch helpers count.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get active placements count
    const { count: placementsCount, error: placementsError } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .in('helper_id', 
        await supabase
          .from('agency_helpers')
          .select('helper_id')
          .eq('agency_id', agency.id)
          .then(res => res.data?.map(h => h.helper_id) || [])
      )
      .eq('status', 'accepted');
    
    if (placementsError) {
      console.error('Error fetching placements count:', placementsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch placements count.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get monthly revenue
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount')
      .in('payee_id',
        await supabase
          .from('agency_profiles')
          .select('user_id')
          .eq('id', agency.id)
          .then(res => res.data?.map(a => a.user_id) || [])
      )
      .gte('created_at', new Date(new Date().setDate(1)).toISOString())
      .eq('status', 'completed');
    
    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch payments.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const monthlyRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    
    // Get agency reputation
    const { data: reputation, error: reputationError } = await supabase
      .from('agency_reputation')
      .select('rating, response_time_rating, helper_quality_rating')
      .eq('agency_id', agency.id);
    
    if (reputationError) {
      console.error('Error fetching reputation:', reputationError);
      return new Response(JSON.stringify({ error: 'Failed to fetch reputation.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const averageRating = reputation?.length ? 
      reputation.reduce((sum, r) => sum + r.rating, 0) / reputation.length : 0;
    
    const averageResponseTime = reputation?.length ? 
      reputation.reduce((sum, r) => sum + (r.response_time_rating || 0), 0) / reputation.length : 0;
    
    const averageHelperQuality = reputation?.length ? 
      reputation.reduce((sum, r) => sum + (r.helper_quality_rating || 0), 0) / reputation.length : 0;
    
    // Calculate reliability index
    const reliabilityIndex = (averageResponseTime * 0.3) + (averageHelperQuality * 0.7);
    
    // Get recent activity
    const { data: recentMatches, error: matchesError } = await supabase
      .from('matches')
      .select(`
        id,
        created_at,
        status,
        helper_profile:helper_profiles(id, user_id, user:profiles(full_name)),
        household_profile:household_profiles(id, user_id, user:profiles(full_name))
      `)
      .in('helper_id',
        await supabase
          .from('agency_helpers')
          .select('helper_id')
          .eq('agency_id', agency.id)
          .then(res => res.data?.map(h => h.helper_id) || [])
      )
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (matchesError) {
      console.error('Error fetching recent matches:', matchesError);
      return new Response(JSON.stringify({ error: 'Failed to fetch recent matches.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      agency: {
        ...agency,
        stats: {
          total_helpers: helpersCount || 0,
          active_placements: placementsCount || 0,
          monthly_revenue: monthlyRevenue,
          average_rating: parseFloat(averageRating.toFixed(2)),
          reliability_index: parseFloat(reliabilityIndex.toFixed(2))
        },
        recent_activity: recentMatches || []
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('Agency dashboard error:', error);
    
    return new Response(JSON.stringify({ error: 'An error occurred while fetching agency dashboard data.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
