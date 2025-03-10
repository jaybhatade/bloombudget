import React, { useState } from 'react';
import { FiTag, FiPlus, FiMoreHorizontal, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../Firebase';

function CategorySelector({ 
  transactionType, 
  categories, 
  setCategories, 
  selectedCategory, 
  setSelectedCategory, 
  loading,
  userID,
  emojiOptions 
}) {
  const [newCategoryModal, setNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("🏷️");
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  
  // Use provided emoji options or fallback to default
  const iconOptions = emojiOptions || ["🛍️", "🍽️", "📱", "🎮", "📚", "💅", "⚽", "🤝", "🚗", "👕", "🚙", "🍺", "🚬", "💰", "💻", "📈", "🎁", "💵", "🏦", "💳", "🏠", "💊", "✈️", "🎭", "🎟️", "📊"];
  
  const getCategoriesForType = () => {
    return categories[transactionType] || [];
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Category name is required");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "categories"), {
        name: newCategoryName.trim(),
        icon: newCategoryIcon,
        type: transactionType,
        userID,
        createdAt: serverTimestamp()
      });

      const newCategory = {
        id: docRef.id,
        name: newCategoryName.trim(),
        icon: newCategoryIcon,
        type: transactionType
      };

      setCategories(prev => ({
        ...prev,
        [transactionType]: [...prev[transactionType], newCategory].sort((a, b) => 
          a.name.localeCompare(b.name)
        )
      }));

      setNewCategoryName("");
      setNewCategoryIcon("🏷️");
      setNewCategoryModal(false);
      setSelectedCategory(docRef.id);
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category. Please try again.");
    }
  };

  // Display only first 6 categories, rest in "More" popup
  const visibleCategories = getCategoriesForType().slice(0, 6);
  const moreCategories = getCategoriesForType().slice(6);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="flex items-center text-sm font-medium text-slate-300">
          <FiTag className="mr-2" /> Category
        </label>
        <button
          type="button"
          onClick={() => setNewCategoryModal(true)}
          className="text-blue-400 flex items-center text-sm"
        >
          <FiPlus className="mr-1" /> Add New
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-pulse bg-slate-800 w-full h-24 rounded-lg"></div>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {visibleCategories.map((category) => (
            <div key={category.id} className='flex flex-col items-center justify-center'>
              <button
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={`aspect-square rounded-full flex flex-col h-14 items-center justify-center transition-all ${
                  selectedCategory === category.id 
                    ? 'bg-blue-500 text-white scale-110' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="text-2xl">{category.icon}</span>
              </button>
              <span className="text-xs mt-1 truncate w-full text-center pt-1">{category.name}</span>
            </div>
          ))}
          
          {moreCategories.length > 0 && (
            <div className='flex flex-col items-center justify-center'>
              <button
                type="button"
                onClick={() => setShowMoreCategories(true)}
                className="aspect-square rounded-full flex flex-col h-14 items-center justify-center bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                <FiMoreHorizontal className="text-2xl" />
              </button>
              <span className="text-xs mt-1">More</span>
            </div>
          )}
        </div>
      )}

      {/* "More Categories" Modal */}
      <AnimatePresence>
        {showMoreCategories && (
          <MoreCategoriesModal 
            moreCategories={moreCategories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            setShowMoreCategories={setShowMoreCategories}
          />
        )}
      </AnimatePresence>

      {/* "Add Category" Modal */}
      <AnimatePresence>
        {newCategoryModal && (
          <AddCategoryModal 
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            newCategoryIcon={newCategoryIcon}
            setNewCategoryIcon={setNewCategoryIcon}
            emojiOptions={iconOptions}
            handleAddCategory={handleAddCategory}
            setNewCategoryModal={setNewCategoryModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// More Categories Modal Component
function MoreCategoriesModal({ moreCategories, selectedCategory, setSelectedCategory, setShowMoreCategories }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setShowMoreCategories(false)}
    >
      <motion.div 
        className="bg-slate-900 rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-semibold">All Categories </h3>
          <button onClick={() => setShowMoreCategories(false)} className="text-slate-400 hover:text-white">
            <FiX size={24} />
          </button>
        </div>
        <div className="p-4 grid grid-cols-3 gap-4">
          {moreCategories.map((category) => (
            <div key={category.id}>
              <button
                onClick={() => {
                  setSelectedCategory(category.id);
                  setShowMoreCategories(false);
                }}
                className={`aspect-square h-14 rounded-full flex flex-col items-center justify-center transition-all ${
                  selectedCategory === category.id 
                    ? 'bg-blue-500 text-white scale-110' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="text-2xl">{category.icon}</span>
              </button>
              <span className="text-xs mt-1 truncate w-full text-center px-2">{category.name}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Add Category Modal Component
function AddCategoryModal({ 
  newCategoryName, 
  setNewCategoryName, 
  newCategoryIcon, 
  setNewCategoryIcon, 
  emojiOptions,
  handleAddCategory,
  setNewCategoryModal
}) {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setNewCategoryModal(false)}
    >
      <motion.div 
        className="bg-slate-900 rounded-xl w-full max-w-md"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Add New Category</h3>
          <button onClick={() => setNewCategoryModal(false)} className="text-slate-400 hover:text-white">
            <FiX size={24} />
          </button>
        </div>
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-slate-300">
              Category Name
            </label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full bg-slate-800 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g., Groceries"
              maxLength={20}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-slate-300">
              Select Icon
            </label>
            <div className="grid grid-cols-7 gap-2 bg-slate-800 p-3 rounded-lg">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setNewCategoryIcon(emoji)}
                  className={`w-10 h-10 text-xl flex items-center justify-center rounded-full ${
                    newCategoryIcon === emoji 
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
              onClick={() => setNewCategoryModal(false)}
              className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-4 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600"
            >
              Add Category
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default CategorySelector;