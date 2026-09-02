import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { FaPaperPlane, FaTimes } from "react-icons/fa";

export default function ChatWindow({
  bookingId,
  currentUser,   // { id, name }
  recipientName,
  onClose
}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef(null);

  // 1️⃣ Listen for messages
  useEffect(() => {
    if (!bookingId || !currentUser?.id) return;

    const q = query(
      collection(db, "messages"),
      where("bookingId", "==", bookingId),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [bookingId, currentUser]);

  // 2️⃣ Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3️⃣ Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage.trim(),
        createdAt: serverTimestamp(),
        bookingId,
        user: currentUser.id,                // ✅ SAME AS BEFORE
        userName: currentUser.name || "You"  // ✅ SAME AS BEFORE
      });

      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 md:w-96 bg-white shadow-2xl rounded-t-xl border flex flex-col h-[500px] z-50">

      {/* Header */}
      <div className="bg-yellow-600 text-white p-3 flex justify-between items-center">
        <div>
          <div className="font-bold text-sm">
            Chat with {recipientName || "Partner"}
          </div>
          <div className="text-[10px] opacity-80">
            Booking #{bookingId?.slice(-6)}
          </div>
        </div>
        <button onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
        {messages.map(msg => {
          const isMe = msg.user === currentUser.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${
                isMe ? "bg-yellow-500 text-white" : "bg-white border"
              }`}>
                <p>{msg.text}</p>
                <span className="block text-[10px] opacity-70 text-right mt-1">
                  {msg.userName}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t flex gap-2">
        <input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          className="flex-1 border rounded p-2 text-sm"
          placeholder="Type a message..."
        />
        <button type="submit" disabled={!newMessage.trim()}>
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}
