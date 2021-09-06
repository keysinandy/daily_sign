const nodemailer = require("nodemailer")

const send = async ({
  text
}) => {
  const to = process.env.to
  const user = process.env.user
  const pass = process.env.pass 
  const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    auth: {
      user,
      pass
    }
  })
  await transporter.sendMail({
    from: `"sender" <${user}>`, // sender address
    to, // list of receivers
    subject: "daily info", // Subject line
    text, // plain text body
  })
}

module.exports = send