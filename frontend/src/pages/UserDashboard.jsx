import React, { useEffect, useState } from "react";
// 1. Import userApi
import { userApi } from "../api/userApi";
import toast from "react-hot-toast";
import { 
  FaSignOutAlt, FaBars, FaTimes, FaWallet
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { load } from "@cashfreepayments/cashfree-js"; 



// Sub-components
import UserSidebar from "../components/user/UserSidebar";
import DashboardHome from "../components/user/DashboardHome";
import FindMaids from "../components/user/FindMaids";
import MyBookings from "../components/user/MyBookings";

// Modals
import BookingModal from "../components/BookingModal"; 
import ReviewModal from "../components/ReviewModal";
import MaidProfileModal from "../components/MaidProfileModal";
import ChatWindow from "../components/ChatWindow";
import NotificationBell from "../components/NotificationBell";

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [maids, setMaids] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [filter, setFilter] = useState({ serviceType: "", availability: "" });
  const [availableServices, setAvailableServices] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  
  // Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [myHires, setMyHires] = useState([]); 
  const [stats, setStats] = useState({ activeHires: 0, pendingRequests: 0, completed: 0 });

  // Modal States
  const [selectedMaidForBooking, setSelectedMaidForBooking] = useState(null);
  const [bookingToReview, setBookingToReview] = useState(null);
  const [selectedMaidProfile, setSelectedMaidProfile] = useState(null);
  const [activeChat, setActiveChat] = useState(null);

  // --- CASHFREE STATE ---
  const [cashfree, setCashfree] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const navigate = useNavigate();
  
  const token = localStorage.getItem("userToken");

  // Helper to get current user info
  const getCurrentUser = () => {
    try {
      if(!token) return null;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (e) { return null; }
  };
  const currentUser = getCurrentUser();

  // --- API CALLS ---
  const fetchMaids = async () => {
    try {
      const res = await userApi.get("/api/maids/approved");
      setMaids(res.data);

      const allServices = new Set();
      res.data.forEach(maid => {
        // Check if serviceType exists
        if (maid.serviceType) {
          // If it is a string (e.g., "Cleaning, Cooking"), split it
          if (typeof maid.serviceType === 'string') {
             maid.serviceType.split(',').forEach(s => allServices.add(s.trim()));
          } 
          // If it is already an array (e.g., ["Cleaning", "Cooking"]), just loop through it
          else if (Array.isArray(maid.serviceType)) {
             maid.serviceType.forEach(s => allServices.add(s.trim()));
          }
        }
      });
      setAvailableServices(Array.from(allServices).sort());
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const res = await userApi.get("/api/bookings/my-bookings");
      setMyHires(res.data);
      
      const active = res.data.filter(b => ['accepted', 'in_progress'].includes(b.status)).length;
      const pending = res.data.filter(b => b.status === 'pending').length;
      const completed = res.data.filter(b => b.status === 'completed').length;
      setStats({ ...stats, activeHires: active, pendingRequests: pending, completed });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await userApi.get("/api/payment/history");
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load transaction history");
    }
  };

  // --- INITIALIZE CASHFREE SDK ---
  useEffect(() => {
    const initSdk = async () => {
        try {
            const cf = await load({ mode: "sandbox" }); 
            setCashfree(cf);
        } catch (error) {
            console.error("Cashfree SDK failed to load", error);
        }
    };
    initSdk();
  }, []);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    if(!token) { navigate('/login'); return; }
    fetchMaids();
    fetchMyBookings();
    findNearbyMaids(false);

    const intervalId = setInterval(() => {
      fetchMyBookings();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // --- NEW: FETCH TRANSACTIONS WHEN TAB IS ACTIVE ---
  useEffect(() => {
    if (activeTab === "transactions") fetchTransactions();
  }, [activeTab]);


  // --- HANDLE PAYMENT LOGIC ---
  const handlePayment = async (booking) => {
    try {
      if (!cashfree) return toast.error("Payment SDK not ready");

      // 1. Create Order
      const res = await userApi.post("/api/payment/create-order", {
        bookingId: booking._id
      });

      const { payment_session_id, order_id } = res.data; 

      if (!payment_session_id) return toast.error("Failed to init payment");

      // 2. Open Popup
      const checkoutOptions = {
        paymentSessionId: payment_session_id,
        redirectTarget: "_modal",
      };

      // 3. LISTEN FOR POPUP CLOSE
      cashfree.checkout(checkoutOptions).then(async (result) => {
        console.log("Payment Interaction Finished:", result);
        
        const verifyToast = toast.loading("Verifying payment...");

        try {
             const verifyRes = await userApi.post("/api/payment/verify", {
                 orderId: order_id
             });

             if (verifyRes.data.status === "success") {
                 toast.success("Payment Successful!", { id: verifyToast });
                 fetchMyBookings(); 
             } else {
                 toast.error("Payment Pending or Failed", { id: verifyToast });
                 fetchMyBookings(); 
             }
        } catch (verifyErr) {
             console.error("Verification Error:", verifyErr);
             toast.dismiss(verifyToast);
        }
      });

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Payment Error");
    }
  };

  const findNearbyMaids = (isManual = false) => {
    if (!("geolocation" in navigator)) return;
    setLoadingNearby(true);
    if(isManual) toast.loading("Locating...", { id: "geo" });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        try {
          const res = await userApi.get("/api/maids/nearby", {
            params: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          });
          setNearby(res.data);
          if(isManual) toast.success(`Found ${res.data.length} nearby!`, { id: "geo" });
        } catch (err) {
          if(isManual) toast.error("Failed to load nearby", { id: "geo" });
        } finally {
          setLoadingNearby(false);
        }
      },
      () => setLoadingNearby(false)
    );
  };

  const handleLogout = () => { localStorage.removeItem("userToken"); navigate("/login"); };

  const handleReportNoShow = async (bookingId) => {
    if(!window.confirm("Are you sure? This adds a strike.")) return;
    try {
        await userApi.put(`/api/bookings/report-no-show/${bookingId}`, {});
        toast.success("Reported successfully.");
        fetchMyBookings();
    } catch(err) {
        toast.error(err.response?.data?.message || "Failed to report");
    }
  };

  const renderImage = (photo) => photo ? (photo.startsWith("http") ? photo : `http://localhost:5000/${photo.replace(/\\/g, "/")}`) : "https://via.placeholder.com/300";

  return (
    <div className="h-screen w-full bg-gray-50 flex font-sans text-gray-800 overflow-hidden relative">
      
      {/* Sidebar - Desktop */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 border-r border-gray-200
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
         <div className="h-full flex flex-col">
           {/* Close Button for Mobile */}
           <div className="md:hidden p-4 flex justify-end">
              <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500">
                 <FaTimes size={24} />
              </button>
           </div>
           <UserSidebar 
             activeTab={activeTab} 
             setActiveTab={(tab) => {
               setActiveTab(tab);
               setIsSidebarOpen(false); 
             }} 
             handleLogout={handleLogout} 
           />
         </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-3">
              <button 
                className="md:hidden text-gray-600 focus:outline-none"
                onClick={() => setIsSidebarOpen(true)}
              >
                <FaBars size={24} />
              </button>
              <h1 className="text-xl font-bold text-yellow-700 md:hidden">SocioServe</h1>
              <h2 className="hidden md:block text-xl font-bold text-gray-800 capitalize">
                {activeTab.replace('-', ' ')}
              </h2>
            </div>

            <div className="flex items-center gap-4">
               <NotificationBell userId={currentUser?.id} />
               <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 md:hidden">
                 <FaSignOutAlt size={20}/>
               </button>
            </div>
        </header>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
            <div className="max-w-7xl mx-auto">
              {activeTab === "dashboard" && (
                <DashboardHome 
                  stats={stats} 
                  setActiveTab={setActiveTab} 
                  setFilter={setFilter}
                  myHires={myHires}
                  userLocation={userLocation}
                  nearbyCount={nearby.length}
                  maids={maids}            
                  renderImage={renderImage} 
                  setActiveChat={setActiveChat}
                  currentUser={currentUser}
                  handlePayment={handlePayment}
                />
              )}
              
              {activeTab === "search" && (
                  <FindMaids 
                      findNearbyMaids={findNearbyMaids} loadingNearby={loadingNearby} 
                      filter={filter} setFilter={setFilter} availableServices={availableServices} 
                      nearby={nearby} filteredMaids={maids} renderImage={renderImage} 
                      setSelectedMaidProfile={setSelectedMaidProfile} 
                      setSelectedMaidForBooking={setSelectedMaidForBooking}
                      showMap={showMap} setShowMap={setShowMap} userLocation={userLocation}
                  />
              )}
              
              {activeTab === "bookings" && (
                  <MyBookings 
                      myHires={myHires} renderImage={renderImage}
                      setActiveChat={setActiveChat} setBookingToReview={setBookingToReview} 
                      handleReportNoShow={handleReportNoShow} setActiveTab={setActiveTab} 
                      currentUser={currentUser}
                      handlePayment={handlePayment}
                      onUpdate={fetchMyBookings}
                  />
              )}

              {/* --- NEW: TRANSACTIONS TAB --- */}
              {activeTab === "transactions" && (
                <div className="bg-white p-6 rounded-lg shadow-md animate-fadeIn">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <FaWallet className="text-blue-600"/> Payment History
                  </h2>
                  
                  {transactions.length === 0 ? (
                    <p className="text-gray-500">No transactions found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-100 text-gray-700">
                            <th className="p-3">Date</th>
                            <th className="p-3">Maid Name</th>
                            <th className="p-3">Service</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((txn) => (
                            <tr key={txn._id} className="border-b hover:bg-gray-50">
                              <td className="p-3">{new Date(txn.updatedAt).toLocaleDateString()}</td>
                              <td className="p-3 font-medium">{txn.maidId?.name || "Unknown"}</td>
                              <td className="p-3 capitalize">{txn.serviceType}</td>
                              <td className="p-3 font-bold text-green-600">₹{txn.totalAmount}</td>
                              <td className="p-3">
                                 <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full uppercase font-bold">
                                   {txn.paymentStatus}
                                 </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
        </div>
      </main>

      {/* --- MODALS --- */}
      {selectedMaidForBooking && <BookingModal maid={selectedMaidForBooking} onClose={() => setSelectedMaidForBooking(null)} onSuccess={() => { fetchMyBookings(); setActiveTab("bookings"); }} />}
      {bookingToReview && <ReviewModal booking={bookingToReview} onClose={() => setBookingToReview(null)} onSuccess={() => { setBookingToReview(null); fetchMyBookings(); }} />}
      {selectedMaidProfile && <MaidProfileModal maid={selectedMaidProfile} onClose={() => setSelectedMaidProfile(null)} />}
      {activeChat && <ChatWindow bookingId={activeChat.bookingId} recipientName={activeChat.recipientName} currentUser={activeChat.currentUser} onClose={() => setActiveChat(null)} />}
    </div>
  );
}