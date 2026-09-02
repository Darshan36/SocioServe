import React from "react";

export default function ImageModal({ url, onClose }) {
  if (!url) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <img
        src={url}
        className="max-w-[90%] max-h-[90%] rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
