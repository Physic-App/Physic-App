import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-3 py-4 text-lg font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl px-6 py-3 shadow-sm transition-colors duration-300">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
          {item.path ? (
            <Link 
              to={item.path} 
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-gray-800 dark:text-gray-200">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;