import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// GET /api/auth/session — return current user session from cookie
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("unity-session");

    if (!sessionCookie) {
      return NextResponse.json(null, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    return NextResponse.json(session);
  } catch {
    return NextResponse.json(null, { status: 401 });
  }
}
