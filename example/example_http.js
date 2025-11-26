import http from "http";
import { createAuthMiddleware } from "../middlewares/auth.js";
import { hashApiKey } from "../helper/hash.js";
import { CreateDailyUsageTracker } from "../middlewares/limit.js";
import { createBurstLimitMiddleware } from "../middlewares/burst.js";

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
    dailyUsage: 5,
    presentUsage: 0,
  },
};

let user = [
  {
    id: 1,
    name: "Test Client",
    apiKey: RAW_KEY,
    hashedKey: HASHED_KEY,
    dailyUsage: 20,
    presentUsage: 0,
    burstLimit: 3
  },
  {
    id: 2,
    name: "Test Client",
    apiKey: "12346678940",
    dailyUsage: 20,
    presentUsage: 0,
    burstLimit: 5
  },
];

const burstMap = new Map(); // key: clientId → { count, time }

// 4) Create the auth middleware with a keyLoader
const authMiddleware = createAuthMiddleware({
  keyLoader: async (hashedKey) => {
    let key = KEYS[hashedKey];

    return key ? key.hashedKey : null;
  },
});

const dailyLimitMiddleware = CreateDailyUsageTracker({
  storage: {
    getData: (id) => user.find((u) => u.hashedKey === id),
    incrementUsage: (id) => {
      let index = user.findIndex((u) => u.hashedKey === id);
      if (index !== -1) {
        user[index].presentUsage++;
      }
    },
  },
});

const burstLimitMiddleware = createBurstLimitMiddleware({
  getLimit: (hashedKey) => {
    const userData = user.find(u => u.hashedKey === hashedKey);
    return userData?.burstLimit ?? 0; // 0 if not found
  },
  // map methods to set the data 
  setData: (dbKey, entry) => burstMap.set(dbKey, entry),
  getData: (dbkey) => burstMap.get(dbkey),
  waitSec: 7000
})


// 5) Create a simple HTTP server to test
const server = http.createServer(async (req, res) => {
  // this will run for every request if the daily limit is reached then we will api key reached error
  //     // call the middleware manually
  authMiddleware(req, res, () => {
    dailyLimitMiddleware(req, res, () => {
      burstLimitMiddleware(req, res, () => {
        // Both checks passed
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            message: "Request successful",
            user: req.auth_key,
          }),
        );
      })
    });
  });
});

server.listen(8080, () => {
  console.log("Test server running on http://localhost:8080");
  console.log("Use this API key in header x-api-key:", RAW_KEY);
});
