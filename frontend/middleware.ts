import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware — currently a passthrough.
 * Auth/login can be added here in the future once a user system is introduced.
 */
export function middleware(request: NextRequest) {
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
