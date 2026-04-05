const amqp = require("amqplib");

const BOOKING_EXCHANGE = "booking_exchange";

let connection;
let channel;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectRabbit = async () => {
  const rabbitUrl = process.env.RABBITMQ_URL || "amqp://localhost:5672";

  while (!channel) {
    try {
      connection = await amqp.connect(rabbitUrl);
      channel = await connection.createChannel();

      await channel.assertExchange(BOOKING_EXCHANGE, "topic", {
        durable: true,
      });

      console.log("Booking service connected to RabbitMQ");
    } catch (error) {
      console.error("Booking service waiting for RabbitMQ...", error.message);
      await sleep(5000);
    }
  }

  return channel;
};

const getChannel = () => {
  if (!channel) {
    throw new Error("RabbitMQ channel has not been initialized yet.");
  }

  return channel;
};

const publishEvent = async (routingKey, event) => {
  const activeChannel = getChannel();

  activeChannel.publish(
    BOOKING_EXCHANGE,
    routingKey,
    Buffer.from(JSON.stringify(event)),
    { persistent: true }
  );
};

module.exports = {
  BOOKING_EXCHANGE,
  connectRabbit,
  getChannel,
  publishEvent,
};
