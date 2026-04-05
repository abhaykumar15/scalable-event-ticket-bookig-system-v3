const amqp = require("amqplib");

const BOOKING_EXCHANGE = "booking_exchange";
const PAYMENT_QUEUE = "payment_queue";
const PAYMENT_RETRY_QUEUE = "payment_retry_queue";
const PAYMENT_DLQ = "payment_dlq";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectRabbit = async () => {
  const rabbitUrl = process.env.RABBITMQ_URL || "amqp://localhost:5672";
  const maxRetries = Number(process.env.PAYMENT_MAX_RETRIES || 3);
  const retryDelayMs = Number(process.env.PAYMENT_RETRY_DELAY_MS || 5000);

  while (true) {
    try {
      const connection = await amqp.connect(rabbitUrl);
      const channel = await connection.createChannel();

      await channel.assertExchange(BOOKING_EXCHANGE, "topic", {
        durable: true,
      });

      await channel.assertQueue(PAYMENT_RETRY_QUEUE, {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": BOOKING_EXCHANGE,
          "x-dead-letter-routing-key": "booking.created",
        },
      });

      await channel.assertQueue(PAYMENT_DLQ, {
        durable: true,
      });

      await channel.assertQueue(PAYMENT_QUEUE, {
        durable: true,
      });

      await channel.bindQueue(PAYMENT_QUEUE, BOOKING_EXCHANGE, "booking.created");

      await channel.consume(PAYMENT_QUEUE, async (message) => {
        if (!message) {
          return;
        }

        try {
          const payload = JSON.parse(message.content.toString());
          const attempt = Number(payload.meta?.attempt || 0);
          const success = Math.random() >= 0.25;

          if (success) {
            const successEvent = {
              event: "payment.success",
              data: {
                bookingId: payload.data.bookingId,
                amount: payload.data.amount,
                attempt: attempt + 1,
                userEmail: payload.data.userEmail,
                seatNumbers: payload.data.seatNumbers,
                movieTitle: payload.data.movieTitle,
              },
              createdAt: new Date().toISOString(),
            };

            channel.publish(
              BOOKING_EXCHANGE,
              "payment.success",
              Buffer.from(JSON.stringify(successEvent)),
              { persistent: true }
            );

            console.log(`Payment succeeded for booking ${payload.data.bookingId}`);
          } else if (attempt + 1 < maxRetries) {
            const retryPayload = {
              ...payload,
              meta: {
                attempt: attempt + 1,
              },
            };

            channel.sendToQueue(
              PAYMENT_RETRY_QUEUE,
              Buffer.from(JSON.stringify(retryPayload)),
              {
                persistent: true,
                expiration: String(retryDelayMs * (attempt + 1)),
              }
            );

            console.log(`Payment retry scheduled for booking ${payload.data.bookingId}`);
          } else {
            const failedEvent = {
              event: "payment.failed",
              data: {
                bookingId: payload.data.bookingId,
                amount: payload.data.amount,
                attempt: attempt + 1,
                userEmail: payload.data.userEmail,
                seatNumbers: payload.data.seatNumbers,
                movieTitle: payload.data.movieTitle,
              },
              createdAt: new Date().toISOString(),
            };

            channel.sendToQueue(PAYMENT_DLQ, Buffer.from(JSON.stringify(failedEvent)), {
              persistent: true,
            });

            channel.publish(
              BOOKING_EXCHANGE,
              "payment.failed",
              Buffer.from(JSON.stringify(failedEvent)),
              { persistent: true }
            );

            console.log(`Payment moved to DLQ for booking ${payload.data.bookingId}`);
          }

          channel.ack(message);
        } catch (error) {
          console.error("Payment processing error:", error.message);
          channel.nack(message, false, false);
        }
      });

      console.log("Payment service connected to RabbitMQ");
      return;
    } catch (error) {
      console.error("Payment service waiting for RabbitMQ...", error.message);
      await sleep(5000);
    }
  }
};

module.exports = connectRabbit;
