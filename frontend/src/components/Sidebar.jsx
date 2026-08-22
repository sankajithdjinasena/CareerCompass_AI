import { LayoutDashboard, FileText, Map, Briefcase, PlayCircle, Settings, Sun, Moon, LogOut } from 'lucide-react'
import { useTheme } from '../lib/ThemeContext'

export default function Sidebar({ activePage = 'dashboard', onNavigate = () => {} }) {
  const { theme, toggleTheme } = useTheme()

  const navItem = (key, label, Icon, enabled, comingSoonMsg) => {
    const active = activePage === key
    return (
      <li key={key}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            if (enabled) {
              onNavigate(key)
            } else {
              alert(comingSoonMsg)
            }
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-left ${
            active
              ? 'bg-brand-500/15 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300 border-l-4 border-brand-500 font-semibold'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Icon className={`w-5 h-5 ${active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'}`} />
          <span>{label}</span>
          {active && (
            <div className="ml-auto bg-brand-500 text-white text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              ACTIVE
            </div>
          )}
        </button>
      </li>
    )
  }

  return (
    <aside className="w-64 bg-white dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white flex flex-col h-full shadow-lg transition-colors duration-200 z-20 flex-shrink-0">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800/80">
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <span>CAREERCOMPASS</span>
          <span className="bg-brand-500 text-white text-xs px-2 py-0.5 rounded-md font-bold">AI</span>
        </h2>
      </div>

      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <ul className="space-y-1.5">
          {navItem('dashboard', 'Dashboard', LayoutDashboard, true)}
          {navItem('resume', 'Resume', FileText, true)}
          {navItem('roadmap', 'Roadmap', Map, true)}
          {navItem('jobs', 'Jobs', Briefcase, true)}
          {navItem('practice', 'Practice', PlayCircle, true)}
          {navItem('settings', 'Settings', Settings, true)}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2 mt-auto">
        {/* Theme Switcher Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center justify-between px-4 py-2.5 w-full rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700/60"
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600" />
            )}
            <span className="text-sm font-semibold">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </div>
          <span className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded font-mono uppercase">
            {theme}
          </span>
        </button>

        {/* Logout Button */}
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('logout');
          }}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-semibold">Log Out</span>
        </button>
      </div>
    </aside>
  )
}
