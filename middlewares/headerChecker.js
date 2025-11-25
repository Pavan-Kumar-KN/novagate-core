
function checkapiKeyHeader(req, res , next) {
    const apiKey = req.headers['x-api-key'];

    if (apiKey !== KEY) {
        res.statusCode = 401;
        res.end("Invalid API KEY");
        return;
    }

    next();
}

export {
    checkapiKeyHeader
}