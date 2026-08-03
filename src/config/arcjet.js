import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";

const key = process.env.ARCJET_KEY;
if (!key) {
  throw new Error('Missing ARCJET_KEY environment variable');
}

const aj = arcjet({
  key, // Get your site key from https://app.arcjet.com
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc  
        "CATEGORY:PREVIEW",
        "POSTMAN" 
      ],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    slidingWindow({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      interval:'2s',
      max:5
    }),
  ],
});

export default aj;