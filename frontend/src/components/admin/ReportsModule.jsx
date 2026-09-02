import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import toast from "react-hot-toast";
import { FaSearch, FaFilter, FaUndo, FaFileInvoiceDollar, FaTimes } from "react-icons/fa";

export default function ReportsModule() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Refund Modal State
  const [refundData, setRefundData] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get(`/api/admin/bookings?status=${filter}&search=${search}`);
      setBookings(res.data);
    } catch (err) {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBookings(); }, [filter]);

  const handleRefundSubmit = async () => {
      if(!refundAmount || !refundReason) return toast.error("Please fill all fields");
      
      // Safety Check
      const maxRefund = refundData.amount || refundData.totalAmount || 0;
      if (parseFloat(refundAmount) > parseFloat(maxRefund)) {
          return toast.error(`Cannot refund more than ₹${maxRefund}`);
      }

      try {
          await adminApi.post("/api/payment/refund", {
              bookingId: refundData._id,
              amount: refundAmount,
              reason: refundReason
          });
          toast.success("Refund Processed Successfully!");
          setRefundData(null);
          loadBookings();
      } catch (err) {
          console.error("Refund Error:", err);
          toast.error(err.response?.data?.message || "Refund Failed");
          
          // 🛑 THE FIX: Force reload the table even if there is an error!
          // This allows you to see the "On Hold" status immediately.
          setRefundData(null); // Close the modal
          loadBookings();      // Refresh the data
      }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaFileInvoiceDollar className="text-indigo-600"/> Transaction Reports
        </h2>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12}/>
                <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 appearance-none"
                >
                    <option value="all">All Transactions</option>
                    <option value="paid">Paid</option>
                    <option value="disputed">Disputed</option>
                    <option value="refunded">Refunded</option>
                </select>
            </div>

            <div className="relative flex-1 md:w-64">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12}/>
                <input 
                    type="text" 
                    placeholder="Search Order ID..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadBookings()}
                    className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                />
            </div>
            
            <button onClick={loadBookings} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">
                Refresh
            </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                    <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Transaction ID</th>
                        <th className="px-6 py-4">User / Maid</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                         <tr><td colSpan="6" className="text-center py-10 text-gray-400">Loading...</td></tr>
                    ) : bookings.length === 0 ? (
                        <tr><td colSpan="6" className="text-center py-10 text-gray-400">No records found.</td></tr>
                    ) : (
                        bookings.map(b => (
                            <tr key={b._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-500">
                                    {new Date(b.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-gray-600">
                                    {b.transactionId || "N/A"}
                                    {b.isDisputed && <span className="block text-red-500 text-[10px] font-bold mt-1">⚠️ DISPUTED</span>}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-800">{b.userId?.name || "Unknown"}</div>
                                    <div className="text-xs text-gray-400">Maid: {b.maidId?.name || "Deleted"}</div>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-800">
                                    ₹{b.amount || b.totalAmount || 0}
                                </td>
                                
                                {/* 🛑 UPDATED STATUS BADGE LOGIC HERE */}
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                        b.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                                        b.paymentStatus === 'refunded' ? 'bg-purple-100 text-purple-700' :
                                        b.paymentStatus === 'refund_on_hold' ? 'bg-orange-100 text-orange-700' : 
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {b.paymentStatus.replace(/_/g, " ")}
                                    </span>
                                </td>

                                <td className="px-6 py-4">
                                    {b.paymentStatus === 'paid' && (
                                        <button 
                                            onClick={() => {
                                                setRefundData(b);
                                                setRefundAmount(b.amount || b.totalAmount || 0);
                                                setRefundReason("");
                                            }}
                                            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold text-xs bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100"
                                        >
                                            <FaUndo size={10}/> Refund
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* 🛑 Refund Modal */}
      {refundData && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              {/* Overlay Backdrop */}
              <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setRefundData(null)}
              ></div>
              
              {/* Modal Content */}
              <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn">
                  <button onClick={() => setRefundData(null)} className="absolute top-4 right-4 text-white hover:text-gray-200">
                    <FaTimes />
                  </button>

                  <div className="bg-indigo-600 p-6 text-white">
                      <h3 className="font-bold text-lg">Process Refund</h3>
                      <p className="text-xs opacity-80 mt-1">Order ID: {refundData.transactionId}</p>
                  </div>
                  
                  <div className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Refund Amount (₹)</label>
                          <input 
                            type="number" 
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-lg text-gray-800"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            Max refundable: ₹{refundData.amount || refundData.totalAmount || 0}
                          </p>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Reason / Note</label>
                          <textarea 
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                            rows="3"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder="Reason for refund..."
                          ></textarea>
                      </div>
                      
                      <div className="flex gap-3 pt-2">
                          <button onClick={() => setRefundData(null)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Cancel</button>
                          <button onClick={handleRefundSubmit} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200">Confirm Refund</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}