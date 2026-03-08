import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// We want to stringently protect any routes that handle money, like the dashboard.
// Depending on user's setup, the root page might be a landing page or the dashboard itself.
const isProtectedRoute = createRouteMatcher(["/", "/dashboard(.*)", "/send(.*)"]);

// /nfc is intentionally public — NFC card users bypass Clerk entirely
const isPublicRoute = createRouteMatcher(["/nfc(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    if (isPublicRoute(req)) return; // skip auth for NFC flow
    if (isProtectedRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)"
    ]
};
