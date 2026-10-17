import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { adapter } from "./db";

const trustedOrigins = new Set(["http://localhost:3000", "http://127.0.0.1:3000"]);
const authUrl = process.env.BETTER_AUTH_URL;
const vercelUrl = process.env.VERCEL_URL;

if (authUrl) {
	trustedOrigins.add(new URL(authUrl).origin);
}

if (vercelUrl) {
	trustedOrigins.add(`https://${vercelUrl}`);
}

trustedOrigins.add("https://ifs24012-tanstack-ekraf.vercel.app");

export const auth = betterAuth({
	trustedOrigins: [...trustedOrigins],
	database: adapter,
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
		// Minimum password length enforced by Better Auth (8 chars).
		minPasswordLength: 8,
	},
	rateLimit: {
		enabled: true,
		window: 60,
		max: 5,
		customRules: {
			"/sign-in/email": { window: 60, max: 5 },
			"/sign-up/email": { window: 60, max: 3 },
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
		cookieCache: {
			enabled: true,
			maxAge: 60 * 15,
		},
	},
	defaultCookieAttributes: {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
	},
	plugins: [tanstackStartCookies()],
});

export default auth;
