const KEY = "223343sdf";

function checkapiKeyHeader(req, res) {
    const apiKey = req.headers['x-api-key'];

    if (apiKey !== KEY) {
        res.statusCode = 401;
        res.end("Invalid API KEY");
        return;
    }

    res.statusCode = 200;
    res.end("You are authorized!");
}

export {
    checkapiKeyHeader
}