import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION_COOKIE_NAME = "expenseflow_session";
const SESSION_EXPIRATION = "7d";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

// Secret key for HMAC signing
const secretKey = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ||
    "expenseflow_dev_secret_key_8f3a2b1c9d0e4f5a6b7c8d9e0f1a2b3c"
);

export interface UserSession {
  userId: string;
  email: string;
  name?: string | null;
  currency?: string;
}

/**
 * Creates and signs a secure JWT session token.
 */
export async function signSessionToken(payload: UserSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRATION)
    .sign(secretKey);
}

/**
 * Verifies a JWT session token and returns the payload if valid.
 */
export async function verifySessionToken(
  token: string
): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    if (!payload.userId || !payload.email) {
      return null;
    }

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: (payload.name as string) || null,
      currency: (payload.currency as string) || "USD",
    };
  } catch (error) {
    // Expired or tampered token
    return null;
  }
}

/**
 * Sets the HTTP-only secure session cookie for the authenticated user.
 */
export async function setSessionCookie(user: UserSession): Promise<void> {
  const token = await signSessionToken(user);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/**
 * Retrieves and validates the current user session from cookies.
 */
export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!tokenCookie?.value) {
    return null;
  }

  return verifySessionToken(tokenCookie.value);
}

/**
 * Enforces server-side authorization.
 * If user is not authenticated, throws or redirects to /login.
 */
export async function requireAuth(): Promise<UserSession> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

/**
 * Destroys the current user session by clearing the cookie.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
