'use client';

import { AuthForm } from "@/components/auth/auth-form";
import { registerUser } from "@/lib/api/auth";
import { routes } from "@/lib/routes/web";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = async (email: string, password: string) => {
    try {
      const { user, error } = await registerUser(email, password);
      if (error) {
        console.error('Error registering:', error);
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
        onSubmit={handleRegister}
        title="Register"
        buttonText="Sign Up"
      />
    </div>
  );
}
