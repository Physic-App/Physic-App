// Comprehensive test cases for RAG chatbot chapter isolation
// This file contains test scenarios to verify the chatbot works correctly

export interface TestCase {
  id: string;
  description: string;
  currentChapter: string;
  userQuestion: string;
  expectedBehavior: 'reject' | 'answer';
  expectedChapter?: string;
}

export const chapterIsolationTests: TestCase[] = [
  // Motion chapter tests
  {
    id: 'motion-1',
    description: 'Ask about motion in motion chapter - should answer',
    currentChapter: 'motion',
    userQuestion: 'what is motion',
    expectedBehavior: 'answer'
  },
  {
    id: 'motion-2',
    description: 'Ask about friction in motion chapter - should reject',
    currentChapter: 'motion',
    userQuestion: 'what is friction',
    expectedBehavior: 'reject',
    expectedChapter: 'friction'
  },
  {
    id: 'motion-3',
    description: 'Ask about speed in motion chapter - should answer',
    currentChapter: 'motion',
    userQuestion: 'what is speed',
    expectedBehavior: 'answer'
  },
  {
    id: 'motion-4',
    description: 'Ask about electricity in motion chapter - should reject',
    currentChapter: 'motion',
    userQuestion: 'what is electricity',
    expectedBehavior: 'reject',
    expectedChapter: 'electricity'
  },

  // Friction chapter tests
  {
    id: 'friction-1',
    description: 'Ask about friction in friction chapter - should answer',
    currentChapter: 'friction',
    userQuestion: 'what is friction',
    expectedBehavior: 'answer'
  },
  {
    id: 'friction-2',
    description: 'Ask about motion in friction chapter - should reject',
    currentChapter: 'friction',
    userQuestion: 'what is motion',
    expectedBehavior: 'reject',
    expectedChapter: 'motion'
  },
  {
    id: 'friction-3',
    description: 'Ask about static friction in friction chapter - should answer',
    currentChapter: 'friction',
    userQuestion: 'what is static friction',
    expectedBehavior: 'answer'
  },
  {
    id: 'friction-4',
    description: 'Ask about light in friction chapter - should reject',
    currentChapter: 'friction',
    userQuestion: 'what is light',
    expectedBehavior: 'reject',
    expectedChapter: 'light-reflection'
  },

  // Force and Pressure chapter tests
  {
    id: 'force-pressure-1',
    description: 'Ask about force in force-pressure chapter - should answer',
    currentChapter: 'force-and-pressure',
    userQuestion: 'what is force',
    expectedBehavior: 'answer'
  },
  {
    id: 'force-pressure-2',
    description: 'Ask about pressure in force-pressure chapter - should answer',
    currentChapter: 'force-and-pressure',
    userQuestion: 'what is pressure',
    expectedBehavior: 'answer'
  },
  {
    id: 'force-pressure-3',
    description: 'Ask about friction in force-pressure chapter - should reject',
    currentChapter: 'force-and-pressure',
    userQuestion: 'what is friction',
    expectedBehavior: 'reject',
    expectedChapter: 'friction'
  },
  {
    id: 'force-pressure-4',
    description: 'Ask about newton laws in force-pressure chapter - should reject',
    currentChapter: 'force-and-pressure',
    userQuestion: 'what are newton laws',
    expectedBehavior: 'reject',
    expectedChapter: 'force-and-laws'
  },

  // Electricity chapter tests
  {
    id: 'electricity-1',
    description: 'Ask about electricity in electricity chapter - should answer',
    currentChapter: 'electricity',
    userQuestion: 'what is electricity',
    expectedBehavior: 'answer'
  },
  {
    id: 'electricity-2',
    description: 'Ask about current in electricity chapter - should reject (belongs to electric-current)',
    currentChapter: 'electricity',
    userQuestion: 'what is electric current',
    expectedBehavior: 'reject',
    expectedChapter: 'electric-current'
  },
  {
    id: 'electricity-3',
    description: 'Ask about motion in electricity chapter - should reject',
    currentChapter: 'electricity',
    userQuestion: 'what is motion',
    expectedBehavior: 'reject',
    expectedChapter: 'motion'
  },

  // Electric Current chapter tests
  {
    id: 'electric-current-1',
    description: 'Ask about current in electric-current chapter - should answer',
    currentChapter: 'electric-current',
    userQuestion: 'what is electric current',
    expectedBehavior: 'answer'
  },
  {
    id: 'electric-current-2',
    description: 'Ask about voltage in electric-current chapter - should answer',
    currentChapter: 'electric-current',
    userQuestion: 'what is voltage',
    expectedBehavior: 'answer'
  },
  {
    id: 'electric-current-3',
    description: 'Ask about friction in electric-current chapter - should reject',
    currentChapter: 'electric-current',
    userQuestion: 'what is friction',
    expectedBehavior: 'reject',
    expectedChapter: 'friction'
  },

  // Force and Laws of Motion chapter tests
  {
    id: 'force-laws-1',
    description: 'Ask about newton laws in force-laws chapter - should answer',
    currentChapter: 'force-and-laws',
    userQuestion: 'what are newton laws',
    expectedBehavior: 'answer'
  },
  {
    id: 'force-laws-2',
    description: 'Ask about inertia in force-laws chapter - should answer',
    currentChapter: 'force-and-laws',
    userQuestion: 'what is inertia',
    expectedBehavior: 'answer'
  },
  {
    id: 'force-laws-3',
    description: 'Ask about light in force-laws chapter - should reject',
    currentChapter: 'force-and-laws',
    userQuestion: 'what is light',
    expectedBehavior: 'reject',
    expectedChapter: 'light-reflection'
  },

  // Light chapter tests
  {
    id: 'light-1',
    description: 'Ask about light in light-reflection chapter - should answer',
    currentChapter: 'light-reflection',
    userQuestion: 'what is light',
    expectedBehavior: 'answer'
  },
  {
    id: 'light-2',
    description: 'Ask about reflection in light-reflection chapter - should answer',
    currentChapter: 'light-reflection',
    userQuestion: 'what is reflection',
    expectedBehavior: 'answer'
  },
  {
    id: 'light-3',
    description: 'Ask about friction in light-reflection chapter - should reject',
    currentChapter: 'light-reflection',
    userQuestion: 'what is friction',
    expectedBehavior: 'reject',
    expectedChapter: 'friction'
  },

  // Gravitation chapter tests
  {
    id: 'gravitation-1',
    description: 'Ask about gravity in gravitation chapter - should answer',
    currentChapter: 'gravitation',
    userQuestion: 'what is gravity',
    expectedBehavior: 'answer'
  },
  {
    id: 'gravitation-2',
    description: 'Ask about weight in gravitation chapter - should answer',
    currentChapter: 'gravitation',
    userQuestion: 'what is weight',
    expectedBehavior: 'answer'
  },
  {
    id: 'gravitation-3',
    description: 'Ask about motion in gravitation chapter - should reject',
    currentChapter: 'gravitation',
    userQuestion: 'what is motion',
    expectedBehavior: 'reject',
    expectedChapter: 'motion'
  },

  // Edge cases
  {
    id: 'edge-1',
    description: 'Empty question - should reject',
    currentChapter: 'motion',
    userQuestion: '',
    expectedBehavior: 'reject'
  },
  {
    id: 'edge-2',
    description: 'Very short question - should handle gracefully',
    currentChapter: 'motion',
    userQuestion: '?',
    expectedBehavior: 'reject'
  },
  {
    id: 'edge-3',
    description: 'Question with mixed topics - should prioritize first topic',
    currentChapter: 'motion',
    userQuestion: 'what is motion and friction',
    expectedBehavior: 'answer'
  }
];

// Helper function to run tests
export const runChapterIsolationTest = async (
  testCase: TestCase,
  generateRAGResponse: (message: string, chapterId: string) => Promise<string>
): Promise<{
  passed: boolean;
  actualResponse: string;
  expectedBehavior: string;
}> => {
  try {
    const response = await generateRAGResponse(testCase.userQuestion, testCase.currentChapter);
    
    let passed = false;
    let expectedBehavior = '';
    
    if (testCase.expectedBehavior === 'reject') {
      // Should contain rejection message
      passed = response.includes('🚫') || response.includes('I can only answer questions related to');
      expectedBehavior = 'reject with chapter boundary message';
    } else {
      // Should contain textbook content
      passed = response.includes('📖') && response.includes('From the textbook:');
      expectedBehavior = 'answer with textbook content';
    }
    
    return {
      passed,
      actualResponse: response,
      expectedBehavior
    };
  } catch (error) {
    return {
      passed: false,
      actualResponse: `Error: ${error}`,
      expectedBehavior: testCase.expectedBehavior
    };
  }
};

// Test runner for all cases
export const runAllChapterIsolationTests = async (
  generateRAGResponse: (message: string, chapterId: string) => Promise<string>
): Promise<{
  total: number;
  passed: number;
  failed: number;
  results: Array<{
    testCase: TestCase;
    result: {
      passed: boolean;
      actualResponse: string;
      expectedBehavior: string;
    };
  }>;
}> => {
  const results = [];
  let passed = 0;
  let failed = 0;
  
  for (const testCase of chapterIsolationTests) {
    const result = await runChapterIsolationTest(testCase, generateRAGResponse);
    results.push({ testCase, result });
    
    if (result.passed) {
      passed++;
    } else {
      failed++;
    }
  }
  
  return {
    total: chapterIsolationTests.length,
    passed,
    failed,
    results
  };
};
