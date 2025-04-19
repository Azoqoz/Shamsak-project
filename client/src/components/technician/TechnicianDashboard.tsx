import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Technician, User } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { TechnicianServiceRequests } from './TechnicianServiceRequests';
import { 
  UserIcon, 
  Briefcase, 
  Calendar, 
  Star, 
  BarChart, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';

interface TechnicianDashboardProps {
  userId: number;
}

export function TechnicianDashboard({ userId }: TechnicianDashboardProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('serviceRequests');

  // Fetch technician data
  const { data: technician, isLoading, error } = useQuery<Technician & { user: User }>({
    queryKey: [`/api/technicians/user/${userId}`],
  });

  // Update availability mutation
  const availabilityMutation = useMutation({
    mutationFn: async (available: boolean) => {
      if (!technician) return;
      const res = await apiRequest('PATCH', `/api/technicians/${technician.id}`, {
        available
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: [`/api/technicians/user/${userId}`] });
      toast({
        title: t('common.success'),
        description: technician?.available 
          ? t('technician.availabilityOff') 
          : t('technician.availabilityOn'),
      });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Toggle availability
  const toggleAvailability = () => {
    if (technician) {
      availabilityMutation.mutate(!technician.available);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">{t('common.loading')}</span>
      </div>
    );
  }

  if (error || !technician) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <h3 className="text-lg font-medium text-red-800">{t('common.error')}</h3>
        <p className="text-sm text-red-600 mt-2">
          {error instanceof Error ? error.message : t('common.error')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('technician.dashboard')}</h1>
          <p className="text-muted-foreground">{t('technician.manageTasks')}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            checked={technician.available}
            onCheckedChange={toggleAvailability}
            disabled={availabilityMutation.isPending}
          />
          <span>
            {technician.available ? t('technician.currentlyAvailable') : t('technician.currentlyUnavailable')}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Availability status card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t('technician.availability')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {technician.available ? (
                <>
                  <Badge className="bg-green-100 text-green-800 mr-2">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {t('technicians.available')}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {t('technician.currentlyAvailable')}
                  </span>
                </>
              ) : (
                <>
                  <Badge className="bg-red-100 text-red-800 mr-2">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {t('technicians.unavailable')}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {t('technician.currentlyUnavailable')}
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Rating card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t('technician.rating')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="flex items-center mr-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-lg font-bold ml-1">{technician.rating || 0}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {technician.reviewCount || 0} {t('technicians.reviews')}
              </span>
            </div>
          </CardContent>
        </Card>
        
        {/* Experience card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t('technicians.experience')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 text-neutral-500 mr-2" />
              <span>{technician.experience}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full md:w-1/2">
          <TabsTrigger value="serviceRequests">
            {t('technician.serviceRequests')}
          </TabsTrigger>
          <TabsTrigger value="performance">
            {t('technician.myPerformance')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="serviceRequests" className="pt-4">
          <TechnicianServiceRequests technician={technician} />
        </TabsContent>
        
        <TabsContent value="performance" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('technician.monthlyStats')}</CardTitle>
              <CardDescription>{t('profile.title')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">{t('technician.totalJobs')}</span>
                  <span className="text-2xl font-bold">0</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">{t('technician.completionRate')}</span>
                  <span className="text-2xl font-bold">0%</span>
                </div>
              </div>
              
              {/* Placeholder for future charts */}
              <div className="h-64 bg-neutral-100 rounded-md mt-4 flex items-center justify-center">
                <BarChart className="h-12 w-12 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}