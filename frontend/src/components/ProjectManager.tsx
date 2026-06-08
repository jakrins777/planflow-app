import { Plus, FolderOpen } from 'lucide-react';
import type { Project, JobCatalogItem } from '../types';

const COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#6366f1', '#10b981'];

interface Props {
  projects: Project[];
  activeProjectId: number;
  setActiveProjectId: (id: number) => void;
  handleAddProject: () => void;
  handleAddJobToProject: (projectId: number) => void;
  handleJobChange: (projectId: number, jobId: number, field: string, value: string | number) => void;
  handleCatalogSelect: (projectId: number, jobId: number, code: string) => void;
  getProjectWorkload: (jobs: any[]) => number;
  jobCatalog: JobCatalogItem[];
}

export default function ProjectManager({
  projects, activeProjectId, setActiveProjectId, handleAddProject, handleAddJobToProject, 
  handleJobChange, handleCatalogSelect, getProjectWorkload, jobCatalog
}: Props) {
  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[550px]">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">จัดการงานราย Project</h3>
          <button onClick={handleAddProject} className="flex items-center text-sm bg-blue-100 px-3 py-1.5 rounded-md text-blue-700 hover:bg-blue-200 font-medium transition">
            <Plus size={16} className="mr-1" /> สร้างโปรเจกต์
          </button>
        </div>
        
        <div className="flex space-x-2 overflow-x-auto pb-1 custom-scrollbar">
          {projects.map((proj) => (
            <button
              key={proj.id}
              onClick={() => setActiveProjectId(proj.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition border-b-2 ${
                activeProjectId === proj.id ? 'bg-white text-slate-800 shadow-sm border-blue-500' : 'text-slate-500 hover:bg-slate-200 border-transparent'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FolderOpen size={16} className={activeProjectId === proj.id ? "text-blue-500" : "text-slate-400"} />
                <span>{proj.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeProject && (
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          <div className="mb-4 flex justify-between items-start">
            <div>
              <h4 className="font-bold text-slate-800 text-lg flex items-center">{activeProject.name}</h4>
              <input 
                 className="text-sm text-slate-500 mt-1 border-b border-dashed border-slate-300 focus:border-blue-500 outline-none bg-transparent"
                 value={activeProject.customer}
                 onChange={(e) => handleJobChange(activeProject.id, 0, 'customer', e.target.value)}
                 title="แก้ชื่อลูกค้าได้"
                 placeholder="ชื่อลูกค้า"
              />
            </div>
            <div className="text-right bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-600 font-medium">เวลารวมโปรเจกต์นี้</p>
              <p className="font-bold text-blue-800 text-lg">{getProjectWorkload(activeProject.jobs)} นาที</p>
            </div>
          </div>

          <div className="space-y-3">
            {activeProject.jobs.map((job, index) => (
              <div key={job.id} className="flex items-center justify-between gap-3 p-3 border border-slate-100 rounded-lg hover:border-slate-300 transition bg-slate-50" style={{ borderLeft: `4px solid ${COLORS[index % COLORS.length]}` }}>
                
                {/* เปลี่ยนจากพิมพ์ข้อความ เป็น Dropdown ดึงจาก Catalog */}
                <select 
                  value={job.catalogCode || ''}
                  onChange={(e) => handleCatalogSelect(activeProject.id, job.id, e.target.value)}
                  className={`flex-1 text-sm px-2 py-1.5 border rounded outline-none font-medium ${!job.catalogCode ? 'border-orange-300 bg-orange-50 text-orange-600' : 'border-slate-300 bg-white text-slate-700'}`}
                >
                  <option value="" disabled>-- กรุณาเลือกงานจากระบบ --</option>
                  {jobCatalog.map(item => (
                    <option key={item.code} value={item.code}>
                      [{item.code}] {item.name}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 mb-0.5">เวลา/ชิ้น</span>
                    {/* ล็อกช่องเวลาเป็นแบบอ่านอย่างเดียว (Read-only) จะมีสีเทาๆ */}
                    <input 
                      type="number" value={job.timePerPiece} readOnly
                      className="w-16 text-sm px-2 py-1.5 border border-slate-200 bg-slate-100 rounded text-center text-slate-500 cursor-not-allowed"
                      title="ดึงอัตโนมัติจากระบบ ไม่สามารถแก้ไขได้"
                    />
                  </div>
                  <span className="text-xs text-slate-400 mt-4">×</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 mb-0.5">จำนวนชิ้น</span>
                    <input 
                      type="number" value={job.qty} min="1"
                      onChange={(e) => handleJobChange(activeProject.id, job.id, 'qty', Number(e.target.value))}
                      className="w-16 text-sm px-2 py-1.5 border border-slate-300 rounded text-center focus:border-blue-400 outline-none"
                    />
                  </div>
                  <div className="w-16 text-right mt-4">
                    <span className="text-sm font-bold text-slate-700">{job.timePerPiece * job.qty} <span className="text-[10px] font-normal text-slate-400">m</span></span>
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              onClick={() => handleAddJobToProject(activeProject.id)}
              className="w-full mt-4 py-2.5 border-2 border-dashed border-slate-200 rounded-lg text-sm font-medium text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition"
            >
              + เพิ่ม Job ย่อย
            </button>
          </div>
        </div>
      )}
    </div>
  );
}