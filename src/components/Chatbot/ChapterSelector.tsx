import React from 'react';
import { BookOpen } from 'lucide-react';
import { Chapter } from '../../types/chatbot';
import { mockChapters } from '../../data/mockData';

interface ChapterSelectorProps {
  selectedChapter: Chapter | null;
  onChapterSelect: (chapter: Chapter) => void;
}

export const ChapterSelector: React.FC<ChapterSelectorProps> = ({
  selectedChapter,
  onChapterSelect
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <BookOpen size={20} className="text-blue-600 dark:text-blue-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Chapters
        </h2>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {mockChapters.map((chapter) => (
          <button
            key={chapter.id}
            onClick={() => onChapterSelect(chapter)}
            className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
              selectedChapter?.id === chapter.id
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 shadow-sm'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <p className={`font-medium text-sm leading-tight ${
              selectedChapter?.id === chapter.id
                ? 'text-blue-900 dark:text-blue-100'
                : 'text-gray-900 dark:text-gray-100'
            }`}>
              {chapter.title}
            </p>
            <p className={`text-xs mt-1 ${
              selectedChapter?.id === chapter.id
                ? 'text-blue-700 dark:text-blue-300'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {chapter.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};