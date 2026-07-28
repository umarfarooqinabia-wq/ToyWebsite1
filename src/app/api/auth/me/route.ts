import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getCurrentUser,
  getUserSession,
} from "@/lib/auth/session";
import { updateUserProfile } from "@/lib/auth/users-db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  return NextResponse.json({ user });
}

const patchSchema = z.object({
  fullName: z.string().min(2).max(80).optional(),
  phone: z.string().max(30).optional(),
});

export async function PATCH(request: Request) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const json = await request.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid profile update", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const user = await updateUserProfile(session.userId, parsed.data);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Could not update profile" }, { status: 500 });
  }
}
