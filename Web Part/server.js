const express = require("express");
const dotenv = require("dotenv");
const { OAuth2Client } = require("google-auth-library");

dotenv.config();
const client = new OAuth2Client(process.env.REACT_APP_GOOGLE_CLIENT_ID);

const app = express();
app.use(express.json());

const users = [];

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
    res.status(400).json({ message: error });
  }
});

app.listen(process.env.port || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
