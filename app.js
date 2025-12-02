// app.js
const express = require("express");
const exphbs = require("express-handlebars");
const nodemailer = require("nodemailer");
const mailGun = require("nodemailer-mailgun-transport");
const path = require("path");

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Handlebars setup
app.engine(
  "hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views", "layouts"),
    runtimeOptions: {
      allowProtoMethodsByDefault: true,
      allowProtoPropertiesByDefault: true,
    },
  })
);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// GET / - render homepage
app.get("/", (req, res) => {
  res.render("index");
});

// POST / - send email
app.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Check environment variables
  if (!process.env.API_KEY || !process.env.DOMAIN) {
    console.error("API_KEY or DOMAIN not set in environment variables");
    return res.status(500).send("Email service not configured.");
  }

  const auth = {
    auth: {
      api_key: process.env.API_KEY,
      domain: process.env.DOMAIN,
    },
  };

  const transporter = nodemailer.createTransport(mailGun(auth));

  const mailOptions = {
    from: email,
    to: "bethel.me123@gmail.com",
    subject: subject,
    html: `
      <h3>Message from: ${name}</h3>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
    return res.redirect("/");
  } catch (err) {
    console.error("Error sending email:", err);
    return res.status(500).send("Something went wrong sending the email.");
  }
});

// Export app for serverless
module.exports = app;
