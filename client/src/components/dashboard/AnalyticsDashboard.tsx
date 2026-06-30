import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsApi } from '../../api/analytics.api';
import { Users, FileText, MessageSquare, BookOpen } from 'lucide-react';
import { StatsOverview } from './StatsOverview';
import toast from 'react-hot-toast';

export function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const stats = await analyticsApi.getDashboardStats();
        setData(stats);
      } catch (error) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="animate-pulse h-64 bg-surface-2 rounded-xl mb-8"></div>;
  }

  if (!data) return null;

  const stats = [
    { label: 'Total Users', value: data.overview.totalUsers, icon: <Users size={22} />, color: '#6C5CE7' },
    { label: 'Total Groups', value: data.overview.totalGroups, icon: <BookOpen size={22} />, color: '#FD79A8' },
    { label: 'Materials', value: data.overview.totalMaterials, icon: <FileText size={22} />, color: '#00CEC9' },
    { label: 'Questions', value: data.overview.totalQuestions, icon: <MessageSquare size={22} />, color: '#3498db' },
  ];

  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>Platform Analytics</h2>
      
      {/* Overview Stats */}
      <StatsOverview stats={stats} />

      {/* Chart */}
      <div className="mt-6 card-flat">
        <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>Materials Uploaded (Last 7 Days)</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}
                itemStyle={{ color: 'var(--color-primary-400)' }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="var(--color-primary-500)" 
                fillOpacity={1} 
                fill="url(#colorCount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
