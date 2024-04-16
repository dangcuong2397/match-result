require("dotenv/config");
const cors = require("cors");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", "app/views");
app.use(cors());
app.use(express.static("app/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// WEBSOCKET
const WebSocket = require("ws");
const webSocketPort = process.env.WS_PORT || 9088;
const wss = new WebSocket.Server({ port: webSocketPort });
const clients = [];
wss.on("connection", (ws) => {
  clients.push(ws);
  console.log(clients.length);
  ws.on("close", () => {
    const index = clients.indexOf(ws);
    if (index > -1) {
      clients.splice(index, 1);
    }
    console.log(clients.length);
  });
});
const sendToAllClients = (message) => {
  clients.forEach((client) => {
    client.send(message);
  });
};
// API
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/score", (req, res) => {
  res.render("score");
});

app.get("/api/v1/update-match-result", (req, res) => {
  try {
    const id = req.query.id;
    const status = req.query.stt;
    const runningTime = req.query.runningTime;

    if (!id) {
      res.status(400).send("id not found");
      return;
    }
    if (!status) {
      res.status(400).send("status not found");
      return;
    }
    const payload = JSON.stringify({
      topic: "update-match-result",
      id,
      status,
      runningTime,
    });
    if (stt === "start") {
      setTimeout(() => {
        sendToAllClients(payload);
      }, 1000);
    } else {
      sendToAllClients(payload);
    }

    res.status(200).send("");
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/api/v1/reset", (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      res.status(400).send("id not found");
      return;
    }
    const payload = JSON.stringify({ topic: "reset", id });
    sendToAllClients(payload);
    res.status(200).send("");
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
