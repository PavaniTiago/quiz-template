"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import QuizQuestion from './quizQuestion';
import ProgressBar from './progressBar';
import { getCookies } from '@/lib/getCookies';
import { updateQuizProgress } from '@/server/actions';

const QuizPage = () => {
  const { data: session, status } = useSession();
  const [quiz, setQuiz] = useState<any>(null);
  const [quizSession, setQuizSession] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<number[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string | null }>({});

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch('/api/quiz');
        const data = await response.json();
        setQuiz(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch quiz', error);
      }
    };

    fetchQuiz();
  }, []);

  useEffect(() => {
    const registerUser = async () => {
      const cookies = getCookies();
      console.log(cookies);
      if (!cookies.userId) {
        try {
          const response = await fetch('/api/auth/register', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          const data = await response.json();
          setQuizSession(data.quizSession);
          console.log('User ID registered in cookies:', data);
        } catch (error) {
          console.error('Error registering user ID in cookies:', error);
        }
      }
    };

    registerUser();
  }, []);

  const handleAnswerSelected = async (answerId: string | null) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestionIndex]: answerId }));
    setAnsweredQuestions((prev) => new Set(prev).add(currentQuestionIndex));

    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setHistory((prev) => [...prev, currentQuestionIndex]);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }

    if (quizSession) {
      const newProgress = quizSession.progress + 1;
      const newQuestionIndex = currentQuestionIndex + 1;

      try {
        await updateQuizProgress({
          quizSessionId: quizSession.id,
          currentQuestionIndex: newQuestionIndex,
          progress: newProgress,
          selectedAnswer: {
            questionId: quiz.questions[currentQuestionIndex].id,
            answerId: answerId as string,
          },
        });
      } catch (error) {
        console.error('Failed to update quiz progress:', error);
      }
    }
  };

  const handleBackButton = () => {
    if (history.length > 0) {
      const previousQuestionIndex = history.pop()!;
      setCurrentQuestionIndex(previousQuestionIndex);
      setHistory([...history]); // Atualiza o estado do histórico
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setHistory((prev) => [...prev, currentQuestionIndex]);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!quiz) {
    return <div>Carregando o quiz...</div>;
  }

  const nextQuestionAnswered = answeredQuestions.has(currentQuestionIndex + 1);

  return (
    <div className="flex w-full min-h-screen flex-col items-center bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <nav className="flex w-full flex-col items-center justify-between bg-gray-800 px-6 py-4">
        <div className="w-full mb-4">
          <ProgressBar
            currentIndex={currentQuestionIndex}
            answeredQuestions={answeredQuestions.size}
            totalQuestions={quiz?.questions.length ?? 0}
          />
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center">
            {history.length > 0 && (
              <button
                onClick={handleBackButton}
                className="flex items-center text-gray-400"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.75 16.5L1.25 9L8.75 1.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Voltar
              </button>
            )}
            {nextQuestionAnswered && (
              <button
                onClick={handleNextQuestion}
                className="flex items-center text-gray-400 ml-4"
              >
                Avançar
                <svg
                  className="ml-2 h-4 w-4"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.25 1.5L8.75 9L1.25 16.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </nav>
      <main className="flex grow flex-col items-center justify-center p-6">
        <QuizQuestion
          question={quiz.questions[currentQuestionIndex]}
          onAnswerSelected={handleAnswerSelected}
          selectedAnswer={selectedAnswers[currentQuestionIndex]}
          quizSession={quizSession}
        />
      </main>
      <footer className="w-full bg-gray-800 py-4 text-center text-sm text-gray-500">
        <div>© 2024 M3SA</div>
        <div className="mt-2 flex justify-center space-x-4">
          <a href="#" className="hover:underline">
            Política de Privacidade
          </a>
          <a href="#" className="hover:underline">
            Termos de Serviço
          </a>
        </div>
      </footer>
    </div>
  );
};

export default QuizPage;