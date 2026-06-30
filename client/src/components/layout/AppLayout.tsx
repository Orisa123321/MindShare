import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavBar } from './TopNavBar';
import { MobileBottomNav } from './MobileBottomNav';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopNavBar onMenuToggle={() => setSidebarOpen(true)} />

      {/* Main content area */}
      <main className="md:ml-[260px] pt-16 pb-20 md:pb-6 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto py-6 animate-fade-in">
          <Outlet />
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
