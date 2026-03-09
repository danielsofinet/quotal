import { NextResponse } from "next/server";
import { getUserWithProjects } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getUserWithProjects();
    if (!user) {
      return NextResponse.json({ result: "null — would redirect to sign-in" });
    }
    return NextResponse.json({
      result: "OK",
      userId: user.id,
      email: user.email,
      projectCount: Array.isArray(user.projects) ? user.projects.length : "no projects field",
    });
  } catch (err) {
    return NextResponse.json({
      result: "THREW",
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack?.split("\n").slice(0, 5) : undefined,
    });
  }
}
