import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LandingPage from "@/components/landing/LandingPage";

export default async function Home() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session");

  if (session?.value) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
