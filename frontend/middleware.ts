import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = ["http://localhost:5000"];
const allowedHeaders = ["Content-Type", "Authorization"];

export async function middleware(req: NextRequest) {
  const token =
    req.cookies.get("next-auth.session-token") ||
    req.cookies.get("__Secure-next-auth.session-token"); // For HTTPS

  const safeRoutes = ["/", "/forgot-password", "/signup", "/two-factor-auth"]; // Define safe routes accessible to unauthenticated users
  const isSafeRoute = safeRoutes.includes(req.nextUrl.pathname);

  // CORS handling
  const origin = req.headers.get("origin") ?? "";
  const isAllowedOrigin = allowedOrigins.includes(origin);

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    const preflightHeaders = {
      ...(isAllowedOrigin && { "Access-Control-Allow-Origin": origin }),
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": allowedHeaders.join(", "),
      "Access-Control-Max-Age": "86400", // 24 hours
    };
    return new NextResponse(null, { headers: preflightHeaders });
  }

  let response: NextResponse;

  // Authentication logic
  if (isSafeRoute && !token) {
    response = NextResponse.next();
  } else if (token && req.nextUrl.pathname === "/") {
    response = NextResponse.redirect(new URL("/overview", req.url));
  } else if (!token && !isSafeRoute) {
    response = NextResponse.redirect(new URL("/", req.url));
  } else {
    response = NextResponse.next();
  }

  // Set CORS headers for the actual request
  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    allowedHeaders.join(", ")
  );

  return response;
}

// Apply middleware to all routes except static and API routes
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
