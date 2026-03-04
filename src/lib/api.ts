import { getAuth } from "./firebase";

export async function authFetch(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const auth = getAuth();
  const user = auth.currentUser;
  const headers = new Headers(init?.headers);

  if (user) {
    const token = await user.getIdToken();
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, { ...init, headers });
}
