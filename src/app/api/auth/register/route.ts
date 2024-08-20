// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { hash } from 'bcrypt-ts';
// import { z } from 'zod';

// export async function POST(req: NextRequest) {
//   try {
//     const { email, password, name } = await req.json();

//     if (!email || !password || !name) {
//       return NextResponse.json(
//         { error: 'Nome, E-mail e senha são obrigátorios' },
//         { status: 400 }
//       );
//     }

//     // Check if the user already exists
//     const existingUser = await prisma.user.findUnique({ where: { email } });

//     if (existingUser) {
//       return NextResponse.json(
//         { error: 'Usuário já existente' },
//         { status: 409 }
//       );
//     }

//     // Define validation schema
//     const credentialsSchema = z.object({
//       email: z.string().email("O email deve ser válido.").trim(),
//       password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres.").trim(),
//       name: z
//         .string()
//         .trim()
//         .regex(/^[A-Za-z\s]+$/, "O nome não deve conter números."),
//     });

//     const parsedCredentials = credentialsSchema.safeParse({
//       email,
//       password,
//       name,
//     });

//     if (!parsedCredentials.success) {
//       const errorMessages = parsedCredentials.error.errors.map((error) => {
//         return { field: error.path[0], message: error.message };
//       });

//       console.error("Validation errors:", errorMessages);
//       return NextResponse.json({ errors: errorMessages }, { status: 400 });
//     }

//     // Hash the password and create a new user
//     const hashedPassword = await hash(password, 10);
    
//     const user = await prisma.user.create({
//       data: {
//         name,
//         email,
//         password: hashedPassword,
//       },
//     });

//     return NextResponse.json(
//       { user },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error('Registration error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';
import { ObjectId } from 'bson';
import { prisma } from '@/lib/prisma'; // Certifique-se de que o caminho está correto

export async function GET(req: NextRequest) {
  try {
    const userId = new ObjectId().toString(); // Gera um ObjectId válido
    const email = 'email_variavel@exemplo.com'; // Substitua pela string variável de email
    console.log('Generated userId:', userId);

    // Verificar se o email já existe
    let user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      // Criar um novo usuário se o email não existir
      user = await prisma.user.create({
        data: {
          id: userId,
          email: email,
          // Adicione outros campos necessários aqui
        },
      });
    }
    // Serializar o userId em um cookie
    const cookie = serialize('userId', user.id, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 semana
    });

    // Usar um ObjectID válido para o quizId
    const quizId = '66c4b9e94a0ae7caa7e47126'; // ID fixo para o quiz

    // Verificar se o quiz existe
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId }
    });

    if (!quiz) {
      throw new Error('Quiz not found.');
    }

    // Verificar se uma sessão de quiz já existe para o usuário e quizId
    let quizSession = await prisma.quizSession.findFirst({
      where: {
        userId: user.id,
        quizId: quizId,
      },
    });

    if (!quizSession) {
      // Criar uma nova sessão de quiz se não existir
      quizSession = await prisma.quizSession.create({
        data: {
          userId: user.id,
          quizId: quizId,
          currentQuestionIndex: 0,
          progress: 0,
          isCompleted: false,
        },
      });
    }

    const response = NextResponse.json({
      message: 'User ID registered in cookies',
      userId: user.id,
      user,
      quizSession,
    });
    response.headers.set('Set-Cookie', cookie);
    return response;
  } catch (error) {
    console.error('Error creating user or quiz session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export function OPTIONS() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}