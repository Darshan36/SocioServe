import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { 
  FaCamera, 
  FaFileAlt, 
  FaInfoCircle, 
  FaMapMarkerAlt, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaUser,
  FaBriefcase,
  FaIdCard,
  FaList
} from "react-icons/fa";
import Tesseract from "tesseract.js";
import { useNavigate } from "react-router-dom";

// --- CONSTANTS ---
const SERVICE_CATEGORIES = [
  {
    category: "Household",
    services: [
      { id: "cleaning", label: "Cleaning", icon: "🧹" },
      { id: "cooking", label: "Cooking", icon: "🍳" },
      { id: "laundry", label: "Laundry", icon: "👕" },
      { id: "dishwashing", label: "Dishwashing", icon: "🍽️" },
    ]
  },
  {
    category: "Care",
    services: [
      { id: "babysitting", label: "Babysitting", icon: "👶" },
      { id: "eldercare", label: "Elder Care", icon: "👵" },
      { id: "petcare", label: "Pet Care", icon: "🐾" },
      { id: "patientcare", label: "Patient Care", icon: "🏥" },
    ]
  },
  {
    category: "Other",
    services: [
      { id: "driver", label: "Driver", icon: "🚗" },
      { id: "gardener", label: "Gardener", icon: "🌻" },
      { id: "security", label: "Watchman", icon: "👮" },
    ]
  }
];

const AadhaarRegex = /\b\d{4}\s?\d{4}\s?\d{4}\b/;

export default function MaidRegisterWizard() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    name: "",
    gender: "",
    phone: "",
    email: "",
    password: "",
    serviceType: "", // Stores comma-separated string: "Cooking,Cleaning"
    availability: [], 
    photo: null, 
    documents: [], 
    detectedAadhaar: "", 
    latitude: "",
    longitude: "",
  });

  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [docPreviews, setDocPreviews] = useState([]);
  const [ocrRunning, setOcrRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputDocsRef = useRef(null);

  // --- GEOLOCATION ---
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setForm(f => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude })),
        (err) => toast.error("Please enable location for better job matching")
      );
    }
  }, []);

  // --- HELPERS ---
  const next = () => setStep((s) => Math.min(5, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Handle Availability Checkboxes
  const handleAvailability = (e) => {
    const { value, checked } = e.target;
    setForm((f) => ({
      ...f,
      availability: checked ? [...f.availability, value] : f.availability.filter((a) => a !== value)
    }));
  };

  // Handle Service Selection (Multi-select)
  const toggleService = (serviceLabel) => {
    setForm((prev) => {
      let currentServices = prev.serviceType ? prev.serviceType.split(",").map(s => s.trim()) : [];
      if (currentServices.includes(serviceLabel)) {
        currentServices = currentServices.filter((s) => s !== serviceLabel);
      } else {
        currentServices.push(serviceLabel);
      }
      return { ...prev, serviceType: currentServices.join(",") };
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, photo: file });
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleDocsChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      setForm({ ...form, documents: files });
      setDocPreviews(files.map((f) => ({ name: f.name })));
    }
  };

  // --- OCR LOGIC ---
  const tryAutoOcr = async () => {
    if (!form.documents || form.documents.length === 0) return toast.error("Upload a document first");
    const first = form.documents[0];
    if (!first.type.startsWith("image/")) return toast.error("OCR only works on images");

    try {
      setOcrRunning(true);
      toast.loading("Scanning document...");
      const { data } = await Tesseract.recognize(first, "eng");
      const match = data?.text?.match(AadhaarRegex);
      
      toast.dismiss();
      if (match) {
        const formatted = match[0].replace(/\s/g, "").replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3");
        setForm(f => ({ ...f, detectedAadhaar: formatted }));
        toast.success("Aadhaar Detected: " + formatted);
      } else {
        toast.error("Could not detect Aadhaar number");
      }
    } catch (err) {
      toast.dismiss();
      toast.error("OCR Failed");
    } finally {
      setOcrRunning(false);
    }
  };

  // --- VALIDATION ---
  const validateStep = () => {
    let newErrors = {};
    if (step === 1) {
      if (!form.name.trim()) newErrors.name = "Name is required";
      if (!form.phone.trim() || form.phone.length < 10) newErrors.phone = "Valid phone required";
      if (!form.email.trim()) newErrors.email = "Email is required";
      if (!form.password.trim()) newErrors.password = "Password is required";
      if (!form.gender) newErrors.gender = "Gender is required";
    }
    if (step === 2) {
      if (!form.serviceType) newErrors.serviceType = "Please select at least one service";
      if (form.availability.length === 0) newErrors.availability = "Select availability";
    }
    if (step === 3 && !form.photo) return "Please upload a profile photo";
    if (step === 4 && form.documents.length === 0) return "Please upload verification documents";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 ? null : "Please fill required fields";
  };

  // --- SUBMIT ---
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const err = validateStep();
    if (err) { setIsSubmitting(false); return toast.error(err); }

    try {
      toast.loading("Creating profile...");
      const fd = new FormData();

      // 🛑 FIXED LOOP
      Object.keys(form).forEach(key => {
        if (key === 'documents') {
            // Append each document
            form.documents.forEach(d => fd.append('documents', d));
        } 
        else if (key === 'availability') {
            // Append availability array items
            form.availability.forEach(a => fd.append('availability', a));
        } 
        else if (key === 'photo') {
            // 🛑 ONLY append photo if it is a File (not null)
            if (form.photo instanceof File) {
                fd.append('photo', form.photo);
            }
        }
        else {
            // Append other fields (name, email, etc.)
            fd.append(key, form[key] || "");
        }
      });

      // Debug: Log what we are sending
      console.log("Sending FormData..."); 

      await axios.post("http://localhost:5000/api/maids/register", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      toast.dismiss();
      toast.success("Registered Successfully!");
      navigate("/maid-login");
    } catch (err) {
      console.error(err);
      toast.dismiss();
      // Now you will see the REAL error from the backend
      toast.error(err.response?.data?.detail || err.response?.data?.message || "Registration Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- STEPS UI ---
  const steps = [
    { label: "Personal", icon: <FaUser /> },
    { label: "Skills", icon: <FaBriefcase /> },
    { label: "Photo", icon: <FaCamera /> },
    { label: "Docs", icon: <FaIdCard /> },
    { label: "Review", icon: <FaList /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4 md:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row h-auto md:h-[600px]">
        
        {/* SIDEBAR STEPS (Desktop) */}
        <div className="hidden md:flex w-1/4 bg-gray-50 border-r border-gray-200 flex-col py-8 px-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className={`flex items-center gap-3 ${step === i + 1 ? "text-green-700 font-bold" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border ${step === i + 1 ? "bg-green-100 border-green-500" : "bg-white border-gray-300"}`}>
                {step > i + 1 ? <FaCheckCircle /> : s.icon}
              </div>
              <span className="text-sm">{s.label}</span>
            </div>
          ))}
        </div>

        {/* MOBILE STEPS */}
        <div className="md:hidden flex justify-between p-4 bg-gray-50 border-b">
          {steps.map((s, i) => (
            <div key={i} className={`flex flex-col items-center ${step === i + 1 ? "text-green-700" : "text-gray-400"}`}>
              <div className={`w-2 h-2 rounded-full mb-1 ${step === i + 1 ? "bg-green-600" : "bg-gray-300"}`}></div>
              <span className="text-[10px] uppercase font-bold">{s.label}</span>
            </div>
          ))}
        </div>

        {/* MAIN FORM AREA */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto relative">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-6">{steps[step-1].label} Details</h2>

          {/* STEP 1: PERSONAL */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange} className="w-full p-3 border rounded-lg mt-1 focus:ring-2 focus:ring-green-500 outline-none" placeholder="e.g. Sunita" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Gender</label>
                  <select name="gender" value={form.gender} onChange={handleChange} className="w-full p-3 border rounded-lg mt-1 focus:ring-2 focus:ring-green-500 outline-none bg-white">
                    <option value="">Select</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} className="w-full p-3 border rounded-lg mt-1 focus:ring-2 focus:ring-green-500 outline-none" placeholder="10-digit mobile" />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full p-3 border rounded-lg mt-1 focus:ring-2 focus:ring-green-500 outline-none" placeholder="name@email.com" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full p-3 border rounded-lg mt-1 focus:ring-2 focus:ring-green-500 outline-none" placeholder="••••••••" />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-green-50 p-2 rounded mt-2">
                <FaMapMarkerAlt className={form.latitude ? "text-green-600" : "text-gray-400"} />
                {form.latitude ? "Location Auto-detected" : "Detecting location..."}
              </div>
            </div>
          )}

          {/* STEP 2: SERVICES & AVAILABILITY (NEW STEP) */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Service Selection Grid */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Select Your Skills <span className="text-red-500">*</span></label>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 max-h-60 overflow-y-auto custom-scrollbar">
                  {SERVICE_CATEGORIES.map((cat) => (
                    <div key={cat.category} className="mb-6 last:mb-0">
                      <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3 ml-1">{cat.category}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {cat.services.map((srv) => {
                          const isSelected = form.serviceType.split(",").map(s => s.trim()).includes(srv.label);
                          return (
                            <div
                              key={srv.id}
                              onClick={() => toggleService(srv.label)}
                              className={`cursor-pointer p-3 rounded-lg border-2 flex items-center gap-3 transition-all ${
                                isSelected ? "bg-green-50 border-green-500 shadow-sm" : "bg-white border-transparent hover:border-gray-300"
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? "bg-white text-xl" : "bg-gray-100 text-lg"}`}>{srv.icon}</div>
                              <span className={`text-sm font-bold flex-1 ${isSelected ? "text-green-800" : "text-gray-700"}`}>{srv.label}</span>
                              {isSelected && <FaCheckCircle className="text-green-600" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {errors.serviceType && <p className="text-red-500 text-xs mt-1">{errors.serviceType}</p>}
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Shifts <span className="text-red-500">*</span></label>
                <div className="flex gap-4">
                  {['Morning', 'Evening', 'Full Day'].map(slot => (
                    <label key={slot} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${form.availability.includes(slot) ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 hover:border-gray-300"}`}>
                      <input type="checkbox" className="hidden" value={slot} checked={form.availability.includes(slot)} onChange={handleAvailability} />
                      <span className="font-bold text-sm">{slot}</span>
                    </label>
                  ))}
                </div>
                {errors.availability && <p className="text-red-500 text-xs mt-1">{errors.availability}</p>}
              </div>
            </div>
          )}

          {/* STEP 3: PHOTO */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn text-center">
              <div className="w-48 h-48 mx-auto bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden relative group">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <FaCamera size={48} className="text-gray-300" />
                )}
                <label className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  Upload
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              </div>
              <p className="text-sm text-gray-500">Upload a clear face photo. This will be shown to residents.</p>
            </div>
          )}

          {/* STEP 4: DOCUMENTS */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                <FaInfoCircle className="text-blue-600 mt-1" />
                <div className="text-sm text-blue-800">
                  <p className="font-bold">Verification Required</p>
                  <p>Upload Aadhaar card (front & back). We use automated OCR to verify your identity.</p>
                </div>
              </div>

              <div 
                onClick={() => fileInputDocsRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition"
              >
                <input ref={fileInputDocsRef} type="file" multiple accept="image/*,.pdf" className="hidden" onChange={handleDocsChange} />
                <FaFileAlt size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="font-medium text-gray-700">Click to upload documents</p>
                <p className="text-xs text-gray-400">JPG, PNG, PDF allowed</p>
              </div>

              {docPreviews.length > 0 && (
                <div className="space-y-2">
                  {docPreviews.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <FaFileAlt className="text-gray-400" /> {doc.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={tryAutoOcr} disabled={ocrRunning} className="flex-1 py-3 bg-yellow-100 text-yellow-700 font-bold rounded-lg hover:bg-yellow-200 transition">
                  {ocrRunning ? "Scanning..." : "Auto-Detect Aadhaar"}
                </button>
              </div>

              {/* Detected Data */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="text-xs font-bold text-gray-500 uppercase">Aadhaar Number</label>
                <input 
                  value={form.detectedAadhaar} 
                  onChange={(e) => setForm(f => ({ ...f, detectedAadhaar: e.target.value }))}
                  className="w-full bg-transparent border-b border-gray-300 p-2 font-mono text-lg tracking-widest outline-none focus:border-green-500" 
                  placeholder="XXXX XXXX XXXX" 
                />
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {step === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                <div className="flex items-center gap-4 border-b pb-4">
                  <img src={photoPreview} className="w-16 h-16 rounded-full object-cover" alt="" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{form.name}</h3>
                    <p className="text-gray-500 text-sm">{form.serviceType.split(",").join(" • ")}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-bold">Contact</p>
                    <p className="font-medium">{form.phone}</p>
                    <p className="text-gray-500">{form.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-bold">Details</p>
                    <p className="font-medium">{form.gender}</p>
                    <p className="text-gray-500">{form.availability.join(", ")}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400 text-xs uppercase font-bold">Aadhaar</p>
                    <p className="font-mono">{form.detectedAadhaar || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NAVIGATION BUTTONS */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t flex justify-between items-center">
            {step > 1 ? (
              <button onClick={prev} className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition">Back</button>
            ) : <div></div>}
            
            <button 
              onClick={step === 5 ? handleSubmit : () => {
                const err = validateStep();
                if(err) toast.error(err);
                else next();
              }}
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition transform hover:scale-105 ${step === 5 ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"}`}
            >
              {isSubmitting ? "Submitting..." : step === 5 ? "Submit Application" : "Continue"}
            </button>
          </div>

        </div>
      </div>
      <style>{`.animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}