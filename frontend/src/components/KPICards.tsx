import { Briefcase, Users, Calendar } from 'lucide-react';

interface Props {
  totalWorkload: number;
  totalActualCapacity: number;
  estimatedDays: string;
  isOverload: boolean;
}

export default function KPICards({ totalWorkload, totalActualCapacity, estimatedDays, isOverload }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 flex items-center space-x-4">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Briefcase size={28} /></div>
        <div>
          <p className="text-sm text-slate-500 font-medium">ภาระงานรวมทุกโปรเจกต์</p>
          <h2 className="text-2xl font-bold text-slate-800">{totalWorkload} นาที</h2>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 flex items-center space-x-4">
        <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Users size={28} /></div>
        <div>
          <p className="text-sm text-slate-500 font-medium">กำลังคนรวม (ใช้งานจริง)</p>
          <h2 className="text-2xl font-bold text-slate-800">{totalActualCapacity} นาที</h2>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${isOverload ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'}`}>
          <Calendar size={28} />
        </div>
        <div>
          <p className="text-sm text-slate-500 font-medium">เวลาที่ต้องใช้ (Days)</p>
          <h2 className={`text-2xl font-bold ${isOverload ? 'text-red-600' : 'text-slate-800'}`}>
            {estimatedDays} วัน
          </h2>
        </div>
      </div>
    </div>
  );
}