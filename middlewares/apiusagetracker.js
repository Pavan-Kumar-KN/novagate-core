function createUsageTracker(options) {
  const { trackUsage } = options;
  
  return function usageTracker(req, res , next) {
    const key = req.auth_key;
    
    if (!key) return next();
    
    const info = {
      key,
      method: req.method,
      url: req.url,
      timestamp: Date.now()
    }
    
    try{
      trackUsage(info);
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
    
    next();
  }
}

export {
  createUsageTracker
}
