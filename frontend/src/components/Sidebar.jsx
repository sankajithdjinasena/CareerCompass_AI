import { LayoutDashboard, FileText, Map, Briefcase, PlayCircle, Settings } from 'lucide-react'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-brand-950 text-white flex flex-col h-full">
      <div className="p-6">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          CAREERWISE AI <span className="bg-brand-500 text-xs px-1 rounded-sm">+</span>
        </h2>
      </div>
      
      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-2">
          <li>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-brand-900 text-white font-medium">
              <LayoutDashboard className="w-5 h-5 text-brand-400" />
              Dashboard
              <div className="ml-auto bg-brand-500 text-xs px-2 py-0.5 rounded-full font-bold">ACTIVE</div>
            </a>
          </li>
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); alert("The Resume Editor module is under construction for CodeSplash '26."); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-brand-900 hover:text-white transition-colors">
              <FileText className="w-5 h-5 text-slate-400" />
              Resume
            </a>
          </li>
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); alert("The Interactive Roadmap module is under construction for CodeSplash '26."); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-brand-900 hover:text-white transition-colors">
              <Map className="w-5 h-5 text-slate-400" />
              Roadmap
            </a>
          </li>
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); alert("The Job Search module is under construction for CodeSplash '26."); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-brand-900 hover:text-white transition-colors">
              <Briefcase className="w-5 h-5 text-slate-400" />
              Jobs
            </a>
          </li>
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); alert("The Interview Practice module is under construction for CodeSplash '26."); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-brand-900 hover:text-white transition-colors">
              <PlayCircle className="w-5 h-5 text-slate-400" />
              Practice
            </a>
          </li>
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); alert("Settings module is under construction."); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-brand-900 hover:text-white transition-colors">
              <Settings className="w-5 h-5 text-slate-400" />
              Settings
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  )
}
