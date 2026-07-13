const roleColors = {
  super_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  pharmacy_owner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pharmacy_manager: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  driver: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  customer: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
};

export default function RoleBadge({ role }) {
  const colorClass = roleColors[role] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {(role || '').replace(/_/g, ' ')}
    </span>
  );
}
