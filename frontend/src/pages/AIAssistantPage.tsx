import React from 'react';
import { Brain } from 'lucide-react';
import AIAssistant from '../components/AIAssistant';

const AIAssistantPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
        <Brain className="w-7 h-7 text-primary" />
        Assistente IA
      </h1>
      <AIAssistant />
    </div>
  )
}

export default AIAssistantPage
