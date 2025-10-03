import React, { useEffect, useRef, useCallback } from 'react';
import { DiagramTemplates } from './Diagrams/DiagramTemplates';

interface HTMLRendererProps {
  content: string;
  className?: string;
}

const HTMLRenderer: React.FC<HTMLRendererProps> = ({ content, className = '' }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const getSectionIcon = useCallback((type: string): string => {
    switch (type) {
      case 'derivation':
        return '<svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>';
      case 'example':
        return '<svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>';
      case 'formula':
        return '<svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>';
      default:
        return '<svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>';
    }
  }, []);

  const toggleCollapsibleSection = useCallback((sectionId: string) => {
    const content = document.getElementById(`content-${sectionId}`);
    const button = document.querySelector(`[data-section-id="${sectionId}"] .collapsible-button`);
    const arrow = button?.querySelector('.collapsible-arrow svg') as HTMLElement;
    
    if (content && arrow) {
      const isCollapsed = content.classList.contains('collapsed');
      if (isCollapsed) {
        content.classList.remove('collapsed');
        arrow.style.transform = 'rotate(0deg)';
      } else {
        content.classList.add('collapsed');
        arrow.style.transform = 'rotate(-90deg)';
      }
    }
  }, []);

  const addInteractiveElements = (element: HTMLElement) => {
    // Enhanced formula detection - look for more patterns
    const formulas = element.querySelectorAll('p, div, td, th, li');
    formulas.forEach((formula) => {
      const text = formula.textContent || '';
      const formulaPatterns = [
        /[A-Za-z]\s*=\s*[A-Za-z0-9\s+\-*/().]+/g, // Basic formula patterns
        /[A-Za-z]\s*=\s*[A-Za-z0-9\s+\-*/().]+\s*[A-Za-z]/g, // Formulas with units
        /[A-Za-z]\s*=\s*[A-Za-z0-9\s+\-*/().]+\s*[A-Za-z]+\s*[A-Za-z]/g, // Complex formulas
      ];
      
      let hasFormula = false;
      formulaPatterns.forEach(pattern => {
        if (pattern.test(text)) {
          hasFormula = true;
        }
      });
      
      // Also check for specific physics formulas
      const specificFormulas = [
        'P = F / A', 'P = ρgh', 'F = P × A', 'F = ma', 'a = (Vf - Vi) / t',
        'p = mv', 'Δp = m × Δv', 'J = F × Δt', 'V = IR', 'P = VI',
        'E = mc²', 'F = kx', 'W = Fd', 'KE = ½mv²', 'PE = mgh'
      ];
      
      specificFormulas.forEach(specificFormula => {
        if (text.includes(specificFormula)) {
          hasFormula = true;
        }
      });
      
      if (hasFormula && !formula.classList.contains('formula-highlight')) {
        formula.classList.add('formula-highlight', 'interactive-element');
        formula.setAttribute('data-tooltip', 'Click to highlight this formula');
        formula.addEventListener('click', () => {
          formula.classList.toggle('formula-highlighted');
        });
      }
    });

    // Enhanced progress indicators for examples and problems
    const examples = element.querySelectorAll('h2, h3, h4, td, th');
    examples.forEach((example, index) => {
      const text = example.textContent?.toLowerCase() || '';
      const exampleKeywords = ['example', 'problem', 'question', 'exercise', 'practice', 'solution'];
      
      if (exampleKeywords.some(keyword => text.includes(keyword)) && !example.querySelector('.progress-indicator')) {
        const progressIndicator = document.createElement('div');
        progressIndicator.className = 'progress-indicator';
        progressIndicator.innerHTML = `
          <div class="progress-bar">
            <div class="progress-fill" style="width: 0%"></div>
          </div>
          <span class="progress-text">${text.includes('example') ? 'Example' : text.includes('problem') ? 'Problem' : 'Exercise'} ${index + 1}</span>
        `;
        example.parentNode?.insertBefore(progressIndicator, example.nextSibling);
      }
    });

    // Enhanced hover effects for physics terms
    const importantTerms = element.querySelectorAll('p, div, td, th, li, span');
    importantTerms.forEach((term) => {
      const text = term.textContent || '';
      const physicsTerms = [
        'pressure', 'force', 'area', 'density', 'gravity', 'depth', 'mass', 'acceleration',
        'velocity', 'momentum', 'impulse', 'energy', 'work', 'power', 'current', 'voltage',
        'resistance', 'electricity', 'magnetism', 'light', 'reflection', 'refraction',
        'frequency', 'wavelength', 'amplitude', 'wave', 'sound', 'heat', 'temperature',
        'motion', 'speed', 'distance', 'time', 'displacement', 'vector', 'scalar'
      ];
      
      if (physicsTerms.some(physicsTerm => text.toLowerCase().includes(physicsTerm)) && 
          !term.classList.contains('interactive-element')) {
        term.classList.add('interactive-element');
        term.addEventListener('mouseenter', () => {
          term.classList.add('term-highlighted');
        });
        term.addEventListener('mouseleave', () => {
          term.classList.remove('term-highlighted');
        });
      }
    });

    // Enhanced step-by-step indicators
    const stepContent = element.querySelectorAll('p, div, td, th, li');
    stepContent.forEach((content) => {
      const text = content.textContent || '';
      const stepKeywords = [
        'step', 'consider', 'therefore', 'hence', 'thus', 'first', 'second', 'third',
        'next', 'then', 'finally', 'conclusion', 'result', 'answer', 'solution',
        'given', 'find', 'calculate', 'determine', 'solve', 'apply', 'use'
      ];
      
      if (stepKeywords.some(keyword => text.toLowerCase().includes(keyword)) && 
          !content.classList.contains('step-by-step')) {
        content.classList.add('step-by-step', 'interactive-element');
      }
    });

    // Add interactive effects to tables
    const tables = element.querySelectorAll('table');
    tables.forEach((table) => {
      if (!table.classList.contains('interactive-table')) {
        table.classList.add('interactive-table');
        const rows = table.querySelectorAll('tr');
        rows.forEach((row, index) => {
          if (index > 0) { // Skip header row
            row.classList.add('interactive-row');
            row.addEventListener('mouseenter', () => {
              row.classList.add('row-highlighted');
            });
            row.addEventListener('mouseleave', () => {
              row.classList.remove('row-highlighted');
            });
          }
        });
      }
    });

    // Add interactive effects to lists
    const lists = element.querySelectorAll('ul, ol');
    lists.forEach((list) => {
      if (!list.classList.contains('interactive-list')) {
        list.classList.add('interactive-list');
        const items = list.querySelectorAll('li');
        items.forEach((item) => {
          item.classList.add('interactive-item');
          item.addEventListener('mouseenter', () => {
            item.classList.add('item-highlighted');
          });
          item.addEventListener('mouseleave', () => {
            item.classList.remove('item-highlighted');
          });
        });
      }
    });
  };

  const addCollapsibleSections = useCallback((element: HTMLElement) => {
    // Find headings that should be collapsible
    const headings = element.querySelectorAll('h2, h3');
    headings.forEach((heading) => {
      const text = heading.textContent?.toLowerCase() || '';
      const shouldBeCollapsible = 
        text.includes('formula') || text.includes('equation') || text.includes('formulae') ||
        text.includes('example') || text.includes('problem') || text.includes('question') ||
        text.includes('derivation') || text.includes('proof');
      
      if (shouldBeCollapsible && !heading.closest('.collapsible-section')) {
        const sectionId = `section-${Math.random().toString(36).substr(2, 9)}`;
        const type = text.includes('formula') || text.includes('equation') ? 'formula' :
                    text.includes('example') || text.includes('problem') ? 'example' : 'derivation';
        const icon = getSectionIcon(type);
        
        // Create collapsible wrapper
        const collapsibleSection = document.createElement('div');
        collapsibleSection.className = 'collapsible-section';
        collapsibleSection.setAttribute('data-section-id', sectionId);
        
        // Create header
        const header = document.createElement('div');
        header.className = 'collapsible-header';
        
        const button = document.createElement('button');
        button.className = 'collapsible-button';
        button.innerHTML = `
          <div class="flex items-center space-x-3">
            <div class="collapsible-icon">${icon}</div>
            <div class="flex-1 text-left">
              <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">${heading.textContent}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">Click to expand/collapse</p>
            </div>
            <div class="collapsible-arrow">
              <svg class="w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        `;
        
        // Add click handler
        button.addEventListener('click', () => {
          toggleCollapsibleSection(sectionId);
        });
        
        header.appendChild(button);
        
        // Create content wrapper
        const content = document.createElement('div');
        content.className = 'collapsible-content collapsed';
        content.id = `content-${sectionId}`;
        
        const contentInner = document.createElement('div');
        contentInner.className = 'collapsible-content-inner';
        
        // Move all content after the heading into the collapsible section
        let nextElement = heading.nextElementSibling;
        const elementsToMove: Element[] = [];
        
        while (nextElement && !nextElement.matches('h1, h2, h3, h4')) {
          elementsToMove.push(nextElement);
          nextElement = nextElement.nextElementSibling;
        }
        
        // Ensure tables have proper styling
        elementsToMove.forEach(el => {
          if (el.tagName === 'TABLE') {
            el.classList.add('w-full', 'border-collapse', 'mb-4', 'rounded-lg', 'shadow-lg');
          }
        });
        
        // Move elements to collapsible content
        elementsToMove.forEach(el => {
          contentInner.appendChild(el);
        });
        
        content.appendChild(contentInner);
        collapsibleSection.appendChild(header);
        collapsibleSection.appendChild(content);
        
        // Replace the heading with the collapsible section
        heading.parentNode?.replaceChild(collapsibleSection, heading);
      }
    });
  }, [getSectionIcon, toggleCollapsibleSection]);

  const addDiagrams = useCallback((element: HTMLElement) => {
    // Look for diagram placeholders in the content
    const diagramPlaceholders = element.querySelectorAll('[data-diagram]');
    
    diagramPlaceholders.forEach((placeholder) => {
      const diagramType = placeholder.getAttribute('data-diagram');
      if (diagramType && Object.prototype.hasOwnProperty.call(DiagramTemplates, diagramType)) {
        // Create a container for the diagram
        const diagramContainer = document.createElement('div');
        diagramContainer.className = 'diagram-container my-6';
        
        // Replace the placeholder with the diagram container
        placeholder.parentNode?.replaceChild(diagramContainer, placeholder);
        
        // Render the diagram (this would need to be handled by React)
        // For now, we'll add a placeholder that can be replaced by React
        diagramContainer.innerHTML = `<div class="diagram-placeholder" data-diagram-type="${diagramType}"></div>`;
      }
    });
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      const element = contentRef.current;
      
      // Add icons and styling to headings
      const headings = element.querySelectorAll('h1, h2, h3, h4');
      headings.forEach((heading) => {
        if (!heading.classList.contains('enhanced')) {
          heading.classList.add('enhanced');
          
          // Add section-specific classes based on content
          const text = heading.textContent?.toLowerCase() || '';
          if (text.includes('formula') || text.includes('equation')) {
            heading.classList.add('formula-section');
          } else if (text.includes('example') || text.includes('problem')) {
            heading.classList.add('example-section');
          } else if (text.includes('mistake') || text.includes('warning') || text.includes('common')) {
            heading.classList.add('warning-section');
          }
        }
      });

      // Enhance lists with better styling
      const lists = element.querySelectorAll('ul, ol');
      lists.forEach((list) => {
        if (!list.classList.contains('enhanced')) {
          list.classList.add('enhanced');
          list.classList.add('space-y-2');
        }
      });

      // Enhance paragraphs with better spacing
      const paragraphs = element.querySelectorAll('p');
      paragraphs.forEach((p) => {
        if (!p.classList.contains('enhanced')) {
          p.classList.add('enhanced');
          p.classList.add('leading-relaxed');
        }
      });

      // Add special styling to formula-like content
      const textContent = element.textContent || '';
      if (textContent.includes('P = F / A') || textContent.includes('ρ') || textContent.includes('=')) {
        element.classList.add('has-formulas');
      }

      // Add interactive elements
      addInteractiveElements(element);
      
      // Add collapsible sections
      addCollapsibleSections(element);
      
      // Add diagram support
      addDiagrams(element);
    }
  }, [content, addCollapsibleSections, addDiagrams]);

  return (
    <div 
      ref={contentRef}
      className={`lesson-content max-w-none prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl mx-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default HTMLRenderer;