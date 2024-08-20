import { PrismaClient } from '@prisma/client';

(async function main() {
    const prisma = new PrismaClient();

    const quiz = await prisma.quiz.update({
        where: { id: '66c4b9e94a0ae7caa7e47126' },
        data: {
            questions: {
                create: [
                    {
                        text: 'What is the capital of France?',
                        title: 'Capital Cities',
                        description: 'Identify the capital city of France.',
                        type: 'SINGLE_CHOICE',
                        answers: {
                            create: [
                                { text: 'Paris', isCorrect: true },
                                { text: 'London', isCorrect: false },
                                { text: 'Berlin', isCorrect: false },
                                { text: 'Rome', isCorrect: false },
                            ],
                        },
                    },
                    {
                        text: 'What is the capital of Germany?',
                        title: 'Capital Cities',
                        description: 'Identify the capital city of Germany.',
                        type: 'SINGLE_CHOICE',
                        answers: {
                            create: [
                                { text: 'Berlin', isCorrect: true },
                                { text: 'Paris', isCorrect: false },
                                { text: 'London', isCorrect: false },
                                { text: 'Rome', isCorrect: false },
                            ],
                        },
                    },
                    {
                        text: 'What is 2 + 2?',
                        title: 'Simple Math',
                        description: 'Solve this basic math problem.',
                        type: 'SINGLE_CHOICE',
                        answers: {
                            create: [
                                { text: '3', isCorrect: false },
                                { text: '4', isCorrect: true },
                                { text: '5', isCorrect: false },
                            ],
                        },
                    },
                    // Add more questions here
                    {
                        text: 'What is the largest planet in our solar system?',
                        title: 'Space Quiz',
                        description: 'Identify the largest planet in our solar system.',
                        type: 'SINGLE_CHOICE',
                        answers: {
                            create: [
                                { text: 'Jupiter', isCorrect: true },
                                { text: 'Saturn', isCorrect: false },
                                { text: 'Mars', isCorrect: false },
                                { text: 'Earth', isCorrect: false },
                            ],
                        },
                    },
                    {
                        text: 'Who painted the Starry Night?',
                        title: 'Art Quiz',
                        description: 'Identify the artist who painted the Starry Night.',
                        type: 'SINGLE_CHOICE',
                        answers: {
                            create: [
                                { text: 'Vincent van Gogh', isCorrect: true },
                                { text: 'Pablo Picasso', isCorrect: false },
                                { text: 'Leonardo da Vinci', isCorrect: false },
                                { text: 'Michelangelo', isCorrect: false },
                            ],
                        },
                    },
                ],
            },
        },
    });

    return quiz;
})();
