import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiPlus, FiArrowLeft } from "react-icons/fi";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../Firebase";
import AccountList from "../SubComponents/AccountList";
import AddAccountModal from "../SubComponents/AddAccountModal";

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const userID = localStorage.getItem("userID");

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "accounts"), where("userID", "==", userID));
      const querySnapshot = await getDocs(q);
      const accountsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAccounts(accountsData);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (newAccount) => {
    try {
      await addDoc(collection(db, "accounts"), {
        name: newAccount.name,
        balance: parseFloat(newAccount.balance),
        icon: newAccount.icon,
        userID: userID,
        createdAt: serverTimestamp(),
      });

      fetchAccounts();
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding account:", error);
    }
  };

  const handleDeleteAccount = async (id) => {
    try {
      await deleteDoc(doc(db, "accounts", id));
      fetchAccounts();
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  const handleUpdateAccount = async (id, updatedData) => {
    try {
      await updateDoc(doc(db, "accounts", id), {
        ...updatedData,
        updatedAt: serverTimestamp(),
      });
      fetchAccounts();
    } catch (error) {
      console.error("Error updating account:", error);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-slate-950 text-white p-4 relative"
      initial={{ left: 40,opacity: 0 }}
      animate={{left: 0, opacity: 1 }}
      transition={{ duration: 0.4}}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-slate-800 transition-colors"
            aria-label="Go back"
          >
            <FiArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-2xl font-semibold ml-4">Manage Accounts</h1>
        </div>

        {/* Accounts List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <AccountList accounts={accounts} onDelete={handleDeleteAccount} onUpdate={handleUpdateAccount} />
        )}

        {/* Floating Add Account Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-6 right-6 bg-blue-500 p-4 rounded-full hover:bg-blue-600 transition-colors shadow-lg"
          aria-label="Add new account"
        >
          <FiPlus className="w-6 h-6 text-white" />
        </button>

        {/* Add Account Modal */}
        <AddAccountModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddAccount} />
      </div>
    </motion.div>
  );
}

export default Accounts;
