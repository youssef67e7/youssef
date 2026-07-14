import { TrendingUp, TrendingDown } from 'lucide-react';

const colorMap = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   ring: 'bg-blue-100' },
  green:  { bg: 'bg-green-50',  text: 'text-green-600',  ring: 'bg-green-100' },
  red:    { bg: 'bg-red-50',    text: 'text-red-600',    ring: 'bg-red-100' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', ring: 'bg-yellow-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'bg-purple-100' },
  primary:{ bg: 'bg-primary-50',text: 'text-primary-600',ring: 'bg-primary-100' },
};

export default function StatCard({ title, value, change, icon: Icon, color = 'blue' }) {
  const c = colorMap[color] || colorMap.blue;
  const isPositive = change >= 0;

  return (
    <div className="bg-white rounded-xl border p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${c.bg}`}>
          <Icon size={20} className={c.text} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{isPositive ? '+' : ''}{change}%</span>
          <span className="text-gray-400 font-normal ml-1">vs last period</span>
        </div>
      )}
    </div>
  );
}
