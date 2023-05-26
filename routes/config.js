const router = require("express").Router();

const verifyToken = require("../utils/verifyToken");
const db = require("../utils/db");

// protected route
router.get("/", verifyToken, async (req, res) => {
  const config = await db.get("config");

  return res.json(config.value);
});

// protected route
router.post("/", verifyToken, async (req, res) => {
  const data = req.body;

  const updates = {
    value: { updated: new Date(), ...data },
  };

  const config = await db.update(updates, "config");

  return res.json(config);
});

module.exports = router;
