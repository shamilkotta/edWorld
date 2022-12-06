const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.G_MAIL_USERNAME,
    clientId: process.env.OAUTH_CLIENTID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    accessToken: process.env.OAUTH_ACCESS_TOKEN,
  },
});

const sendMail = (toEmail, subject, htmlContent, attachment, name) =>
  new Promise((resolve, reject) => {
    let mailOptions = {};
    if (attachment) {
      mailOptions = {
        from: process.env.G_MAIL_USERNAME,
        to: toEmail,
        subject,
        html: htmlContent,
        attachments: [
          {
            filename: name,
            contentType: "application/pdf",
            content: attachment,
          },
        ],
      };
    } else {
      mailOptions = {
        from: process.env.G_MAIL_USERNAME,
        to: toEmail,
        subject,
        html: htmlContent,
      };
    }

    transporter.sendMail(mailOptions, (err) => {
      if (err) reject(err);
      else resolve({ success: true, message: "Mail send successfully" });
    });
  });

module.exports = sendMail;
