const AUTH_KEY = "para-ai-auth";

const DEMO_CREDENTIALS = {
  email: "eric@example.com",
  password: "demo",
};

export function signIn(email: string, password: string): boolean {
  if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ email, signedInAt: Date.now() }));
    return true;
  }
  return false;
}

export function signOut() {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  try {
    return !!localStorage.getItem(AUTH_KEY);
  } catch {
    return false;
  }
}
