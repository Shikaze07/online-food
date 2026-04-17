import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Add paths that shouldn't trigger the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

const secretKey = process.env.JWT_SECRET ;
const key = new TextEncoder().encode(secretKey);

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Paths that require specific roles
  const requireAdmin = pathname.startsWith("/admin");
  const requireCustomer = pathname.startsWith("/customer");
  const requireRider = pathname.startsWith("/rider");
  const isLoginPage = pathname === "/login";
  const isHomePage = pathname === "/";

  // Check if it's a protected route
  if (!requireAdmin && !requireCustomer && !requireRider && !isLoginPage && !isHomePage) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get("session")?.value;

  // Unauthenticated users
  if (!token) {
    if (requireAdmin || requireCustomer || requireRider) {
      const url = new URL("/login", request.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Authenticated users - verify token
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });

    const userRole = payload.role;

    // Direct users away from login page if they are already logged in
    if (isLoginPage || isHomePage) {
      if (userRole === "ADMIN") return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      if (userRole === "CUSTOMER") return NextResponse.redirect(new URL("/customer/menu", request.url));
      if (userRole === "RIDER") return NextResponse.redirect(new URL("/rider/order-assignment", request.url));
      return NextResponse.next();
    }

    // RBAC Checks
    if (requireAdmin && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    if (requireCustomer && userRole !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    if (requireRider && userRole !== "RIDER") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid or expired token
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("session");
    return response;
  }
}

export const middleware = proxy;
