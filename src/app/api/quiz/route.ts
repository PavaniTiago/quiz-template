import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export async function GET() {
    try {
      const quiz = await prisma.quiz.findFirst({
        include: {
          questions: {
            include: {
              answers: true, // Inclui as respostas junto com as perguntas, se necessário
            },
          },
        },
      });
  
      if (!quiz) {
        return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
      }
  
      return NextResponse.json(quiz, { status: 200 });
    } catch (error) {
      console.error('Error fetching quiz:', error);
      return NextResponse.json({ message: 'Failed to fetch quiz' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const quiz = await prisma.quiz.create({
    data: {
      title: body.title,
      description: body.description,
      questions: {
        create: body.questions.map((question: any) => ({
          title: question.title,
          description: question.subtitle,
          answers: {
            create: question.options.map((option: any) => ({
              text: option.text,
              isCorrect: option.isCorrect,
            })),
          },
        })),
      },
    },
  });

  return NextResponse.json(quiz);
}