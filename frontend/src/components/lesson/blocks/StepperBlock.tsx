import React from 'react';
import { StepperBlock as IStepperBlock } from '../../../types';
import { MarkdownText } from './MarkdownText';

interface StepperBlockProps {
  block: IStepperBlock;
}

export const StepperBlock: React.FC<StepperBlockProps> = ({ block }) => {
  const steps = block.steps || [];

  return (
    <div className="my-6 space-y-4">
      {block.title && (
        <h4 className="text-sm font-bold text-[#1A1A1A] dark:text-white tracking-tight flex items-center gap-2">
          <span>🪜</span>
          <span>{block.title}</span>
        </h4>
      )}

      <div className="relative pl-6 sm:pl-8 border-l-2 border-blue-500/30 dark:border-blue-400/30 space-y-6 ml-3 my-2">
        {steps.map((step, idx) => (
          <div key={idx} className="relative space-y-2">
            {/* Number Pill */}
            <div className="absolute -left-[37px] sm:-left-[45px] top-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0066CC] dark:bg-[#4D94FF] text-white font-extrabold text-xs flex items-center justify-center shadow-md border-2 border-white dark:border-[#141414]">
              {idx + 1}
            </div>

            <div className="space-y-1">
              <h5 className="text-sm font-bold text-[#1A1A1A] dark:text-white">
                {step.title}
              </h5>
              <MarkdownText content={step.description} className="text-xs sm:text-sm text-gray-600 dark:text-gray-300" />
            </div>

            {step.code && (
              <pre className="p-3.5 rounded-xl bg-gray-950 text-emerald-400 font-mono text-xs overflow-x-auto">
                <code>{step.code}</code>
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
