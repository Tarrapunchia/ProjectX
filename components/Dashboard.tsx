
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const ACTIVITY_DATA = [
  { name: 'Mon', active: 40, completed: 24 },
  { name: 'Tue', active: 30, completed: 13 },
  { name: 'Wed', active: 20, completed: 98 },
  { name: 'Thu', active: 27, completed: 39 },
  { name: 'Fri', active: 18, completed: 48 },
  { name: 'Sat', active: 23, completed: 38 },
  { name: 'Sun', active: 34, completed: 43 },
];

const RECENT_DOCS = [
  { id: 1, title: 'Product Roadmap Q3', lastEdit: '2h ago', author: 'Alex R.' },
  { id: 2, title: 'API Documentation', lastEdit: '5h ago', author: 'Sarah M.' },
  { id: 3, title: 'Marketing Campaign Ideas', lastEdit: '1d ago', author: 'Mike T.' },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Tasks', value: '12', color: 'bg-indigo-500', trend: '+2 this week' },
          { label: 'Unread Messages', value: '5', color: 'bg-emerald-500', trend: 'From 3 channels' },
          { label: 'Team Capacity', value: '88%', color: 'bg-amber-500', trend: 'High availability' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-4xl font-bold text-slate-800">{stat.value}</h3>
              <span className="text-xs font-medium text-slate-400">{stat.trend}</span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${stat.color} transition-all duration-1000`} style={{ width: stat.value.includes('%') ? stat.value : '40%' }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Productivity Chart */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-800">Team Velocity</h3>
            <select className="text-sm border-none bg-slate-50 rounded-lg px-2 py-1 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ACTIVITY_DATA}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                />
                <Area type="monotone" dataKey="active" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Workspace Files</h3>
          <div className="space-y-4">
            {RECENT_DOCS.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    {doc.title.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{doc.title}</h4>
                    <p className="text-xs text-slate-500">Edited by {doc.author}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-400">{doc.lastEdit}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 text-sm font-semibold text-indigo-600 border border-indigo-100 rounded-xl hover:bg-indigo-50 transition-all">
            View All Documents
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
