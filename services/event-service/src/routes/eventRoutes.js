const express = require("express");
const {
  createEvent, getEvents, getEventById,
  updateEvent, deleteEvent,
  addSlot, updateSlot, deleteSlot,
} = require("../controllers/eventController");

const router = express.Router();

router.get("/",                          getEvents);
router.get("/:eventId",                  getEventById);
router.post("/",                         createEvent);
router.put("/:eventId",                  updateEvent);
router.delete("/:eventId",               deleteEvent);
router.post("/:eventId/slots",           addSlot);
router.put("/:eventId/slots/:slotId",    updateSlot);
router.delete("/:eventId/slots/:slotId", deleteSlot);

module.exports = router;