import React, { useState, useRef } from "react";
import { searchAddressLocationIQ } from "../utils/locationIQ";

export default function TestLocationIQ() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const debounceRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce API call
    debounceRef.current = setTimeout(async () => {
      const data = await searchAddressLocationIQ(value);
      setResults(data);
    }, 500); // 500ms debounce
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>LocationIQ Test</h3>

      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Type an address..."
        style={{ width: "100%", padding: 8 }}
      />

      <ul style={{ marginTop: 10 }}>
        {results.map((place, index) => (
          <li
            key={`${place.place_id}-${place.lat}-${place.lon}-${index}`}
            style={{ marginBottom: 6 }}
          >
            {place.display_name}
          </li>
        ))}
      </ul>
    </div>
  );
}
