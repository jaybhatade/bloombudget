import React, { useEffect, useState } from 'react'
import { FiPlus } from "react-icons/fi"
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../Firebase'

function Head() {
  const [initials, setInitials] = useState("")
  const userID = localStorage.getItem("userID")

  const getInitials = (name) => {
    const names = name.split(' ')
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase()
    }
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
  }

  useEffect(() => {
    const fetchUserData = async () => {
      if (userID) {
        try {
          const userDocRef = doc(db, "users", userID)
          const userDocSnap = await getDoc(userDocRef)
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data()
            setInitials(getInitials(userData.name))
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      }
    }

    fetchUserData()
  }, [userID])

  return (
    <div>
      {/* Header */}
      <header className="p-4 border-b border-slate-800">
        <div className="flex justify-between items-center">
          <div className='w-8'></div>
          <h1 className="text-xl font-bold ">BLOOM BUDGET</h1>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-sm font-medium">{initials}</span>
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}

export default Head
