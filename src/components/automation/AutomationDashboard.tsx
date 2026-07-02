import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Activity, TrendingUp, Calendar, Plus, CheckCircle2 } from 'lucide-react';
import { StrategyCards } from './StrategyCards';
import { ExecutionHistory } from './ExecutionHistory';
import { AutomationBuilderModal } from './AutomationBuilderModal';

export function AutomationDashboard() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [activeStrategies, setActiveStrategies] = useState<any[]>([]);

  const handleCreateStrategy = (template?: any) => {
    setSelectedTemplate(template || null);
    setIsBuilderOpen(true);
  };

  const handleStrategySubmit = (strategy: any) => {
    console.log('Strategy Deployed:', strategy);
    
    // Locally save the strategy to reflect in the UI
    const newStrategy = {
      id: Date.now().toString(),
      strategy: selectedTemplate?.title || 'Custom Strategy',
      risk: selectedTemplate?.risk || 'Moderate',
      trigger: strategy.condition,
      eta: 'Pending Automation Engine'
    };
    
    setActiveStrategies(prev => [newStrategy, ...prev]);
    
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      {/* Header & KPIs */}
      <div className="mb-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium text-white tracking-tight">Intent Automation</h1>
            <p className="mt-2 text-white/50">Configure conditional strategies and automate your yield execution.</p>
          </div>
          <button 
            onClick={() => handleCreateStrategy()}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition-all hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            <Plus className="h-4 w-4" />
            Create Strategy
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-blue-400" />
                <h3 className="text-sm font-medium text-white/50">Active Strategies</h3>
              </div>
            </div>
            <p className="text-2xl font-semibold text-white">{activeStrategies.length}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-medium text-white/50">Total Automations</h3>
            </div>
            <p className="text-2xl font-semibold text-white">{activeStrategies.length}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              <h3 className="text-sm font-medium text-white/50">Extra Yield Earned</h3>
            </div>
            <p className="text-2xl font-semibold text-white">$0.00</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-orange-400" />
                <h3 className="text-sm font-medium text-white/50">Next Execution</h3>
              </div>
            </div>
            <p className="text-2xl font-semibold text-white">-</p>
          </motion.div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="mb-6 text-xl font-medium text-white">Strategy Templates</h2>
        <StrategyCards onSelect={handleCreateStrategy} />
      </div>

      <div className="mb-12">
        <ExecutionHistory upcoming={activeStrategies} />
      </div>

      {/* Builder Modal */}
      <AutomationBuilderModal 
        isOpen={isBuilderOpen} 
        onClose={() => setIsBuilderOpen(false)} 
        onSubmit={handleStrategySubmit}
        initialTemplate={selectedTemplate}
      />

      {/* Success Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-6 py-3 text-emerald-400 backdrop-blur-md"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Strategy Deployed Successfully</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


