import crypto from 'crypto';

function validateApiKey(rawKey) {
    if (!rawKey) return false;
    if (typeof rawKey !== "string") return false;

    const trimmed = rawKey.trim();
    if (trimmed.length < 5) return false;

    return true;
}

function generateApiKey() {
    return crypto.randomBytes(32).toString("hex");
}

function checkapiKeyHeader(req, res ,next) {
    const apiKey = req.headers['x-api-key'];
    
  const isValid = validateApiKey(apiKey);
  
  if(!isValid){
    res.status(400).send({
      message:"Invalid Key"
    })
  }
    next();
}

export {
    validateApiKey,
    generateApiKey,
    checkapiKeyHeader
}