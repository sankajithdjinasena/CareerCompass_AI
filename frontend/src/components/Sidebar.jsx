import { LayoutDashboard, FileText, Map, Briefcase, PlayCircle, Settings } from 'lucide-react'

export default function Sidebar({ activePage = 'dashboard', onNavigate = () => {} }) {
  const navItem = (key, label, Icon, enabled, comingSoonMsg) => {
    const active = activePage === key
    return (
      <li key={key}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            if (enabled) {
              onNavigate(key)
            } else {
              alert(comingSoonMsg)
            }
          }}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
            active
              ? 'bg-brand-900 text-white'
              : 'text-slate-300 hover:bg-brand-900 hover:text-white'
          }`}
        >
          <Icon className={`w-5 h-5 ${active ? 'text-brand-400' : 'text-slate-400'}`} />
          {label}
          {active && (
            <div className="ml-auto bg-brand-500 text-xs px-2 py-0.5 rounded-full font-bold">ACTIVE</div>
          )}
        </a>
      </li>
    )
  }

  return (
    <aside className="w-64 bg-brand-950 text-white flex flex-col h-full">
      <div className="p-6">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          CAREERWISE AI <span className="bg-brand-500 text-xs px-1 rounded-sm">+</span>
        </h2>
      </div>

      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-2">
          {navItem('dashboard', 'Dashboard', LayoutDashboard, true)}
          {navItem('resume', 'Resume', FileText, false, "The Resume Editor module is under construction for CodeSplash '26.")}
          {navItem('roadmap', 'Roadmap', Map, true)}
          {navItem('jobs', 'Jobs', Briefcase, false, "The Job Search module is under construction for CodeSplash '26.")}
          {navItem('practice', 'Practice', PlayCircle, true)}
          {navItem('settings', 'Settings', Settings, true)}
        </ul>
      </nav>

      <div className="p-4 border-t border-brand-900 mt-auto">
        <button 
          onClick={(e) => {
            e.preventDefault();
            onNavigate('logout');
          }}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg font-medium text-slate-300 hover:bg-brand-900 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log Out
        </button>
      </div>
    </aside>
  )
}