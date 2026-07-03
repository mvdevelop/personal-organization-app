import React, { useState } from 'react';
import { Bot, X } from 'lucide-react';
import AIAssistant from './AIAssistant';

const FloatingAIButton: React.FC = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
        title="Assistente IA"
      >
        {open ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>

      {/* Chat drawer */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-[380px] max-w-[calc(100vw-2rem)]">
          <AIAssistant onClose={() => setOpen(false)} minimal />
        </div>
      )}
    </>
  )
}

export default FloatingAIButton
