import { createApiClient, type ApiClient } from "@tragni/api-client";

/**
 * The only place that knows the API exists (arc42 chapter 5).
 * Reads the configuration per request rather than at import time, so a missing
 * value fails a request instead of the build.
 */
export function getApi(): ApiClient {
  const baseUrl = process.env.API_BASE_URL;

  if (!baseUrl) {
    throw new Error("API_BASE_URL is not configured.");
  }

  return createApiClient(baseUrl);
}
