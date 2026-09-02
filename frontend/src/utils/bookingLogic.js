import moment from "moment"; 

export const canModifyBooking = (bookingDate, shiftType) => {
  // 1. Define Start Hours
  const shiftStartHours = {
    "Morning": 8,   // 8:00 AM
    "Full Day": 8,  // 8:00 AM
    "Evening": 16   // 4:00 PM
  };

  // 2. Normalize the shift type (handle casing or missing data)
  // If your booking data uses 'timeSlot' (an array) instead of 'shift', handle that logic here
  let shift = "Morning"; 
  if (shiftType) {
      if (Array.isArray(shiftType)) shift = shiftType[0]; // e.g. ["10:00 AM - 11:00 AM"]
      else shift = shiftType.trim();
  }
  
  // NOTE: If your data is time ranges like "10:00 AM - 11:00 AM" instead of "Morning", 
  // you might need to parse the first time string. 
  // For now, assuming you map your time slots to these broad categories or passed 'shift' prop.

  // 3. Create the exact start time of the booking
  const startHour = shiftStartHours[shift] || 8; 
  
  // Create moment object for the booking date at the specific start hour
  const bookingStart = moment(bookingDate).hour(startHour).minute(0).second(0);

  // 4. Calculate the Deadline (2 hours before)
  const deadline = bookingStart.clone().subtract(2, "hours");

  // 5. Compare with NOW
  const now = moment();

  // Return TRUE if we are currently BEFORE the deadline
  return now.isBefore(deadline);
};