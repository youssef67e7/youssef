import { ArrowUp, ArrowDown } from 'lucide-react';

const colorMap = {
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  cyan: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
  orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
};

export default function StatCard({ title, value, change, icon: Icon, color = 'blue' }) {
  const isPositive = Number(change) >= 0;
  const iconColor = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{title}</p>
          <p className="text-2xl font-bold mt-1 dark:text-white">{value}</p>
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconColor}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      {change !== undefined && change !== null && (
        <div className="mt-3 flex items-center gap-1">
          {isPositive ? (
            <ArrowUp size={14} className="text-green-600 dark:text-green-400" />
          ) : (
            <ArrowDown size={14} className="text-red-600 dark:text-red-400" />
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">vs last period</span>
        </div>
      )}
    </div>
  );
}
