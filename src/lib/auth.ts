import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const demoEmail = process.env.AUTH_DEMO_EMAIL || 'demo@vlooo.ai';
const demoPassword = process.env.AUTH_DEMO_PASSWORD || 'demo1234';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        if (credentials.email === demoEmail && credentials.password === demoPassword) {
          return {
            id: 'demo-user',
            name: 'Vlooo Demo',
            email: demoEmail,
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
