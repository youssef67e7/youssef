const statusColors = {
  healthy: 'bg-green-500', degraded: 'bg-yellow-500', error: 'bg-red-500',
  critical: 'bg-red-600', warning: 'bg-yellow-500', active: 'bg-green-500',
  inactive: 'bg-gray-400', online: 'bg-green-500', offline: 'bg-gray-400',
};
const statusLabels = {
  healthy: 'Healthy', degraded: 'Degraded', error: 'Error', critical: 'Critical',
  warning: 'Warning', active: 'Active', inactive: 'Inactive', online: 'Online', offline: 'Offline',
};

export default function StatusIndicator({ status, size = 'sm' }) {
  const color = statusColors[status] || 'bg-gray-400';
  const label = statusLabels[status] || status;
  const sizeClass = size === 'lg' ? 'w-3 h-3' : 'w-2 h-2';
  const textSize = size === 'lg' ? 'text-sm' : 'text-xs';

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`${sizeClass} ${color} rounded-full shrink-0`} />
      <span className={`${textSize} font-medium capitalize`}>{label}</span>
    </span>
  );
}
