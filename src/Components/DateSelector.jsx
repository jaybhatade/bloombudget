import React from 'react';
import { FiCalendar } from 'react-icons/fi';

function DateSelector({ selectedDate, setSelectedDate }) {
  return (
    <div>
      <label className="flex items-center text-sm font-medium mb-2 text-slate-300">
        <FiCalendar className="mr-2" /> Date
      </label>
      <input
        type="date"
        value={selectedDate.toISOString().split('T')[0]}
        onChange={e => setSelectedDate(new Date(e.target.value))}
        max={new Date().toISOString().split('T')[0]}
        className="w-full bg-slate-800 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
      />
    </div>
  );
}

export default DateSelector;