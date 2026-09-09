import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import outputs from "../../amplify_outputs.json";

// Configured here too (not just in providers.tsx) so this module never
// depends on import order relative to Providers — Amplify.configure() is
// idempotent, so whichever of the two runs first "wins" and the other is
// a harmless no-op. Without this, generateClient() could run before
// Amplify.configure() depending on how the client bundle happens to be
// ordered (this was a real bug: PlayerContext, used from the (app) layout
// alongside Providers, pulled in this module through a second import path).
Amplify.configure(outputs);

export const client = generateClient<Schema>();
