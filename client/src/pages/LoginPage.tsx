import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
  const { login, user } = useAuth();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'technician') {
        navigate('/technician/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (data: FormValues) => {
    setLoginError('');
    setIsPending(true);
    
    try {
      const user = await login(data.username, data.password);
      
      toast({
        title: t('common.success'),
        description: t('login.successMessage'),
      });
      
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'technician') {
        navigate('/technician/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error instanceof Error ? error.message : t('login.error'));
    } finally {
      setIsPending(false);
    }
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
                {t('login.subtitle')}
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
                {t('login.noAccount')} <Link href="/register"><Button variant="link" className="p-0 h-auto">{t('login.register')}</Button></Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
