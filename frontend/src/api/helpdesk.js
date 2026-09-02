import axios from "axios";

const API = "http://localhost:5000/api/helpdesk";

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("userToken")}`
  }
});

export const createHelpdeskTicket = (subject) =>
  axios.post(`${API}/ticket`, { subject }, authHeader());

export const sendHelpdeskMessage = (ticketId, message) =>
  axios.post(`${API}/message`, { ticketId, message }, authHeader());

export const getHelpdeskMessages = (ticketId) =>
  axios.get(`${API}/messages/${ticketId}`, authHeader());
