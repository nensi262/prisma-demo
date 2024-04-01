import { NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware() {
  // const next = request.nextUrl.pathname ?? "";
  // if (!request.cookies.has("moove_token")) {
  //   return NextResponse.redirect(
  //     new URL(`/auth${next ? `?next=${next}` : ""}`, request.url),
  //   );
  // }

  return NextResponse.next();
}

// export const config = {
//   runtime: "nodejs",
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      */
//     "/((?!api|_next/static|_next/image|favicon.ico|auth|p|icons).*)",
//   ],
// };
