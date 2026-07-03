import React from 'react';
import AIAssistant from '../components/AIAssistant';

const AIAssistantPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Assistente IA</h1>
      <AIAssistant />
    </div>
  )
}

export default AIAssistantPage
