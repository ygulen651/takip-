import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin-only routes
    const adminRoutes = ["/clients", "/projects", "/reports", "/admin"];
    const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));

    if (isAdminRoute && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/projects/:path*",
    "/tasks/:path*",
    "/my-tasks/:path*",
    "/reports/:path*",
    "/admin/:path*",
  ],
};

