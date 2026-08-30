import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
  id: string;
  title: string;
  content: string;
  defaultOpen?: boolean;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ id, title, content, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white mb-3 shadow-none transition-colors" id={`accordion-${id}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left font-bold text-[#081A2E] flex justify-between items-center hover:bg-gray-50/60 transition-colors focus:outline-none focus:bg-gray-50"
        aria-expanded={isOpen}
        aria-controls={`accordion-body-${id}`}
      >
        <span className="text-base pr-4">{title}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-[#081A2E]' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div id={`accordion-body-${id}`} className="px-6 pb-5 pt-2 text-gray-600 text-sm leading-relaxed border-t border-gray-100 bg-white">
          {content}
        </div>
      )}
    </div>
  );
};
