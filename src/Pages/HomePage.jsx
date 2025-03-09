"use client"
import { motion } from "framer-motion"
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import Head from "../Components/Head"
import Navbar from "../Components/Navbar"
import RecentTransact from "../Components/RecentTransact"
import BalanceCard from "../Components/BalanceCard"
import ExpBreakdown from "../Components/ExpBreakdown"
import IncBreakdown from "../Components/IncBreakdown"
import ExpxInc from "../Subpages/ExpxInc"

export default function HomePage() {
  

  // Sample data
  const expenseData = [
    { name: "Housing", value: 1200, color: "#FF6B6B" },
    { name: "Food", value: 450, color: "#4ECDC4" },
    { name: "Transport", value: 300, color: "#FFD166" },
    { name: "Entertainment", value: 200, color: "#6A0572" },
    { name: "Others", value: 150, color: "#1A535C" },
  ]

  const incomeVsExpenseData = [
    { name: "Jan", income: 4500, expenses: 3200 },
    { name: "Feb", income: 4800, expenses: 3600 },
    { name: "Mar", income: 5200, expenses: 3800 },
    { name: "Apr", income: 5000, expenses: 3500 },
    { name: "May", income: 5500, expenses: 4000 },
    { name: "Jun", income: 5800, expenses: 4200 },
  ]

  const totalIncome = 5800
  const totalExpenses = 4200
  const budgetProgress = 72 // percentage

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
        
        <BalanceCard />

          <RecentTransact />


          {/* Budget Progress */}
          <motion.div variants={cardVariants} className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Monthly Budget</h2>
            <div className="flex items-center">
              <div className="w-24 h-24">
                <CircularProgressbar
                  value={budgetProgress}
                  text={`${budgetProgress}%`}
                  styles={buildStyles({
                    textSize: "1.5rem",
                    pathColor: budgetProgress > 90 ? "#F87171" : "#60A5FA",
                    textColor: "#FFFFFF",
                    trailColor: "#374151",
                  })}
                />
              </div>
              <div className="ml-6">
                <p className="text-slate-400 mb-1">Spent</p>
                <p className="text-xl font-bold">₹{totalExpenses.toLocaleString()}</p>
                <p className="text-slate-400 mt-2 mb-1">Remaining</p>
                <p className="text-xl font-bold">₹{(6000 - totalExpenses).toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

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

