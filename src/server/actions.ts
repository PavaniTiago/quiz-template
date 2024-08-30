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

export async function UpdateUser({
  userId,
  data,
}: {
  userId: string;
  data: {
    name?: string;
    email?: string;
  };
}) {
  try {
    console.log('Updating user with ID:', userId, 'and data:', data);

    // Verificar se os dados estão sendo passados corretamente
    if (!userId || !data) {
      throw new Error('User ID or data is missing');
    }

    // Verificar se o usuário existe
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new Error('User not found');
    }

    console.log('User exists:', userExists);

    // Atualiza os dados do usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name, // Manter o nome atual se não for fornecido
        email: data.email ?? userExists.email, // Manter o email atual se não for fornecido
      },
    });

    console.log('User updated successfully:', updatedUser);
    return updatedUser;
  } catch (error) {
    console.error('Failed to update user:', error);
    throw new Error('Failed to update user');
  }
}