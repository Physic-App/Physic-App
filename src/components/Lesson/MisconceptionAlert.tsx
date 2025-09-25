import React from 'react';

interface MisconceptionAlertProps {
  title: string;
  misconception: string;
  correction: string;
  explanation: string;
  severity?: 'low' | 'medium' | 'high';
  className?: string;
}

const MisconceptionAlert: React.FC<MisconceptionAlertProps> = ({ 
  title, 
  misconception, 
  correction, 
  explanation, 
  severity = 'medium',
  className = '' 
}) => {
  const getSeverityStyles = () => {
    switch (severity) {
      case 'high':
        return {
          container: 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-300 dark:border-red-600',
          icon: 'bg-red-500',
          title: 'text-red-800 dark:text-red-200',
          iconSvg: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          )
        };
      case 'medium':
        return {
          container: 'bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-300 dark:border-orange-600',
          icon: 'bg-orange-500',
          title: 'text-orange-800 dark:text-orange-200',
          iconSvg: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          )
        };
      case 'low':
        return {
          container: 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-300 dark:border-yellow-600',
          icon: 'bg-yellow-500',
          title: 'text-yellow-800 dark:text-yellow-200',
          iconSvg: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          )
        };
    }
  };

  const styles = getSeverityStyles();

  return (
    <div className={`misconception-alert ${styles.container} border rounded-xl p-6 my-6 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 ${styles.icon} rounded-full flex items-center justify-center`}>
            {styles.iconSvg}
          </div>
        </div>
        <div className="flex-1">
          <h3 className={`text-xl font-bold ${styles.title} mb-4`}>
            {title}
          </h3>
          
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Common Misconception:
              </h4>
              <p className="text-gray-700 dark:text-gray-300 italic">{misconception}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Correct Understanding:
              </h4>
              <p className="text-gray-700 dark:text-gray-300">{correction}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Explanation:
              </h4>
              <p className="text-gray-700 dark:text-gray-300">{explanation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MisconceptionAlert;
