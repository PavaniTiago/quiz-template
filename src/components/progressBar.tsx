import React from 'react';

interface Props {
  currentIndex: number;
  answeredQuestions: number;
  totalQuestions: number;
}

const ProgressBar: React.FC<Props> = ({ currentIndex, answeredQuestions, totalQuestions }) => {
  const calculateNonLinearProgress = (currentIndex: number, totalQuestions: number) => {
    if (totalQuestions === 0) return 0;
    if (currentIndex === 0) return 0; // Garantir que a barra comece em zero
    if (currentIndex === totalQuestions - 1) return 100; // Garantir que a barra seja preenchida completamente na última pergunta
    return Math.sqrt((currentIndex + 1) / totalQuestions) * 100;
  };

  const progressPercentage = Math.min(
    calculateNonLinearProgress(currentIndex, totalQuestions),
    100,
  );

  return (
    <div className="w-full">
      <div className="h-2 w-full overflow-hidden rounded-lg bg-green-900">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;