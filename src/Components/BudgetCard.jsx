import React from 'react'
import { motion } from "framer-motion"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"

function BudgetCard() {
      // Sample data
      const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }
  
  const totalExpenses = 4200
  const budgetProgress = 72 // percentage
  return (
    <div>
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
    </div>
  )
}

export default BudgetCard
