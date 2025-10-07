import React, { useState, useEffect } from 'react';
import { HelpCircle, Search, BookOpen, Lightbulb, Calculator, Settings, Keyboard, X, ChevronRight, ChevronDown } from 'lucide-react';

export interface HelpTopic {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  relatedTopics: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  topics: HelpTopic[];
}

interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSystem: React.FC<HelpSystemProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const helpCategories: HelpCategory[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of using the simulator',
      icon: <BookOpen className="w-5 h-5" />,
      topics: [
        {
          id: 'interface-overview',
          title: 'Interface Overview',
          content: `
            The Light Simulator interface consists of several key components:
            
            **Navigation Bar**: Switch between different simulators (Reflection, Refraction, Lenses, etc.)
            **Canvas**: The main simulation area where physics phenomena are visualized
            **Controls Panel**: Interactive sliders, toggles, and dropdowns to adjust parameters
            **Formula Panel**: Displays relevant physics formulas and calculations
            **Info Panel**: Educational content and explanations
            
            Each simulator focuses on a specific aspect of light physics, allowing you to explore different phenomena in detail.
          `,
          category: 'getting-started',
          tags: ['interface', 'navigation', 'basics'],
          relatedTopics: ['controls', 'canvas'],
          difficulty: 'beginner'
        },
        {
          id: 'controls',
          title: 'Using Controls',
          content: `
            The simulator includes various types of controls:
            
            **Sliders**: Adjust numerical values like angles, distances, and refractive indices
            **Toggles**: Enable/disable features like multiple rays, measurements, or animations
            **Dropdowns**: Select different options like mirror types, medium types, or lens types
            **Buttons**: Trigger actions like reset, export data, or toggle tutorials
            
            All controls provide real-time feedback, updating the simulation immediately when changed.
            Hover over controls to see tooltips with additional information.
          `,
          category: 'getting-started',
          tags: ['controls', 'sliders', 'toggles'],
          relatedTopics: ['interface-overview', 'keyboard-shortcuts'],
          difficulty: 'beginner'
        },
        {
          id: 'canvas',
          title: 'Interactive Canvas',
          content: `
            The canvas is the heart of the simulation, showing:
            
            **Light Rays**: Colored lines representing light paths
            **Optical Elements**: Mirrors, lenses, prisms, and other components
            **Measurements**: Angles, distances, and other physical quantities
            **Labels**: Clear identification of all elements
            
            The canvas updates in real-time as you adjust parameters. You can zoom and pan to get a better view of specific areas.
            Some simulators allow you to click and drag elements for interactive positioning.
          `,
          category: 'getting-started',
          tags: ['canvas', 'visualization', 'interaction'],
          relatedTopics: ['interface-overview', 'measurements'],
          difficulty: 'beginner'
        }
      ]
    },
    {
      id: 'physics-concepts',
      title: 'Physics Concepts',
      description: 'Understand the underlying physics principles',
      icon: <Lightbulb className="w-5 h-5" />,
      topics: [
        {
          id: 'reflection-law',
          title: 'Law of Reflection',
          content: `
            The Law of Reflection states that when light strikes a surface:
            
            **Angle of Incidence = Angle of Reflection**
            **θᵢ = θᵣ**
            
            Both the incident ray and reflected ray lie in the same plane as the normal to the surface.
            
            **Types of Reflection:**
            - **Specular Reflection**: Smooth surfaces create mirror-like reflections
            - **Diffuse Reflection**: Rough surfaces scatter light in multiple directions
            
            **Applications:**
            - Mirrors in telescopes and microscopes
            - Periscopes in submarines
            - Solar concentrators for energy generation
          `,
          category: 'physics-concepts',
          tags: ['reflection', 'angles', 'mirrors'],
          relatedTopics: ['snells-law', 'mirror-types'],
          difficulty: 'beginner'
        },
        {
          id: 'snells-law',
          title: 'Snell\'s Law of Refraction',
          content: `
            Snell's Law describes how light bends when passing between different media:
            
            **n₁sin(θ₁) = n₂sin(θ₂)**
            
            Where:
            - n₁, n₂ are the refractive indices of the two media
            - θ₁, θ₂ are the angles of incidence and refraction
            
            **Key Points:**
            - Light bends toward the normal when entering a denser medium
            - Light bends away from the normal when entering a less dense medium
            - The amount of bending depends on the refractive index difference
            
            **Critical Angle:**
            When light travels from a denser to a less dense medium, there's a critical angle beyond which total internal reflection occurs.
          `,
          category: 'physics-concepts',
          tags: ['refraction', 'snells-law', 'refractive-index'],
          relatedTopics: ['reflection-law', 'total-internal-reflection'],
          difficulty: 'intermediate'
        },
        {
          id: 'total-internal-reflection',
          title: 'Total Internal Reflection',
          content: `
            Total Internal Reflection (TIR) occurs when:
            
            **Conditions for TIR:**
            1. Light travels from a denser medium to a less dense medium
            2. The incident angle exceeds the critical angle
            
            **Critical Angle Formula:**
            **θc = sin⁻¹(n₂/n₁)**
            
            **Applications:**
            - Optical fibers for communication
            - Prism binoculars
            - Diamond cutting and jewelry
            - Retroreflectors for safety
            
            **Why it happens:**
            When the incident angle is too large, Snell's law would require sin(θ₂) > 1, which is impossible. Instead, all light is reflected back into the denser medium.
          `,
          category: 'physics-concepts',
          tags: ['tir', 'critical-angle', 'reflection'],
          relatedTopics: ['snells-law', 'optical-fibers'],
          difficulty: 'intermediate'
        }
      ]
    },
    {
      id: 'calculations',
      title: 'Calculations & Formulas',
      description: 'Mathematical relationships and calculations',
      icon: <Calculator className="w-5 h-5" />,
      topics: [
        {
          id: 'thin-lens-formula',
          title: 'Thin Lens Formula',
          content: `
            The Thin Lens Formula relates object distance, image distance, and focal length:
            
            **1/f = 1/v + 1/u**
            
            Where:
            - f = focal length
            - v = image distance
            - u = object distance
            
            **Sign Conventions:**
            - Positive focal length: converging lens
            - Negative focal length: diverging lens
            - Positive image distance: real image
            - Negative image distance: virtual image
            
            **Magnification:**
            **m = -v/u**
            - Positive magnification: upright image
            - Negative magnification: inverted image
            - |m| > 1: magnified image
            - |m| < 1: diminished image
          `,
          category: 'calculations',
          tags: ['lenses', 'formula', 'magnification'],
          relatedTopics: ['mirror-formula', 'ray-tracing'],
          difficulty: 'intermediate'
        },
        {
          id: 'prism-deviation',
          title: 'Prism Deviation',
          content: `
            The deviation angle of light passing through a prism:
            
            **δ = i₁ + i₂ - A**
            
            Where:
            - δ = deviation angle
            - i₁ = incident angle at first surface
            - i₂ = exit angle at second surface
            - A = prism apex angle
            
            **Minimum Deviation:**
            Occurs when the light passes symmetrically through the prism:
            **δmin = 2i - A**
            
            **Dispersion:**
            Different wavelengths (colors) have different refractive indices, causing them to bend by different amounts and separate into a spectrum.
          `,
          category: 'calculations',
          tags: ['prism', 'deviation', 'dispersion'],
          relatedTopics: ['snells-law', 'wavelength'],
          difficulty: 'advanced'
        }
      ]
    },
    {
      id: 'keyboard-shortcuts',
      title: 'Keyboard Shortcuts',
      description: 'Quick navigation and control shortcuts',
      icon: <Keyboard className="w-5 h-5" />,
      topics: [
        {
          id: 'navigation-shortcuts',
          title: 'Navigation Shortcuts',
          content: `
            **Simulator Navigation:**
            - Press 1-7 to switch between simulators
            - Ctrl + ? to show/hide keyboard shortcuts
            - Tab to cycle through controls
            - Enter to activate focused control
            
            **Canvas Controls:**
            - Mouse wheel to zoom in/out
            - Click and drag to pan
            - Right-click for context menu
            
            **General:**
            - Escape to close dialogs
            - F11 for fullscreen mode
            - Ctrl + R to reset current simulator
            - Ctrl + S to save current state
          `,
          category: 'keyboard-shortcuts',
          tags: ['shortcuts', 'navigation', 'keyboard'],
          relatedTopics: ['controls', 'interface-overview'],
          difficulty: 'beginner'
        }
      ]
    }
  ];

  const filteredTopics = helpCategories.flatMap(category => 
    category.topics.filter(topic => 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Help & Documentation</h2>
              <p className="text-blue-200 text-sm">Learn how to use the Light Simulator effectively</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-1/3 border-r border-white/20 overflow-y-auto">
            {/* Search */}
            <div className="p-4 border-b border-white/20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                <input
                  type="text"
                  placeholder="Search help topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="p-4">
              {searchQuery ? (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Search Results</h3>
                  <div className="space-y-2">
                    {filteredTopics.map(topic => (
                      <button
                        key={topic.id}
                        onClick={() => setSelectedTopic(topic)}
                        className="w-full text-left p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <div className="font-medium text-white">{topic.title}</div>
                        <div className="text-sm text-blue-200">{topic.category}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {helpCategories.map(category => (
                    <div key={category.id}>
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {category.icon}
                          <div className="text-left">
                            <div className="font-medium text-white">{category.title}</div>
                            <div className="text-sm text-blue-200">{category.description}</div>
                          </div>
                        </div>
                        {expandedCategories.has(category.id) ? (
                          <ChevronDown className="w-4 h-4 text-blue-300" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-blue-300" />
                        )}
                      </button>
                      
                      {expandedCategories.has(category.id) && (
                        <div className="ml-6 mt-2 space-y-1">
                          {category.topics.map(topic => (
                            <button
                              key={topic.id}
                              onClick={() => setSelectedTopic(topic)}
                              className="w-full text-left p-2 rounded bg-white/5 hover:bg-white/15 transition-colors"
                            >
                              <div className="text-sm text-white">{topic.title}</div>
                              <div className="text-xs text-blue-300">
                                {topic.difficulty} • {topic.tags.slice(0, 2).join(', ')}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {selectedTopic ? (
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedTopic.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-blue-300">
                    <span className="px-2 py-1 bg-blue-500/20 rounded">
                      {selectedTopic.difficulty}
                    </span>
                    <span>{selectedTopic.category}</span>
                  </div>
                </div>
                
                <div className="prose prose-invert max-w-none">
                  <div className="text-blue-200 leading-relaxed whitespace-pre-line">
                    {selectedTopic.content}
                  </div>
                </div>

                {selectedTopic.relatedTopics.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/20">
                    <h4 className="text-lg font-semibold text-white mb-3">Related Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTopic.relatedTopics.map(relatedId => {
                        const relatedTopic = helpCategories
                          .flatMap(cat => cat.topics)
                          .find(topic => topic.id === relatedId);
                        
                        if (!relatedTopic) return null;
                        
                        return (
                          <button
                            key={relatedId}
                            onClick={() => setSelectedTopic(relatedTopic)}
                            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-blue-200 transition-colors"
                          >
                            {relatedTopic.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center">
                <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Welcome to Help</h3>
                <p className="text-blue-200">
                  Select a topic from the sidebar to get started, or use the search to find specific information.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
