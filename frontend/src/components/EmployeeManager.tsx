import { UserCircle, Activity } from 'lucide-react';
import type { EmployeeStat } from '../types';

interface Props {
  employeeStats: EmployeeStat[];
  handleEmployeeChange: (id: number, field: string, value: number) => void;
}

export default function EmployeeManager({ employeeStats, handleEmployeeChange }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 h-[550px] flex flex-col">
      <h3 className="text-lg font-bold text-slate-800 mb-4">จัดการกำลังคน (OE & OT)</h3>
      <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
        {employeeStats.map((emp) => (
          <div key={emp.id} className="p-4 border border-slate-100 rounded-lg bg-slate-50 flex flex-col space-y-3 hover:border-slate-300 transition">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <div className="flex items-center space-x-2">
                <UserCircle size={20} className="text-slate-500" />
                <span className="font-bold text-slate-800">{emp.name}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">เวลาใช้งานจริง: </span>
                <span className="font-bold text-green-600 text-lg">{emp.actualCap} </span>
                <span className="text-[10px] text-slate-400">นาที</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 text-sm text-slate-500">
                เวลาปกติ: <span className="font-medium text-slate-700">{emp.baseTime}</span> นาที
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-orange-500 font-medium mb-1">OT (นาที)</span>
                  <input 
                    type="number" min="0" value={emp.ot}
                    onChange={(e) => handleEmployeeChange(emp.id, 'ot', Number(e.target.value))}
                    className="w-16 px-1 py-1 border border-slate-300 rounded text-center focus:ring-1 focus:ring-orange-300 outline-none text-sm"
                  />
                </div>
                
                <span className="text-slate-300 mt-4">×</span>

                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-blue-500 font-medium mb-1 flex items-center">
                    <Activity size={10} className="mr-1"/> OE (%)
                  </span>
                  <input 
                    type="number" min="1" max="100" value={emp.oe}
                    onChange={(e) => handleEmployeeChange(emp.id, 'oe', Number(e.target.value))}
                    className="w-16 px-1 py-1 border border-slate-300 rounded text-center focus:ring-1 focus:ring-blue-300 outline-none text-sm font-semibold text-blue-700"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}