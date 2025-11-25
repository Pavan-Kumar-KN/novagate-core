| Feature                           | Description                                                                        |
| --------------------------------- | ---------------------------------------------------------------------------------- |
| **API Key Authentication**        | Validates client calls using hashed API keys (never store raw keys).               |
| **Pluggable Storage**             | Users provide their own DB storage handlers (Mongo / SQL / Redis / File / Memory). |
| **Daily Request Limit**           | Blocks clients who exceed daily allowed API calls.                                 |
| **Burst Rate Limiting**           | Prevents spam by restricting high request frequency per second.                    |
| **Usage Tracking Hook**           | Emits request usage so the user can store it anywhere.                             |
| **Logging Hook**                  | Emits request logs (URL, key, timestamp, status, response time).                   |
| **Suspension Trigger (Optional)** | Calls a callback to suspend abusive clients.                                       |
| **Framework-Agnostic**            | Works with raw HTTP, Express, Fastify, Hono, Next API, etc.                        |
| **Hash-Based Key Validation**     | Only hashes are compared → secure even if DB leaks.                                |

## The usecase in the package 
```
import novagate from "novagate-core";

app.use(novagate({
  limits: { daily: 1000, burst: 30 },
  keyLoader: async (apiKeyHash) => {}, // get client info
  storage: {
    incrementUsage: async (clientId) => {},
    log: async (logData) => {},
    suspendClient: async (clientId) => {}
  }
}));
```

