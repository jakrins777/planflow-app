import { useState, useEffect } from 'react';
import { getPlanHistoryService, deletePlanService } from '../api/planService';

interface PlanHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (plan: any) => void;
}

export default function PlanHistoryModal({ isOpen, onClose, onEdit }: PlanHistoryModalProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchHistory();
  }, [isOpen]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getPlanHistoryService();
      setHistory(data);
    } catch (err) {
      alert('ดึงข้อมูลประวัติไม่สำเร็จครับ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบแผนงานนี้?')) {
      try {
        await deletePlanService(id);
        alert('ลบแผนงานสำเร็จ! 🎉');
        fetchHistory();
      } catch (err) {
        alert('เกิดข้อผิดพลาด ไม่สามารถลบได้ครับ');
      }
    }
  };

  // 🔴 ฟังก์ชันอัจฉริยะสำหรับสร้างหน้าพิมพ์ PDF
  const handlePrint = (plan: any) => {
    const dateObj = new Date(plan.date);
    const thaiDate = dateObj.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

    // สร้างหน้าต่างใหม่ในเบราว์เซอร์
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert('โปรดเปิดการใช้งาน Pop-up บนเบราว์เซอร์ก่อนครับ');

    // เขียนโครงสร้าง HTML + Tailwind สำหรับหน้าพิมพ์โดยเฉพาะ
    printWindow.document.write(`
      <html>
        <head>
          <title>ใบสั่งงานและแผนงานประจำวัน - ${thaiDate}</title>
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
          <style>
            @media print {
              body { background: white; color: black; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body class="p-8 bg-white text-slate-800 font-sans">
          
          <div class="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-end">
            <div>
              <h1 class="text-3xl font-bold tracking-tight text-slate-900">PLANFLOW DAILY WORK ORDER</h1>
              <p class="text-slate-500 text-sm mt-1">ระบบบริหารจัดการและวางแผนภาระงานประจำวัน</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-slate-700">ประจำวันที่</p>
              <p class="text-xl font-bold text-blue-600">${thaiDate}</p>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4 mb-8">
            <div class="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <p class="text-xs font-semibold text-slate-500 uppercase">ภาระงานรวม (Workload)</p>
              <p class="text-2xl font-bold text-orange-600 mt-1">${plan.totalWorkload} <span class="text-sm font-normal text-slate-500">นาที</span></p>
            </div>
            <div class="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <p class="text-xs font-semibold text-slate-500 uppercase">กำลังคนรวมจริง (Capacity)</p>
              <p class="text-2xl font-bold text-blue-600 mt-1">${plan.totalCapacity} <span class="text-sm font-normal text-slate-500">นาที</span></p>
            </div>
            <div class="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <p class="text-xs font-semibold text-slate-500 uppercase">ระยะเวลาประเมิน (Estimated)</p>
              <p class="text-2xl font-bold text-emerald-600 mt-1">${plan.estimatedDays} <span class="text-sm font-normal text-slate-500">วันทำงาน</span></p>
            </div>
          </div>

          <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">📋 รายละเอียดงานย่อยในแต่ละโปรเจกต์</h2>
          
          ${plan.projects.map((proj: any) => `
            <div class="mb-6 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div class="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                <h3 class="font-bold text-slate-800 text-lg">📁 โปรเจกต์: ${proj.projectName}</h3>
                <span class="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">ลูกค้า: ${proj.customer || '-'}</span>
              </div>
              <table class="w-full text-left border-collapse text-sm">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th class="p-3">รหัสงาน</th>
                    <th class="p-3">ชื่อรายการงานย่อย</th>
                    <th class="p-3 text-right">เวลาต่อชิ้น (นาที)</th>
                    <th class="p-3 text-right">จำนวน (ชิ้น)</th>
                    <th class="p-3 text-right">เวลารวม (นาที)</th>
                  </tr>
                </thead>
                <tbody>
                  ${proj.jobs.map((job: any) => `
                    <tr class="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td class="p-3 font-mono text-slate-500">${job.catalogCode || '-'}</td>
                      <td class="p-3 font-medium text-slate-800">${job.jobName}</td>
                      <td class="p-3 text-right">${job.timePerPiece}</td>
                      <td class="p-3 text-right font-semibold">${job.quantity}</td>
                      <td class="p-3 text-right text-orange-600 font-bold">${job.timePerPiece * job.quantity}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `).join('')}

          <div class="mt-16 grid grid-cols-2 gap-12 text-center text-sm">
            <div>
              <div class="border-b border-slate-400 h-12 w-48 mx-auto"></div>
              <p class="mt-2 font-medium text-slate-600">ผู้จัดทำแผนงาน (Planner)</p>
            </div>
            <div>
              <div class="border-b border-slate-400 h-12 w-48 mx-auto"></div>
              <p class="mt-2 font-medium text-slate-600">ผู้อนุมัติคำสั่งงาน (Supervisor)</p>
            </div>
          </div>

        </body>
      </html>
    `);

    // สั่งปิด Document และเปิดหน้าต่างสั่งพิมพ์ทันทีที่โหลดเสร็จ
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-2xl font-bold text-slate-800">🕒 ประวัติแผนงานย้อนหลัง</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 text-3xl leading-none">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-10 text-slate-500">กำลังโหลดข้อมูล... ⏳</div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 text-slate-500">ยังไม่มีประวัติแผนงานในระบบ</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600">
                  <th className="p-3 border-b">วันที่บันทึก</th>
                  <th className="p-3 border-b text-right">ภาระงานรวม (นาที)</th>
                  <th className="p-3 border-b text-right">กำลังคนรวม (นาที)</th>
                  <th className="p-3 border-b text-center">ใช้เวลา (วัน)</th>
                  <th className="p-3 border-b text-center">จำนวนโปรเจกต์</th>
                  <th className="p-3 border-b text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {history.map((plan, index) => {
                  const dateObj = new Date(plan.date);
                  const thaiDate = dateObj.toLocaleDateString('th-TH', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                  });

                  return (
                    <tr key={index} className="hover:bg-slate-50 border-b last:border-0 transition">
                      <td className="p-3 font-medium text-slate-800">{thaiDate}</td>
                      <td className="p-3 text-right text-orange-600 font-semibold">{plan.totalWorkload}</td>
                      <td className="p-3 text-right text-blue-600 font-semibold">{plan.totalCapacity}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-sm font-bold ${plan.estimatedDays > 1 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {plan.estimatedDays}
                        </span>
                      </td>
                      <td className="p-3 text-center">{plan.projects?.length || 0} โปรเจกต์</td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-1.5">
                          {/* 🔴 ปุ่มพิมพ์อันใหม่แกะกล่อง */}
                          <button 
                            onClick={() => handlePrint(plan)}
                            className="text-emerald-600 hover:text-white border border-emerald-500 hover:bg-emerald-500 px-2.5 py-1 rounded transition-colors text-sm font-medium"
                          >
                            🖨️ พิมพ์
                          </button>
                          
                          <button 
                            onClick={() => {
                              onEdit(plan);
                              onClose();
                            }}
                            className="text-blue-500 hover:text-white border border-blue-500 hover:bg-blue-500 px-2.5 py-1 rounded transition-colors text-sm font-medium"
                          >
                            ✏️ แก้ไข
                          </button>
                          
                          <button 
                            onClick={() => handleDelete(plan.id)}
                            className="text-red-500 hover:text-white border border-red-500 hover:bg-red-500 px-2.5 py-1 rounded transition-colors text-sm font-medium"
                          >
                            🗑️ ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}