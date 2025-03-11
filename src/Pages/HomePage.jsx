"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FiPieChart } from 'react-icons/fi'
import Head from "../Components/Head"
import Navbar from "../Components/Navbar"
import RecentTransact from "../Components/RecentTransact"
import BalanceCard from "../Components/BalanceCard"
import ExpBreakdown from "../Components/ExpBreakdown"
import IncBreakdown from "../Components/IncBreakdown"
import ExpxInc from "../Subpages/ExpxInc"
import { Link } from "react-router-dom"
import BudgetCard from "../Components/BudgetCard"
import InitialBalanceModal from "../SubComponents/InitialBalanceModal"
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../Firebase'

export default function HomePage() {
  const [showInitBalModal, setShowInitBalModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hasAccounts, setHasAccounts] = useState(true)
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  useEffect(() => {
    const checkUserAccounts = async () => {
      try {
        setLoading(true)
        const userID = localStorage.getItem('userID')
        
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
    
    checkUserAccounts()
  }, [])

  const handleModalComplete = () => {
    setHasAccounts(true)
    setShowInitBalModal(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Head />
      
      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <main className="p-4 pb-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="space-y-6"
          >
            <BalanceCard />
            {/* Budget Progress */}

            <motion.div variants={cardVariants} className="flex rounded-lg w-full justify-center items-center">
              <Link 
                to="/budget"
                className="flex rounded-lg justify-center items-center w-full py-3 bg-blue-700/80 hover:bg-blue-600 transition-all duration-200 group"
              >
                <h1 className="text-white font-medium text-sm flex items-center">
                  <FiPieChart className="mr-2 group-hover:scale-110 transition-transform" />
                  Manage Your Budget
                </h1>
              </Link>
            </motion.div>

            <RecentTransact />

            <BudgetCard />

            {/* Income vs Expenses Chart */}

            {/* Expense Breakdown */}
            <ExpBreakdown />

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