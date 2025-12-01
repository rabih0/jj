import { Home, FileText, Users, Settings, PlusCircle } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="pb-24 pt-8 px-4 max-w-md mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-1">UmzugsManager</h1>
        <p className="text-muted-foreground">Welcome back, Rabih</p>
      </header>

      <section className="mb-8">
        <div className="glass-card bg-gradient-to-br from-white/40 to-white/10 dark:from-black/40 dark:to-black/10">
          <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-white/30 dark:bg-black/20">
              <p className="text-xs text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">€0</p>
            </div>
            <div className="p-3 rounded-lg bg-white/30 dark:bg-black/20">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <button className="text-sm text-primary hover:underline">View All</button>
        </div>
        <div className="space-y-3">
          {/* Placeholder for recent items */}
          <div className="glass p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-medium">New Installation</p>
              <p className="text-xs text-muted-foreground">Just now</p>
            </div>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">System</span>
          </div>
        </div>
      </section>
    </div>
  );
}
