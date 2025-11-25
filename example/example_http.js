import http from "http";
import { createAuthMiddleware  } from '../middlewares/auth.js'
import { hashApiKey } from "../helper/hash.js";

// 1) Define a RAW key that the client will use
const RAW_KEY = "123456789";

// 2) Hash it using your own function
const HASHED_KEY = hashApiKey(RAW_KEY);

// 3) Fake DB (in-memory)
const KEYS = {
  [HASHED_KEY]: {
    id: 1,
    name: "Test Client",
    hashedKey: HASHED_KEY,
    suspended: false,
  },
};

// 4) Create the auth middleware with a keyLoader
const authMiddleware = createAuthMiddleware({
  keyLoader: async (hashedKey) => {
    let key =  KEYS[hashedKey]; 

    return key ? key.hashedKey :  null;
  },
});

// 5) Create a simple HTTP server to test
const server = http.createServer(async (req, res) => {
  // call the middleware manually
  authMiddleware(req, res, () => {
    // This runs ONLY if key is valid
    res.statusCode = 200;
    res.end("Protected data: You are authorized ✅");
  });
});

server.listen(8080, () => {
  console.log("Test server running on http://localhost:8080");
  console.log("Use this API key in header x-api-key:", RAW_KEY);
});
