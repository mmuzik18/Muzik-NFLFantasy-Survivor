import type { NextConfig } from "next";

// AWS's own regional endpoints for Cognito User Pool / Identity Pool auth,
// plus a wildcard for this app's AppSync API (the subdomain differs per
// environment — sandbox vs. this branch deployment — so it can't be
// pinned to one literal hostname here). All of these are called directly
// from the browser by the aws-amplify SDK; none of it is proxied through
// our own server.
const AWS_REGION = "us-east-1";
const CONNECT_SRC = [
  "'self'",
  `https://cognito-idp.${AWS_REGION}.amazonaws.com`,
  `https://cognito-identity.${AWS_REGION}.amazonaws.com`,
  `https://sts.${AWS_REGION}.amazonaws.com`,
  `https://*.appsync-api.${AWS_REGION}.amazonaws.com`,
  `wss://*.appsync-realtime-api.${AWS_REGION}.amazonaws.com`,
].join(" ");

// script-src allows 'unsafe-inline' rather than a nonce: nonces need a
// fresh value per request (since Next injects its own inline hydration
// scripts with content that varies per request), which per Next's own
// docs requires opting every page into dynamic rendering — full SSR on
// every request, no static optimization, ever, app-wide. That's a real,
// permanent cost for a small app like this one, and the payoff is small
// here: React escapes all rendered content by default, there's no
// dangerouslySetInnerHTML on user-controlled content anywhere in this
// codebase (verified — the one usage is this file's own static theme
// script), and no eval. The other directives below still do real work
// against clickjacking, form hijacking, and data exfiltration regardless.
//
// Report-Only, not enforced: even with that scope, this policy hasn't
// been exercised against a real signed-in session (sign-in/pick/admin
// flows), only the public sign-in screen — verified via a production
// build with no violations. Report-Only can't break the app — it only
// logs to the console — so it's safe to ship now; switch the header key
// below to "Content-Security-Policy" once real sessions confirm it's
// clean.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  `connect-src ${CONNECT_SRC}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy-Report-Only", value: CSP },
        ],
      },
    ];
  },
};

export default nextConfig;
