import { createHash, timingSafeEqual } from 'node:crypto';
import { validateApiKey } from '../helper/validateKey.js';

// hash the api key then store in the db
function hashApiKey(key) {
    return createHash("sha256").update(key).digest("hex");
}

function compareHashedApiKey(rawKey, storedHash) {

    let isValidkey = validateApiKey(rawKey);

    if(!isValidkey){
        return;
    }
    
    const hashed = hashApiKey(rawKey);

    const buffA = Buffer.from(hashed);
    const buffB = Buffer.from(storedHash);

    if (buffA.length !== buffB.length) return false;

    return timingSafeEqual(buffA, buffB);
}


export {
    hashApiKey,
    compareHashedApiKey
}