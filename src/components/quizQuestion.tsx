import React, { useState, useEffect } from 'react';
import { Question } from '@/types/types';
import { QuizSession } from '@prisma/client';
import { getSavedAnswer, UpdateUser } from '@/server/actions';
import Feedback1 from '@/quiz-template/feedbacks/feedback1';
import Input from './Input';
import { Icon } from '@iconify/react';

interface Props {
  question: Question;
  onAnswerSelected: (answerIds: string[]) => void;
  quizSession: QuizSession;
  selectedAnswer: string | null;
  onUserUpdated: (data: { name: string }) => void; // Nova prop
}

const QuizQuestion: React.FC<Props> = ({ question, onAnswerSelected, quizSession, selectedAnswer, onUserUpdated }) => {
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(selectedAnswer);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(selectedAnswer ? selectedAnswer.split(',') : []);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
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
          setSelectedAnswers(savedAnswer.answerId.split(','));
        }
      } catch (error) {
        console.error('Failed to fetch saved answer:', error);
      }
    };

    fetchSavedAnswer();
  }, [quizSession, question]);

  useEffect(() => {
    setSelectedAnswerId(selectedAnswer);
    setSelectedAnswers(selectedAnswer ? selectedAnswer.split(',') : []);
  }, [selectedAnswer, question]);

  const handleAnswerSelected = (answerId: string) => {
    if (question.type === 'MULTIPLE_CHOICE') {
      setSelectedAnswers((prev) => {
        const newAnswers = prev.includes(answerId)
          ? prev.filter((id) => id !== answerId)
          : [...prev, answerId];
        return newAnswers;
      });
    } else {
      setSelectedAnswerId(answerId);
      onAnswerSelected([answerId]);
    }
  };

  const handleMultipleChoiceSubmit = () => {
    const uniqueAnswers = Array.from(new Set(selectedAnswers));
    onAnswerSelected(uniqueAnswers);
  };

  const handleUpdateUser = async (name: string, id: string, email?: string, password?: string) => {
    try {
      const data = { name, email, password }; // Estrutura correta do objeto
      await UpdateUser({ data, userId: id });
      onUserUpdated(data); // Passa os dados para o componente pai
      handleMultipleChoiceSubmit(); // Avança para a próxima pergunta
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  return (
    <div className="w-full max-w-lg">
      {question ? (
        <>
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-green-400">
              {
               question.id === '66c8e5e2acff529714d7b060' 
               ? '' 
               : question.text
              }
            </h2>
            {question.description && (
              question.id === '66c8e5e2acff529714d7b060' ? (
                <>
                  <p className="text-gray-300 text-xl font-semibold">Como você se chama?</p>
                  <p className="text-gray-400 text-sm">Nosso quiz quer te conhecer</p>
                </>
              )
              :
              <>
                <p className="text-gray-300 font-semibold">{question.title}</p>
                <p className="text-gray-400 text-sm">{question.description}</p>
              </>
            )}
          </div>
          {question.type === 'TEXT' ? 
            question.id === '66c8e5e2acff529714d7b05f' ? (
              <div className="mb-6 text-center">
                <Feedback1 />
              </div>
            ) : question.id === '66c8e5e2acff529714d7b060' ? (
              <div className="mb-6 text-center space-y-6">
                <Input
                  icon={<Icon icon="bx:user" className='w-5 h-5 text-neutral-500' />}
                  value={name}
                  type='text'
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  icon={<Icon icon="ic:outline-email" className='w-5 h-5 text-neutral-500' />}
                  value={email}
                  type='email'
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  icon={<Icon icon="mdi:password-outline" className='w-5 h-5 text-neutral-500' />}
                  value={password}
                  type='password'
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            ) : (
              <div className="mb-6 text-center">
                <Input
                  icon={<Icon icon="bx:user" className='w-5 h-5 text-neutral-500' />}
                  value={name}
                  type='text'
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )
           : (
            <div className="space-y-4">
              {question.answers.map((answer) => (
                <label
                  key={answer.id}
                  className={`flex cursor-pointer items-center space-x-4 rounded-lg p-4 ${
                    selectedAnswerId === answer.id || selectedAnswers.includes(answer.id) ? 'bg-green-700' : 'bg-gray-700'
                  }`}
                >
                  <input
                    type={question.type === 'MULTIPLE_CHOICE' ? 'checkbox' : 'radio'}
                    name={question.id}
                    value={answer.id}
                    checked={selectedAnswerId === answer.id || selectedAnswers.includes(answer.id)}
                    onChange={() => handleAnswerSelected(answer.id)}
                    className="h-6 w-6 border-gray-600 text-green-400 focus:ring-green-400"
                  />
                  <span className="text-gray-300">{answer.text}</span>
                </label>
              ))}
            </div>
          )}
          {question.type === 'MULTIPLE_CHOICE' && (
            <button
            onClick={name !== '' ? () => { handleUpdateUser(name, quizSession.userId) } : handleMultipleChoiceSubmit}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg"
            >
              Avançar
            </button>
          )}
          {question.type === 'TEXT' && (
            <button
            onClick={name !== '' ? () => { handleUpdateUser(name, quizSession.userId, email, password) } : handleMultipleChoiceSubmit}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg"
            >
              Avançar
            </button>
          )}
        </>
      ) : (
        <div>Carregando pergunta...</div>
      )}
    </div>
  );
};

export default QuizQuestion;