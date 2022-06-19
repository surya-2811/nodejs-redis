const express = require("express");
const axios = require("axios");
const responseTime = require("response-time");
const app = express();
const Redis = require("ioredis");

const redis = new Redis("redis://default:redispw@localhost:49154");

app.use(responseTime());
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const reply = await redis.get("rockets");

    if (reply) {
      res.json({ status: true, source: "Cache", rockets: JSON.parse(reply) });
    } else {
      const response = await axios.get("https://api.spacexdata.com/v3/rockets");
      const saveResult = await redis.set(
        "rockets",
        JSON.stringify(response.data),
        "EX",
        5
      );
      res.json({ status: true, source: "API", rockets: response.data });
    }
  } catch (err) {
    console.log(err);
    res.send(err.messsage);
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
