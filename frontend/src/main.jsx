import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "leaflet/dist/leaflet.css";
import { Toaster } from "react-hot-toast"; // 👈 import toaster

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-center" reverseOrder={false} /> {/* 👈 place globally */}
  </React.StrictMode>
);
