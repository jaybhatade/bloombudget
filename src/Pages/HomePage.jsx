"use client"
import { motion } from "framer-motion"
import {  FiPieChart } from 'react-icons/fi';
import Head from "../Components/Head"
import Navbar from "../Components/Navbar"
import RecentTransact from "../Components/RecentTransact"
import BalanceCard from "../Components/BalanceCard"
import ExpBreakdown from "../Components/ExpBreakdown"
import IncBreakdown from "../Components/IncBreakdown"
import ExpxInc from "../Subpages/ExpxInc"
import { Link } from "react-router-dom";
import BudgetCard from "../Components/BudgetCard";

export default function HomePage() {
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
    <Head />
      {/* Main Content */}
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
        
          {/* Budget Progress */}
        <BudgetCard />

        <motion.div variants={cardVariants} className="flex rounded-lg w-full justify-center items-center ">
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


      <BalanceCard />

          {/* Income vs Expenses Chart */}
          <ExpxInc />

          {/* Expense Breakdown */}

          <ExpBreakdown />

          <IncBreakdown />

        </motion.div>
      </main>


        <Navbar/>
    </div>
  )
}

