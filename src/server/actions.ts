"use server";

// src/server/actions.ts

import { prisma } from '@/lib/prisma';
import { ObjectId } from 'mongodb';

export async function updateQuizProgress({
  quizSessionId,
  currentQuestionIndex,
  progress,
  selectedAnswer,
}: {
  quizSessionId: string;
  currentQuestionIndex: number;
  progress: number;
  selectedAnswer: {
    questionId: string;
    answerId: string; // Este campo será renomeado para id
  };
}) {
  console.log('updateQuizProgress called with:', {
    quizSessionId,
    currentQuestionIndex,
    progress,
    selectedAnswer,
  });

  try {
    // Verificar se os IDs são ObjectIDs válidos
    if (!ObjectId.isValid(selectedAnswer.answerId)) {
      throw new Error(`Invalid ObjectID for answerId: ${selectedAnswer.answerId}`);
    }

    // Atualiza o progresso do quiz
    await prisma.quizSession.update({
      where: { id: quizSessionId },
      data: {
        currentQuestionIndex,
        progress,
      },
    });

    // Salva a resposta selecionada
    await prisma.selectedAnswer.create({
      data: {
        questionId: selectedAnswer.questionId,
        answerId: selectedAnswer.answerId, // Usando o campo correto do modelo Answer
        quizSessionId: quizSessionId,
      },
    });

    console.log('Quiz progress updated successfully');
  } catch (error) {
    console.error('Failed to update quiz progress:', error);
    throw new Error('Failed to update quiz progress');
  }
}

export async function getSavedAnswer({
  quizSessionId,
  questionId,
}: {
  quizSessionId: string;
  questionId: string;
}) {
  try {
    console.log('Fetching saved answer for session:', quizSessionId, 'and question:', questionId);

    // Verificar se os IDs estão no formato correto
    if (!ObjectId.isValid(quizSessionId) || !ObjectId.isValid(questionId)) {
      throw new Error('Invalid ID format');
    }

    const savedAnswer = await prisma.selectedAnswer.findFirst({
      where: {
        quizSessionId,
        questionId,
      },
      orderBy: {
        createdAt: 'desc', // Garantir que a última resposta selecionada seja retornada
      },
    });
    console.log('Saved answer fetched:', savedAnswer);
    return savedAnswer;
  } catch (error) {
    console.error('Failed to fetch saved answer:', error);
    throw new Error('Failed to fetch saved answer');
  }
}