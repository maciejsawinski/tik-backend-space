const express = require("express");
const dotenv = require("dotenv");

const authRouter = require("./routes/auth");
const kioskRouter = require("./routes/kiosk");
const configRouter = require("./routes/config");
const update = require("./cron/update");

let app = express();
dotenv.config();

// on local
if (process.env.DETA_RUNTIME !== "true") {
  const morgan = require("morgan");
  app.use(morgan("dev"));

  app.get("/crontest", async (req, res) => {
    await update();

    res.status(200).send("cron test");
  });
}

// deta scheduled actions
app.post("/__space/v0/actions", async (req, res) => {
  const event = req.body.event;

  if (event.id === "update") {
    await update();
  }

  res.status(200).send("ok");
});

// middlewares
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/config", configRouter);
app.use("/api/kiosk", kioskRouter);

const port = parseInt(process.env.PORT) || 8000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
