import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { CITIES } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { LoaderCircle, UserCircle, Phone, Mail, MapPin, CheckCircle, LockKeyhole, LayoutDashboard } from 'lucide-react';
import TechnicianDashboard from '@/components/technician/TechnicianDashboard';
import { Technician } from '@shared/schema';

// Component to fetch technician data and render dashboard
const TechnicianDashboardLoader = ({ userId }: { userId: number }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // Fetch technician data by user ID
  const { data: technician, isLoading, error, refetch } = useQuery<Technician & { user: any }>({
    queryKey: [`/api/technicians/user/${userId}`],
    retry: 2,
    retryDelay: 1000,
  });
  
  // If there's an error, set up a retry button
  const handleRetry = () => {
    refetch();
    toast({
      title: t('common.retrying'),
      description: t('common.fetchingData'),
    });
  };
  
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <LoaderCircle className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p>{t('common.loading')}</p>
      </div>
    );
  }
  
  if (error || !technician) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {error instanceof Error 
              ? error.message 
              : t('common.error')}
          </AlertDescription>
        </Alert>
        <div className="text-center">
          <Button onClick={handleRetry} variant="outline">
            <LoaderCircle className="mr-2 h-4 w-4" />
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }
  
  return <TechnicianDashboard technician={technician} />;
};

// Schema for profile update form
const profileFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+996\s\d{2}\s\d{3}\s\d{3}$/, 'Phone number must be in the format +996 51 234 567'),
  city: z.string().min(1, 'City is required'),
  address: z.string().optional(),
});

// Schema for password change form
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const ProfilePage = () => {
  const { t } = useTranslation();
  const { direction } = useLanguage();
  const { user, loading: isLoading, updateProfile, changePassword } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [profileUpdateError, setProfileUpdateError] = useState<string>('');
  const [passwordUpdateError, setPasswordUpdateError] = useState<string>('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      city: user?.city || '',
      address: user?.address || '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Update profile form when user data changes
  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        address: user.address || '',
      });
    }
  }, [user, profileForm]);

  const onProfileSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    
    setProfileUpdateError('');
    setIsUpdatingProfile(true);
    
    try {
      await updateProfile(user.id, data);
      toast({
        title: t('common.success'),
        description: t('profile.profileUpdated'),
      });
    } catch (error) {
      console.error('Profile update error:', error);
      setProfileUpdateError(error instanceof Error ? error.message : t('common.error'));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    if (!user) return;
    
    setPasswordUpdateError('');
    setIsChangingPassword(true);
    
    try {
      await changePassword(
        user.id,
        data.currentPassword,
        data.newPassword
      );
      
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      toast({
        title: t('common.success'),
        description: t('profile.passwordChanged'),
      });
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordUpdateError(error instanceof Error ? error.message : t('common.error'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: t('profile.notLoggedIn')
      });
      setLocation('/login');
    }
  }, [isLoading, user, setLocation, toast, t]);
  
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('profile.title')} | {t('common.appName')}</title>
      </Helmet>

      <div className="bg-neutral-50 py-16 fade-in">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                {t('profile.title')}
              </h1>
              <p className="text-neutral-600">
                {t('profile.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* User info sidebar */}
              <div className="md:col-span-1">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                        {user.profileImage ? (
                          <img 
                            src={user.profileImage} 
                            alt={user.name} 
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <UserCircle className="w-20 h-20 text-primary" />
                        )}
                      </div>
                      <h2 className="text-xl font-bold">{user.name}</h2>
                      <div className="text-sm text-neutral-600 w-full space-y-2">
                        <div className="flex items-center">
                          <Mail className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                          <span>{user.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                          <span>{user.city}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main content */}
              <div className="md:col-span-3">
                <Tabs 
                  defaultValue={user.role === 'technician' ? 'dashboard' : 'profile'} 
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className={`grid w-full ${user.role === 'technician' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    {user.role === 'technician' && (
                      <TabsTrigger value="dashboard">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        {t('technician.dashboard')}
                      </TabsTrigger>
                    )}
                    <TabsTrigger value="profile">
                      {t('profile.profileInfo')}
                    </TabsTrigger>
                    <TabsTrigger value="security">
                      {t('profile.security')}
                    </TabsTrigger>
                  </TabsList>

                  {/* Profile information tab */}
                  <TabsContent value="profile">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('profile.profileInfo')}</CardTitle>
                        <CardDescription>{t('profile.updateProfileDesc')}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {profileUpdateError && (
                          <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{profileUpdateError}</AlertDescription>
                          </Alert>
                        )}

                        <Form {...profileForm}>
                          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                            <FormField
                              control={profileForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('profile.name')}</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={profileForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('profile.email')}</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={profileForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('profile.phone')}</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      placeholder="+966 51 234 567"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    {t('profile.phoneFormat')}
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={profileForm.control}
                                name="city"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t('profile.city')}</FormLabel>
                                    <Select
                                      value={field.value}
                                      onValueChange={field.onChange}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={t('profile.selectCity')} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {CITIES.map((city) => (
                                          <SelectItem key={city.value} value={city.value}>
                                            {t(city.labelKey)}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={profileForm.control}
                                name="address"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t('profile.address')}</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <Button
                              type="submit"
                              className="w-full md:w-auto"
                              disabled={isUpdatingProfile}
                            >
                              {isUpdatingProfile ? (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="mr-2 h-4 w-4" />
                              )}
                              {t('profile.updateProfile')}
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Security tab */}
                  {/* Technician Dashboard Tab */}
                  {user.role === 'technician' && (
                    <TabsContent value="dashboard">
                      {/* Fetch technician data */}
                      <TechnicianDashboardLoader userId={user.id} />
                    </TabsContent>
                  )}

                  <TabsContent value="security">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('profile.security')}</CardTitle>
                        <CardDescription>{t('profile.changePasswordDesc')}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {passwordUpdateError && (
                          <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{passwordUpdateError}</AlertDescription>
                          </Alert>
                        )}

                        <Form {...passwordForm}>
                          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                            <FormField
                              control={passwordForm.control}
                              name="currentPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('profile.currentPassword')}</FormLabel>
                                  <FormControl>
                                    <Input type="password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={passwordForm.control}
                              name="newPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('profile.newPassword')}</FormLabel>
                                  <FormControl>
                                    <Input type="password" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    {t('profile.passwordRequirements')}
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={passwordForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('profile.confirmPassword')}</FormLabel>
                                  <FormControl>
                                    <Input type="password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <Button
                              type="submit"
                              className="w-full md:w-auto"
                              disabled={isChangingPassword}
                            >
                              {isChangingPassword ? (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <LockKeyhole className="mr-2 h-4 w-4" />
                              )}
                              {t('profile.changePassword')}
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;