import React from "react";
import {
  FaUserFriends,
  FaClock,
  FaFlagCheckered,
  FaBroom,
  FaUtensils,
  FaBaby,
  FaTshirt,
  FaCar,
  FaSearch,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaRedo,
  FaChevronRight,
  FaStar,
  FaComments,
  FaCheckCircle,
  FaLightbulb
} from "react-icons/fa";

export default function DashboardHome({
  stats,
  setActiveTab,
  setFilter,
  myHires = [],
  userLocation,
  nearbyCount = 0,
  maids = [],
  renderImage,
  setActiveChat,
  currentUser
}) {
  const today = new Date().setHours(0, 0, 0, 0);
  const todaysBooking = myHires.find(
    (b) =>
      ["accepted", "in_progress"].includes(b.status) &&
      new Date(b.date).setHours(0, 0, 0, 0) === today
  );

  const lastBooking = myHires.find((b) => b.status === "completed");

  const topRatedMaids = [...maids]
    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    .slice(0, 4);

  const quickSearch = (service) => {
    setFilter((prev) => ({ ...prev, serviceType: service }));
    setActiveTab("search");
  };

  // Helper to safely get the first service type
  const getMainService = (serviceData) => {
    if (!serviceData) return "General Help";
    if (typeof serviceData === "string") return serviceData.split(",")[0];
    if (Array.isArray(serviceData) && serviceData.length > 0) return serviceData[0];
    return "General Help";
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Welcome back! 👋</h2>
          <p className="text-gray-500 text-sm mt-1">Here is your daily summary.</p>
        </div>

        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border shadow-sm transition-all ${
            userLocation
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-600 border-red-200"
          }`}
        >
          <FaMapMarkerAlt />
          {userLocation
            ? `Location Active (${nearbyCount} nearby)`
            : "Location Off - Enable for best results"}
        </div>
      </header>

      {/* TODAY'S BOOKING */}
      {todaysBooking ? (
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-100 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>

          <div className="flex items-center gap-5 z-10 w-full md:w-auto">
            <img
              src={renderImage(todaysBooking.maidId?.photo)}
              alt="Maid"
              className="w-16 h-16 rounded-full border-2 border-white object-cover"
            />
            <div>
              <span className="bg-green-500 text-[10px] font-bold px-2 py-0.5 rounded text-white uppercase tracking-wider mb-1 inline-block">
                {todaysBooking.status === "in_progress"
                  ? "Happening Now"
                  : "Today"}
              </span>
              <h3 className="text-xl font-bold">{todaysBooking.maidId?.name}</h3>
              <div className="flex items-center gap-4 mt-1 text-blue-100 text-sm opacity-90">
                <span className="flex items-center gap-1">
                  <FaClock /> {todaysBooking.timeSlot}
                </span>
                <span className="flex items-center gap-1">
                  <FaBroom /> {todaysBooking.serviceType}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 z-10 w-full md:w-auto">
            {todaysBooking.status === "accepted" && todaysBooking.startOtp && (
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-center border border-white/10">
                <p className="text-[10px] uppercase font-bold text-blue-100">
                  Start OTP
                </p>
                <p className="text-xl font-mono font-bold tracking-widest">
                  {todaysBooking.startOtp}
                </p>
              </div>
            )}

            <button
              onClick={() =>
                setActiveChat({
                  bookingId: todaysBooking._id,
                  recipientName: todaysBooking.maidId?.name,
                  currentUser
                })
              }
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-gray-50 transition flex items-center gap-2"
            >
              <FaComments /> Chat
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">House looking a bit messy?</h3>
            <p className="text-gray-400 text-sm">
              Book a verified professional in under 2 minutes.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("search")}
            className="px-5 py-2.5 bg-yellow-500 text-gray-900 font-bold rounded-lg shadow-lg hover:bg-yellow-400 transition text-sm"
          >
            Find Help Now
          </button>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => setActiveTab("bookings")}
          className="cursor-pointer bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md hover:border-green-200 transition"
        >
          <div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">
              Active Hires
            </p>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">
              {stats.activeHires}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-green-100 text-green-600">
            <FaUserFriends size={20} />
          </div>
        </div>

        <div
          onClick={() => setActiveTab("bookings")}
          className="cursor-pointer bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md hover:border-yellow-200 transition"
        >
          <div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">
              Pending
            </p>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">
              {stats.pendingRequests}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
            <FaClock size={20} />
          </div>
        </div>

        <div
          onClick={() => setActiveTab("bookings")}
          className="cursor-pointer bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md hover:border-blue-200 transition"
        >
          <div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">
              Completed
            </p>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">
              {stats.completed}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
            <FaFlagCheckered size={20} />
          </div>
        </div>
      </div>

      {/* QUICK SEARCH + TOP RATED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Search */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Search</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Cleaning", icon: FaBroom, color: "text-blue-600 bg-blue-50" },
              { label: "Cooking", icon: FaUtensils, color: "text-orange-600 bg-orange-50" },
              { label: "Babysitting", icon: FaBaby, color: "text-pink-600 bg-pink-50" },
              { label: "Driver", icon: FaCar, color: "text-gray-600 bg-gray-100" }
            ].map((item, i) => (
              <div
                key={i}
                onClick={() => quickSearch(item.label)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition hover:scale-105 border border-transparent hover:border-gray-200 ${item.color}`}
              >
                <div className="text-xl mb-2">
                  <item.icon />
                </div>
                <span className="text-xs font-bold">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Top Rated */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Top Rated Professionals</h3>
              <button
                onClick={() => setActiveTab("search")}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {topRatedMaids.map((maid) => (
                <div
                  key={maid._id}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:shadow-md transition cursor-pointer"
                  onClick={() => {
                    setFilter({ ...{}, serviceType: "" });
                    setActiveTab("search");
                  }}
                >
                  <img
                    src={renderImage(maid.photo)}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-800 truncate">
                      {maid.name}
                    </h4>
                    {/* 🛑 FIX: Safely access serviceType */}
                    <p className="text-xs text-gray-500 truncate">
                      {getMainService(maid.serviceType)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold">
                    <FaStar />{" "}
                    {maid.averageRating ? maid.averageRating.toFixed(1) : "New"}
                  </div>
                </div>
              ))}
              {topRatedMaids.length === 0 && (
                <p className="text-sm text-gray-400">No data available.</p>
              )}
            </div>
          </div>
        </div>

        {/* QUICK REPEAT */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            {lastBooking ? (
              <>
                <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-3 text-sm">
                  <FaRedo className="text-blue-500" /> Book Again
                </h4>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <img
                    src={renderImage(lastBooking.maidId?.photo)}
                    alt="Maid"
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm truncate text-gray-800">
                      {lastBooking.maidId?.name}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <FaCheckCircle className="text-green-500" size={10} />
                      {lastBooking.serviceType}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    // 🛑 FIX: Safely access serviceType for Book Again logic
                    const sType = getMainService(lastBooking.serviceType);
                    setFilter((f) => ({
                      ...f,
                      serviceType: sType
                    }));
                    setActiveTab("search");
                  }}
                  className="w-full mt-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                  Book Again
                </button>
              </>
            ) : (
              <>
                <h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                  <FaLightbulb className="text-yellow-500" /> Tip of the Day
                </h4>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  For best results, try booking specific time slots like
                  "Morning" to match with maid availability.
                </p>
              </>
            )}
          </div>

          {/* SAFETY */}
          <div className="bg-green-50 border border-green-100 rounded-xl p-5">
            <h4 className="font-bold text-green-800 flex items-center gap-2 text-sm mb-2">
              <FaShieldAlt /> Safety First
            </h4>
            <ul className="text-xs text-green-700 space-y-2 list-disc pl-4">
              <li>Verify OTP before starting work.</li>
              <li>Check ID proof inside the app.</li>
              <li>Use in-app chat for privacy.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}