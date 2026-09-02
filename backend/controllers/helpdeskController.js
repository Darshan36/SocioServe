import HelpdeskTicket from "../models/HelpdeskTicket.js";
import HelpdeskMessage from "../models/HelpdeskMessage.js";
import Booking from "../models/Booking.js";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- AI LOGIC ---
// --- AI LOGIC ---
const shouldEscalate = (message, booking) => {
  if (!booking) return false;
  
  const lower = message.toLowerCase();
  
  // Added a few more keywords so the user can explicitly ask for a human
  const escalateKeywords = [
    "did not come", "didn't come", "hasn't come", "not arrived", 
    "no show", "waiting", "human", "agent", "real person", "manager"
  ];
  
  const wantsEscalation = escalateKeywords.some(k => lower.includes(k));
  
  // Only escalate if they actually trigger a keyword
  return wantsEscalation;
};

const getAIReply = async (message, booking) => {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are Support Bot for SocioServe. 
          Context: Maid: ${booking?.maidId?.name || "N/A"}, Date: ${new Date(booking?.date).toDateString()}.
          Rules: Be polite. If they say "maid didn't come", apologize and say you are connecting a human. Do not invent details.`
        },
        { role: "user", content: message }
      ],
      temperature: 0.3
    });
    return completion.choices[0]?.message?.content;
  } catch (err) {
    console.error("AI Error:", err);
    return null;
  }
};

// --- USER ACTIONS ---

export const createTicket = async (req, res) => {
  try {
    const { subject, bookingId } = req.body;

    // Determine if User or Maid
    // (req.user is attached by verifyToken)
    const userModel = req.user.role === 'maid' ? 'Maid' : 'User';

    const ticket = await HelpdeskTicket.create({
      userId: req.user._id,
      userModel: userModel, // 🛑 Save the type
      bookingId: bookingId || null,
      subject: subject || "Support Request",
      status: "ai"
    });

    res.status(201).json({ ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create ticket" });
  }
};

// 2. GET ACTIVE BOOKINGS (Smart Filter)
export const getActiveBookingsForHelpdesk = async (req, res) => {
  try {
    let query = { 
        status: { $in: ["pending", "accepted", "in_progress"] } 
    };

    // 🛑 DYNAMIC QUERY
    if (req.user.role === 'maid' || req.user.serviceType) {
        // If Maid: Show jobs assigned to ME
        query.maidId = req.user._id;
    } else {
        // If User: Show jobs I booked
        query.userId = req.user._id;
    }

    const bookings = await Booking.find(query)
      .populate("maidId", "name photo")
      .populate("userId", "name") // Show User name to Maid
      .populate("addressId", "fullAddress")
      .sort({ date: -1 });

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching bookings" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { ticketId, message } = req.body;
    if (!ticketId || !message) return res.status(400).json({ message: "Missing data" });

    const ticket = await HelpdeskTicket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // 1. Save User Message
    await HelpdeskMessage.create({
      ticketId,
      senderType: "user",
      senderId: req.user._id, // ✅ FIXED
      message
    });

    // 2. Fetch Context
    const booking = ticket.bookingId ? await Booking.findById(ticket.bookingId).populate("maidId") : null;

    // 3. AUTO-ESCALATION CHECK
    let responseSent = false;

    // A. Human Mode: Do nothing, wait for admin
    if (ticket.status === "human") {
        // Just return the updated list
    } 
    // B. AI Mode: Process logic
    else {
        if (shouldEscalate(message, booking)) {
            ticket.status = "human";
            ticket.escalated = true;
            await ticket.save();
            
            await HelpdeskMessage.create({
                ticketId, senderType: "system", 
                message: "⚠️ I have escalated this to a human agent immediately. They will join shortly." 
            });
            responseSent = true;
        } else {
            // Try AI Reply
            const aiResponse = await getAIReply(message, booking);
            if (aiResponse) {
                await HelpdeskMessage.create({
                    ticketId, senderType: "ai", message: aiResponse
                });
            } else {
                // Fallback if AI fails
                ticket.status = "human";
                await ticket.save();
            }
        }
    }

    const messages = await HelpdeskMessage.find({ ticketId }).sort({ createdAt: 1 });
    res.json(messages);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Message failed" });
  }
};

export const getTicketMessages = async (req, res) => {
  try {
    const messages = await HelpdeskMessage.find({ ticketId: req.params.ticketId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error loading chat" });
  }
};

// --- ADMIN ACTIONS ---

export const getAllTicketsForAdmin = async (req, res) => {
  try {
    const tickets = await HelpdeskTicket.find()
      .populate("userId", "name email role") // 🛑 This works because of refPath in Schema
      .populate({
        path: "bookingId",
        populate: { path: "maidId", select: "name" }
      })
      .sort({ escalated: -1, updatedAt: -1 });

    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching tickets" });
  }
};

export const adminReply = async (req, res) => {
  try {
    const { ticketId, message } = req.body;

    // 1. Find the ticket first to check its current status
    const ticket = await HelpdeskTicket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // 2. CHECK: Was this ticket previously handled by AI?
    if (ticket.status !== "human") {
        // 🚨 ANNOUNCE HUMAN ENTRY
        await HelpdeskMessage.create({
            ticketId,
            senderType: "system",
            message: "👤 A human support agent has joined the chat."
        });

        // Update status to human
        ticket.status = "human";
        ticket.escalated = false; // Clear escalation flag since you are here
        await ticket.save();
    }

    // 3. Save the Admin's actual text message
    await HelpdeskMessage.create({
      ticketId,
      senderType: "admin",
      senderId: req.user._id,
      message
    });

    // 4. Return the full chat history
    const messages = await HelpdeskMessage.find({ ticketId }).sort({ createdAt: 1 });
    res.json(messages);

  } catch (err) {
    console.error("Admin Reply Error:", err);
    res.status(500).json({ message: "Reply failed" });
  }
};

export const resolveTicket = async (req, res) => {
    try {
        await HelpdeskTicket.findByIdAndUpdate(req.params.ticketId, { status: "resolved" });
        res.json({ message: "Ticket Resolved" });
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
};

// ... existing imports and functions

export const getUserTickets = async (req, res) => {
  try {
    // Finds tickets created by THIS specific ID (whether Maid or User)
    const tickets = await HelpdeskTicket.find({ userId: req.user._id })
      .sort({ updatedAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: "Failed to load tickets" });
  }
};