import React, { useState } from 'react';
import { 
  Zap, 
  Grip, 
  Target, 
  Zap as Collision, 
  Globe, 
  Wind,
  ChevronRight
} from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const tabs = [
    {
      id: 'newton',
      title: "Newton's Laws",
      subtitle: "Force & Motion",
      icon: Zap,
      color: 'blue',
      description: "Explore the three fundamental laws of motion"
    },
    {
      id: 'friction',
      title: "Friction",
      subtitle: "Resistance & Surfaces",
      icon: Grip,
      color: 'orange',
      description: "Understand how friction affects motion"
    },
    {
      id: 'collision',
      title: "Collisions",
      subtitle: "Impact & Energy",
      icon: Collision,
      color: 'red',
      description: "Explore elastic and inelastic collisions"
    },
    {
      id: 'gravity',
      title: "Gravity",
      subtitle: "Free Fall & Orbits",
      icon: Globe,
      color: 'purple',
      description: "Understand gravitational forces"
    }
  ];

  const getTabClasses = (tab: any, isActive: boolean) => {
    const baseClasses = "group relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl backdrop-blur-sm";
    
    if (isActive) {
      const colorClasses = {
        blue: "bg-blue-500/20 border-blue-400 text-blue-200 shadow-blue-500/25",
        orange: "bg-orange-500/20 border-orange-400 text-orange-200 shadow-orange-500/25",
        green: "bg-green-500/20 border-green-400 text-green-200 shadow-green-500/25",
        red: "bg-red-500/20 border-red-400 text-red-200 shadow-red-500/25",
        purple: "bg-purple-500/20 border-purple-400 text-purple-200 shadow-purple-500/25",
        cyan: "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-cyan-500/25"
      };
      return `${baseClasses} ${colorClasses[tab.color as keyof typeof colorClasses]}`;
    }
    
    return `${baseClasses} bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:border-slate-600`;
  };

  const getIconClasses = (tab: any, isActive: boolean) => {
    const baseClasses = "w-8 h-8 transition-all duration-300";
    const colorClasses = {
      blue: isActive ? "text-blue-400" : "text-slate-400 group-hover:text-blue-400",
      orange: isActive ? "text-orange-400" : "text-slate-400 group-hover:text-orange-400",
      green: isActive ? "text-green-400" : "text-slate-400 group-hover:text-green-400",
      red: isActive ? "text-red-400" : "text-slate-400 group-hover:text-red-400",
      purple: isActive ? "text-purple-400" : "text-slate-400 group-hover:text-purple-400",
      cyan: isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-400"
    };
    return `${baseClasses} ${colorClasses[tab.color as keyof typeof colorClasses]}`;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Physics Simulations</h2>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <div
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={getTabClasses(tab, isActive)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isActive 
                      ? `bg-${tab.color}-500/30` 
                      : 'bg-slate-700/50 group-hover:bg-slate-600/50'
                  }`}>
                    <Icon className={getIconClasses(tab, isActive)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm leading-tight">{tab.title}</h3>
                    <p className="text-xs opacity-80 mt-1">{tab.subtitle}</p>
                    {isExpanded && (
                      <p className="text-xs opacity-70 mt-2 leading-relaxed">{tab.description}</p>
                    )}
                  </div>
                </div>
                
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
