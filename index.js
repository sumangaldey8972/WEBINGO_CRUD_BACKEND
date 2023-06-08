const express = require("express");
const connect = require("./database/connection");
const router = require("./routes/user.routes");
const PORT = process.env.PORT;
const app = express();
const session = require("express-session");

app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.json());

app.use("/", router);

app.get("/", (req, res) => {
  res.send("Welcome to CRUD application");
});

app.listen(PORT, async () => {
  await connect();
  console.log(`server started and listening on ${PORT}`);
});
