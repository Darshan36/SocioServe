import React from "react";
import { FaWallet } from "react-icons/fa";

export default function PaymentHistory({ transactions }) {
  
  // Helper to color-code statuses
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
      case "received":
        return "bg-green-100 text-green-700";
      case "refunded":
        return "bg-orange-100 text-orange-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md animate-fadeIn">
      <h2 className="text-2xl font-bold mb-4 text-green-700 flex items-center gap-2">
        <FaWallet/> Payment Received
      </h2>
      <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-green-50 text-green-800">
                <th className="p-3">Date</th>
                <th className="p-3">User Name</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{new Date(txn.updatedAt).toLocaleDateString()}</td>
                  <td className="p-3 font-medium">{txn.userId?.name || "Guest"}</td>
                  <td className="p-3 font-bold text-green-600">
                     {/* Show minus if refunded, plus if received */}
                     {txn.paymentStatus === 'refunded' ? '-' : '+'} ₹{txn.totalAmount}
                  </td>
                  <td className="p-3">
                    {/* 👇 Dynamic Status Badge */}
                    <span className={`px-2 py-1 text-xs rounded-full uppercase font-bold ${getStatusColor(txn.paymentStatus)}`}>
                      {txn.paymentStatus || "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && <p className="p-4 text-gray-500">No payments yet.</p>}
      </div>
    </div>
  );
}