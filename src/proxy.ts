import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isLoginPage = createRouteMatcher(["/admin/login"]);
const isAdminPage = createRouteMatcher(["/admin", "/admin/(.*)"]);

/**
 * Admin-panel gatekeeper. It also relays login requests to Convex via
 * /api/auth. This only decides which page to show; every admin query and
 * mutation re-checks the signed-in admin in Convex (convex/auth.ts → requireAdmin).
 */
export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    const signedIn = await convexAuth.isAuthenticated();
    if (isLoginPage(request)) {
      if (signedIn) return nextjsMiddlewareRedirect(request, "/admin");
      return;
    }
    if (isAdminPage(request) && !signedIn) return nextjsMiddlewareRedirect(request, "/admin/login");
  },
  { cookieConfig: { maxAge: 60 * 60 * 24 * 14 } }, // stay signed in for 14 days
);

// Public pages never run this, so they stay static and fast.
export const config = { matcher: ["/admin", "/admin/:path*", "/api/auth"] };
