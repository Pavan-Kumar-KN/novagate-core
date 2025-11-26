// This function pass the logs of the each request

function createLoggerMiddleware(options) {
  const { log } = options;

  return async function logger(req, res, next) {
    const start = Date.now();

    // hook into response end
    const originalEnd = res.end;

    res.end = function newEnd(...args) {
      const duration = Date.now() - start;

      // send log to user callback
      log &&
        log({
          key: req.auth_key,
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          responseTime: duration,
          timestamp: Date.now(),
        });

      originalEnd.apply(res, args); // call original
    };

    next();
  };
}


export {
  createLoggerMiddleware
}