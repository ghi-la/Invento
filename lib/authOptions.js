import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongodb";
import User from "@/lib/models/User";

const providers = [
  CredentialsProvider({
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Enter your email and password.");
      }
      await dbConnect();
      const user = await User.findOne({ email: credentials.email.toLowerCase().trim() }).select(
        "+passwordHash"
      );
      if (!user || !user.passwordHash) {
        throw new Error("No account found with that email.");
      }
      const valid = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!valid) {
        throw new Error("Incorrect password.");
      }
      return { id: user._id.toString(), name: user.name, email: user.email, image: user.image };
    },
  }),
];

export const authOptions = {
  providers,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/warehouses",
  },
  callbacks: {
    async jwt({ token, user }) {
      await dbConnect();
      const dbUser = await User.findOne({ email: (user?.email || token.email || "").toLowerCase() });
      if (dbUser) {
        token.id = dbUser._id.toString();
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.picture = dbUser.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
