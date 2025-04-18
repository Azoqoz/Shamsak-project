import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const formSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof formSchema>;

const LoginPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [loginError, setLoginError] = useState<string>('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest('POST', '/api/auth/login', data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: t('common.success'),
        description: 'Successfully logged in',
      });
      
      // Redirect based on user role
      if (data.role === 'admin') {
        navigate('/admin');
      } else if (data.role === 'technician') {
        navigate('/technician/dashboard');
      } else {
        navigate('/');
      }
    },
    onError: (error) => {
      setLoginError(error.message || t('login.error'));
    },
  });

  const onSubmit = (data: FormValues) => {
    setLoginError('');
    mutate(data);
  };

  return (
    <>
      <Helmet>
        <title>{t('login.title')} | {t('common.appName')}</title>
      </Helmet>

      <div className="min-h-[80vh] flex items-center justify-center bg-neutral-50 py-16 fade-in">
        <div className="w-full max-w-md p-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t('login.title')}</CardTitle>
              <CardDescription>
                Sign in to your Shamsak account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loginError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('login.username')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>{t('login.password')}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isPending}
                  >
                    {isPending ? t('common.loading') : t('login.submit')}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button variant="link" className="text-sm">
                {t('login.forgotPassword')}
              </Button>
              <div className="text-sm text-center">
                {t('login.noAccount')} <Button variant="link" className="p-0 h-auto">{t('login.register')}</Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
