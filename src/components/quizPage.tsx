"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import QuizQuestion from './quizQuestion';
import ProgressBar from './progressBar';
import { getCookies } from '@/lib/getCookies';
import { updateQuizProgress } from '@/server/actions';
import { User } from '@prisma/client';
import { Icon } from '@iconify/react';

const QuizPage = () => {
  const { data: session, status } = useSession();
  const [quiz, setQuiz] = useState<any>(null);
  const [quizSession, setQuizSession] = useState<any>(null);
  const [user, setUser] = useState<User>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<number[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string[] }>({});
  const [selected, setSelected] = useState<string[]>([]);

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
          setUser(data.user);
          console.log('User ID registered in cookies:', data);
        } catch (error) {
          console.error('Error registering user ID in cookies:', error);
        }
      }
    };

    registerUser();
  }, []);

  useEffect(() => {
    const currentSelected = Array.isArray(selectedAnswers[currentQuestionIndex])
      ? selectedAnswers[currentQuestionIndex].join(',').split(',')
      : [];
    setSelected(currentSelected);
  }, [selectedAnswers, currentQuestionIndex]);

  const handleAnswerSelected = async (answerIds: string[]) => {
    const currentQuestion = quiz.questions[currentQuestionIndex];
  
    if (currentQuestion.type === 'MULTIPLE_CHOICE') {
      setSelectedAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: answerIds,
      }));
    } else {
      setSelectedAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: answerIds.slice(0, 1),
      }));
    }
  
    setAnsweredQuestions((prev) => new Set(prev).add(currentQuestionIndex));
  
    let nextQuestionIndex = currentQuestionIndex + 1;
  
    // Lógica condicional para direcionar o usuário para a próxima pergunta específica
    if (currentQuestion.id === '66c4b9e94a0ae7caa7e47127') {
      if (answerIds.includes('66c4b9e94a0ae7caa7e47128')) {
        nextQuestionIndex = quiz.questions.findIndex((q: { id: string; }) => q.id === '66c8e5e2acff529714d7b05f');
      } else {
        nextQuestionIndex = quiz.questions.findIndex((q: { id: string; }) => q.id === '66c4f372811f0556f802a5fd');
      }
    } else if (currentQuestion.id === '66c4f372811f0556f802a5f8') {
      if (answerIds.includes('someAnswerId2')) {
        nextQuestionIndex = quiz.questions.findIndex((q: { id: string; }) => q.id === 'nextQuestionId3');
      } else {
        nextQuestionIndex = quiz.questions.findIndex((q: { id: string; }) => q.id === 'nextQuestionId4');
      }
    } else if (currentQuestion.type === 'MULTIPLE_CHOICE' && currentQuestion.id === '66c79675c81181ebb80e5328') {
      // Exemplo de lógica para múltipla escolha
      if (answerIds.includes('66c79675c81181ebb80e5329') && answerIds.includes('66c79675c81181ebb80e532a')) {
        console.log('Both answers selected');
        nextQuestionIndex = quiz.questions.findIndex((q: { id: string; }) => q.id === '66c4b9e94a0ae7caa7e47127');
      } else if (answerIds.includes('multipleChoiceAnswerId1')) {
        nextQuestionIndex = quiz.questions.findIndex((q: { id: string; }) => q.id === 'nextQuestionIdForMultipleChoice1');
      } else if (answerIds.includes('multipleChoiceAnswerId2')) {
        nextQuestionIndex = quiz.questions.findIndex((q: { id: string; }) => q.id === 'nextQuestionIdForMultipleChoice2');
      } else {
        nextQuestionIndex = quiz.questions.findIndex((q: { id: string; }) => q.id === 'defaultNextQuestionIdForMultipleChoice');
      }
    }
  
    if (quiz && nextQuestionIndex < quiz.questions.length) {
      setHistory((prev) => [...prev, currentQuestionIndex]);
      setCurrentQuestionIndex(nextQuestionIndex);
    }
  
    if (quizSession) {
      const newProgress = quizSession.progress + 1;
  
      try {
        await updateQuizProgress({
          quizSessionId: quizSession.id,
          currentQuestionIndex: nextQuestionIndex,
          progress: newProgress,
          selectedAnswer: {
            questionId: currentQuestion.id,
            answerId: answerIds[0], // Considerando apenas o primeiro ID para o progresso
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

  const handleUserUpdated = (data: { name: string }) => {
    setUser(data as any);
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
        <div className="flex w-full items-center justify-around">
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
          {user?.name && <div className="flex items-center text-center mt-4 gap-3"><Icon icon="bx:user" className='w-5 h-5 text-neutral-500' />{user?.name}</div>}
        </div>
      </nav>
      <main className="flex grow flex-col items-center justify-center p-6">
        <QuizQuestion
          question={quiz.questions[currentQuestionIndex]}
          onAnswerSelected={handleAnswerSelected}
          selectedAnswer={selected.join(',')}
          quizSession={quizSession}
          onUserUpdated={handleUserUpdated}
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