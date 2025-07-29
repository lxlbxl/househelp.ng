import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Get the current user
  const { data: { user }, error } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Define route categories
  const authRoutes = ['/login', '/register'];
  const protectedRoutes = ['/dashboard', '/profile-edit'];
  const profileSetupRoute = '/profile-setup';

  // If user is not authenticated
  if (!user || error) {
    // Redirect to login if trying to access protected routes or profile setup
    if (protectedRoutes.includes(pathname) || pathname === profileSetupRoute) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    // Allow access to auth routes and public routes
    return response;
  }

  // User is authenticated
  // Check if user has completed profile setup and handle user type routing
  if (protectedRoutes.includes(pathname) || pathname.startsWith('/admin') || pathname.startsWith('/agency')) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type, is_admin')
        .eq('id', user.id)
        .single();

      // If no profile exists or user_type is not set, redirect to profile setup
      if (!profile || !profile.user_type) {
        const profileSetupUrl = new URL('/profile-setup', request.url);
        return NextResponse.redirect(profileSetupUrl);
      }

      // Handle admin routes
      if (pathname.startsWith('/admin')) {
        if (profile.user_type !== 'admin' && !profile.is_admin) {
          const dashboardUrl = new URL('/dashboard', request.url);
          return NextResponse.redirect(dashboardUrl);
        }
      }

      // Handle agency routes
      if (pathname.startsWith('/agency')) {
        if (profile.user_type !== 'agency') {
          const dashboardUrl = new URL('/dashboard', request.url);
          return NextResponse.redirect(dashboardUrl);
        }
      }

      // Handle dashboard route - redirect based on user type
      if (pathname === '/dashboard') {
        if (profile.user_type === 'admin' || profile.is_admin) {
          const adminUrl = new URL('/admin', request.url);
          return NextResponse.redirect(adminUrl);
        } else if (profile.user_type === 'agency') {
          const agencyUrl = new URL('/agency/dashboard', request.url);
          return NextResponse.redirect(agencyUrl);
        }
        // For helper and household, stay on /dashboard
      }

    } catch (profileError) {
      // If there's an error fetching profile, redirect to profile setup
      const profileSetupUrl = new URL('/profile-setup', request.url);
      return NextResponse.redirect(profileSetupUrl);
    }
  }

  // If authenticated user tries to access auth routes, redirect to dashboard
  if (authRoutes.includes(pathname)) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Allow access to all other routes
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};