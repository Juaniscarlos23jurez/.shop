'use client';

import { RegisterForm, RegisterFormValues } from "@/components/auth/register-form";
import { registerUser } from "@/lib/api/auth";
import { routes } from "@/lib/routes/web";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = async ({ name, email, password, password_confirmation, phone }: RegisterFormValues) => {
    try {
      const { user, error } = await registerUser(
        name,
        email,
        password,
        password_confirmation,
        phone
      );
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
      <RegisterForm onSubmit={handleRegister} />
    </div>
  );
}
