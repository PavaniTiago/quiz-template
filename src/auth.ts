import NextAuth, { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { z } from 'zod'
import { prisma } from './lib/prisma'
import { compare } from 'bcrypt-ts'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { serialize, parse } from 'cookie'
import { v4 as uuidv4 } from 'uuid'

// Função para recuperar um usuário pelo email
async function getUser(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    return user
  } catch (error) {
    console.error('Database error:', error)
    throw new Error('Internal server error')
  }
}

// Função para registrar o ID do usuário nos cookies
function registerUserIdInCookies(userId: string) {
  const existingCookie = parse(document.cookie)
  if (existingCookie.userId) {
    // ID do usuário já existe nos cookies
    return
  }

  const cookie = serialize('userId', userId, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 1 semana
  })

  document.cookie = cookie

  console.log('cookies:', cookie);
}

// Função para registrar o sessionId nos cookies
function registerSessionIdInCookies(sessionId: string) {
  const cookie = serialize('sessionId', sessionId, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 1 semana
  })

  document.cookie = cookie

  console.log('sessionId cookie:', cookie);
}

// Função para ler os cookies no frontend
function getCookies() {
  const cookies = parse(document.cookie || '');
  const userId = cookies.userId;
  const sessionId = cookies.sessionId;

  console.log('User ID:', userId);
  console.log('Session ID:', sessionId);

  return { userId, sessionId };
}

// Configuração do NextAuth
export const config: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/', // Redirecionar para a página de login
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnQuizPage = nextUrl.pathname.startsWith('/')
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')

      if (isOnQuizPage) {
        console.log('quiz page')
        // Permitir acesso ao quiz mesmo se não estiver totalmente autenticado
        return true
      } else if (isOnDashboard && isLoggedIn) {
        // Permitir acesso ao dashboard apenas se estiver totalmente autenticado
        return true
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }
      return false // Redirecionar usuários não autenticados
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      console.log('session')
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
    async signIn({ user }) {
      // Autenticação progressiva: verificar se o usuário precisa ser totalmente autenticado
      const existingUser = await getUser(user.email!)
      if (!existingUser) {
        // Registrar novo usuário se ele não existir
        await prisma.user.create({
          data: {
            email: user.email!,
            password: null, // A senha será adicionada após a autenticação completa
          },
        })
      }

      console.log('Registering user ID in cookies:', user.id);
      // Registrar o ID do usuário nos cookies
      if (user.id) {
        registerUserIdInCookies(user.id);
      }

      // Gerar e registrar o sessionId nos cookies
      const sessionId = uuidv4();
      registerSessionIdInCookies(sessionId);

      return true
    },
    async redirect({ url, baseUrl }) {
      // Redirecionar para o quiz ou dashboard dependendo do estado
      if (url === baseUrl) {
        return `${baseUrl}/quiz`
      }
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      return baseUrl
    },
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error('Missing credentials')
        }

        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string() })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const user = await getUser(email)

          // Simular verificação de senha (certifique-se de ter senhas hashadas no seu BD)
          if (user?.password) {
            const passwordsMatch = await compare(password, user.password)
            if (passwordsMatch) {
              return user
            }
          }
        }

        console.log('Invalid credentials')
        return null
      },
    }),
  ],
}

export const { auth, signIn, signOut, handlers } = NextAuth(config);

// Verificar os cookies quando o usuário acessa a URL "/"
if (typeof window !== 'undefined' && window.location.pathname === '/') {
  getCookies();
}