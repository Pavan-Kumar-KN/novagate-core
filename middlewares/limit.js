function CreateDailyUsageTracker(options) {
  const { storage } = options;

  return async function limit(req, res, next) {
    const dbKey = req.auth_key;

    let data = storage.getData(dbKey); // user object we will now

    await storage.incrementUsage(dbKey);
    
    if (data?.presentUsage >= data?.dailyUsage) {
      res.statusCode = 429;
       res.setHeader("Content-Type", "application/json");
       return res.end(JSON.stringify({
         error: "Daily API limit exceeded"
       }));
    }

    next();
  };
}
  
export { CreateDailyUsageTracker };
