import { PrismaClient } from '@prisma/client';

(async function main() {
    const prisma = new PrismaClient();

    const quiz = await prisma.quiz.update({
        where: { id: '66c4b9e94a0ae7caa7e47126' },
        data: {
            questions: {
                create: [
                    {
                        text: 'Qual é a fórmula química da água?',
                        title: 'Quiz de Química',
                        description: 'Identifique a fórmula química da água.',
                        type: 'MULTIPLE_CHOICE',
                        answers: {
                            create: [
                                { text: 'H2O', isCorrect: true },
                                { text: 'CO2', isCorrect: false },
                                { text: 'O2', isCorrect: false },
                                { text: 'H2SO4', isCorrect: false },
                            ],
                        },
                    },
                    {
                        text: 'Quem escreveu "Dom Quixote"?',
                        title: 'Quiz de Literatura',
                        description: 'Identifique o autor do livro "Dom Quixote".',
                        type: 'MULTIPLE_CHOICE',
                        answers: {
                            create: [
                                { text: 'Miguel de Cervantes', isCorrect: true },
                                { text: 'William Shakespeare', isCorrect: false },
                                { text: 'J.K. Rowling', isCorrect: false },
                                { text: 'Gabriel García Márquez', isCorrect: false },
                            ],
                        },
                    },
                    {
                        text: 'Qual é a capital do Japão?',
                        title: 'Capitais do Mundo',
                        description: 'Identifique a capital do Japão.',
                        type: 'MULTIPLE_CHOICE',
                        answers: {
                            create: [
                                { text: 'Tóquio', isCorrect: true },
                                { text: 'Osaka', isCorrect: false },
                                { text: 'Quioto', isCorrect: false },
                                { text: 'Nagoya', isCorrect: false },
                            ],
                        },
                    },
                ],
            },
        },
    });

    return quiz;
})();