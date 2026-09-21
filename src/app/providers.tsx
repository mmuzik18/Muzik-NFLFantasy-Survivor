"use client";

import { useState } from "react";
import { Amplify } from "aws-amplify";
import { Authenticator, ThemeProvider } from "@aws-amplify/ui-react";
import type { Theme } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import outputs from "../../amplify_outputs.json";
import { BrandMark } from "@/components/BrandMark";
import { loadPendingDisplayName, savePendingDisplayName } from "@/lib/pendingDisplayName";

Amplify.configure(outputs);

// Every color here is a CSS variable from globals.css, so the sign-in
// screen follows the same light/dark tokens as the rest of the app. The
// ThemeProvider below is pinned to colorMode="light" so Amplify never
// applies its own dark overrides on top of ours.
const theme: Theme = {
  name: "survivor-theme",
  tokens: {
    colors: {
      font: {
        primary: { value: "var(--color-ink)" },
        secondary: { value: "var(--color-muted)" },
        tertiary: { value: "var(--color-muted)" },
        interactive: { value: "var(--color-ink)" },
        hover: { value: "var(--color-muted)" },
        focus: { value: "var(--color-ink)" },
        active: { value: "var(--color-ink)" },
        error: { value: "var(--color-loss)" },
      },
      background: {
        primary: { value: "var(--color-surface)" },
        secondary: { value: "var(--color-sunk)" },
        tertiary: { value: "var(--color-sunk)" },
      },
      border: {
        primary: { value: "var(--color-line)" },
        secondary: { value: "var(--color-line)" },
        tertiary: { value: "var(--color-line)" },
        focus: { value: "var(--color-ink)" },
        error: { value: "var(--color-loss)" },
      },
    },
    radii: {
      small: { value: "6px" },
      medium: { value: "6px" },
      large: { value: "6px" },
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
          borderColor: { value: "var(--color-line)" },
          backgroundColor: { value: "var(--color-surface)" },
          boxShadow: { value: "none" },
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
          color: { value: "var(--color-muted)" },
          fontWeight: { value: "600" },
          _active: {
            color: { value: "var(--color-ink)" },
            borderColor: { value: "var(--color-ink)" },
          },
          _hover: { color: { value: "var(--color-ink)" } },
          _focus: { color: { value: "var(--color-ink)" } },
        },
      },
      fieldcontrol: {
        borderRadius: { value: "6px" },
        borderColor: { value: "var(--color-line)" },
        color: { value: "var(--color-ink)" },
        _focus: {
          borderColor: { value: "var(--color-ink)" },
          boxShadow: { value: "0 0 0 1px var(--color-ink)" },
        },
      },
      button: {
        fontWeight: { value: "600" },
        borderRadius: { value: "6px" },
        primary: {
          backgroundColor: { value: "var(--color-accent)" },
          color: { value: "var(--color-on-accent)" },
          _hover: {
            backgroundColor: {
              value: "color-mix(in srgb, var(--color-accent) 88%, var(--color-ink))",
            },
            color: { value: "var(--color-on-accent)" },
          },
          _active: {
            backgroundColor: {
              value: "color-mix(in srgb, var(--color-accent) 80%, var(--color-ink))",
            },
            color: { value: "var(--color-on-accent)" },
          },
          _focus: {
            backgroundColor: { value: "var(--color-accent)" },
            color: { value: "var(--color-on-accent)" },
            boxShadow: { value: "0 0 0 2px var(--color-ink)" },
          },
        },
        link: {
          color: { value: "var(--color-ink)" },
          _hover: { color: { value: "var(--color-muted)" } },
        },
      },
    },
  },
};

// Sits above the actual (Cognito-managed) email field on the Create
// Account tab. Deliberately NOT a real Cognito attribute (e.g. via
// signUpAttributes={['nickname']}): that requires the user pool client
// to have write permission for that attribute, which, like the pool's
// schema itself, is a create-time-only setting on an already-deployed
// pool (confirmed against a real failed deploy). Captured into
// localStorage instead and consumed once the account is created, see
// pendingDisplayName.ts and PlayerContext.tsx.
function SignUpNameField() {
  const [value, setValue] = useState(() => loadPendingDisplayName());

  return (
    <div className="px-8 pt-8 pb-1">
      <label
        htmlFor="pending-display-name"
        className="mb-1.5 block text-sm font-medium text-ink"
      >
        Display name
      </label>
      <input
        id="pending-display-name"
        name="pending-display-name"
        type="text"
        autoComplete="off"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          savePendingDisplayName(e.target.value);
        }}
        placeholder="What should we call you?"
        maxLength={40}
        className="w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
      />
      <p className="mt-1.5 text-sm text-muted">
        Optional. Shown instead of your email everywhere in the app. You can change it later too.
      </p>
    </div>
  );
}

const components = {
  Header() {
    return (
      <div className="flex flex-col items-start gap-5 pt-4 pb-8">
        <BrandMark size={34} />
        <div>
          <h1 className="font-display text-5xl leading-[0.9] font-bold tracking-tight text-ink">
            Muzik NFL Survivor
          </h1>
          <p className="mt-3 text-[15px] text-muted">
            Pick one team a week. Don&apos;t repeat. Don&apos;t lose.
          </p>
        </div>
      </div>
    );
  },
  Footer() {
    return (
      <div className="pt-6 pb-10 text-sm text-muted">
        Sign in to see the rules, make your pick, and check standings.
      </div>
    );
  },
  SignUp: {
    Header: SignUpNameField,
  },
};

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme} colorMode="light">
      <Authenticator components={components}>{children}</Authenticator>
    </ThemeProvider>
  );
}
