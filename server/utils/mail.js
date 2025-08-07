"use strict";
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "anhquoc10.tvt@gmail.com",
    pass: "crsh njmd dhjr yxeg",
  },
});

module.exports = async (to, subject, content) => {
  const info = await transporter.sendMail({
    from: '"Quoc Anh 👻" <anhquoc10.tvt@gmail.com>',
    to,
    subject,
    html: content,
  });
  return info;
};
