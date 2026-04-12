const nodemailer = require("nodemailer");

const createTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

const FROM = process.env.MAIL_FROM || '"Ticket App" <no-reply@ticketapp.com>';

const fmt = (d) =>
  new Date(d).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

const bookingConfirmedMail = (data) => ({
  from: FROM,
  to: data.userEmail,
  subject: ` Booking Confirmed – ${data.movieTitle}`,
  html: `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
      <div style="background:#16a34a;padding:24px 32px">
        <h1 style="color:#fff;margin:0;font-size:22px">Booking Confirmed!</h1>
      </div>
      <div style="padding:32px">
        <p style="color:#374151">Hi <strong>${data.userName || data.userEmail}</strong>,</p>
        <p style="color:#374151">Your booking for <strong>${data.movieTitle}</strong> is confirmed. Here are your details:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr style="background:#f9fafb">
            <td style="padding:10px 12px;color:#6b7280;font-size:13px">Booking ID</td>
            <td style="padding:10px 12px;color:#111827;font-weight:600;font-size:13px">${data.bookingId}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;color:#6b7280;font-size:13px">Movie</td>
            <td style="padding:10px 12px;color:#111827;font-size:13px">${data.movieTitle}</td>
          </tr>
          <tr style="background:#f9fafb">
            <td style="padding:10px 12px;color:#6b7280;font-size:13px">Show Time</td>
            <td style="padding:10px 12px;color:#111827;font-size:13px">${fmt(data.showStartTime)}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;color:#6b7280;font-size:13px">Seats</td>
            <td style="padding:10px 12px;color:#111827;font-size:13px">${data.seatNumbers.join(", ")}</td>
          </tr>
          <tr style="background:#f9fafb">
            <td style="padding:10px 12px;color:#6b7280;font-size:13px">Amount Paid</td>
            <td style="padding:10px 12px;color:#16a34a;font-weight:700;font-size:13px">₹${data.amount}</td>
          </tr>
        </table>
        <p style="color:#6b7280;font-size:12px;margin-top:24px">Please arrive 15 minutes before show time. Enjoy the movie! 🎬</p>
      </div>
      <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb">
        <p style="color:#9ca3af;font-size:11px;margin:0">Ticket App · This is an automated message, please do not reply.</p>
      </div>
    </div>
  `,
});

const bookingFailedMail = (data) => ({
  from: FROM,
  to: data.userEmail,
  subject: `Booking Failed – ${data.movieTitle}`,
  html: `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
      <div style="background:#dc2626;padding:24px 32px">
        <h1 style="color:#fff;margin:0;font-size:22px">Booking Failed</h1>
      </div>
      <div style="padding:32px">
        <p style="color:#374151">Hi <strong>${data.userName || data.userEmail}</strong>,</p>
        <p style="color:#374151">
          Unfortunately your booking for <strong>${data.movieTitle}</strong> (Booking ID: <code>${data.bookingId}</code>)
          could not be processed after ${data.attempts || 3} attempts.
        </p>
        <p style="color:#374151">If any amount was deducted, it will be refunded within 3–5 business days.</p>
        <p style="color:#374151">Please try booking again or contact support if the issue persists.</p>
      </div>
      <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb">
        <p style="color:#9ca3af;font-size:11px;margin:0">Ticket App · This is an automated message, please do not reply.</p>
      </div>
    </div>
  `,
});

const bookingReceivedMail = (data) => ({
  from: FROM,
  to: data.userEmail,
  subject: `🎟 Booking Received – ${data.movieTitle}`,
  html: `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
      <div style="background:#2563eb;padding:24px 32px">
        <h1 style="color:#fff;margin:0;font-size:22px">We got your booking!</h1>
      </div>
      <div style="padding:32px">
        <p style="color:#374151">Hi <strong>${data.userName || data.userEmail}</strong>,</p>
        <p style="color:#374151">
          We've received your booking for <strong>${data.movieTitle}</strong>.
          Payment is being processed – you'll receive a confirmation email shortly.
        </p>
        <p style="color:#6b7280;font-size:13px">Booking ID: <code>${data.bookingId}</code></p>
      </div>
    </div>
  `,
});

const sendMail = async (event, data) => {
  let mailOptions;

  switch (event) {
    case "booking.confirmed":
      mailOptions = bookingConfirmedMail(data);
      break;
    case "booking.failed":
      mailOptions = bookingFailedMail(data);
      break;
    case "booking.created":
      mailOptions = bookingReceivedMail(data);
      break;
    default:
      console.warn(`[mailer] Unknown event: ${event} – no email sent.`);
      return;
  }

  try {
    const transporter = await createTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(`[mailer] ✉️  Email sent for "${event}" to ${data.userEmail}`);
    console.log(`[mailer] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (err) {
    console.error(`[mailer]  Failed to send email for "${event}":`, err.message);
  }
};

module.exports = { sendMail };