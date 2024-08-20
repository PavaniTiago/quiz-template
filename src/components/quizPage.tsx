"use client"

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import QuizQuestion from './quizQuestion';
import ProgressBar from './progressBar';
import { getCookies } from '@/lib/getCookies';

const QuizPage = () => {
  const { data: session, status } = useSession();
  const [quiz, setQuiz] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<number[]>([]);

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
    const cookies = getCookies();
    console.log(cookies);
    if (!cookies.userId) {
      // Chame a API para registrar o ID do usuário nos cookies
      fetch('/api/auth/register', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Certifique-se de incluir credenciais para permitir que os cookies sejam salvos
      })
        .then(response => response.json())
        .then(data => {
          console.log('User ID registered in cookies:', data);
          // Não é necessário salvar manualmente o cookie, o navegador deve fazer isso automaticamente
        })
        .catch(error => {
          console.error('Error registering user ID in cookies:', error);
        });
    }
  }, []);

  const handleAnswerSelected = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setHistory([...history, currentQuestionIndex]);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      alert('Você concluiu o quiz!');
    }
  };

  const handleBackButton = () => {
    if (history.length > 0) {
      const previousQuestionIndex = history.pop()!;
      setCurrentQuestionIndex(previousQuestionIndex);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!quiz) {
    return <div>Carregando o quiz...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <nav className="flex w-full items-center justify-between bg-gray-800 px-6 py-4">
        <button
          onClick={handleBackButton}
          className={`flex items-center text-gray-400 ${history.length === 0 ? 'hidden' : ''}`}
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
        <div className="flex justify-center">
          <ProgressBar
            currentIndex={currentQuestionIndex}
            totalQuestions={quiz?.questions.length ?? 0}
          />
        </div>
      </nav>
      <main className="flex grow flex-col items-center justify-center p-6">
        <QuizQuestion
          question={quiz.questions[currentQuestionIndex]}
          onAnswerSelected={handleAnswerSelected}
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