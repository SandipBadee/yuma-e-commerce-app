// middleware.js
export { default } from "next-auth/middleware";

export const config = { 
  // Admin-only surface: protect the complete admin area.
  matcher: ["/admin/:path*"], 
};