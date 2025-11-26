
function createBurstLimitMiddleware(options) {
    const { getLimit, setData, getData , waitSec} = options;

    return async function burstlimit(req, res, next) {
        const dbKey = req.auth_key;

        if (!dbKey) {
            res.statusCode = 500;
            return res.end("Auth must run before burst limit");
        }

        const burstLimit = await getLimit(dbKey);

        let now = Date.now();
        let entry = getData(dbKey) || {count : 0 , time : now};

        console.log("the entry data " , entry);

        if (now - entry.time < waitSec) {
            entry.count++;
        } else {
            // reset for new second
            entry.count = 1;
            entry.time = now;
        }

        setData(dbKey , entry);

        if (entry.count > burstLimit) {
            res.statusCode = 429;
            return res.end("Too many requests (burst limit exceeded)");
        }

        next();
    }
}

export {
    createBurstLimitMiddleware
}