import React from 'react'
import { FiPlus } from "react-icons/fi"
function Head() {
  return (
    <div>
            {/* Header */}
            <header className="p-4 border-b border-slate-800">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Bloom Budget</h1>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full bg-slate-800">
              <FiPlus className="text-white" />
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-sm font-medium">JD</span>
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}

export default Head
