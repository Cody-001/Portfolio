const express = require("express");
const exphbs = require("express-handlebars");
const nodemailer = require("nodemailer");
const mailGun = require("nodemailer-mailgun-transport");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.engine(
  "hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    runtimeOptions: {
      allowProtoMethodsByDefault: true,
      allowProtoPropertiesByDefault: true,
    },
  })
);

app.set("view engine", "hbs");

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", (req, res) => {
  const { name, email, subject, message } = req.body;

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
    html: `<h3>Message from: ${name}</h3>
           <p><strong>Email:</strong> ${email}</p>
           <p><strong>Message:</strong> ${message}</p>`,
  };

  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      console.log("Error sending email:", err);
      return res.status(500).send("Something went wrong.");
    } else {
      console.log("Email sent successfully!");
      return res.redirect("/");
    }
  });
});

app.listen(2000, () => {
  console.log("Server listening on port 2000!");
});
