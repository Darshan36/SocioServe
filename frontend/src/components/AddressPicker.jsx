import React, { useState, useRef } from "react";
import { userApi } from "../api/userApi";
import { searchAddressLocationIQ } from "../utils/locationIQ";

export default function AddressPicker({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [label, setLabel] = useState("Home");
  const debounceRef = useRef(null);

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      const data = await searchAddressLocationIQ(value);
      setResults(data);
    }, 500);
  };

  const handleSelect = async (place) => {
    try {
      const payload = {
        label,
        fullAddress: place.display_name,
        lat: Number(place.lat),
        lng: Number(place.lon),
        placeId: place.place_id,
      };

      // Uses userApi so token/base URL are handled automatically
      const res = await userApi.post("/api/addresses", payload);

      onSelect(res.data); // send saved address back to parent
      setResults([]);
      setQuery(place.display_name);
    } catch (err) {
      console.error("Save address failed:", err);
      alert("Failed to save address");
    }
  };

  return (
    <div className="space-y-2">
      {/* Label selector */}
      <select
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="Home">Home</option>
        <option value="Work">Work</option>
        <option value="Other">Other</option>
      </select>

      {/* Address input */}
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search address"
        className="border p-2 rounded w-full"
      />

      {/* Suggestions */}
      {results.length > 0 && (
        <ul className="border rounded max-h-40 overflow-y-auto bg-white">
          {results.map((place, index) => (
            <li
              key={`${place.place_id}-${index}`}
              onClick={() => handleSelect(place)}
              className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}