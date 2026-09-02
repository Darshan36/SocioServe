import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaComments, FaHistory, FaPlus, FaArrowLeft, FaPaperPlane, FaRobot } from "react-icons/fa";

export default function HelpdeskChat() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("home"); // 'home' | 'chat'
  const [loading, setLoading] = useState(false);

  // Data
  const [bookings, setBookings] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  
  // Chat State
  const [activeTicket, setActiveTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  // 🛑 AUTO-DETECT TOKEN (Works for both Maid and User)
  const token = localStorage.getItem("userToken") || localStorage.getItem("maidToken");

  // --- INITIAL DATA LOAD ---
  useEffect(() => {
    if (!open || !token) return;
    loadHomeData();
  }, [open, token]);

  const loadHomeData = async () => {
    setLoading(true);
    try {
      // 🛑 The backend now intelligently returns the correct bookings based on the token
      const [bookingsRes, ticketsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/helpdesk/active-bookings", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5000/api/helpdesk/my-tickets", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setBookings(bookingsRes.data);
      setMyTickets(ticketsRes.data);
    } catch (err) {
      console.error("Failed to load helpdesk data", err);
    } finally {
      setLoading(false);
    }
  };

  // --- POLLING FOR CHAT ---
  useEffect(() => {
    if (!open || view !== "chat" || !activeTicket) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/helpdesk/messages/${activeTicket._id}`, {
           headers: { Authorization: `Bearer ${token}` } 
        });
        setMessages(res.data);
      } catch (err) { console.error(err); }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [open, view, activeTicket, token]);

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- ACTIONS ---

  const handleCreateTicket = async (booking) => {
    try {
      // 🛑 Smart Subject: If Maid, say "Issue with Resident"; If User, say "Issue with Maid"
      const entityName = booking.maidId?.name ? `Maid (${booking.maidId.name})` : "Booking";
      
      const res = await axios.post("http://localhost:5000/api/helpdesk/ticket", 
        { subject: `Issue with ${entityName}`, bookingId: booking._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setActiveTicket(res.data.ticket || res.data); 
      setView("chat");
    } catch (err) {
      alert("Failed to start chat");
    }
  };

  const handleOpenTicket = (ticket) => {
    setActiveTicket(ticket);
    setView("chat");
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    try {
      const res = await axios.post("http://localhost:5000/api/helpdesk/message", 
        { ticketId: activeTicket._id, message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data);
      setInput("");
    } catch (err) {
      console.error("Send failed");
    }
  };

  if (!token) return null;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:bg-indigo-700 transition z-50 flex items-center justify-center"
      >
        <FaComments size={24} />
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden font-sans animate-fadeIn">
          
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shadow-md">
            {view === "chat" ? (
               <button onClick={() => setView("home")} className="text-white hover:bg-indigo-500 p-1 rounded-full"><FaArrowLeft /></button>
            ) : (
               <div className="font-bold flex items-center gap-2"><FaRobot /> Support</div>
            )}
            {view === "chat" && <span className="font-bold text-sm truncate max-w-[200px]">{activeTicket?.subject}</span>}
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50 custom-scrollbar">
            {view === "home" && (
              <div className="p-4 space-y-6">
                
                {/* Active Jobs/Bookings */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <FaPlus /> Report Issue
                  </h3>
                  <div className="space-y-2">
                    {bookings.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No active jobs found.</p>
                    ) : (
                        bookings.map(b => (
                            <div key={b._id} onClick={() => handleCreateTicket(b)} className="bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-indigo-300 transition shadow-sm">
                                <p className="font-bold text-sm text-gray-800">{b.serviceType}</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(b.date).toDateString()} • {b.addressId?.fullAddress?.slice(0, 20)}...
                                </p>
                            </div>
                        ))
                    )}
                  </div>
                </div>

                {/* Ticket History */}
                <div>
                   <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <FaHistory /> Your Tickets
                  </h3>
                  <div className="space-y-2">
                    {myTickets.length === 0 ? (
                         <div className="text-center py-4 bg-white rounded-lg border border-dashed">
                            <p className="text-sm text-gray-400">No past tickets.</p>
                         </div>
                    ) : (
                        myTickets.map(t => (
                            <div key={t._id} onClick={() => handleOpenTicket(t)} className="bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-indigo-300 transition shadow-sm flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-sm text-gray-800 truncate w-32">{t.subject}</p>
                                    <p className="text-[10px] text-gray-400">{new Date(t.updatedAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${t.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {t.status.toUpperCase()}
                                </span>
                            </div>
                        ))
                    )}
                  </div>
                </div>

              </div>
            )}

            {view === "chat" && (
                <div className="p-4 space-y-3">
                    {messages.length === 0 && <p className="text-center text-gray-400 text-sm mt-10">Start typing to chat...</p>}
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[85%] p-3 rounded-xl text-sm shadow-sm ${
                                m.senderType === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 
                                m.senderType === 'system' ? 'bg-yellow-50 text-yellow-800 w-full text-center border border-yellow-200' :
                                'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                             }`}>
                                {m.message}
                             </div>
                        </div>
                    ))}
                    <div ref={scrollRef} />
                </div>
            )}
          </div>

          {view === "chat" && (
            <div className="p-3 bg-white border-t flex gap-2">
               <input 
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
               />
               <button onClick={handleSendMessage} className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700">
                  <FaPaperPlane size={14} />
               </button>
            </div>
          )}

        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </>
  );
}