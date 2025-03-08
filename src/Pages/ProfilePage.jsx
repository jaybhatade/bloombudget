import React from 'react'
import Navbar from '../Components/Navbar'
import { FiChevronRight, FiStar, FiSettings } from 'react-icons/fi'
import { motion } from 'framer-motion'

function ProfilePage() {
  return (
    <motion.div 
      className="min-h-screen bg-slate-950 text-white"
    >
      {/* User Profile Section */}
      <motion.div 
        className="px-6 pt-8 pb-6 bg-slate-950"
        initial={{ y: 50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center">
          <motion.div 
            className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-2xl font-bold"
          >
            JB
          </motion.div>
          <motion.div className="ml-4" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
            <h2 className="text-xl font-semibold">Jay Bhatade</h2>
            <p className="text-slate-400">test@example.com</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Premium Card */}
      <motion.div 
        className="mx-4 my-6"
        initial={{ y: 50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ duration: 0.3 }}
      >
        <motion.div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2">Upgrade to Premium</h3>
          <p className="text-slate-200 mb-4">Get detailed insights, advanced reports and more!</p>
          <motion.button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium" >
            Upgrade Now
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Menu Items */}
      <motion.div className="px-4" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
        <div className="bg-slate-900 rounded-xl overflow-hidden">
          {/* Rate App */}
          <motion.button className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-800 hover:bg-slate-800 transition-colors" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="flex items-center">
              <FiStar className="text-yellow-500 w-6 h-6" />
              <span className="ml-3">Rate the App</span>
            </div>
            <FiChevronRight className="text-slate-400" />
          </motion.button>

          {/* Settings */}
          <motion.button className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-800 transition-colors" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="flex items-center">
              <FiSettings className="text-slate-400 w-6 h-6" />
              <span className="ml-3">Settings</span>
            </div>
            <FiChevronRight className="text-slate-400" />
          </motion.button>
        </div>
      </motion.div>

      <Navbar />
    </motion.div>
  )
}

export default ProfilePage