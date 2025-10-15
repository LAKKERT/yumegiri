'use server'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const rolesForCafe = ['waiter', 'admin'];
const rolesForMenu = ['waiter', 'admin'];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  
  const {
      data: { user },
    } = await supabase.auth.getUser()

    const userRole = await supabase.from('user_roles').select().eq('user_id', ((await supabase.auth.getUser()).data.user?.id)).single();

    if (
        user && 
        request.nextUrl.pathname.startsWith('/menu/') &&
        !rolesForMenu.includes(userRole.data.role)
    ) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }
    
    if (
        user && 
        request.nextUrl.pathname.startsWith('/restaurants/') &&
        !rolesForCafe.includes(userRole.data.role)
    ) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login')
    ) {

    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }
  return supabaseResponse
}