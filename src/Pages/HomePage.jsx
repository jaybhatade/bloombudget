import React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FiPieChart, FiRefreshCw } from 'react-icons/fi'
import Head from "../Components/Head"
import Navbar from "../Components/Navbar"
import RecentTransact from "../Components/RecentTransact"
import BalanceCard from "../Components/BalanceCard"
import Budget from "../Subpages/Budget"
import BudgetCard from "../Components/BudgetCard"
import InitialBalanceModal from "../SubComponents/InitialBalanceModal"
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../Firebase'

export default function HomePage() {
  const [showInitBalModal, setShowInitBalModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hasAccounts, setHasAccounts] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const checkUserAccounts = async () => {
    try {
      setLoading(true)
      const userID = localStorage.getItem('userID')
      
      if (!userID) {
        setHasAccounts(false)
        setShowInitBalModal(true)
        return
      }
      
      const q = query(
        collection(db, 'accounts'),
        where('userID', '==', userID)
      )
      
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        setHasAccounts(false)
        setShowInitBalModal(true)
      } else {
        setHasAccounts(true)
      }
    } catch (error) {
      console.error("Error checking user accounts:", error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    checkUserAccounts()
  }, [])

  const handleModalComplete = () => {
    setHasAccounts(true)
    setShowInitBalModal(false)
  }

  const renderTabContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-6"
        >
          <div className="flex flex-col gap-4">
            <BalanceCard />
            <RecentTransact />
          </div>
        </motion.div>
      )
    } else if (activeTab === 'budget') {
      return (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-6"
        >
          <div className="">
            <BudgetCard />

            <Budget />
          </div>
        </motion.div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="lg:hidden">
        <Head />
      </div>
      
      {/* Tabs */}
      <div className="px-4 pt-4 lg:pl-72 rounded-t-4xl lg:rounded-none border-t border-slate-700 bg-slate-950">
        <div className="flex space-x-2 justify-center">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`px-4 py-2 font-medium rounded-t-lg  transition ${
              activeTab === 'dashboard' 
                ? 'bg-slate-950 text-blue-400 border-b-2 border-blue-400' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('budget')} 
            className={`px-4 py-2 font-medium rounded-t-lg transition ${
              activeTab === 'budget' 
                ? 'bg-slate-950 text-blue-400 border-b-2 border-blue-400' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Budget
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <main className="p-4 pb-24 lg:pl-72 bg-slate-950 ">
         
          {renderTabContent()}
        </main>
      )}

      <Navbar />
      
      {/* Initial Balance Modal */}
      <InitialBalanceModal 
        isOpen={showInitBalModal} 
        onClose={() => setShowInitBalModal(false)} 
        onComplete={handleModalComplete}
      />
    </div>
  )
}