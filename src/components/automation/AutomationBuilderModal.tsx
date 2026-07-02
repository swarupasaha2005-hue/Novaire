import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Settings, Clock, ChevronDown } from 'lucide-react';
import { YieldService } from '@/services/yieldService';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useTrade } from '@/hooks/useTrade';

interface AutomationBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (strategy: any) => void;
  initialTemplate?: any;
}

export function AutomationBuilderModal({ isOpen, onClose, onSubmit, initialTemplate }: AutomationBuilderModalProps) {
  // Custom State
  const [conditionAsset, setConditionAsset] = useState('PT Price');
  const [conditionOperator, setConditionOperator] = useState('<');
  const [conditionValue, setConditionValue] = useState('0.95');
  const [actionType, setActionType] = useState('Buy');
  const [actionAsset, setActionAsset] = useState('PT');
  const [actionAmount, setActionAmount] = useState('1000');

  // Common State
  const [slippage, setSlippage] = useState('0.5');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Template Specific State
  const [s1Action, setS1Action] = useState('Redeem PT & Mint Next Epoch');
  const [s2Threshold, setS2Threshold] = useState('10');
  const [s2Operator, setS2Operator] = useState('>');
  const [s2Action, setS2Action] = useState('Claim Yield & Reinvest into Same Vault');
  const [s3Target, setS3Target] = useState('0.90');
  const [s3Operator, setS3Operator] = useState('<');
  const [s3Amount, setS3Amount] = useState('1000');
  const [s4Target, setS4Target] = useState('0.15');
  const [s4Operator, setS4Operator] = useState('>');
  const [s4Amount, setS4Amount] = useState('100');
  const [s5Target, setS5Target] = useState('15');
  const [s5Amount, setS5Amount] = useState('500');

  const [vaults, setVaults] = useState<any[]>([]);
  const [selectedVaultId, setSelectedVaultId] = useState<string>('');
  const [claimableYield, setClaimableYield] = useState<number>(0);
  
  const { portfolio, loading } = usePortfolio();
  const { marketData } = useTrade();
  
  console.log(`[AutomationBuilderModal Render] loading=${loading}, portfolio=${portfolio ? 'Exists' : 'Null'}, assets=${portfolio?.assets?.length || 0}`);
  
  const currentPtPrice = marketData?.ptPrice || 0;
  const currentYtPrice = marketData?.ytPrice || 0;

  useEffect(() => {
    YieldService.getVaults().then((vaultsData) => {
      setVaults(vaultsData);
      if (vaultsData.length > 0) {
        // Prioritize the user's active deployed vault (Epoch 17 XLM) over mock vaults
        const activeVault = vaultsData.find(v => v.asset === 'XLM' || (Array.isArray(v.asset) && v.asset.includes('XLM'))) || vaultsData[0];
        setSelectedVaultId(activeVault.id);
      }
    }).catch(console.error);

    if (isOpen && initialTemplate) {
      // Reset or initialize values if needed
    }
  }, [isOpen, initialTemplate]);

  useEffect(() => {
    // Calculate claimable yield when vault or portfolio changes
    if (portfolio && selectedVaultId && vaults.length > 0) {
      let yieldCalc = 0;
      const vaultAssets = portfolio.assets.filter((a: any) => a.assetType === 'vault');
      const selectedVault = vaults.find(v => v.id === selectedVaultId);
      
      if (selectedVault) {
        vaultAssets.forEach((asset: any) => {
          const match = asset.assetCode.match(/\((.*?)\)/);
          const underlying = match ? match[1] : 'Unknown';
          // Check if this vault asset matches the selected vault's underlying
          if ((Array.isArray(selectedVault.asset) ? selectedVault.asset.includes(underlying) : selectedVault.asset === underlying) &&
              !isNaN(asset.balance) && typeof selectedVault.fixedApy === 'number' && !isNaN(selectedVault.fixedApy)) {
            const addedYield = asset.balance * (selectedVault.fixedApy / 100) * 0.1;
            if (!isNaN(addedYield) && isFinite(addedYield)) yieldCalc += addedYield;
          }
        });
      }
      setClaimableYield(yieldCalc);
    }
  }, [selectedVaultId, vaults, portfolio]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Add validation for S3
    if (initialTemplate?.id === 's3') {
      const parsedAmount = parseFloat(s3Amount);
      const parsedTarget = parseFloat(s3Target);
      if (isNaN(parsedAmount) || parsedAmount <= 0 || isNaN(parsedTarget) || parsedTarget <= 0) {
        setIsSubmitting(false);
        return;
      }
    }
    // Add validation for S4
    if (initialTemplate?.id === 's4') {
      const parsedAmount = parseFloat(s4Amount);
      const parsedTarget = parseFloat(s4Target);
      
      let availableYt = 0;
      if (portfolio) {
        const selectedVault = vaults.find(v => v.id === selectedVaultId);
        const underlying = selectedVault?.asset || 'XLM';
        const ytAsset = portfolio.assets.find((a: any) => a.assetType === 'yt' && a.assetCode.includes(underlying));
        if (ytAsset && !isNaN(ytAsset.balance)) {
          availableYt = ytAsset.balance;
        }
      }

      if (isNaN(parsedAmount) || parsedAmount <= 0 || isNaN(parsedTarget) || parsedTarget <= 0 || parsedAmount > availableYt) {
        setIsSubmitting(false);
        return;
      }
    }
    if (initialTemplate?.id === 's2' && parseFloat(s2Threshold) <= 0) {
      setIsSubmitting(false);
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    
    let conditionDesc = '';
    let actionDesc = '';

    const id = initialTemplate?.id;

    if (!id) {
      conditionDesc = `IF ${conditionAsset} ${conditionOperator} ${conditionValue}`;
      actionDesc = `THEN ${actionType} ${actionAmount} ${actionAsset}`;
    } else if (id === 's1') {
      const selectedVault = vaults.find(v => v.id === selectedVaultId);
      const vaultName = selectedVault ? `${selectedVault.protocol} ${selectedVault.asset} Vault` : 'Selected Vault';
      conditionDesc = `IF ${vaultName} Reaches Maturity`;
      actionDesc = `THEN ${s1Action}`;
    } else if (id === 's2') {
      const selectedVault = vaults.find(v => v.id === selectedVaultId);
      const vaultName = selectedVault ? `${selectedVault.protocol} ${selectedVault.asset} Vault` : 'Selected Vault';
      conditionDesc = `IF ${vaultName} Claimable Yield ${s2Operator} ${s2Threshold}`;
      actionDesc = `THEN ${s2Action}`;
    } else if (id === 's3') {
      conditionDesc = `IF PT Price ${s3Operator} ${s3Target}`;
      actionDesc = `THEN Buy ${s3Amount} PT`;
    } else if (id === 's4') {
      conditionDesc = `IF YT Price ${s4Operator} ${s4Target}`;
      actionDesc = `THEN Sell ${s4Amount} YT`;
    } else if (id === 's5') {
      conditionDesc = `IF Vault APY > ${s5Target}%`;
      actionDesc = `THEN Mint using ${s5Amount} XLM`;
    }

    onSubmit({
      condition: conditionDesc,
      action: actionDesc,
      status: 'Active',
      id: Math.random().toString(36).substring(7)
    });
    onClose();
  };

  const renderTriggerFields = () => {
    const id = initialTemplate?.id;

    if (id === 's1') {
      const selectedVault = vaults.find(v => v.id === selectedVaultId);
      const epoch = selectedVault?.epoch || '-';
      const maturityDate = selectedVault ? new Date(selectedVault.maturityDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) : '';
      const vaultName = selectedVault ? `${selectedVault.protocol} ${selectedVault.asset} Vault` : '';

      return (
        <div className="space-y-4">
          <div className="relative">
            <select
              value={selectedVaultId}
              onChange={(e) => setSelectedVaultId(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-500/50 focus:outline-none"
            >
              {vaults.map((vault) => (
                <option key={vault.id} value={vault.id}>
                  {vault.protocol} {vault.asset} Vault (Epoch {epoch})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white/70">
              <Clock className="h-4 w-4" />
              At Vault Maturity
            </div>

            <div className="mb-4 grid grid-cols-3 gap-4">
              <div>
                <div className="mb-1 text-xs text-white/40">Vault</div>
                <div className="text-sm font-medium text-white">{vaultName}</div>
              </div>
              <div>
                <div className="mb-1 text-xs text-white/40">Epoch</div>
                <div className="text-sm font-medium text-white">{epoch}</div>
              </div>
              <div>
                <div className="mb-1 text-xs text-white/40">Execution Date</div>
                <div className="text-sm font-medium text-blue-400">{maturityDate}</div>
              </div>
            </div>

            <div className="rounded-lg bg-blue-500/10 px-4 py-3 text-xs leading-relaxed text-blue-300">
              This strategy will execute automatically when this vault reaches maturity.
            </div>
          </div>
        </div>
      );
    }
    if (id === 's2') {
      const selectedVault = vaults.find(v => v.id === selectedVaultId);
      const assetLabel = selectedVault?.asset || 'XLM';
      const parsedThreshold = parseFloat(s2Threshold);
      const isThresholdValid = !isNaN(parsedThreshold) && parsedThreshold > 0;
      
      let meetsCondition = false;
      if (isThresholdValid) {
        if (s2Operator === '>') meetsCondition = claimableYield > parsedThreshold;
        if (s2Operator === '>=') meetsCondition = claimableYield >= parsedThreshold;
        if (s2Operator === '<') meetsCondition = claimableYield < parsedThreshold;
        if (s2Operator === '<=') meetsCondition = claimableYield <= parsedThreshold;
      }

      return (
        <div className="space-y-4">
          <div className="relative">
            <select
              value={selectedVaultId}
              onChange={(e) => setSelectedVaultId(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-500/50 focus:outline-none"
            >
              {vaults.map((vault) => (
                <option key={vault.id} value={vault.id}>
                  {vault.protocol} {vault.asset} Vault
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <div className="mb-4">
              <div className="mb-1 text-xs text-white/40">Current Claimable Yield</div>
              <div className="text-xl font-semibold text-emerald-400">
                {claimableYield.toFixed(3)} {assetLabel}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm text-white/70">Execute when claimable yield</span>
              <div className="relative">
                <select
                  value={s2Operator}
                  onChange={(e) => setS2Operator(e.target.value)}
                  className="appearance-none rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 pr-8 text-sm text-white focus:border-blue-500/50 focus:outline-none"
                >
                  <option value=">">Greater Than (&gt;)</option>
                  <option value=">=">Greater or Equal (&gt;=)</option>
                  <option value="<">Less Than (&lt;)</option>
                  <option value="<=">Less or Equal (&lt;=)</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-white/50" />
              </div>
              <div className="relative flex-1 min-w-[100px]">
                <input
                  type="number"
                  value={s2Threshold}
                  onChange={(e) => setS2Threshold(e.target.value)}
                  placeholder="10"
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-sm text-white focus:border-blue-500/50 focus:outline-none"
                />
              </div>
              <span className="text-sm text-white/70">{assetLabel}</span>
            </div>

            {isThresholdValid ? (
              meetsCondition ? (
                <div className="rounded-lg bg-emerald-500/10 px-4 py-3 text-xs leading-relaxed text-emerald-400 font-medium">
                  Ready to Execute
                </div>
              ) : (
                <div className="rounded-lg bg-blue-500/10 px-4 py-3 text-xs leading-relaxed text-blue-300">
                  Waiting for Claimable Yield to exceed the configured threshold.
                </div>
              )
            ) : (
              <div className="rounded-lg bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-400">
                Threshold must be greater than zero.
              </div>
            )}
          </div>
        </div>
      );
    }
    if (id === 's3') {
      const selectedVault = vaults.find(v => v.id === selectedVaultId);
      
      return (
        <div className="space-y-4">
          <div className="relative">
            <select
              value={selectedVaultId}
              onChange={(e) => setSelectedVaultId(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-500/50 focus:outline-none"
            >
              {vaults.map((vault) => (
                <option key={vault.id} value={vault.id}>
                  {vault.protocol} {vault.asset} Vault
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white flex-1">
              PT Price
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/50 w-16 text-center">
              &lt;
            </div>
            <input
              type="number"
              value={s3Target}
              onChange={(e) => setS3Target(e.target.value)}
              placeholder="Target Price"
              step="0.01"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-500/50 focus:outline-none flex-1"
            />
          </div>
        </div>
      );
    }
    if (id === 's4') {
      return (
        <div className="space-y-4">
          <div className="relative">
            <select
              value={selectedVaultId}
              onChange={(e) => setSelectedVaultId(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-orange-500/50 focus:outline-none"
            >
              {vaults.map((vault) => (
                <option key={vault.id} value={vault.id}>
                  {vault.protocol} {vault.asset} Vault
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white flex-1">
              YT Price
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/50 w-16 text-center">
              &gt;
            </div>
            <input
              type="number"
              value={s4Target}
              onChange={(e) => setS4Target(e.target.value)}
              placeholder="Target Price"
              step="0.01"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-orange-500/50 focus:outline-none flex-1"
            />
          </div>
        </div>
      );
    }
    if (id === 's5') {
      return (
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white flex-1">
            Vault APY (%)
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/50 w-16 text-center">
            &gt;
          </div>
          <input
            type="number"
            value={s5Target}
            onChange={(e) => setS5Target(e.target.value)}
            placeholder="Target APY"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-500/50 focus:outline-none flex-1"
          />
        </div>
      );
    }

    // Default generic custom trigger
    return (
      <div className="grid grid-cols-3 gap-3">
        <select 
          value={conditionAsset}
          onChange={(e) => setConditionAsset(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-500/50 focus:outline-none"
        >
          <option value="PT Price">PT Price</option>
          <option value="YT Price">YT Price</option>
          <option value="Fixed APY">Fixed APY</option>
          <option value="Vault Yield">Vault Yield</option>
          <option value="Time">Time (Maturity)</option>
        </select>
        
        <select
          value={conditionOperator}
          onChange={(e) => setConditionOperator(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-500/50 focus:outline-none"
        >
          <option value="<">Falls Below (&lt;)</option>
          <option value=">">Rises Above (&gt;)</option>
          <option value="=">Equals (=)</option>
        </select>
        
        <input
          type="number"
          value={conditionValue}
          onChange={(e) => setConditionValue(e.target.value)}
          placeholder="0.00"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-500/50 focus:outline-none"
        />
      </div>
    );
  };

  const renderActionFields = () => {
    const id = initialTemplate?.id;

    if (id === 's1') {
      return (
        <div className="relative">
          <select
            value={s1Action}
            onChange={(e) => setS1Action(e.target.value)}
            className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-500/50 focus:outline-none"
          >
            <option value="Redeem PT & Mint Next Epoch">Redeem PT & Mint Next Epoch</option>
            <option value="Redeem PT to Wallet">Redeem PT to Wallet</option>
            <option value="Sell PT Before Maturity">Sell PT Before Maturity</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
        </div>
      );
    }
    if (id === 's2') {
      return null;
    }
    if (id === 's3') {
      const selectedVault = vaults.find(v => v.id === selectedVaultId);
      const assetLabel = selectedVault?.asset || 'XLM';
      const parsedAmount = parseFloat(s3Amount);
      const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0;
      const estimatedCost = (parsedAmount > 0 && currentPtPrice > 0) ? (parsedAmount * currentPtPrice) : 0;

      return (
        <div className="space-y-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <label className="mb-2 block text-sm font-medium text-white/70">Buy Amount</label>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="number"
                value={s3Amount}
                onChange={(e) => setS3Amount(e.target.value)}
                placeholder="1000"
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-500/50 focus:outline-none"
              />
              <span className="text-sm font-medium text-white">PT</span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/50">Estimated Cost</span>
                <span className="font-semibold text-white">≈ {estimatedCost.toFixed(4)} {assetLabel}</span>
              </div>
            </div>
            
            {!isAmountValid && (
              <div className="mt-3 rounded-lg bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-400">
                Buy Amount must be greater than zero.
              </div>
            )}
          </div>
        </div>
      );
    }
    if (id === 's4') {
      if (loading) {
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 text-sm text-white/50 text-center animate-pulse">
              Loading Portfolio...
            </div>
          </div>
        );
      }
      if (!portfolio || !portfolio.assets || portfolio.assets.length === 0) {
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 text-sm text-white/50 text-center animate-pulse">
              Loading Portfolio Assets...
            </div>
          </div>
        );
      }
      const selectedVault = vaults.find(v => v.id === selectedVaultId);
      const assetLabel = selectedVault?.asset || 'XLM';
      
      let availableYt = 0;
      if (portfolio) {
        // Explicit YT lookup instead of substring matching
        const matchedAsset = portfolio.assets.find((a: any) => a.assetType === 'yt' && a.assetCode === `YT-${assetLabel}`);
        
        console.log("selectedVaultId", selectedVaultId);
        console.log("selectedVault", selectedVault);
        console.log("assetLabel", assetLabel);
        console.log("portfolio.assets", portfolio.assets);
        console.log("matched asset", matchedAsset);
        
        if (matchedAsset && !isNaN(matchedAsset.balance)) {
          availableYt = matchedAsset.balance;
        }
        
        console.log("availableYt", availableYt);
      }

      const parsedAmount = parseFloat(s4Amount);
      const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0;
      const isAmountWithinBalance = isAmountValid && parsedAmount <= availableYt;
      const estimatedReceive = (parsedAmount > 0 && currentYtPrice > 0) ? (parsedAmount * currentYtPrice) : 0;

      return (
        <div className="space-y-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-white/70">Sell Amount</label>
              <div className="text-xs text-white/50">
                Available: <span className="text-white">{availableYt.toFixed(4)} YT</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <input
                type="number"
                value={s4Amount}
                onChange={(e) => setS4Amount(e.target.value)}
                placeholder="100"
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-orange-500/50 focus:outline-none"
              />
              <button
                onClick={() => setS4Amount(availableYt.toString())}
                className="rounded-lg bg-orange-500/20 px-3 py-2 text-xs font-medium text-orange-400 hover:bg-orange-500/30 transition-colors"
              >
                Max
              </button>
              <span className="text-sm font-medium text-white">YT</span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/50">Estimated Receive</span>
                <span className="font-semibold text-white">≈ {estimatedReceive.toFixed(4)} {assetLabel}</span>
              </div>
            </div>
            
            {!isAmountValid ? (
              <div className="mt-3 rounded-lg bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-400">
                Sell Amount must be greater than zero.
              </div>
            ) : !isAmountWithinBalance ? (
              <div className="mt-3 rounded-lg bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-400">
                Sell amount cannot exceed available YT balance.
              </div>
            ) : null}
          </div>
        </div>
      );
    }
    if (id === 's5') {
      return (
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white flex-1">
            Mint PT & YT
          </div>
          <input
            type="number"
            value={s5Amount}
            onChange={(e) => setS5Amount(e.target.value)}
            placeholder="Deposit Amount (XLM)"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none flex-1"
          />
        </div>
      );
    }

    // Default generic custom action
    return (
      <div className="grid grid-cols-3 gap-3">
        <select
          value={actionType}
          onChange={(e) => setActionType(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none"
        >
          <option value="Buy">Buy</option>
          <option value="Sell">Sell</option>
          <option value="Mint">Mint</option>
          <option value="Redeem">Redeem</option>
          <option value="Compound">Compound</option>
        </select>
        
        <input
          type="number"
          value={actionAmount}
          onChange={(e) => setActionAmount(e.target.value)}
          placeholder="Amount"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none"
        />

        <select
          value={actionAsset}
          onChange={(e) => setActionAsset(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none"
        >
          <option value="PT">PT</option>
          <option value="YT">YT</option>
          <option value="XLM">XLM</option>
          <option value="Yield">Yield</option>
        </select>
      </div>
    );
  };

  const showSlippage = initialTemplate?.id === 's3' || initialTemplate?.id === 's4' || !initialTemplate;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A] shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <div>
              <h2 className="text-xl font-medium text-white">
                Strategy Builder {initialTemplate?.title ? `– ${initialTemplate.title}` : ''}
              </h2>
              <p className="text-sm text-white/50">
                {initialTemplate?.description || 'Define conditional intents for execution.'}
              </p>
            </div>
            <button onClick={onClose} className="rounded-full p-2 text-white/50 transition-colors hover:bg-white/5 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* IF Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                  <span className="text-sm font-bold">IF</span>
                </div>
                <h3 className="text-lg font-medium text-white">Condition Trigger</h3>
              </div>
              
              {renderTriggerFields()}
            </div>

            {/* THEN Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <span className="text-sm font-bold">THEN</span>
                </div>
                <h3 className="text-lg font-medium text-white">Execution Action</h3>
              </div>
              
              {/* Action Configuration */}
              {initialTemplate?.id === 's2' ? (
                <div className="mb-8">
                  <label className="mb-3 block text-sm font-medium text-white/70">Action</label>
                  <div className="relative">
                    <select
                      value={s2Action}
                      onChange={(e) => setS2Action(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-500/50 focus:outline-none"
                    >
                      <option value="Claim Yield & Mint PT/YT">Claim Yield &amp; Mint PT/YT</option>
                      <option value="Claim Yield & Reinvest into Same Vault">Claim Yield &amp; Reinvest into Same Vault</option>
                      <option value="Claim Yield to Wallet">Claim Yield to Wallet</option>
                      <option value="Claim Yield & Buy PT">Claim Yield &amp; Buy PT</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                  </div>
                </div>
              ) : initialTemplate?.id === 's3' || initialTemplate?.id === 's4' ? (
                <div className="mb-8">
                  {renderActionFields()}
                </div>
              ) : (
                <div className="mb-8">
                  <label className="mb-3 block text-sm font-medium text-white/70">Action</label>
                  {renderActionFields()}
                </div>
              )}
            </div>
          </div>

          {/* Strategy Summary for S3 */}
          {initialTemplate?.id === 's3' && (
            <div className="px-6 mb-6">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <h3 className="mb-3 text-sm font-semibold text-emerald-400">Strategy Summary</h3>
                <div className="space-y-2 text-sm text-white/80">
                  <p>
                    <span className="font-mono text-emerald-300">IF</span> PT Price {s3Operator} {parseFloat(s3Target) || 0} XLM
                  </p>
                  <p>
                    <span className="font-mono text-emerald-300">THEN</span> Buy {parseFloat(s3Amount) || 0} PT
                  </p>
                  <div className="pt-2 mt-2 border-t border-emerald-500/10">
                    <p className="font-medium">Estimated Cost: ≈ {((parseFloat(s3Amount) || 0) * currentPtPrice).toFixed(4)} XLM</p>
                  </div>
                  <p className="text-xs text-white/50 mt-3">This strategy will execute automatically once the condition is satisfied.</p>
                </div>
              </div>
            </div>
          )}

          {/* Strategy Summary for S4 */}
          {initialTemplate?.id === 's4' && (
            <div className="px-6 mb-6">
              <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-5">
                <h3 className="mb-3 text-sm font-semibold text-orange-400">Strategy Summary</h3>
                <div className="space-y-2 text-sm text-white/80">
                  <p>
                    <span className="font-mono text-orange-300">IF</span> YT Price {s4Operator} {parseFloat(s4Target) || 0} XLM
                  </p>
                  <p>
                    <span className="font-mono text-orange-300">THEN</span> Sell {parseFloat(s4Amount) || 0} YT
                  </p>
                  <div className="pt-2 mt-2 border-t border-orange-500/10">
                    <p className="font-medium">Estimated Receive: ≈ {((parseFloat(s4Amount) || 0) * currentYtPrice).toFixed(4)} XLM</p>
                  </div>
                  <p className="text-xs text-white/50 mt-3">This strategy will execute automatically once the condition is satisfied.</p>
                </div>
              </div>
            </div>
          )}

          {/* Execution Settings */}
          <div className="px-6 flex gap-4">
            {initialTemplate?.id === 's4' && (
              <div className="flex-1 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="mb-1 text-xs text-white/40">Estimated Receive</div>
                <div className="text-sm font-medium text-white">≈ {((parseFloat(s4Amount) || 0) * currentYtPrice).toFixed(4)} XLM</div>
              </div>
            )}
            <div className="flex-1 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="mb-1 text-xs text-white/40">Network Fee</div>
              <div className="text-sm font-medium text-white">~0.0001 XLM</div>
            </div>
            {(!initialTemplate?.id || initialTemplate?.id === 's3' || initialTemplate?.id === 's4') && (
              <div className="flex-1 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="mb-1 text-xs text-white/40">Slippage Tolerance</div>
                <div className="text-sm font-medium text-white">{slippage}%</div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="mt-8 border-t border-white/10 p-6">
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  isSubmitting || 
                  (initialTemplate?.id === 's2' && parseFloat(s2Threshold) <= 0) ||
                  (initialTemplate?.id === 's3' && (parseFloat(s3Amount) <= 0 || parseFloat(s3Target) <= 0 || isNaN(parseFloat(s3Amount)) || isNaN(parseFloat(s3Target)))) ||
                  (initialTemplate?.id === 's4' && (() => {
                    const parsedAmount = parseFloat(s4Amount);
                    const parsedTarget = parseFloat(s4Target);
                    
                    let availableYt = 0;
                    if (portfolio) {
                      const selectedVault = vaults.find(v => v.id === selectedVaultId);
                      const underlying = selectedVault?.asset || 'XLM';
                      const ytAsset = portfolio.assets.find((a: any) => a.assetType === 'yt' && a.assetCode.includes(underlying));
                      if (ytAsset && !isNaN(ytAsset.balance)) availableYt = ytAsset.balance;
                    }
                    
                    return isNaN(parsedAmount) || parsedAmount <= 0 || isNaN(parsedTarget) || parsedTarget <= 0 || parsedAmount > availableYt;
                  })())
                }
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition-all hover:bg-white/90 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                Deploy Strategy
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
