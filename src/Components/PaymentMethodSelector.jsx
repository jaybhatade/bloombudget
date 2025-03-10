import React, { useState } from 'react';
import { FiCreditCard, FiPlus, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../Firebase';

function PaymentMethodSelector({ 
  paymentMethod, 
  setPaymentMethod, 
  paymentMethods, 
  setPaymentMethods,
  userID,
  paymentMethodEmojis = ["💵", "💳", "🏦", "📱", "👝", "💰", "🏧"]
}) {
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [newPaymentMethodName, setNewPaymentMethodName] = useState("");
  const [newPaymentMethodIcon, setNewPaymentMethodIcon] = useState("💳");

  const handleAddPaymentMethod = async () => {
    if (!newPaymentMethodName.trim()) {
      alert("Payment method name is required");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "paymentMethods"), {
        name: newPaymentMethodName.trim(),
        icon: newPaymentMethodIcon,
        userID,
        createdAt: serverTimestamp()
      });

      const newMethod = {
        id: docRef.id,
        name: newPaymentMethodName.trim(),
        icon: newPaymentMethodIcon
      };

      // Add the new method to the existing list
      setPaymentMethods([...paymentMethods, newMethod]);
      
      // Set the new method as the selected one
      setPaymentMethod(newMethod.id);
      setNewPaymentMethodName("");
      setNewPaymentMethodIcon("💳");
      setShowPaymentMethodModal(false);
      
      return docRef.id; // Return the new payment method ID for compatibility
    } catch (error) {
      console.error("Error adding payment method:", error);
      alert("Failed to add payment method. Please try again.");
      return null;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="flex items-center text-sm font-medium text-slate-300">
          <FiCreditCard className="mr-2" /> Payment Method
        </label>
        <button
          type="button"
          onClick={() => setShowPaymentMethodModal(true)}
          className="text-blue-400 flex items-center text-sm"
        >
          <FiPlus className="mr-1" /> Add New
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {paymentMethods.map((method) => (
          <div key={method.id} className='flex flex-col justify-center'>
            <button
              type="button"
              onClick={() => setPaymentMethod(method.id)}
              className={`aspect-square rounded-full flex flex-col h-14 items-center justify-center transition-all ${
                paymentMethod === method.id 
                  ? 'bg-blue-500 text-white scale-110' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span className="text-2xl">{method.icon}</span>
            </button>
            <span className="text-xs mt-1 truncate w-full text-center px-2">{method.name}</span>
          </div>
        ))}
      </div>

      {/* Add Payment Method Modal */}
      <AnimatePresence>
        {showPaymentMethodModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPaymentMethodModal(false)}
          >
            <motion.div 
              className="bg-slate-900 rounded-xl w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Add Payment Method</h3>
                <button onClick={() => setShowPaymentMethodModal(false)} className="text-slate-400 hover:text-white">
                  <FiX size={24} />
                </button>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-slate-300">
                    Payment Method Name
                  </label>
                  <input
                    type="text"
                    value={newPaymentMethodName}
                    onChange={(e) => setNewPaymentMethodName(e.target.value)}
                    className="w-full bg-slate-800 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g., Credit Card"
                    maxLength={20}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-slate-300">
                    Select Icon
                  </label>
                  <div className="grid grid-cols-7 gap-2 bg-slate-800 p-3 rounded-lg">
                    {paymentMethodEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewPaymentMethodIcon(emoji)}
                        className={`w-10 h-10 text-xl flex items-center justify-center rounded-full ${
                          newPaymentMethodIcon === emoji 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-slate-700'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={() => setShowPaymentMethodModal(false)}
                    className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddPaymentMethod}
                    className="px-4 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600"
                  >
                    Add Payment Method
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PaymentMethodSelector;