import http from "http";
import { createAuthMiddleware } from "../src/auth/auth.js";
import { hashApiKey } from "../src/util/hash.js";
import { CreateDailyUsageTracker } from "../src/limits/limit.js";
import { createBurstLimitMiddleware } from "../src/limits/burst.js";
import { createLoggerMiddleware } from "../src/trackers/logger.js";
import { createUsageTracker } from "../src/trackers/apiusagetracker.js";
import { createSuspensionMiddleware } from "../src/security/suspension.js";

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
    burstLimit: 3,
    suspended: false,
  },
  {
    id: 2,
    name: "Test Client",
    apiKey: "12346678940",
    dailyUsage: 20,
    presentUsage: 0,
    burstLimit: 5,
    suspended: false,
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
    const userData = user.find((u) => u.hashedKey === hashedKey);
    return userData?.burstLimit ?? 0; // 0 if not found
  },
  // map methods to set the data
  setData: (dbKey, entry) => burstMap.set(dbKey, entry),
  getData: (dbkey) => burstMap.get(dbkey),
  waitSec: 7000,
});

const logger = createLoggerMiddleware({
  log: (info) => {
    console.log("LOG:", info);
    // OR save in DB
  },
});

const usageTracker = createUsageTracker({
  trackUsage: async ({ key, method, url, timestamp }) => {
    console.log("TRACK:", key, method, url);
    // save to DB if needed
  },
});

const suspendMiddleware = createSuspensionMiddleware({
  storagefn: {
    getSuspended: async (key) => {
      const userData = user.find((u) => u.hashedKey === key);
      return userData?.suspended ?? false; // false if not found
    },
    suspend: async (key) => {
      const userData = user.find((u) => u.hashedKey === key);
      if (userData) {
        userData.suspended = true;
        return true;
      }
      return false;
    },
    getData: async (key) => {
      const userData = user.find((u) => u.hashedKey === key);
      return userData?.presentUsage ?? 0;
    },
  },
});

// 5) Create a simple HTTP server to test
const server = http.createServer(async (req, res) => {
  // this will run for every request if the daily limit is reached then we will api key reached error
  //     // call the middleware manually
  authMiddleware(req, res, () => {
    suspendMiddleware(req, res, () => {
      usageTracker(req, res, () => {
        logger(req, res, () => {
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
            });
          });
        });
      });
    });
  });
});

server.listen(8080, () => {
  console.log("Test server running on http://localhost:8080");
  console.log("Use this API key in header x-api-key:", RAW_KEY);
});
