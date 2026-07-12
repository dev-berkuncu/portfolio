const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    const SMTP_EMAIL = process.env.SMTP_EMAIL;
    const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

    if (!SMTP_EMAIL || !SMTP_PASSWORD) {
        console.error("SMTP_EMAIL or SMTP_PASSWORD environment variables are not set!");
        return res.status(500).send("Sunucu yapılandırma hatası. SMTP bilgileri eksik.");
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: SMTP_EMAIL,
        pass: SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: SMTP_EMAIL,
      to: SMTP_EMAIL, // Receive the notification on the same email
      replyTo: email,
      subject: `Yeni İletişim Formu Mesajı: ${name}`,
      text: `
Yeni Mesaj Geldi!

İsim: ${name}
E-posta: ${email}
Mesaj: ${message}
      `,
      html: `
<h3>Yeni Mesaj Geldi!</h3>
<ul>
  <li><strong>İsim:</strong> ${name}</li>
  <li><strong>E-posta:</strong> ${email}</li>
  <li><strong>Mesaj:</strong> ${message}</li>
</ul>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      // Başarılı olduğunda ana sayfaya dön
      res.redirect('/#about');
    } catch (mailError) {
      console.error("Nodemailer error:", mailError);
      res.status(500).send("Gönderim başarısız oldu. Lütfen daha sonra tekrar deneyin.");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
