const Booking = require("./models/Booking");
const { BOOKING_EXCHANGE, getChannel } = require("./config/rabbit");

const startConsumer = async () => {
  const channel = getChannel();
  const queue = "booking_status_queue";

  await channel.assertQueue(queue, {
    durable: true,
  });

  await channel.bindQueue(queue, BOOKING_EXCHANGE, "payment.success");
  await channel.bindQueue(queue, BOOKING_EXCHANGE, "payment.failed");

  await channel.consume(queue, async (message) => {
    if (!message) {
      return;
    }

    try {
      const payload = JSON.parse(message.content.toString());
      const { event, data } = payload;

      if (event === "payment.success") {
        await Booking.findByIdAndUpdate(data.bookingId, {
          status: "PAYMENT_SUCCESS",
          paymentAttempts: data.attempt ?? 1,
        });
      }

      if (event === "payment.failed") {
        await Booking.findByIdAndUpdate(data.bookingId, {
          status: "PAYMENT_FAILED",
          paymentAttempts: data.attempt ?? Number(process.env.PAYMENT_MAX_RETRIES || 3),
        });
      }

      channel.ack(message);
    } catch (error) {
      console.error("Booking consumer failed:", error.message);
      channel.nack(message, false, false);
    }
  });

  console.log("Booking service consumer is listening for payment events");
};

module.exports = startConsumer;
