import React from 'react';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

interface TooltipInfoProps {
  text: string;
}

const TooltipInfo: React.FC<TooltipInfoProps> = ({ text }) => {
  return (
    <span
      className="inline-flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help"
      title={text}
    >
      <QuestionMarkCircleIcon className="w-4 h-4" />
    </span>
  );
};

export default TooltipInfo;
