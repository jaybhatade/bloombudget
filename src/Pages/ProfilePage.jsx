import React, { useState, useEffect } from 'react'
import Navbar from '../Components/Navbar'
import { FiChevronRight, FiStar, FiSettings, FiDollarSign, FiLogOut } from 'react-icons/fi'
import { FaUniversity } from "react-icons/fa";
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../Firebase'

function ProfilePage() {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userData, setUserData] = useState({ name: "User", email: "user@example.com" });
  const userID = localStorage.getItem("userID");

  useEffect(() => {
    const fetchUserData = async () => {
      if (userID) {
        try {
          const userDocRef = doc(db, "users", userID);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [userID]);

  const getInitials = (name) => {
    const names = name.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userID");
    navigate("/login");
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <motion.div 
      className="min-h-screen bg-slate-950 text-white"
    >
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <motion.div 
            className="bg-slate-800 rounded-xl p-6 max-w-sm w-full mx-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-xl font-semibold mb-4">Confirm Logout</h3>
            <p className="text-slate-300 mb-6">Are you sure you want to logout?</p>
            <div className="flex justify-end gap-3">
              <button 
                className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                onClick={handleCancelLogout}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
            {getInitials(userData.name)}
          </motion.div>
          <motion.div className="ml-4" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
            <h2 className="text-xl font-semibold">{userData.name}</h2>
            <p className="text-slate-400">{userData.email}</p>
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
          <motion.button className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-800 hover:bg-slate-800 transition-colors" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="flex items-center">
              <FiSettings className="text-slate-400 w-6 h-6" />
              <span className="ml-3">Settings</span>
            </div>
            <FiChevronRight className="text-slate-400" />
          </motion.button>

          <motion.button className="w-full flex items-center justify-between px-6 py-4 border-b-2  border-slate-900 bg-slate-800 cursor-not-allowed" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3 }} disabled>
            <div className="flex items-center">
              <FiDollarSign className="text-slate-500 w-6 h-6 opacity-50" />
              <span className="ml-3 text-slate-500">Multi Currency ( coming soon )</span>
            </div>
            <FiChevronRight className="text-slate-500 opacity-50" />
          </motion.button>

          <motion.button className="w-full flex items-center justify-between px-6 py-4 bg-slate-800 cursor-not-allowed" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3 }} disabled>
            <div className="flex items-center">
              <FaUniversity className="text-slate-500 w-6 h-6 opacity-50" />
              <span className="ml-3 text-slate-500">Link Accounts ( coming soon )</span>
            </div>
            <FiChevronRight className="text-slate-500 opacity-50" />
          </motion.button>

          {/* Logout */}
          <motion.button 
            className="w-full flex items-center justify-between px-6 py-4 border-t border-slate-800 hover:bg-red-500/10 transition-colors text-red-500"
            onClick={handleLogoutClick}
            initial={{ x: -20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center">
              <FiLogOut className="w-6 h-6" />
              <span className="ml-3">Logout</span>
            </div>
          </motion.button>
        </div>
      </motion.div>

      <Navbar />
    </motion.div>
  )
}

export default ProfilePage