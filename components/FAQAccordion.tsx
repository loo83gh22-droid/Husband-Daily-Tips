'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden transition-all"
        >
          <button
            onClick={() => toggleItem(index)}
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-900/70 transition-colors"
            aria-expanded={openIndex === index}
          >
            <h3 className="text-lg font-semibold text-slate-200 pr-4">
              {item.question}
            </h3>
            <span className="text-primary-400 text-xl flex-shrink-0">
              {openIndex === index ? '−' : '+'}
            </span>
          </button>
          {openIndex === index && (
            <div className="px-6 pb-4">
              <p className="text-slate-400 leading-relaxed">
                {item.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

