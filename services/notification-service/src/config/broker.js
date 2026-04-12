const amqp = require("amqplib");
const { sendMail } = require("../mailer");

const BOOKING_EXCHANGE = "booking_exchange";
const NOTIFICATION_QUEUE = "notification_queue";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectRabbit = async () => {
  const rabbitUrl = process.env.RABBITMQ_URL || "amqp://localhost:5672";

  while (true) {
    try {
      const connection = await amqp.connect(rabbitUrl);
      const channel = await connection.createChannel();

      await channel.assertExchange(BOOKING_EXCHANGE, "topic", {
        durable: true,
      });

      await channel.assertQueue(NOTIFICATION_QUEUE, {
        durable: true,
      });

      await channel.bindQueue(NOTIFICATION_QUEUE, BOOKING_EXCHANGE, "booking.created");
      await channel.bindQueue(NOTIFICATION_QUEUE, BOOKING_EXCHANGE, "payment.success");
      await channel.bindQueue(NOTIFICATION_QUEUE, BOOKING_EXCHANGE, "payment.failed");

      await channel.consume(NOTIFICATION_QUEUE, async (message) => {
        if (!message) return;

        try {
          const payload = JSON.parse(message.content.toString());

          if (payload.event === "booking.created") {
            console.log(`[Notification] Sending booking-created email to ${payload.data.userEmail}`);
            await sendMail("booking.created", payload.data);
          }

          if (payload.event === "payment.success") {
            console.log(`[Notification] Sending payment-success email to ${payload.data.userEmail}`);
            await sendMail("booking.confirmed", payload.data);
          }

          if (payload.event === "payment.failed") {
            console.log(`[Notification] Sending payment-failed email to ${payload.data.userEmail}`);
            await sendMail("booking.failed", payload.data);
          }

          channel.ack(message);
        } catch (error) {
          console.error("Notification consumer error:", error.message);
          channel.nack(message, false, false);
        }
      });

      console.log("Notification service connected to RabbitMQ");
      return;
    } catch (error) {
      console.error("Notification service waiting for RabbitMQ...", error.message);
      await sleep(5000);
    }
  }
};

module.exports = connectRabbit;