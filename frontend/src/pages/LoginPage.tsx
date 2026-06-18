import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import useAuth from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }).min(1, { message: 'Email is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof formSchema>;

const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    try {
      await login(data.email, data.password);
      navigate('/admin/dashboard');
    } catch (error) {
      form.setError('root.serverError', {
        message: 'Invalid email or password.',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center">Way Down South - Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.formState.errors.root?.serverError && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.root.serverError.message}
                </p>
              )}
              <Button
                type="submit"
                className="w-full bg-[#d4a843] hover:bg-[#d4a843]/90"
                disabled={isLoading}
              >
                {isLoading ? 'Logging In...' : 'Log In'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;