import React, { useEffect, useState } from 'react';
import { FiPlus, FiBell, FiSettings } from "react-icons/fi";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase';

function Head() {
  const [initials, setInitials] = useState("");
  const [userName, setUserName] = useState("");
  const userID = localStorage.getItem("userID");
  
  const getInitials = (name) => {
    const names = name.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
  };
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (userID) {
        try {
          const userDocRef = doc(db, "users", userID);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setInitials(getInitials(userData.name));
            setUserName(userData.name);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    
    fetchUserData();
  }, [userID]);
  
  return (
    <div className="w-full bg-slate-900  p-5 py-6 ">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-blue-100 text-sm font-medium">Welcome back</p>
            <h2 className="text-xl font-bold text-white">{userName}</h2>
          </div>
        </div>
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-lg shadow-md">
            {initials}
          </div>
      </div>
    </div>
  );
}

export default Head;