const express = require("express");

const { lockSeats, getSeatStatus } = require("../controllers/lockController");

const router = express.Router();

router.get("/status/:showId", getSeatStatus);
router.post("/lock", lockSeats);

module.exports = router;
