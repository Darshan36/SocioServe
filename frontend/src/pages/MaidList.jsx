import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function MaidList() {
  const [maids, setMaids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaids = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/maids");
        setMaids(res.data);
      } catch (err) {
        toast.error("Failed to load maids");
      } finally {
        setLoading(false);
      }
    };
    fetchMaids();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl text-gray-600">
        Loading maids...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
      <h2 className="text-3xl font-bold text-center text-green-700 mb-8">
        Available Maids
      </h2>

      {maids.length === 0 ? (
        <p className="text-center text-gray-500">No maids registered yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {maids.map((maid) => (
            <div
              key={maid._id}
              className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition border"
            >
              <h3 className="text-xl font-semibold text-green-700">
                {maid.name}
              </h3>

              <p className="text-gray-600">{maid.serviceType}</p>
              <p className="text-gray-500 text-sm">
                Gender: {maid.gender}
              </p>
              <p className="text-gray-500 text-sm">
                Phone: {maid.phone}
              </p>

              {maid.availability?.length > 0 && (
                <p className="text-sm mt-2">
                  <span className="font-medium">Availability:</span>{" "}
                  {maid.availability.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-8">
        <a
          href="/maid-register"
          className="text-green-600 font-medium hover:underline"
        >
          Register another maid
        </a>
      </div>
    </div>
  );
}
