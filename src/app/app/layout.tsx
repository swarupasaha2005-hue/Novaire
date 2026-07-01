import { ReactNode } from 'react';
import { TopNav } from '@/components/app-shell/TopNav';
import { AmbientBackground } from '@/components/AmbientBackground';

export const metadata = {
  title: 'Novaire Web Terminal',
  description: 'Novaire protocol web terminal.',
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-screen w-full overflow-hidden text-[#F5F5F2] font-inter">
      {/* Background Layer */}
      <AmbientBackground />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNav />
        
        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
