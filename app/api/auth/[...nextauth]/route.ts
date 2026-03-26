import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Hard gate: only ADMIN_EMAIL env var is allowed — never role-based
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) { console.error("ADMIN_EMAIL not set"); return null; }
        if (credentials.email !== adminEmail) return null;

        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user?.password) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return { id: user._id.toString(), email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = (user as any).id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).id = token.id;
      return session;
    },
  },
  pages:   { signIn: "/admin", error: "/admin?error=true" },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  secret:  process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
