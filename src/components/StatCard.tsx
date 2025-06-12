import React, { ComponentType } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ComponentType<{ className?: string }> | null;
  description?: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  description,
  color = 'blue', 
  trend 
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
          text: 'text-blue-600',
          light: 'bg-blue-50',
          border: 'border-blue-100',
          shadow: 'shadow-blue-500/20'
        };
      case 'green':
        return {
          bg: 'bg-gradient-to-br from-green-500 to-green-600',
          text: 'text-green-600',
          light: 'bg-green-50',
          border: 'border-green-100',
          shadow: 'shadow-green-500/20'
        };
      case 'orange':
        return {
          bg: 'bg-gradient-to-br from-orange-500 to-orange-600',
          text: 'text-orange-600',
          light: 'bg-orange-50',
          border: 'border-orange-100',
          shadow: 'shadow-orange-500/20'
        };
      case 'red':
        return {
          bg: 'bg-gradient-to-br from-red-500 to-red-600',
          text: 'text-red-600',
          light: 'bg-red-50',
          border: 'border-red-100',
          shadow: 'shadow-red-500/20'
        };
      case 'purple':
        return {
          bg: 'bg-gradient-to-br from-purple-500 to-purple-600',
          text: 'text-purple-600',
          light: 'bg-purple-50',
          border: 'border-purple-100',
          shadow: 'shadow-purple-500/20'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
          text: 'text-blue-600',
          light: 'bg-blue-50',
          border: 'border-blue-100',
          shadow: 'shadow-blue-500/20'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div className={`bg-white rounded-xl p-6 border ${colors?.border || 'border-blue-100'} hover:shadow-lg transition-all duration-300 group`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors?.light || 'bg-blue-50'} group-hover:${colors?.bg || 'bg-gradient-to-br from-blue-500 to-blue-600'} transition-colors duration-300`}>
                <Icon className={`w-5 h-5 ${colors?.text || 'text-blue-600'} group-hover:text-white transition-colors duration-300`} />
              </div>
            )}
            <p className="text-sm font-medium text-gray-600">{title}</p>
          </div>
          <div className="mt-4">
            <p className={`text-3xl font-bold ${colors?.text || 'text-blue-600'}`}>{value}</p>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
            {trend && (
              <div className="flex items-center mt-2 space-x-2">
                <div className={`flex items-center space-x-1 text-sm ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span className="font-medium">
                    {trend.isPositive ? '+' : ''}{trend.value}%
                  </span>
                  <svg
                    className={`w-4 h-4 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d={trend.isPositive 
                      ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      : "M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"} 
                    />
                  </svg>
                </div>
                <span className="text-sm text-gray-500">vs. ontem</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;