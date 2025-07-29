import { redirect } from 'next/navigation';
import { createClientClient } from '@/lib/supabase/client';

export default async function AgencyPage() {
  const supabase = createClientClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // If no user is logged in, redirect to login
    redirect('/login');
  }
  
  // Check if user has an agency profile
  const { data: agencyProfile } = await supabase
    .from('agency_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();
  
  if (agencyProfile) {
    // If user has an agency profile, redirect to dashboard
    redirect('/agency/dashboard');
  } else {
    // If user doesn't have an agency profile, redirect to registration
    redirect('/agency/register');
  }
  
  // This return is never reached but required by TypeScript
  return null;
}
