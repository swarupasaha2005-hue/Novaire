import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Activity, TrendingUp, Calendar, Plus, CheckCircle2 } from 'lucide-react';
import { StrategyCards } from './StrategyCards';
import { ExecutionHistory } from './ExecutionHistory';
import { AutomationBuilderModal } from './AutomationBuilderModal';
import { YieldService } from '@/services/yieldService';
import { PageContainer } from '@/components/ui/PageContainer';
import { MetricCard } from '@/components/ui/MetricCard';
import { Button } from '@/components/ui/Button';

export function AutomationDashboard() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [activeStrategies, setActiveStrategies] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [vaults, setVaults] = useState<any[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem('novaire_automation_strategies');
      if (saved) {
        setActiveStrategies(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse saved strategies', e);
    }
  }, []);

  useEffect(() => {
    YieldService.getVaults().then(setVaults).catch(console.error);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('novaire_automation_strategies', JSON.stringify(activeStrategies));
    }
  }, [activeStrategies, isClient]);

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

  const renderNextExecution = () => {
    if (activeStrategies.length === 0) {
      return (
        <div className="mt-1">
          <p className="text-[17px] font-semibold text-white">No Pending Executions</p>
        </div>
      );
    }

    const autoRoll = activeStrategies.find(s => s.strategy === 'Auto Roll at Maturity');
    
    if (autoRoll) {
      const vault = vaults.find(v => autoRoll.trigger.includes(v.asset) || autoRoll.trigger.includes('Selected Vault')) || vaults[0];
      
      if (vault) {
        const maturity = new Date(vault.maturityDate);
        const now = new Date();
        const diffTime = maturity.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return (
          <div className="mt-1">
            <p className="text-[13px] font-medium text-blue-400 mb-0.5">{autoRoll.strategy}</p>
            <p className="text-lg font-semibold text-white leading-tight">
              {diffDays > 0 ? `${diffDays} Days Remaining` : `Executes on ${maturity.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`}
            </p>
          </div>
        );
      }
      return (
        <div className="mt-1">
          <p className="text-[13px] font-medium text-blue-400 mb-0.5">{autoRoll.strategy}</p>
          <p className="text-lg font-semibold text-white leading-tight">Pending Calculation</p>
        </div>
      );
    }

    const oldestMarket = activeStrategies[activeStrategies.length - 1];
    
    let metric = 'Market Data';
    if (oldestMarket.trigger.includes('PT Price')) metric = 'PT Price';
    else if (oldestMarket.trigger.includes('YT Price')) metric = 'YT Price';
    else if (oldestMarket.trigger.includes('Claimable Yield')) metric = 'Claimable Yield';
    else if (oldestMarket.trigger.includes('APY')) metric = 'Vault APY';
    
    let waitingFor = oldestMarket.trigger.replace('IF ', '');
    // Clean up generic vault names from trigger for better fit
    waitingFor = waitingFor.replace('Selected Vault ', '').replace('Novaire XLM Vault ', '');

    return (
      <div className="mt-1">
        <p className="text-[13px] font-medium text-purple-400 mb-0.5 truncate">{oldestMarket.strategy}</p>
        <p className="text-[11px] text-white/50 mb-0.5 uppercase tracking-wide">Monitoring {metric}</p>
        <p className="text-[14px] font-semibold text-white truncate">Waiting for {waitingFor}</p>
      </div>
    );
  };

  return (
    <PageContainer
      title="Intent Automation"
      description="Configure conditional strategies and automate your yield execution."
      actions={
        <Button onClick={() => handleCreateStrategy()}>
          <Plus className="h-4 w-4 mr-2" />
          Create Strategy
        </Button>
      }
    >
      <div className="mb-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Active Strategies"
            value={activeStrategies.length.toString()}
            icon={Activity}
            index={0}
          />
          <MetricCard
            label="Total Automations"
            value={activeStrategies.length.toString()}
            icon={Zap}
            index={1}
          />
          <MetricCard
            label="Extra Yield Earned"
            value="$0.00"
            icon={TrendingUp}
            index={2}
          />
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-[#111111] p-4 transition-all duration-200 hover:border-[#43D18C] hover:shadow-[0_0_18px_rgba(67,209,140,0.15)] hover:-translate-y-[3px]">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-white/5 text-orange-400 transition-colors duration-200 group-hover:bg-[#43D18C]/10 group-hover:text-[#43D18C]">
                <Calendar className="h-3 w-3" />
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#9A9A9A] font-sans leading-none">
                Next Execution
              </span>
            </div>
            
            <div className="mt-3 flex flex-col relative z-10 min-h-[28px]">
              {renderNextExecution()}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#43D18C]/30 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          </div>
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
    </PageContainer>
  );
}


