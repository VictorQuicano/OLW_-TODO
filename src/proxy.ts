import { NextResponse, type NextRequest } from "next/server";

// Optimistic check only: no cookie → login. The signature is verified by requireUser().
export function proxy(request: NextRequest) {
  if (!request.cookies.has("olw_session")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Everything except the login page, Next internals and static assets.
  matcher: ["/((?!login|_next/|models/|favicon.ico).*)"],
};
