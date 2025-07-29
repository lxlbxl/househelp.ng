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
    
    // Get agency reputation
    const { data: reputation, error: reputationError } = await supabase
      .from('agency_reputation')
      .select(`
        id,
        rating,
        comment,
        response_time_rating,
        helper_quality_rating,
        created_at,
        reviewer:profiles(full_name, avatar_url)
      `)
      .eq('agency_id', agency.id)
      .order('created_at', { ascending: false });
    
    if (reputationError) {
      console.error('Error fetching agency reputation:', reputationError);
      return new Response(JSON.stringify({ error: 'Failed to fetch agency reputation.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Calculate average ratings
    const totalReviews = reputation?.length || 0;
    const averageRating = totalReviews ? 
      reputation?.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;
    
    const averageResponseTime = totalReviews ? 
      reputation?.reduce((sum, r) => sum + (r.response_time_rating || 0), 0) / totalReviews : 0;
    
    const averageHelperQuality = totalReviews ? 
      reputation?.reduce((sum, r) => sum + (r.helper_quality_rating || 0), 0) / totalReviews : 0;
    
    // Calculate reliability index
    const reliabilityIndex = (averageResponseTime * 0.3) + (averageHelperQuality * 0.7);
    
    return new Response(JSON.stringify({
      success: true,
      reputation: {
        total_reviews: totalReviews,
        average_rating: parseFloat(averageRating.toFixed(2)),
        average_response_time: parseFloat(averageResponseTime.toFixed(2)),
        average_helper_quality: parseFloat(averageHelperQuality.toFixed(2)),
        reliability_index: parseFloat(reliabilityIndex.toFixed(2)),
        reviews: reputation || []
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('Agency reputation error:', error);
    
    return new Response(JSON.stringify({ error: 'An error occurred while fetching agency reputation.' }), {
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
    
    // Get request body
    const body = await request.json();
    const {
      agency_id,
      rating,
      comment,
      response_time_rating,
      helper_quality_rating
    } = body;
    
    // Validate required fields
    if (!agency_id) {
      return new Response(JSON.stringify({ error: 'Agency ID is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!rating || rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: 'Rating must be between 1 and 5.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if agency exists
    const { data: agency, error: agencyError } = await supabase
      .from('agency_profiles')
      .select('id')
      .eq('id', agency_id)
      .single();
    
    if (agencyError || !agency) {
      return new Response(JSON.stringify({ error: 'Agency not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if user has already reviewed this agency
    const { data: existingReview, error: existingError } = await supabase
      .from('agency_reputation')
      .select('id')
      .eq('agency_id', agency_id)
      .eq('reviewer_id', user.id)
      .single();
    
    if (existingReview) {
      return new Response(JSON.stringify({ error: 'You have already reviewed this agency.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Insert agency reputation
    const { data: reputation, error: insertError } = await supabase
      .from('agency_reputation')
      .insert({
        agency_id,
        reviewer_id: user.id,
        rating,
        comment,
        response_time_rating: response_time_rating || null,
        helper_quality_rating: helper_quality_rating || null
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error inserting agency reputation:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to submit review.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      reputation
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('Agency reputation POST error:', error);
    
    return new Response(JSON.stringify({ error: 'An error occurred while submitting review.' }), {
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
    
    // Get request body
    const body = await request.json();
    const {
      id,
      rating,
      comment,
      response_time_rating,
      helper_quality_rating
    } = body;
    
    // Validate required fields
    if (!id) {
      return new Response(JSON.stringify({ error: 'Review ID is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!rating || rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: 'Rating must be between 1 and 5.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if review exists and belongs to user
    const { data: reputation, error: reputationError } = await supabase
      .from('agency_reputation')
      .select('id')
      .eq('id', id)
      .eq('reviewer_id', user.id)
      .single();
    
    if (reputationError || !reputation) {
      return new Response(JSON.stringify({ error: 'Review not found or you do not have permission to edit it.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Update agency reputation
    const { data: updatedReputation, error: updateError } = await supabase
      .from('agency_reputation')
      .update({
        rating,
        comment,
        response_time_rating: response_time_rating || null,
        helper_quality_rating: helper_quality_rating || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating agency reputation:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update review.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      reputation: updatedReputation
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('Agency reputation PUT error:', error);
    
    return new Response(JSON.stringify({ error: 'An error occurred while updating review.' }), {
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
    
    // Get review ID from URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Review ID is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if review exists and belongs to user
    const { data: reputation, error: reputationError } = await supabase
      .from('agency_reputation')
      .select('id')
      .eq('id', id)
      .eq('reviewer_id', user.id)
      .single();
    
    if (reputationError || !reputation) {
      return new Response(JSON.stringify({ error: 'Review not found or you do not have permission to delete it.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Delete agency reputation
    const { error: deleteError } = await supabase
      .from('agency_reputation')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('Error deleting agency reputation:', deleteError);
      return new Response(JSON.stringify({ error: 'Failed to delete review.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Review deleted successfully.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('Agency reputation DELETE error:', error);
    
    return new Response(JSON.stringify({ error: 'An error occurred while deleting review.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
