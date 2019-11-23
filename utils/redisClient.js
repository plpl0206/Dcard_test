var redis = require('redis');

let redisClient;

const getRedisInstance = () => {

    if (redisClient == null){
        redisClient = redis.createClient(require('./config.json'));
    }
    return redisClient;
};

module.exports = { getRedisInstance };