import React from "react"
import { useState, useEffect, Suspense }from "react"
import { motion } from "framer-motion"
import Head from "../Components/Head"
import Navbar from "../Components/Navbar"
import RecentTransact from "../Components/RecentTransact"
import BalanceCard from "../Components/BalanceCard"
import BudgetCard from "../Components/BudgetCard"
import InitialBalanceModal from "../SubComponents/InitialBalanceModal"
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../Firebase'



export default function HomePage() {
  const [showInitBalModal, setShowInitBalModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hasAccounts, setHasAccounts] = useState(true)


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
            </div>
            
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