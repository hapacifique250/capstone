import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, changeType = 'neutral', icon: Icon, iconColor = 'text-blue-600', iconBg = 'bg-blue-100' }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 hover:border-blue-200 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              changeType === 'positive' ? 'text-emerald-600' : changeType === 'negative' ? 'text-red-500' : 'text-gray-500'
            }`}>
              {changeType === 'positive' ? <TrendingUp className="w-3 h-3" /> : changeType === 'negative' ? <TrendingDown className="w-3 h-3" /> : null}
              {change}
            </div>
          )}
        </div>
        <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
