export default function ChartCard({ title, children, trailing, height }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold dark:text-white">{title}</h3>
        {trailing}
      </div>
      {height ? <div style={{ height }}>{children}</div> : children}
    </div>
  );
}
