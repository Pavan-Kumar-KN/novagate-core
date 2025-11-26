# 🔐 Novagate — Secure API Key Gateway for Node.js

Novagate is a flexible and fast API key middleware system for Node.js apps.  
It provides authentication, usage limits, burst protection, suspension, logging, and analytics.

### ✨ Features

| Feature | Description |
|---------|-------------|
| 🔑 Secure API Key Auth | SHA-256 hashing + timing-safe comparisons |
| 📊 Usage Tracking | Track all requests, even blocked ones |
| 📌 Daily Limits | Define per-key daily quota |
| ⚡ Burst Limit | Protect against short-term spikes |
| 🛑 Auto Suspension | Ban abusive keys automatically |
| 📑 Logging | Capture latency + status + endpoint |
| 🚀 Framework Agnostic | Works with HTTP, Express, Fastify, Hono, etc. |
| 🔌 Pluggable Storage | Use MongoDB, Redis, SQL, Key-Value, etc. |

---

## 🚀 Installation

```bash
npm install novagate


Please Check /examples folder for usage examples.