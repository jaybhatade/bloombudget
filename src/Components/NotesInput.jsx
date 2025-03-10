import React from 'react';

function NotesInput({ notes, setNotes }) {
  return (
    <div>
      <label className="flex items-center text-sm font-medium mb-2 text-slate-300">
        Notes (Optional)
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full bg-slate-800 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
        placeholder="Add notes about this transaction"
        rows={2}
      />
    </div>
  );
}

export default NotesInput;