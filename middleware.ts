import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        if (
          pathname === "/" ||
          pathname.startsWith("/report") ||
          pathname === "/admin" ||
          pathname.startsWith("/api/submit") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/_next")
        ) return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/dashboard/:path*", "/admin/cases/:path*", "/api/admin/:path*", "/api/push/:path*"],
};
