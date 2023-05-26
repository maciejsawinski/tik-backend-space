const router = require("express").Router();
const db = require("../utils/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) return res.status(400).send("Bad request");

  const dbCredentials = await db.get("auth");
  const passwordCompare = await bcrypt.compare(
    password,
    dbCredentials.value.password
  );

  if (login !== dbCredentials.value.login || !passwordCompare) {
    return res.status(401).json({ message: "Invalid credentials" });
  } else {
    const token = jwt.sign({ login }, process.env.JWT_SECRET);

    return res.header("access-token", token).json({ token });
  }
});

module.exports = router;
