function CreateDailyUsageTracker(options) {
  const { storage } = options;

  return async function limit(req, res, next) {
    const dbKey = req.auth_key;

    let data = storage.getData(dbKey); // user object we will now

    if (data?.presentUsage >= data?.dailyUsage) {
      return res.end("Daily API limit exceeded");
    }

    await storage.incrementUsage(dbKey);
    next();
  };
}
  
export { CreateDailyUsageTracker };
