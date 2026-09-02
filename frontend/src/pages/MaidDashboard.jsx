import React, { useEffect, useState, useMemo } from "react";
import { maidApi, API_BASE_URL } from "../api/maidApi"; 
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaSignOutAlt, FaBars } from "react-icons/fa";

// --- SUB-COMPONENTS ---
import MaidSidebar from "../components/maid/MaidSidebar";
import DashboardHome from "../components/maid/DashboardHome";
import JobRequests from "../components/maid/JobRequests";
import PaymentHistory from "../components/maid/PaymentHistory";
import JobHistory from "../components/maid/JobHistory";
import MaidSchedule from "../components/MaidSchedule"; // Existing component
import EditProfileModal from "../components/EditProfileModal";
import ChatWindow from "../components/ChatWindow";

// 👇 IMPORT ADDED HERE
import RefundStatus from "../components/RefundStatus"; 

export default function MaidDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [maid, setMaid] = useState(null);
  const [requests, setRequests] = useState([]); 
  const [reviews, setReviews] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false); // For mobile

  const navigate = useNavigate();

  // --- 1. DATA LOADING ---
  const loadData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const profileRes = await maidApi.get("/api/maids/me");
      setMaid(profileRes.data);

      const jobsRes = await maidApi.get("/api/bookings/maid-requests");
      if (Array.isArray(jobsRes.data)) {
          setRequests(jobsRes.data);
      } else if (jobsRes.data.pending || jobsRes.data.active) {
          // Flattening logic
          const all = [
              ...(jobsRes.data.pending || []),
              ...(jobsRes.data.active || []),
              ...(jobsRes.data.overdue || []),
              ...(jobsRes.data.history || [])
          ];
          setRequests(all);
      }

      try {
        const reviewsRes = await maidApi.get(`/api/reviews/${profileRes.data._id}`);
        setReviews(reviewsRes.data);
      } catch (e) { setReviews([]); }

    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("maidToken");
        navigate("/maid-login");
      }
      console.error(err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
        const res = await maidApi.get("/api/payment/history"); 
        setTransactions(res.data);
    } catch(err) { console.error(err); }
  };

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) return toast.error("No GPS support");

    const toastId = toast.loading("1. Requesting GPS...");
    console.log("📍 Step 1: Requesting GPS...");

    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log("📍 Step 2: GPS Success!", position.coords);
        toast.loading("2. GPS Found! Sending to server...", { id: toastId });

        try {
          const { latitude, longitude } = position.coords;
          
          console.log("📍 Step 3: Calling API (PUT /api/maids/update-location)...");
          
          // The code likely freezes on this line if CORS is wrong
          const res = await maidApi.put("/api/maids/update-location", {
            latitude,
            longitude
          });

          console.log("📍 Step 4: API Success!", res.data);
          toast.success("Location Updated!", { id: toastId });
          loadData(true); 

        } catch (err) {
          console.error("❌ Step 4: API Failed:", err);
          toast.error("Server connection failed.", { id: toastId });
        }
      },
      (error) => {
        console.error("❌ GPS Error:", error);
        toast.error("GPS Permission Denied or Timeout", { id: toastId });
      },
      options
    );
  };

  useEffect(() => {
    if (!localStorage.getItem("maidToken")) { navigate("/maid-login"); return; }
    loadData(false);
    const interval = setInterval(() => loadData(true), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === "transactions") fetchTransactions();
  }, [activeTab]);

  // --- 2. DERIVED STATE & MEMO ---
  const { pendingJobs, activeJobs, overdueJobs, historyJobs, completedJobs } = useMemo(() => {
    if (!requests) return { pendingJobs: [], activeJobs: [], overdueJobs: [], historyJobs: [], completedJobs: [] };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return {
        pendingJobs: requests.filter(r => r.status === 'pending' && new Date(r.date) >= today),
        activeJobs: requests.filter(r => r.status === 'in_progress' || (r.status === 'accepted' && new Date(r.date) >= today)),
        overdueJobs: requests.filter(r => (r.status === 'pending' || r.status === 'accepted') && new Date(r.date) < today),
        completedJobs: requests.filter(r => r.status === 'completed'),
        historyJobs: requests.filter(r => ["completed", "rejected", "cancelled", "expired", "no_show"].includes(r.status))
    };
  }, [requests]);

  // --- STATS (Updated Logic) ---
  const { chartData } = useMemo(() => {
    const jobsByDate = {}; 
    completedJobs.forEach((job) => {
        const dateKey = new Date(job.date).toDateString();
        jobsByDate[dateKey] = (jobsByDate[dateKey] || 0) + 1;
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        data.push({ 
            day: days[d.getDay()], 
            count: jobsByDate[d.toDateString()] || 0 
        });
    }
    return { chartData: data };
  }, [completedJobs]);

  // --- ACTIONS ---
  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await maidApi.put(`/api/bookings/status/${bookingId}`, { status: newStatus });
      toast.success(`Job ${newStatus}!`);
      loadData(true); 
    } catch (err) { toast.error("Update failed"); }
  };

  const verifyOtpAndStart = async (bookingId, otp) => {
    try {
      await maidApi.put("/api/bookings/start-job", { bookingId, otp });
      toast.success("Job Started!");
      loadData(true);
    } catch (err) { toast.error("Invalid OTP"); }
  };

  const logout = () => { localStorage.removeItem("maidToken"); navigate("/maid-login"); };
  const renderImage = (path) => path ? (path.startsWith("http") ? path : `${API_BASE_URL || 'http://localhost:5000'}/${path.replace(/\\/g, "/")}`) : null;

  if (loading) return <div className="h-screen flex items-center justify-center text-gray-500">Loading Dashboard...</div>;
  if (!maid) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      
      {/* Sidebar (Desktop & Mobile Wrapper) */}
      <MaidSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        logout={logout} 
        pendingCount={pendingJobs.length}
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <main className="flex-1 p-4 md:p-8 md:ml-64 pb-24 overflow-x-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600"><FaBars size={24} /></button>
          <h1 className="text-xl font-bold text-yellow-700">Partner App</h1>
          <button onClick={logout} className="text-red-500"><FaSignOutAlt /></button>
        </div>

        {/* --- DYNAMIC VIEWS --- */}
        {activeTab === "dashboard" && (
          <DashboardHome 
            maid={maid}
            stats={{ completed: completedJobs.length, pending: pendingJobs.length }}
            chartData={chartData}
            reviews={reviews}
            renderImage={renderImage}
            setShowEditModal={setShowEditModal}
            handleUpdateLocation={handleUpdateLocation}
          />
        )}

        {activeTab === "requests" && (
          <JobRequests 
            pendingJobs={pendingJobs}
            activeJobs={activeJobs}
            overdueJobs={overdueJobs}
            handleStatusUpdate={handleStatusUpdate}
            verifyOtpAndStart={verifyOtpAndStart}
            setActiveChat={setActiveChat}
            currentUser={maid}
            renderImage={renderImage}
          />
        )}

        {activeTab === "schedule" && (
          <div className="space-y-6 animate-fadeIn">
             <h2 className="text-xl font-bold text-gray-800">My Schedule</h2>
             <MaidSchedule bookings={requests} />
          </div>
        )}

        {activeTab === "transactions" && (
          <PaymentHistory transactions={transactions} />
        )}

        {activeTab === "history" && (
          <JobHistory historyJobs={historyJobs} />
        )}

      </main>

      {/* --- MODALS --- */}
      {showEditModal && <EditProfileModal user={maid} role="maid" onClose={() => setShowEditModal(false)} onSuccess={loadData} />}
      {activeChat && <ChatWindow bookingId={activeChat.bookingId} recipientName={activeChat.recipientName} currentUser={activeChat.currentUser} onClose={() => setActiveChat(null)} />}
    </div>
  );
}