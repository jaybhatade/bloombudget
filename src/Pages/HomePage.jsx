import React from "react"
import { useState, useEffect, Suspense }from "react"
import { motion } from "framer-motion"
import { FiPieChart, FiRefreshCw } from 'react-icons/fi'
import Head from "../Components/Head"
import Navbar from "../Components/Navbar"
import RecentTransact from "../Components/RecentTransact"
import BalanceCard from "../Components/BalanceCard"
import ExpBreakdown from "../Components/ExpBreakdown"
import BudgetCard from "../Components/BudgetCard"
import InitialBalanceModal from "../SubComponents/InitialBalanceModal"
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../Firebase'

// Lazy loading components that might not be immediately needed
const ExpxInc = React.lazy(() => import("../Subpages/ExpxInc"))
const IncBreakdown = React.lazy(() => import("../Components/IncBreakdown"))

export default function HomePage() {
  const [showInitBalModal, setShowInitBalModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hasAccounts, setHasAccounts] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
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
      setRefreshing(false)
    }
  }
  
  useEffect(() => {
    checkUserAccounts()
  }, [])

  const handleModalComplete = () => {
    setHasAccounts(true)
    setShowInitBalModal(false)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    checkUserAccounts()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="lg:hidden">

      <Head />
      </div>
      
      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <main className="p-4 pb-24 lg:pl-72">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <button 
              onClick={handleRefresh} 
              className="flex items-center px-3 py-1 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
              disabled={refreshing}
            >
              <FiRefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
          
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                <BalanceCard />


                <RecentTransact />
         

                <BudgetCard />

              <motion.div variants={cardVariants} className="col-span-1 lg:col-span-3">
                <ExpBreakdown />
              </motion.div>
              
            </div>
            
            {hasAccounts && (
              <motion.div variants={cardVariants} className="mt-6">
                  <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading chart...</div>}>
                    <ExpxInc />
                  </Suspense>
              </motion.div>
            )}
          </motion.div>
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