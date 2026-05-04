import { hc } from "hono/client";
import type { app } from "./index";

/**
 * Type representing the Hono app instance for client-side consumption.
 */
export type AppType = typeof app;

/**
 * Type representing the RPC client generated from the Hono app.
 */
export type Client = ReturnType<typeof hc<AppType>>;

/**
 * Creates a typed Hono RPC client.
 *
 * @param args - Arguments passed to the Hono client creator
 * @returns A typed RPC client instance
 */
export const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<AppType>(...args);