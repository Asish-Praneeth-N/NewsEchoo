interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeColor?: string;
  icon: React.ReactNode;
  loading: boolean;
}

export default function StatsCard({ title, value, change, changeColor, icon, loading }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-300 dark:border-gray-600 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-300">{title}</p>
          <p className="text-xl font-semibold text-black dark:text-white">{loading ? 'Loading...' : value}</p>
          <p className={`text-sm ${changeColor || 'text-gray-600 dark:text-gray-300'}`}>
            {loading ? '' : change}
          </p>
        </div>
        {icon}
      </div>
    </div>
  );
}