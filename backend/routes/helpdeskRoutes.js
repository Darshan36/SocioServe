import express from "express";
import {
  createTicket,
  sendMessage,
  getTicketMessages,
  getActiveBookingsForHelpdesk,
  getAllTicketsForAdmin,
  adminReply,
  getUserTickets,
  resolveTicket
} from "../controllers/helpdeskController.js";
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// USER ROUTES
router.post("/ticket", verifyToken, createTicket);
router.post("/message", verifyToken, sendMessage);
router.get("/messages/:ticketId", verifyToken, getTicketMessages);
router.get("/active-bookings", verifyToken, getActiveBookingsForHelpdesk);
router.get("/my-tickets", verifyToken, getUserTickets);

// ADMIN ROUTES
router.get("/admin/tickets", verifyToken, requireAdmin, getAllTicketsForAdmin);
router.post("/admin/reply", verifyToken, requireAdmin, adminReply);
router.put("/admin/resolve/:ticketId", verifyToken, requireAdmin, resolveTicket);

export default router;