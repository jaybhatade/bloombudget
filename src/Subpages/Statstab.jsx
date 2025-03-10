import React from 'react'
import ExpxInc from './ExpxInc';
import ExpBreakdown from '../Components/ExpBreakdown';
import IncBreakdown from '../Components/IncBreakdown';

function Statstab() {
  return (
    <div className="p-2 space-y-6 pb-24">
      <ExpxInc />
      <ExpBreakdown />
      <IncBreakdown />
    </div>
  )
}

export default Statstab
