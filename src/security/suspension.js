function createSuspensionMiddleware(options) {
  const { storagefn, maxStrikes = 10 } = options;

  return async function suspension(req, res, next) {
    const key = req.auth_key;
    if (!key) return next();

    let isSuspended = await storagefn.getSuspended(key);
    
    if (isSuspended) {
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ error: "API Key Suspended" }));
    }

    let  presentUsage  = await storagefn.getData(key);

    if (presentUsage > maxStrikes) {
      await storagefn.suspend(key);
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ error: "API Key Suspended" }));
    }
    
    next();
  };
}

export {
  createSuspensionMiddleware
}