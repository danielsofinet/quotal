import type { Metadata } from "next";
import SignInClient from "./SignInClient";

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return <SignInClient />;
}
