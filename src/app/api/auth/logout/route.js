import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// POST /api/auth/logout — clear session cookie
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("unity-session");
  return NextResponse.json({ success: true });
}
