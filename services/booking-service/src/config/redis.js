const Redis = require("ioredis");

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT || 6379),
  lazyConnect: true,
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    return Math.min(times * 500, 5000);
  },
});

const connectRedis = async () => {
  if (redisClient.status === "ready") {
    return redisClient;
  }

  await redisClient.connect();
  console.log("Booking service connected to Redis");
  return redisClient;
};

const disconnectRedis = async () => {
  if (redisClient.status === "ready" || redisClient.status === "connect") {
    await redisClient.quit();
  }
};

module.exports = {
  redisClient,
  connectRedis,
  disconnectRedis,
};
