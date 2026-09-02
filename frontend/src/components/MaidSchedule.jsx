import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaCircle } from "react-icons/fa";

export default function MaidSchedule({ bookings }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Filter only active jobs (Accepted/Pending)
  const activeJobs = bookings.filter(b => ['accepted', 'pending'].includes(b.status));

  // Helpers for Calendar Logic
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const isSameDay = (d1, d2) => {
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
  };

  // Get jobs for the specifically selected date
  const jobsForSelectedDate = activeJobs.filter(job => 
    isSameDay(new Date(job.date), selectedDate)
  );

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const startDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty slots for days before start of month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      
      // Check if this day has any jobs
      const hasJob = activeJobs.some(job => isSameDay(new Date(job.date), dateToCheck));
      const isSelected = isSameDay(dateToCheck, selectedDate);

      days.push(
        <div 
          key={day} 
          onClick={() => setSelectedDate(dateToCheck)}
          className={`h-10 w-10 mx-auto flex flex-col items-center justify-center rounded-full cursor-pointer transition-all relative
            ${isSelected ? "bg-yellow-600 text-white shadow-md font-bold" : "hover:bg-yellow-50 text-gray-700"}
          `}
        >
          <span className="text-sm">{day}</span>
          {/* Dot indicator for jobs */}
          {hasJob && !isSelected && (
            <span className="absolute bottom-1 w-1.5 h-1.5 bg-green-500 rounded-full"></span>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* Calendar Side */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-gray-800">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-2">
            <button onClick={() => changeMonth(-1)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600"><FaChevronLeft size={12}/></button>
            <button onClick={() => changeMonth(1)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600"><FaChevronRight size={12}/></button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 text-center mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <span key={d} className="text-xs font-bold text-gray-400 uppercase">{d}</span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-2">
          {renderCalendarDays()}
        </div>

        <div className="mt-4 flex gap-4 text-xs text-gray-500 justify-center">
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Has Booking</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-600 rounded-full"></div> Selected</div>
        </div>
      </div>

      {/* Details Side (Jobs for Selected Day) */}
      <div className="w-full lg:w-80 bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h4 className="font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
          Schedule for {selectedDate.toLocaleDateString()}
        </h4>

        <div className="space-y-3">
          {jobsForSelectedDate.length > 0 ? (
            jobsForSelectedDate.map(job => (
              <div key={job._id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm border-l-4 border-l-green-500">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-gray-800 text-sm">{job.timeSlot}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${job.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {job.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1 font-medium">{job.userId?.name || "Client"}</p>
                <p className="text-xs text-gray-500 truncate">{job.address}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No jobs scheduled for this day.</p>
              <p className="text-xs mt-1">Enjoy your free time! ☕</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}