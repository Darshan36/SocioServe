import React, { useEffect, useState, useRef } from "react";
import { adminApi } from "../api/adminApi"; // Using your adminApi instance
import { FaSearch, FaUser, FaRobot, FaPaperPlane, FaCheck, FaExclamationCircle } from "react-icons/fa";
import toast from "react-hot-toast";

export default function AdminHelpdesk() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  // 1. Load Tickets
  const loadTickets = async () => {
    try {
      const res = await adminApi.get("/api/helpdesk/admin/tickets");
      setTickets(res.data);
    } catch (err) {
      toast.error("Failed to load tickets");
    }
  };

  useEffect(() => { loadTickets(); }, []);

  // 2. Load Chat when ticket selected
  useEffect(() => {
    if (!selectedTicket) return;
    const fetchMessages = async () => {
        try {
            const res = await adminApi.get(`/api/helpdesk/messages/${selectedTicket._id}`);
            setMessages(res.data);
            scrollToBottom();
        } catch (err) { console.error(err); }
    };
    fetchMessages();
    
    // Simple polling for real-time feel (every 5s)
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedTicket]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 3. Send Reply
  const handleSend = async () => {
    if (!input.trim()) return;
    try {
        const res = await adminApi.post("/api/helpdesk/admin/reply", {
            ticketId: selectedTicket._id,
            message: input
        });
        setMessages(res.data);
        setInput("");
        scrollToBottom();
    } catch (err) {
        toast.error("Failed to send");
    }
  };

  // 4. Resolve Ticket
  const handleResolve = async () => {
      if(!window.confirm("Mark this ticket as resolved?")) return;
      try {
          await adminApi.put(`/api/helpdesk/admin/resolve/${selectedTicket._id}`);
          toast.success("Ticket Resolved");
          loadTickets();
          setSelectedTicket(null);
      } catch (err) {
          toast.error("Error resolving ticket");
      }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* LEFT: Ticket List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-gray-800">Support Inbox</h1>
            <p className="text-xs text-gray-500">{tickets.length} total tickets</p>
        </div>
        <div className="flex-1 overflow-y-auto">
            {tickets.map(ticket => (
                <div 
                    key={ticket._id} 
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 border-b cursor-pointer hover:bg-indigo-50 transition ${selectedTicket?._id === ticket._id ? "bg-indigo-50 border-l-4 border-indigo-600" : ""}`}
                >
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-800 text-sm">{ticket.subject}</h3>
                        {ticket.escalated && <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><FaExclamationCircle/> ESCALATED</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">User: {ticket.userId?.name || "Unknown"}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(ticket.updatedAt).toLocaleString()}</p>
                    <div className={`text-[10px] mt-2 inline-block px-2 py-0.5 rounded ${ticket.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {ticket.status.toUpperCase()}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* RIGHT: Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedTicket ? (
            <>
                {/* Header */}
                <div className="p-4 bg-white border-b flex justify-between items-center shadow-sm">
                    <div>
                        <h2 className="font-bold text-lg text-gray-800">Chat with {selectedTicket.userId?.name}</h2>
                        <p className="text-xs text-gray-500">Booking ID: {selectedTicket.bookingId?._id || "General Inquiry"}</p>
                    </div>
                    <button onClick={handleResolve} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-700">
                        <FaCheck /> Mark Resolved
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3 rounded-xl text-sm shadow-sm ${
                                msg.senderType === 'admin' 
                                    ? 'bg-indigo-600 text-white rounded-br-none' 
                                    : msg.senderType === 'system'
                                    ? 'bg-yellow-50 text-yellow-800 border border-yellow-200 w-full text-center'
                                    : msg.senderType === 'ai'
                                    ? 'bg-gray-200 text-gray-800'
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                            }`}>
                                {msg.senderType === 'system' && <FaRobot className="inline mr-2"/>}
                                {msg.message}
                                <div className={`text-[10px] mt-1 opacity-70 ${msg.senderType === 'admin' ? 'text-indigo-100' : 'text-gray-400'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString()} • {msg.senderType.toUpperCase()}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={scrollRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Type your reply..."
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button onClick={handleSend} className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition">
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <FaRobot size={48} className="mb-4 opacity-20"/>
                <p>Select a ticket to view conversation</p>
            </div>
        )}
      </div>
    </div>
  );
}