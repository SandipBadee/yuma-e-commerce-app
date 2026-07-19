import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET, 
  // Use JWT strategy because we are using an external backend API
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: { 
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      async authorize(credentials) {
        // Use the BACKEND_URL from your environment variables
        const res = await fetch(`${process.env.BACKEND_URL}/api/auth/login`, {
          method: "POST",
          headers: { 
            "accept": "*/*",
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        const data = await res.json();

        // If backend returns 200 and has a token, authentication is successful
        if (res.ok && data.token) {
          // We return an object that contains both user info and the token
          // NextAuth will pass this object to the 'jwt' callback below
          return {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            accessToken: data.token,
          };
        }

        // Throwing an error here allows the LoginPage to display the specific backend message
        throw new Error(data.message || "Invalid credentials");
      },
    }),
  ],
  callbacks: {
    // 1. JWT Callback: Happens when the token is created or updated
    async jwt({ token, user }) {
      if (user) {
        // Save the backend's accessToken and role into the JWT cookie
        token.accessToken = user.accessToken;
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    // 2. Session Callback: Happens whenever a session is checked (e.g., useSession())
    async session({ session, token }) {
      // Make the accessToken and role available on the client-side session object
      if (session.user) {
        session.accessToken = token.accessToken;
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  // Added for extra security in production
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };