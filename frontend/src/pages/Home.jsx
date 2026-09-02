import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaBars, 
  FaTimes, 
  FaCheckCircle, 
  FaShieldAlt, 
  FaUsers, 
  FaArrowRight, 
  FaBriefcase, 
  FaHeart, 
  FaHome, 
  FaSmile,
  FaStar,
  FaClock,
  FaMapMarkerAlt,
  FaUserTie,
  FaUser
} from "react-icons/fa";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Role Selection Modal State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [authType, setAuthType] = useState("login"); // 'login' or 'register'

  // Detect scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openAuthModal = (type) => {
    setAuthType(type);
    setShowRoleModal(true);
    setMobileMenuOpen(false);
  };

  return (
    <div className="font-sans text-gray-900 bg-white">
      
      {/* ---------------- NAVBAR ---------------- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">S</div>
            <span className="text-2xl font-extrabold text-gray-800 tracking-tight">SocioServe</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-yellow-600 transition">Features</a>
            <a href="#services" className="text-sm font-medium text-gray-600 hover:text-yellow-600 transition">Services</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-yellow-600 transition">How it Works</a>
            
            <div className="h-6 w-px bg-gray-200"></div>

            <div className="flex gap-3">
              <button 
                onClick={() => openAuthModal("login")}
                className="px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-full transition"
              >
                Log In
              </button>
              <button 
                onClick={() => openAuthModal("register")}
                className="px-5 py-2.5 text-sm font-bold text-white bg-yellow-600 hover:bg-yellow-700 rounded-full shadow-lg shadow-yellow-200 transition transform hover:-translate-y-0.5"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-t p-6 shadow-xl flex flex-col gap-4 md:hidden animate-fadeIn">
            <a href="#features" className="text-center py-2 text-gray-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#services" className="text-center py-2 text-gray-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Services</a>
            <button onClick={() => openAuthModal("login")} className="block text-center py-3 border rounded-lg font-bold text-gray-700">Log In</button>
            <button onClick={() => openAuthModal("register")} className="block text-center py-3 bg-yellow-600 text-white rounded-lg font-bold">Sign Up</button>
          </div>
        )}
      </nav>

      {/* ---------------- HERO SECTION ---------------- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-yellow-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-bold uppercase tracking-wide mb-6">
            <FaCheckCircle size={14} /> Trusted by 50+ Societies
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-tight mb-6">
            Find Trusted Help <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-500">
              For Your Home.
            </span>
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            SocioServe connects residents with verified household helpers like maids, cooks, and babysitters. 
            Safe, reliable, and community-approved.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => openAuthModal("register")}
              className="px-8 py-4 bg-gray-900 text-white text-lg font-bold rounded-full shadow-xl hover:bg-black transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Find a Maid <FaArrowRight />
            </button>
            <button 
              onClick={() => openAuthModal("register")}
              className="px-8 py-4 bg-white text-gray-900 border border-gray-200 text-lg font-bold rounded-full shadow-sm hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              Join as a Helper
            </button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-gray-100 pt-10">
            {[
              { label: "Verified Maids", val: "500+" },
              { label: "Happy Families", val: "1,200+" },
              { label: "Societies", val: "50+" },
              { label: "Cities", val: "5" },
            ].map((stat, i) => (
              <div key={i}>
                <h3 className="text-3xl font-black text-gray-900">{stat.val}</h3>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wide mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FEATURES SECTION (NEW) ---------------- */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose SocioServe?</h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">We prioritize safety, transparency, and ease of use for your entire society.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                title: "Verified Profiles", 
                desc: "Every maid undergoes a strict document verification process, including Aadhaar checks.", 
                icon: <FaShieldAlt className="text-green-500" size={32} /> 
              },
              { 
                title: "Transparent Reviews", 
                desc: "Read genuine feedback and ratings from other residents in your society before hiring.", 
                icon: <FaStar className="text-yellow-500" size={32} /> 
              },
              { 
                title: "Direct Booking", 
                desc: "Connect directly with helpers. No middlemen, no hidden agency fees.", 
                icon: <FaUserTie className="text-blue-500" size={32} /> 
              },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-gray-50 transition duration-300">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- SERVICES SECTION ---------------- */}
      <section id="services" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Services We Offer</h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">From daily chores to specialized care, find the right professional for every need.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "House Cleaning", icon: <FaHome className="text-blue-500" />, desc: "Sweeping, mopping, dusting, and deep cleaning." },
              { title: "Expert Cooking", icon: <FaSmile className="text-orange-500" />, desc: "Daily meals, special dishes, and kitchen management." },
              { title: "Babysitting", icon: <FaHeart className="text-red-500" />, desc: "Caring and verified sitters for your little ones." },
              { title: "Elder Care", icon: <FaUsers className="text-purple-500" />, desc: "Compassionate support for senior family members." },
              { title: "Laundry & Ironing", icon: <FaBriefcase className="text-teal-500" />, desc: "Washing, drying, and ironing clothes to perfection." },
              { title: "Driver", icon: <FaShieldAlt className="text-yellow-500" />, desc: "Verified drivers for your daily commute." },
            ].map((s, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                  {s.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section id="how-it-works" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">How SocioServe Works</h2>
              <p className="text-gray-500 text-lg mb-10">We've simplified the process of hiring household help. No more asking neighbors or security guards.</p>
              <div className="space-y-8">
                {[
                  { step: "01", title: "Create an Account", text: "Sign up as a resident to view profiles in your society." },
                  { step: "02", title: "Browse & Filter", text: "Filter maids by service, time slot, and ratings." },
                  { step: "03", title: "Book & Relax", text: "Send a booking request and get verified help instantly." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold text-lg">{item.step}</div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{item.title}</h4>
                      <p className="text-gray-500 mt-1">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100 to-blue-50 rounded-full blur-3xl opacity-60"></div>
              <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 rotate-3 hover:rotate-0 transition duration-500">
                {/* Mock UI for Visual Appeal */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-20 bg-gray-100 rounded"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-24 bg-gray-100 rounded-xl w-full"></div>
                  <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
                </div>
                <div className="mt-6 flex gap-2">
                  <div className="flex-1 h-10 bg-yellow-500 rounded-lg"></div>
                  <div className="flex-1 h-10 bg-gray-100 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="bg-gray-900 text-white border-t border-gray-800 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-yellow-600 rounded flex items-center justify-center text-white font-bold text-xs">S</div>
              <span className="text-xl font-bold">SocioServe</span>
            </div>
            <p className="text-gray-400 text-sm">Empowering societies with safe and reliable household services.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-yellow-500">Services</a></li>
              <li><a href="#" className="hover:text-yellow-500">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-yellow-500">About Us</a></li>
              <li><a href="#" className="hover:text-yellow-500">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-yellow-500">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-yellow-500">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center text-gray-500 text-sm border-t border-gray-800 pt-8">
          © {new Date().getFullYear()} SocioServe. All rights reserved.
        </div>
      </footer>

      {/* ---------------- ROLE SELECTION MODAL ---------------- */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button 
              onClick={() => setShowRoleModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <FaTimes size={20} />
            </button>

            <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">
              {authType === 'login' ? 'Welcome Back!' : 'Join SocioServe'}
            </h3>
            <p className="text-center text-gray-500 mb-8">Select how you want to continue</p>

            <div className="grid gap-4">
              <Link 
                to={authType === 'login' ? "/login" : "/register"}
                className="flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  <FaHome />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">I am a Resident</h4>
                  <p className="text-xs text-gray-500">Looking for services</p>
                </div>
                <FaArrowRight className="ml-auto text-gray-300 group-hover:text-blue-500" />
              </Link>

              <Link 
                to={authType === 'login' ? "/maid-login" : "/maid-register"}
                className="flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-yellow-500 hover:bg-yellow-50 transition group"
              >
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  <FaUser />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">I am a Helper</h4>
                  <p className="text-xs text-gray-500">Looking for work</p>
                </div>
                <FaArrowRight className="ml-auto text-gray-300 group-hover:text-yellow-500" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}