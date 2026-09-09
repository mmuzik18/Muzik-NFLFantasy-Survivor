import { fetchAuthSession } from "aws-amplify/auth";

/** Whether the current signed-in user is in the `admins` Cognito group. */
export async function isAdmin(): Promise<boolean> {
  const session = await fetchAuthSession();
  const groups = session.tokens?.accessToken?.payload["cognito:groups"] as
    | string[]
    | undefined;
  return groups?.includes("admins") ?? false;
}
