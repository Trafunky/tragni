import createClient from "openapi-fetch";
import type { components, paths } from "./schema";

export type ApiClient = ReturnType<typeof createClient<paths>>;

/** Creates a client for the tragni.ch API. Paths and responses are typed. */
export function createApiClient(baseUrl: string): ApiClient {
  return createClient<paths>({ baseUrl });
}

export type Status = components["schemas"]["GetStatusResponse"];
