import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase"; // Ensure this points to your firebase config
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc } from "firebase/firestore";
import { FaBell } from "react-icons/fa";

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 1. Listen for Real-Time Notifications
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(data);
    }, (error) => {
      // Log error but don't crash app
      console.log("Notification listener error (permission/index):", error.code);
    });

    return () => unsubscribe();
  }, [userId]);

  // 2. Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id) => {
    try {
      const notifRef = doc(db, "notifications", id);
      await updateDoc(notifRef, { read: true });
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    unreadIds.forEach(id => markAsRead(id));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
      >
        <FaBell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-fadeIn">
          <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-sm text-gray-700">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-blue-600 font-medium hover:underline">
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">No notifications yet</div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => !notif.read && markAsRead(notif.id)}
                  className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition ${
                    !notif.read ? "bg-blue-50/40 border-l-4 border-l-blue-500" : "bg-white border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`text-sm ${!notif.read ? "font-bold text-gray-800" : "font-medium text-gray-600"}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {notif.createdAt?.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}