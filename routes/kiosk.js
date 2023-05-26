const router = require("express").Router();

const verifyToken = require("../utils/verifyToken");
const db = require("../utils/db");

router.get("/", async (req, res) => {
  const kiosk = await db.get("kiosk");
  const alerts = await db.get("alerts");
  const destinations = await db.get("destinations");

  return res.json({
    kiosk: kiosk.value,
    alerts: alerts.value,
    destinations: destinations.value,
  });
});

// protected route
router.post("/", verifyToken, async (req, res) => {
  const { slides } = req.body;

  const updates = {
    value: { updated: new Date(), slides },
  };

  const kiosk = await db.update(updates, "kiosk");

  return res.json(kiosk);
});

module.exports = router;
