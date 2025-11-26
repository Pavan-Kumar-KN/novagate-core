import express from "express";
import { createAuthMiddleware } from "../middlewares/auth.js";
import { CreateDailyUsageTracker } from "../middlewares/limit.js";
import { createBurstLimitMiddleware } from "../middlewares/burst.js";
import { createLoggerMiddleware } from "../middlewares/logger.js";
import { createUsageTracker } from "../middlewares/apiusagetracker.js";
import { hashApiKey } from "../helper/hash.js";

const app = express();

// ---------------------
// SAMPLE DATA
// ---------------------

const RAW_KEY = "123456789";
const HASHED_KEY = hashApiKey(RAW_KEY);

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
  },
];

const burstMap = new Map();

// ---------------------
// MIDDLEWARE WRAPPERS
// ---------------------

function wrap(middleware) {
  return (req, res, next) => middleware(req, res, next);
}

const authMiddleware = wrap(
  createAuthMiddleware({
    keyLoader: async (hashedKey) => {
      const key = KEYS[hashedKey];
      return key ? key.hashedKey : null;
    },
  })
);

const usageTracker = wrap(
  createUsageTracker({
    trackUsage: ({ key, method, url }) => {
      console.log("TRACK:", key, method, url);
    },
  })
);

const logger = wrap(
  createLoggerMiddleware({
    log: (info) => console.log("LOG:", info),
  })
);

const dailyLimitMiddleware = wrap(
  CreateDailyUsageTracker({
    storage: {
      getData: (id) => user.find((u) => u.hashedKey === id),
      incrementUsage: (id) => {
        let index = user.findIndex((u) => u.hashedKey === id);
        if (index !== -1) user[index].presentUsage++;
      },
    },
  })
);

const burstLimitMiddleware = wrap(
  createBurstLimitMiddleware({
    getLimit: (hashedKey) => {
      const userData = user.find((u) => u.hashedKey === hashedKey);
      return userData?.burstLimit ?? 0;
    },
    setData: (dbKey, entry) => burstMap.set(dbKey, entry),
    getData: (dbKey) => burstMap.get(dbKey),
  })
);

// ---------------------
// APPLY IN PROPER ORDER
// ---------------------

app.use(authMiddleware);
app.use(usageTracker);       // track all valid requests
app.use(logger);             // track response + time
app.use(dailyLimitMiddleware);
app.use(burstLimitMiddleware);

// ---------------------
// ROUTES
// ---------------------

app.get("/", (req, res) => {
  res.json({
    message: "Request successful",
    user: req.auth_key,
  });
});

// ---------------------
// START SERVER
// ---------------------

app.listen(8080, () => {
  console.log("Express server running on http://localhost:8080");
  console.log("Use API key:", RAW_KEY);
});
