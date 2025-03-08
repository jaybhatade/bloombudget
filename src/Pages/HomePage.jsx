"use client"
import { motion } from "framer-motion"
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import Head from "../Components/Head"
import Navbar from "../Components/Navbar"

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
      <main className="p-4">
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
          {/* Balance Card */}
          <motion.div
            variants={cardVariants}
            className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 p-6 rounded-xl shadow-lg"
          >
            <h2 className="text-slate-400 mb-1">Total Balance</h2>
            <p className="text-3xl font-bold">₹{(totalIncome - totalExpenses).toLocaleString()}</p>
            <div className="mt-4 flex justify-between items-center">
              <div>
                <p className="text-slate-400 text-sm">Income</p>
                <p className="text-green-400 font-medium">₹{totalIncome.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Expenses</p>
                <p className="text-red-400 font-medium">₹{totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

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
          <motion.div variants={cardVariants} className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Income vs Expenses</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeVsExpenseData}>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1F2937", border: "none" }}
                    itemStyle={{ color: "#FFFFFF" }}
                  />
                  <Bar dataKey="income" fill="#60A5FA" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#F87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Expense Breakdown */}
          <motion.div variants={cardVariants} className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Expense Breakdown</h2>
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={8}
                      dataKey="value"
                      labelLine={{
                        stroke: "#6B7280",
                        strokeWidth: 1,
                        strokeDasharray: "2 2"
                      }}
                      label={({
                        cx,
                        cy,
                        midAngle,
                        outerRadius,
                        name,
                        percent
                      }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = outerRadius * 1.25;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text
                            x={x}
                            y={y}
                            fill="#9CA3AF"
                            textAnchor={x > cx ? "start" : "end"}
                            dominantBaseline="central"
                            className="text-[10px]"
                          >
                            {`${name} (${(percent * 100).toFixed(0)}%)`}
                          </text>
                        );
                      }}
                    >
                      {expenseData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="transparent"
                          className="hover:opacity-80 transition-opacity duration-300"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: "rgba(31, 41, 55, 0.9)",
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                      }}
                      itemStyle={{ color: "#FFFFFF" }}
                      formatter={(value) => [`₹${value}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 mt-4 md:mt-0">
                <ul className="space-y-3">
                  {expenseData.map((item, index) => (
                    <li key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 transition-colors duration-200">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-lg">₹{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div variants={cardVariants} className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 p-6 mb-24 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
            <ul className="space-y-4">
              {[
                { name: "Grocery Store", amount: -120, date: "Today", icon: "🛒" },
                { name: "Salary Deposit", amount: 3200, date: "Yesterday", icon: "💰" },
                { name: "Electric Bill", amount: -85, date: "Jun 15", icon: "⚡" },
                { name: "Freelance Work", amount: 650, date: "Jun 14", icon: "💻" },
              ].map((transaction, index) => (
                <li key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center mr-3">
                      <span>{transaction.icon}</span>
                    </div>
                    <div>
                      <p className="font-medium">{transaction.name}</p>
                      <p className="text-slate-400 text-sm">{transaction.date}</p>
                    </div>
                  </div>
                  <p className={transaction.amount > 0 ? "text-green-400" : "text-red-400"}>
                    {transaction.amount > 0 ? "+" : ""}
                    {transaction.amount.toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </main>


        <Navbar/>
    </div>
  )
}

