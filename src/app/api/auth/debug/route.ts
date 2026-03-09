import { NextResponse } from "next/server";
import { getUserWithProjects } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getUserWithProjects();
    if (!user) {
      return NextResponse.json({ status: "no_user", message: "getUserWithProjects returned null — check server logs for [auth] messages" });
    }
    return NextResponse.json({
      status: "ok",
      userId: user.id,
      email: user.email,
      projectCount: user.projects?.length ?? 0,
    });
  } catch (err) {
    return NextResponse.json({
      status: "error",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
