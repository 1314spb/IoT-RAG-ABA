import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const CalendarPicker = ({ selectedDate, setSelectedDate }) => {
  return (
    <div className="mb-4">
      <label htmlFor="inline-calendar" className="block text-sm font-medium text-gray-700 mb-1">
        Select Date:
      </label>
      <div id="inline-calendar" className="bg-white rounded-lg shadow p-4">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          locale="en-US"
        />
      </div>
    </div>
  );
};

export default CalendarPicker;