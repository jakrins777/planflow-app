import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Project } from '../types';

const COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#6366f1', '#10b981'];

interface Props {
  chartData: any[];
  activeProject: Project | undefined;
}

export default function WorkloadChart({ chartData, activeProject }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 h-96">
      <h3 className="text-lg font-bold text-slate-800 mb-4">
        สัดส่วนงานย่อย (Jobs) ใน <span className="text-blue-600">{activeProject?.name}</span> เปรียบเทียบกับ กำลังคนจริง
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip cursor={{ fill: 'transparent' }} />
          <Legend verticalAlign="top" height={36} />
          <Bar dataKey="กำลังคน(ใช้งานจริง)" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={100} />
          
          {activeProject?.jobs.map((job, index) => (
            <Bar 
              key={job.id} 
              dataKey={job.name} 
              stackId="workload" 
              fill={COLORS[index % COLORS.length]} 
              barSize={100}
              radius={index === activeProject.jobs.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} 
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}