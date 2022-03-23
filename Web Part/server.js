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

app.post("/sendAccountInfo", async (req, res) => {
  try {
    const { token, passNumber, githubAccount, classGroup } = req.body;

    // verify token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    });

    const { name, email, picture, tokenId } = ticket.getPayload();
    return res.status(200).json({
      message: "Sucessfully Send Account Info",
      passNumber,
      githubAccount,
      classGroup,
    });
  } catch (error) {
    console.log(error, "test");
    return res.status(400).json({ message: error });
  }
});

app.post("/api/google-login", async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    });

    const { name, email, picture, tokenId } = ticket.getPayload();

    res.status(201).json({ name, email, picture, tokenId });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error });
  }
});

app.listen(process.env.port || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
