import type { MiddlewareResponseHandler } from 'astro';
import { defineMiddleware, sequence } from 'astro/middleware';

// Define the CORS middleware
const corsHandler: MiddlewareResponseHandler = defineMiddleware(
  async (_, next) => {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Allow any origin
    };

    const response = await next();

    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.append(key, value);
    }

    return response;
  }
);

// Export the middleware using sequence
export const onRequest = sequence(corsHandler);
