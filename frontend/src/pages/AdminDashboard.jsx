// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import toast from "react-hot-toast";

// Import Components
import Sidebar from "../components/admin/Sidebar";
import Header from "../components/admin/Header";
import StatsGrid from "../components/admin/StatsGrid";
import ChartsSection from "../components/admin/ChartsSection";
import MaidRequestBoard from "../components/admin/MaidRequestBoard";
import BannedMaidsTable from "../components/admin/BannedMaidsTable";
import ReportsModule from "../components/admin/ReportsModule";
import MaidPerformanceTable from "../components/admin/MaidPerformanceTable"; // 👈 IMPORTED HERE

export default function AdminDashboard() {
  // State
  const [activeView, setActiveView] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // Data
  const [stats, setStats] = useState(null);
  const [bannedMaids, setBannedMaids] = useState([]);
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [rejected, setRejected] = useState([]);

  // Fetch Data
  const loadDashboard = async () => {
    try {
      // 1. Stats & Disputes & MaidPerformance (now included in /stats endpoint)
      const statsRes = await adminApi.get("/api/admin/stats");
      setStats(statsRes.data);

      // 2. Kanban Data
      const [p, a, r] = await Promise.all([
        adminApi.get("/api/maids/pending"),
        adminApi.get("/api/maids/approved"),
        adminApi.get("/api/maids/rejected"),
      ]);
      setPending(p.data);
      setApproved(a.data);
      setRejected(r.data);

      // 3. Banned List
      const bannedRes = await adminApi.get("/api/admin/banned-maids");
      setBannedMaids(bannedRes.data);

      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Actions
  const handleApprove = async (id) => {
    try {
      await adminApi.put(`/api/maids/approve/${id}`);
      toast.success("Maid approved");
      loadDashboard();
    } catch (err) {
      toast.error("Approval failed");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await adminApi.put(`/api/maids/reject/${id}`, { reason });
      toast.success("Maid rejected");
      loadDashboard();
    } catch (err) {
      toast.error("Rejection failed");
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Permanently ban/remove this maid?")) return;
    try {
      await adminApi.put(`/api/maids/remove/${id}`);
      toast.success("Maid removed/banned");
      loadDashboard();
    } catch (err) {
      toast.error("Removal failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-slate-800">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <main className="flex-1 md:ml-64">
        <Header />

        <div className="p-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {activeView === "dashboard" && (
                <div className="space-y-8 animate-fadeIn pb-10">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Command Center</h2>
                    <p className="text-gray-500 text-sm mt-1">Real-time system overview</p>
                  </div>

                  {/* Top Stats Cards */}
                  <StatsGrid stats={stats} />

                  {/* Main Charts */}
                  <ChartsSection stats={stats} recentDisputes={stats?.recentDisputes || []} />
                  
                  {/* 👇 ADDED NEW TABLE COMPONENT HERE */}
                  <MaidPerformanceTable stats={stats} />
                </div>
              )}

              {activeView === "requests" && (
                <MaidRequestBoard
                  pending={pending}
                  approved={approved}
                  rejected={rejected}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onRemove={handleRemove}
                  loadDashboard={loadDashboard}
                />
              )}

              {activeView === "banned" && <BannedMaidsTable bannedMaids={bannedMaids} />}
              
              {activeView === "reports" && <ReportsModule />}
            </>
          )}
        </div>
      </main>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 20px; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}