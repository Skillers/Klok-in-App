const express = require("express");
const dotenv = require("dotenv");
const { OAuth2Client } = require("google-auth-library");
const cors = require("cors");
let mysql = require("mysql");

dotenv.config();
const client = new OAuth2Client(process.env.REACT_APP_GOOGLE_CLIENT_ID);

const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/google-login", async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    });

    const { family_name, given_name, email, picture, tokenId } =
      ticket.getPayload();

    res.status(200).json({
      family_name,
      given_name,
      email,
      picture,
      tokenId,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error });
  }
});

app.get("/api/getstudents", (req, res) => {
  console.log("connecting")

  var con = mysql.createConnection({
    host: "185.132.47.171",
    user: "ApiAccesUser",
    password: "E&52fsq16",
    database: "Klokinapp"
  });

  console.log("connected")
  
  con.connect();

  console.log("querying")

  con.query("SELECT * FROM student", function (err, result, fields) {
    if (err) return {status: 500};
    res.json({status: 200, data: result})
  })
})

app.get("/api/getklokurenbyweek", (req, res) => {
  var con = mysql.createConnection({
    host: "185.132.47.171",
    user: "ApiAccesUser",
    password: "E&52fsq16",
    database: "Klokinapp"
  });
  
  con.connect();

  con.query("SELECT * FROM kloktijd WHERE WEEK(Datum) = WEEK(CURDATE())", function (err, result, fields) {
    if (err) return {status: 500};
    res.json({status: 200, data: result})
  })
})

app.get("/api/getklokuren", (req, res) => {
  var con = mysql.createConnection({
    host: "185.132.47.171",
    user: "ApiAccesUser",
    password: "E&52fsq16",
    database: "Klokinapp"
  });
  
  con.connect();

  con.query("SELECT * FROM kloktijd", function (err, result, fields) {
    if (err) return {status: 500};
    res.json({status: 200, data: result})
  })
})

app.listen(process.env.port || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
