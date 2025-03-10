import React from 'react';
import { INR } from '../Common/funcs';

function AmountInput({ amount, setAmount }) {
  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (!value || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <div className="relative">
      <label className="flex items-center text-sm font-medium mb-2 text-slate-300">
        <p className="mr-2">{INR}</p>Amount
      </label>
      <input
        type="text"
        value={amount}
        onChange={handleAmountChange}
        className="w-full bg-slate-800 rounded-lg p-4 text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
        placeholder="0.00"
        required
      />
    </div>
  );
}

export default AmountInput;