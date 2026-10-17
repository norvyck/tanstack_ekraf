import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { adapter } from "./db";

export const auth = betterAuth({
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
