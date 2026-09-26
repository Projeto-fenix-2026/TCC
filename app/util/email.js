const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

function enviarEmail(to, subject, text = null, html = null, callback) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
  };
  if (html) {
    mailOptions.html = html;
  } else if (text) {
    mailOptions.text = text;
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Erro ao enviar e-mail:", error);
      return;
    }
    console.log("E-mail enviado:", info.response);
    if (callback && typeof callback === "function") {
      callback();
    }
  });
}

module.exports = { enviarEmail };
