'use client';

import { AuthForm } from "@/components/auth/auth-form";
import { loginUser } from "@/lib/api/auth";
import { routes } from "@/lib/routes/web";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    try {
      const { user, error } = await loginUser(email, password);
      if (error) {
        console.error('Error logging in:', error);
        return;
      }
      router.push(routes.dashboard);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <AuthForm
        onSubmit={handleLogin}
        title="Login"
        buttonText="Sign In"
      />
    </div>
  );
}
