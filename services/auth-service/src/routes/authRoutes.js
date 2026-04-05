const express = require("express");
const router = express.Router();

router.post("/login", (req, res) => {
  console.log("Login API HIT");
  console.log(req.body);

  res.json({
    message: "Login working ✅",
    data: req.body
  });
});

module.exports = router;