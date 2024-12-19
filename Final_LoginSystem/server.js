const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'galgaligowri@gmail.com',
    pass: 'mihq matk bajj vyaz'
  }
});

app.post('/send-email', (req, res) => {
  const { email, otp } = req.body;

  const mailOptions = {
    from: 'galgaligowri@gmail.com',
    to: email,
    subject: 'Your verification code is',
    text: `Your verification code is ${otp}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send({ status: 'error', message: error.message });
    }
    res.send({ status: 'success', message: 'Email sent: ' + info.response });
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
