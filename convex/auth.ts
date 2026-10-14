import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexError } from "convex/values";
import type { QueryCtx } from "./_generated/server";

/** The one email allowed to use the admin panel. Set with `npx convex env set ADMIN_EMAIL ...`. */
export function adminEmail() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) throw new ConvexError("ADMIN_EMAIL is not set on the Convex deployment.");
  return email;
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      // Runs for every flow (sign up, sign in). Anyone who isn't the admin is
      // turned away before an account is created or a password is checked.
      profile(params) {
        const email = String(params.email ?? "").trim().toLowerCase();
        if (email !== adminEmail()) throw new ConvexError("Invalid email or password.");
        return { email };
      },
      validatePasswordRequirements(password) {
        if (password.length < 12) throw new ConvexError("Use at least 12 characters for the password.");
      },
    }),
  ],
});

/**
 * Every admin query and mutation starts with this. It checks the signed-in
 * user in the database itself, so hiding pages in the browser is never the
 * only protection.
 */
export async function requireAdmin(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("Not signed in.");
  const user = await ctx.db.get(userId);
  if (!user?.email || user.email.toLowerCase() !== adminEmail()) throw new ConvexError("Not allowed.");
  return { userId, email: user.email };
}
