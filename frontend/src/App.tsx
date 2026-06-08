import { useState, useMemo } from 'react';
import Header from './components/Header';
import KPICards from './components/KPICards';
import WorkloadChart from './components/WorkloadChart';
import ProjectManager from './components/ProjectManager';
import EmployeeManager from './components/EmployeeManager';
import type { Project, Employee, JobCatalogItem } from './types';
import { saveDailyPlanService, updatePlanService } from './api/planService';
import PlanHistoryModal from './components/PlanHistoryModal';


// จำลองฐานข้อมูล Master Data ของงาน
export const JOB_CATALOG: JobCatalogItem[] = [
  { code: 'J01', name: 'เบิกน็อต (S/M/L)', time: 10 },
  { code: 'J02', name: 'เบิกสายไฟ / เคเบิล', time: 15 },
  { code: 'J03', name: 'เบิกเหล็กแผ่น / โครงเหล็ก', time: 30 },
  { code: 'J04', name: 'เบิกมอเตอร์ / อะไหล่ใหญ่', time: 45 },
  { code: 'J05', name: 'เบิกแผงวงจร (PCBA)', time: 20 },
  { code: 'J06', name: 'งานแพ็คกิ้งลงกล่อง', time: 12 },
];

export default function App() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1, name: 'Project A', customer: 'Customer A',
      jobs: [
        { id: 101, catalogCode: 'J01', name: 'เบิกน็อต (S/M/L)', timePerPiece: 10, qty: 50 },
        { id: 102, catalogCode: 'J03', name: 'เบิกเหล็กแผ่น / โครงเหล็ก', timePerPiece: 30, qty: 5 },
      ]
    },
    {
      id: 2, name: 'Project B', customer: 'Customer B',
      jobs: [{ id: 201, catalogCode: 'J02', name: 'เบิกสายไฟ / เคเบิล', timePerPiece: 15, qty: 20 }]
    }
  ]);

  const [activeProjectId, setActiveProjectId] = useState<number>(projects[0]?.id || 1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [editPlanId, setEditPlanId] = useState<number | null>(null); // 🔴 State จำ ID แผนงานที่กำลังแก้ไข
  const [employees, setEmployees] = useState<Employee[]>([
    { id: 1, name: 'สมชาย', baseTime: 460, ot: 0, oe: 85 },
    { id: 2, name: 'สมศรี', baseTime: 460, ot: 0, oe: 85 },
    { id: 3, name: 'สมศักดิ์', baseTime: 460, ot: 0, oe: 85 },
  ]);

  const handleEmployeeChange = (id: number, field: string, value: number) => {
    setEmployees(employees.map(emp => emp.id === id ? { ...emp, [field]: value } : emp));
  };

  const handleAddProject = () => {
    const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
    const newProject = { 
      id: newId, name: `Project ${newId}`, customer: 'New Customer', 
      jobs: [{ id: Date.now(), catalogCode: '', name: '', timePerPiece: 0, qty: 1 }] 
    };
    setProjects([...projects, newProject]);
    setActiveProjectId(newId);
  };

  const handleAddJobToProject = (projectId: number) => {
    setProjects(projects.map(proj => {
      if (proj.id === projectId) {
        return { ...proj, jobs: [...proj.jobs, { id: Date.now(), catalogCode: '', name: '', timePerPiece: 0, qty: 1 }] };
      }
      return proj;
    }));
  };

  const handleCatalogSelect = (projectId: number, jobId: number, selectedCode: string) => {
    const catalogItem = JOB_CATALOG.find(item => item.code === selectedCode);
    if (!catalogItem) return;

    setProjects(projects.map(proj => {
      if (proj.id === projectId) {
        return { 
          ...proj, 
          jobs: proj.jobs.map(job => 
            job.id === jobId 
              ? { ...job, catalogCode: catalogItem.code, name: catalogItem.name, timePerPiece: catalogItem.time } 
              : job
          ) 
        };
      }
      return proj;
    }));
  };

  const handleJobChange = (projectId: number, jobId: number, field: string, value: string | number) => {
    setProjects(projects.map(proj => {
      if (proj.id === projectId) {
        if (jobId === 0) return { ...proj, [field]: value };
        return { ...proj, jobs: proj.jobs.map(job => job.id === jobId ? { ...job, [field]: value } : job) };
      }
      return proj;
    }));
  };

  const getProjectWorkload = (jobs: any[]) => jobs.reduce((sum, job) => sum + (job.timePerPiece * job.qty), 0);
  const totalWorkload = useMemo(() => projects.reduce((sum, proj) => sum + getProjectWorkload(proj.jobs), 0), [projects]);

  const employeeStats = useMemo(() => {
    return employees.map(emp => {
      const maxCap = emp.baseTime + emp.ot;
      const actualCap = Math.round(maxCap * (emp.oe / 100));
      return { ...emp, maxCap, actualCap };
    });
  }, [employees]);

  const totalActualCapacity = useMemo(() => employeeStats.reduce((sum, emp) => sum + emp.actualCap, 0), [employeeStats]);
  const estimatedDays = totalActualCapacity > 0 ? (totalWorkload / totalActualCapacity).toFixed(2) : '0.00';
  const isOverload = parseFloat(estimatedDays) > 1.0;

  const activeProject = projects.find(p => p.id === activeProjectId);

  const chartData = useMemo(() => {
    if (!activeProject) return [];
    const dataObj: any = { name: activeProject.name, 'กำลังคน(ใช้งานจริง)': totalActualCapacity };
    activeProject.jobs.forEach(job => { 
      if(job.name) dataObj[job.name] = job.timePerPiece * job.qty; 
    });
    return [dataObj];
  }, [activeProject, totalActualCapacity]);

  const handleSavePlan = async () => {
    setIsSaving(true); 
    
    const payload = {
      date: new Date().toISOString(),
      totalWorkload: totalWorkload, 
      totalCapacity: totalActualCapacity, 
      estimatedDays: parseFloat(estimatedDays),
      projects: projects.map(p => ({
        name: p.name,
        customer: p.customer,
        jobs: p.jobs.map(j => ({
          catalogCode: j.catalogCode || '', 
          name: j.name,
          timePerPiece: j.timePerPiece,
          qty: j.qty
        }))
      })),
      manpowers: employeeStats.map(e => ({
        id: e.id.toString(),
        ot: e.ot,
        oe: e.oe
      }))
    };

    try {
      if (editPlanId) {
        // ถ้ามี editPlanId แปลว่ากำลังกดเซฟจากการ "แก้ไข"
        await updatePlanService(editPlanId, payload);
        alert('อัปเดตข้อมูลแผนงานสำเร็จแล้ว! 🎉');
        setEditPlanId(null); // ล้างสถานะการแก้ไข
      } else {
        // ถ้าไม่มี แปลว่า "สร้างใหม่" ตามปกติ
        await saveDailyPlanService(payload);
        alert('บันทึกแผนงานลงฐานข้อมูลสำเร็จแล้ว! 🎉');
      }
      
      // ✅ เคลียร์หน้าจอเหมือนเดิม
      setProjects([
        { id: 1, name: 'Project A', customer: '', jobs: [{ id: Date.now(), catalogCode: '', name: '', timePerPiece: 0, qty: 1 }] }
      ]);
      setEmployees(employees.map(emp => ({ ...emp, ot: 0, oe: 85 }))); 
      setActiveProjectId(1);

    } catch (err) {
      console.error("❌ เกิดข้อผิดพลาด:", err);
      alert('เกิดข้อผิดพลาดในการบันทึก โปรดตรวจสอบการเชื่อมต่อ');
    } finally {
      setIsSaving(false); 
    }
  };

  const handleLoadEdit = (plan: any) => {
    setEditPlanId(plan.id); // บันทึก ID ว่าเรากำลังแก้แผนงานนี้

    // 1. โหลดข้อมูล Project และ Job
    const loadedProjects = plan.projects.map((p: any, index: number) => ({
      id: p.id || index + 1,
      name: p.projectName,
      customer: p.customer || '',
      jobs: p.jobs.map((j: any, jIndex: number) => ({
        id: j.id || Date.now() + jIndex,
        catalogCode: j.catalogCode,
        name: j.jobName,
        timePerPiece: j.timePerPiece,
        qty: j.quantity
      }))
    }));
    setProjects(loadedProjects);
    if (loadedProjects.length > 0) setActiveProjectId(loadedProjects[0].id);

    // 2. โหลดข้อมูล OT พนักงาน
    const loadedEmployees = employees.map(emp => {
      const savedData = plan.manpowers.find((m: any) => m.employeeId === emp.id);
      return savedData ? { ...emp, ot: savedData.otMinutes, oe: savedData.oe } : { ...emp, ot: 0, oe: 85 };
    });
    setEmployees(loadedEmployees);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <Header />
        
        <div className="flex gap-4">
          <button 
            onClick={handleSavePlan}
            disabled={isSaving}
            className={`px-6 py-2 rounded-lg transition-all font-medium shadow-sm flex items-center justify-center
              ${isSaving 
                ? 'bg-slate-400 text-white cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-95'
              }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังบันทึกข้อมูล...
              </>
            ) : (
              '💾 บันทึกแผนงาน'
            )}
          </button>

          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="px-6 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all font-medium shadow-sm"
          >
            🕒 ดูประวัติแผนงาน
          </button>
        </div>

        <KPICards totalWorkload={totalWorkload} totalActualCapacity={totalActualCapacity} estimatedDays={estimatedDays} isOverload={isOverload} />
        <WorkloadChart chartData={chartData} activeProject={activeProject} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProjectManager 
            projects={projects}
            activeProjectId={activeProjectId}
            setActiveProjectId={setActiveProjectId}
            handleAddProject={handleAddProject}
            handleAddJobToProject={handleAddJobToProject}
            handleJobChange={handleJobChange}
            handleCatalogSelect={handleCatalogSelect}
            getProjectWorkload={getProjectWorkload}
            jobCatalog={JOB_CATALOG}
          />
          <EmployeeManager employeeStats={employeeStats} handleEmployeeChange={handleEmployeeChange} />
        </div>

        <PlanHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} onEdit={handleLoadEdit} />

      </div>
    </div>
  );
}