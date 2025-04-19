import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { insertUserSchema } from '@shared/schema';

import {
  Form,
  FormControl,
  FormDescription,
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
import { CITIES } from '@/lib/constants';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

// Extend the insert user schema to include password confirmation
const extendedSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof extendedSchema>;

const RegisterPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [registerError, setRegisterError] = useState<string>('');
  const { register, user } = useAuth();

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
    resolver: zodResolver(extendedSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      role: 'user',
      name: '',
      email: '',
      phone: '',
      city: '',
    },
  });

  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (data: FormValues) => {
    setRegisterError('');
    setIsPending(true);
    
    try {
      // Remove confirmPassword as it's not needed in the API call
      const { confirmPassword, ...userData } = data;
      
      await register(userData);
      
      toast({
        title: t('common.success'),
        description: t('register.successMessage'),
      });
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      setRegisterError(error instanceof Error ? error.message : t('register.error'));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Register | {t('common.appName')}</title>
      </Helmet>

      <div className="min-h-[80vh] flex items-center justify-center bg-neutral-50 py-16 fade-in">
        <div className="w-full max-w-md p-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t('register.title')}</CardTitle>
              <CardDescription>
                {t('register.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {registerError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{registerError}</AlertDescription>
                </Alert>
              )}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.fullName')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('register.fullName')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.username')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('register.username')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.email')}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={t('register.email')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.phone')}</FormLabel>
                        <FormControl>
                          <Input placeholder="+996 51 234 567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.city')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('register.cityPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CITIES.map((city) => (
                              <SelectItem key={city.value} value={city.value}>{t(city.labelKey)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.password')}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={t('register.password')} {...field} />
                        </FormControl>
                        <FormDescription>
                          {t('register.passwordRequirements')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.confirmPassword')}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={t('register.confirmPassword')} {...field} />
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
                    {isPending ? t('register.creatingAccount') : t('register.register')}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="text-center">
              <div className="w-full text-sm">
                {t('register.alreadyHaveAccount')} <Link href="/login" className="text-primary font-medium">{t('register.login')}</Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;