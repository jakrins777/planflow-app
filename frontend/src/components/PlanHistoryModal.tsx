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

  // ดึงข้อมูลทุกครั้งที่เปิด Modal
  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
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

  // 🔴 1. เพิ่มฟังก์ชัน handleDelete ที่หายไปกลับเข้ามา
  const handleDelete = async (id: number) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบแผนงานนี้? (ข้อมูลโปรเจกต์และงานในวันนี้จะหายไปทั้งหมด)')) {
      try {
        await deletePlanService(id);
        alert('ลบแผนงานสำเร็จ! 🎉');
        fetchHistory(); // โหลดข้อมูลใหม่เพื่ออัปเดตตารางทันที
      } catch (err) {
        alert('เกิดข้อผิดพลาด ไม่สามารถลบได้ครับ');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      {/* ขยายความกว้างสูงสุดเป็น max-w-5xl เพื่อให้ตารางไม่อึดอัด */}
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header ของ Modal */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-2xl font-bold text-slate-800">🕒 ประวัติแผนงานย้อนหลัง</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 text-3xl leading-none">&times;</button>
        </div>

        {/* เนื้อหาตาราง */}
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
                  <th className="p-3 border-b text-center">จัดการ</th> {/* 🔴 เพิ่มหัวข้อ "จัดการ" ให้ตรงกับปุ่ม */}
                </tr>
              </thead>
              <tbody>
                {history.map((plan, index) => {
                  // แปลงรูปแบบวันที่ให้เป็นภาษาไทย
                  const dateObj = new Date(plan.date);
                  const thaiDate = dateObj.toLocaleDateString('th-TH', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                  });

                  return (
                    <tr key={index} className="hover:bg-slate-50 border-b last:border-0 transition">
                      <td className="p-3 font-medium text-slate-800">{thaiDate}</td>
                      <td className="p-3 text-right text-orange-600 font-semibold">{plan.totalWorkload}</td>
                      <td className="p-3 text-right text-blue-600 font-semibold">{plan.totalCapacity}</td>
                      
                      {/* 🔴 2. เพิ่มข้อมูล "ใช้เวลา (วัน)" กลับเข้ามาให้ตรงกับหัวตาราง */}
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-sm font-bold ${plan.estimatedDays > 1 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {plan.estimatedDays}
                        </span>
                      </td>

                      <td className="p-3 text-center">{plan.projects?.length || 0} โปรเจกต์</td>
                      
                      {/* 🔴 จัดปุ่มกดให้อยู่ในบล็อก div เดียวกันภายใต้คอลลังน์ "จัดการ" ท้ายสุด */}
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => {
                              onEdit(plan); // ส่งข้อมูลแผนงานกลับไปให้ App.tsx
                              onClose(); // ปิด Modal
                            }}
                            className="text-blue-500 hover:text-white border border-blue-500 hover:bg-blue-500 px-3 py-1 rounded transition-colors text-sm"
                          >
                            ✏️ แก้ไข
                          </button>
                          
                          <button 
                            onClick={() => handleDelete(plan.id)}
                            className="text-red-500 hover:text-white border border-red-500 hover:bg-red-500 px-3 py-1 rounded transition-colors text-sm"
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