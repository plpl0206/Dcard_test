const redisClient = require('../utils/redisClient').getRedisInstance();

const rateLimiter = (req, res, next) => {
    const ip = req.ip;
    redisClient
        .multi()
        .set([ip, 0, 'EX', 60, 'NX'])
        .incr(ip)
        .exec((error, replies) => {
            if (error){
                next(error);
                return;
            }
            const reqCount = replies[1];
            if (reqCount > 60){
                res.status(429).send('Error');
            } else {
                res.locals.reqCount = reqCount;
                next();
            }
        });
};

module.exports = { rateLimiter };