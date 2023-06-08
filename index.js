const express = require("express");
const connect = require("./database/connection");
const PORT = 8080;
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to CRUD application");
});

app.listen(PORT, async () => {
  await connect();
  console.log(`server started and listening on ${PORT}`);
});
