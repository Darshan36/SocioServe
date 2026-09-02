import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import MaidRegister from "./pages/MaidRegister";
import MaidList from "./pages/MaidList";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import UserDashboard from "./pages/UserDashboard";
import MaidLogin from "./pages/MaidLogin";
import MaidDashboard from "./pages/MaidDashboard";
import TestLocationIQ from "./components/TestLocationIQ";
import TestAddressPicker from "./pages/TestAddressPicker";
import HelpdeskChat from "./components/HelpdeskChat";
import AdminHelpdesk from "./pages/AdminHelpdesk";
import AdminRoute from "./components/AdminRoute";

/* 🔹 ROUTE WRAPPER */
function AppContent() {
  const location = useLocation();

  // ✅ Show helpdesk ONLY on user & maid dashboards
  const showHelpdesk =
    location.pathname === "/dashboard" ||
    location.pathname === "/maid-dashboard";

  return (
    <>
      <Routes>
        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* USERS */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/test-location" element={<TestLocationIQ />} />
        <Route path="/test-address" element={<TestAddressPicker />} />

        {/* MAIDS */}
        <Route path="/maid-register" element={<MaidRegister />} />
        <Route path="/maids" element={<MaidList />} />
        <Route path="/maid-login" element={<MaidLogin />} />
        <Route path="/maid-dashboard" element={<MaidDashboard />} />

        {/* ADMIN */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* ✅ ADMIN-ONLY HELPDESK */}
        <Route
          path="/admin-helpdesk"
          element={
            <AdminRoute>
              <AdminHelpdesk />
            </AdminRoute>
          }
        />
      </Routes>

      {/* ✅ FLOATING HELPDESK */}
      {showHelpdesk && <HelpdeskChat />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
