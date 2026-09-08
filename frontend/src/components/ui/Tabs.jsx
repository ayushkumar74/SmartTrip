import React, { useState } from 'react';

export default function Tabs({ tabs, className = '' }) {
 const [activeTab, setActiveTab] = useState(0);

 return (
 <div className={`w-full ${className}`}>
 <div className="flex space-x-1 border-b border-border">
 {tabs.map((tab, idx) => (
 <button
 key={idx}
 onClick={() => setActiveTab(idx)}
 className={`
 py-3 px-6 text-sm font-medium border-b-2 transition-colors
 ${activeTab === idx 
 ? 'border-primary text-primary' 
 : 'border-transparent text-text-muted hover:text-text-primary hover:border-border-strong'
 }
 `}
 >
 {tab.label}
 </button>
 ))}
 </div>
 <div className="pt-6">
 {tabs[activeTab].content}
 </div>
 </div>
 );
}
