import { API } from "@/services";
import NextAuth from "next-auth/next";
import Credentials from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { type: "text" },
        password: { type: "text" },
        phone_number: { type: "text" },
      },
      //   authorize function
      async authorize(credentials) {
        try {
          // call the backend api
          const response = await API.post("/login", {
            email: credentials?.email,
            password: credentials?.password,
            phone_number: credentials?.password,
          });

          return response.data as any;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  // callbacks
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.access_token = (user as any).access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.access_token = token.access_token as any;
      }

      return session;
    },
  },

  pages: {
    signIn: "/",
    newUser: "/sign-up",
  },
});

export { handler as GET, handler as POST };
