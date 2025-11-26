import { validateApiKey } from "../util/validate.js";
import { hashApiKey, compareHashedApiKey } from "../util/hash.js";

export function createAuthMiddleware(options) {
  const { keyLoader } = options;

  return async function authMiddleware(req, res, next) {
    // logic here
    const rawKey = req.headers["x-api-key"];

    // / 1) Validate input format
    if (!validateApiKey(rawKey)) {
      res.statusCode = 401;
      return res.end("Invalid API Key Format");
    }

    const hashedKey = hashApiKey(rawKey);

    const dbKey = await keyLoader(hashedKey);

    if (!dbKey) {
      res.statusCode = 401;
      return res.end("API Key Not Found");
    }

    // 4) Final secure comparison
    if (!compareHashedApiKey(rawKey, dbKey)) {
      res.statusCode = 401;
      return res.end("Unauthorized");
    }

    req.auth_key = dbKey;

    next();
  };
}
