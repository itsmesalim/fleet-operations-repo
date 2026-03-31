// Register page component
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MailCheck, UserPlus, Truck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

// Validation schema
const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['Admin', 'Manager', 'Operator']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Registration page for new users
 */
export function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'Operator',
    },
  });

  /**
   * Handle registration form submission
   */
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    const result = await signUp(
      data.email,
      data.password,
      data.fullName,
      data.role
    );

    if (result.error) {
      if (result.error.message.includes('over_email_send_rate_limit')) {
        setError(
          'Supabase email limit exceed ho gayi hai. Thori dair baad dobara try karein, ya Supabase dashboard me email confirmation temporarily off kar dein.'
        );
      } else {
        setError(
          result.error.message === 'Email address "uorg@gmail.com" is invalid'
            ? 'Email field me hidden space ya invalid formatting aa rahi hai. Email dobara manually type karein aur browser autofill hata kar try karein.'
            : result.error.message || 'Failed to create account. Please try again.'
        );
      }
      setIsLoading(false);
      return;
    }

    if (result.requiresEmailConfirmation) {
      setSuccessMessage(
        'Account create request bhej di gayi hai. Agar project me email confirmation on hai to pehle inbox se confirm karein, phir login karein.'
      );
      setIsLoading(false);
      return;
    }

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md" padding="lg">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white mb-4">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Join the fleet management system
          </p>
        </div>

        {/* Registration form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-start gap-2">
                <MailCheck className="w-4 h-4 mt-0.5 text-emerald-700 dark:text-emerald-300" />
                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                  {successMessage}
                </p>
              </div>
            </div>
          )}

          <Input
            {...register('fullName')}
            label="Full Name"
            placeholder="John Doe"
            error={errors.fullName?.message}
          />

          <Input
            {...register('email')}
            type="email"
            label="Email Address"
            placeholder="you@company.com"
            error={errors.email?.message}
          />

          <Select
            {...register('role')}
            label="Role"
            error={errors.role?.message}
            options={[
              { value: 'Operator', label: 'Operator' },
              { value: 'Manager', label: 'Manager' },
              { value: 'Admin', label: 'Admin' },
            ]}
          />

          <Input
            {...register('password')}
            type="password"
            label="Password"
            placeholder="********"
            error={errors.password?.message}
          />

          <Input
            {...register('confirmPassword')}
            type="password"
            label="Confirm Password"
            placeholder="********"
            error={errors.confirmPassword?.message}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              'Creating account...'
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Create Account
              </>
            )}
          </Button>
        </form>

        {/* Sign in link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}
