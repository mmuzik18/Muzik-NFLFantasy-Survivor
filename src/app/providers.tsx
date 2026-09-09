"use client";

import { Amplify } from "aws-amplify";
import { Authenticator, ThemeProvider } from "@aws-amplify/ui-react";
import type { Theme } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import outputs from "../../amplify_outputs.json";

Amplify.configure(outputs);

const theme: Theme = {
  name: "survivor-theme",
  tokens: {
    colors: {
      primary: {
        10: { value: "#eef5f0" },
        20: { value: "#d7e6dc" },
        40: { value: "#9fc2ab" },
        60: { value: "#5c8f6c" },
        80: { value: "#1f4a2e" },
        90: { value: "#123825" },
        100: { value: "#0b2e1d" },
      },
      secondary: {
        10: { value: "#faf3e3" },
        20: { value: "#f1dfb0" },
        40: { value: "#e3c179" },
        60: { value: "#d4a24e" },
        80: { value: "#c8912f" },
        90: { value: "#a97525" },
        100: { value: "#7d5619" },
      },
    },
    radii: {
      small: { value: "6px" },
      medium: { value: "8px" },
      large: { value: "12px" },
    },
    fonts: {
      default: {
        variable: { value: "var(--font-geist-sans), sans-serif" },
        static: { value: "var(--font-geist-sans), sans-serif" },
      },
    },
    components: {
      authenticator: {
        router: {
          borderWidth: { value: "1px" },
          borderStyle: { value: "solid" },
          borderColor: { value: "#e4dcc5" },
          backgroundColor: { value: "#fffdf8" },
          boxShadow: { value: "0 30px 60px -25px rgba(0,0,0,0.55)" },
        },
        form: {
          padding: { value: "2rem 2rem 1.5rem" },
        },
        footer: {
          paddingBottom: { value: "0.5rem" },
        },
      },
      tabs: {
        item: {
          color: { value: "#8a8377" },
          fontWeight: { value: "600" },
          _active: {
            color: { value: "#0b2e1d" },
            borderColor: { value: "#c8912f" },
          },
          _hover: { color: { value: "#0b2e1d" } },
          _focus: { color: { value: "#0b2e1d" } },
        },
      },
      fieldcontrol: {
        borderRadius: { value: "8px" },
        borderColor: { value: "#ddd4bc" },
        _focus: {
          borderColor: { value: "#c8912f" },
          boxShadow: { value: "0 0 0 3px rgba(200, 145, 47, 0.25)" },
        },
      },
      button: {
        fontWeight: { value: "700" },
        borderRadius: { value: "8px" },
        primary: {
          backgroundColor: { value: "#c8912f" },
          color: { value: "#17140f" },
          _hover: { backgroundColor: { value: "#d4a24e" } },
          _active: { backgroundColor: { value: "#a97525" } },
          _focus: {
            backgroundColor: { value: "#d4a24e" },
            boxShadow: { value: "0 0 0 3px rgba(200, 145, 47, 0.35)" },
          },
        },
        link: {
          color: { value: "#0b2e1d" },
          _hover: { color: { value: "#c8912f" } },
        },
      },
    },
  },
};

function BrandMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#c8912f" />
      <ellipse cx="16" cy="16" rx="9.5" ry="6.2" fill="#0b2e1d" />
      <path d="M8 16 L24 16" stroke="#c8912f" strokeWidth="0.9" />
      <path
        d="M13 13.4 L13 18.6 M15 12.6 L15 19.4 M17 12.6 L17 19.4 M19 13.4 L19 18.6"
        stroke="#c8912f"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

const components = {
  Header() {
    return (
      <div className="flex flex-col items-center gap-3 pt-10 pb-6 px-6 text-center">
        <BrandMark />
        <div>
          <h1 className="font-display text-2xl tracking-wide text-[#f7f3e8] uppercase">
            Muzik NFL Survivor
          </h1>
          <p className="mt-1 text-sm text-[#c9c3b2]">
            Pick one team a week. Don&apos;t repeat. Don&apos;t lose.
          </p>
        </div>
      </div>
    );
  },
  Footer() {
    return (
      <div className="pb-10 pt-4 text-center text-xs text-[#a7a08e]">
        Sign in to see the rules, make your pick, and check standings.
      </div>
    );
  },
};

// No Cognito-attribute-based sign-up field for a display name (e.g. via
// signUpAttributes={['nickname']}): that requires the user pool client to
// have write permission for that attribute, which — like the schema
// attribute itself — is a create-time-only setting on an already-deployed
// pool (confirmed against a real failed deploy). The display name is
// captured entirely on the app side after sign-up instead — see
// PlayerContext.tsx (needsDisplayName) and Navbar's EditableName.

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <Authenticator components={components}>{children}</Authenticator>
    </ThemeProvider>
  );
}
