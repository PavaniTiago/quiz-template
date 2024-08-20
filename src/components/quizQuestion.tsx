import React, { useState, useEffect } from 'react';
import { Question } from '@/types/types';
import { QuizSession } from '@prisma/client';
import { updateQuizProgress, getSavedAnswer } from '@/server/actions';

interface Props {
  question: Question;
  onAnswerSelected: (nextId: string | null) => void;
  quizSession: QuizSession;
  selectedAnswer: string | null;
}

const QuizQuestion: React.FC<Props> = ({ question, onAnswerSelected, quizSession, selectedAnswer }) => {
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(selectedAnswer);

  useEffect(() => {
    if (!quizSession || !question) return;

    const fetchSavedAnswer = async () => {
      try {
        const savedAnswer = await getSavedAnswer({
          quizSessionId: quizSession.id,
          questionId: question.id,
        });
        if (savedAnswer) {
          setSelectedAnswerId(savedAnswer.answerId);
        }
      } catch (error) {
        console.error('Failed to fetch saved answer:', error);
      }
    };

    fetchSavedAnswer();
  }, [quizSession, question]);

  const handleAnswerSelected = async (answerId: string) => {
    setSelectedAnswerId(answerId);

    const newProgress = quizSession.progress + 1;
    const newQuestionIndex = quizSession.currentQuestionIndex + 1;

    try {
      await updateQuizProgress({
        quizSessionId: quizSession.id,
        currentQuestionIndex: newQuestionIndex,
        progress: newProgress,
        selectedAnswer: {
          questionId: question.id,
          answerId: answerId,
        },
      });
      onAnswerSelected(newQuestionIndex.toString()); // Atualiza o índice da questão
    } catch (error) {
      console.error('Failed to update quiz progress:', error);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-green-400">
          {question.title}
        </h2>
        {question.description && (
          <p className="text-gray-400">{question.description}</p>
        )}
      </div>
      <div className="space-y-4">
        {question.answers.map((answer) => (
          <label
            key={answer.id}
            className={`flex cursor-pointer items-center space-x-4 rounded-lg p-4 ${
              selectedAnswerId === answer.id ? 'bg-green-700' : 'bg-gray-700'
            }`}
          >
            <input
              type="radio"
              name={question.id}
              value={answer.id}
              checked={selectedAnswerId === answer.id}
              onChange={() => handleAnswerSelected(answer.id)}
              className="h-6 w-6 border-gray-600 text-green-400 focus:ring-green-400"
            />
            <span className="text-gray-300">{answer.text}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default QuizQuestion;