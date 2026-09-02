import React, { useState } from "react";
import AddressPicker from "../components/AddressPicker";

export default function TestAddressPicker() {
  const [savedAddress, setSavedAddress] = useState(null);

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">
      <h2 className="text-xl font-bold">Test Address Picker</h2>

      <AddressPicker onSelect={setSavedAddress} />

      {savedAddress && (
        <div className="p-3 border rounded bg-gray-50 text-sm">
          <strong>Saved Address:</strong>
          <p>{savedAddress.fullAddress}</p>
          <p className="text-xs text-gray-500">
            {savedAddress.label} • {savedAddress.lat}, {savedAddress.lng}
          </p>
        </div>
      )}
    </div>
  );
}
