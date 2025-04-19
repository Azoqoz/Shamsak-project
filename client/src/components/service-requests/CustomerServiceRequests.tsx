import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ServiceRequest, User } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ServiceRequestProgress } from '@/components/service-requests/ServiceRequestProgress';
import {
  Calendar,
  Clock,
  Home,
  Loader2,
  MapPin,
  User as UserIcon,
  Wrench,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface CustomerServiceRequestsProps {
  userId: number;
}

export function CustomerServiceRequests({ userId }: CustomerServiceRequestsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');

  // Fetch service requests for the current user
  const {
    data: serviceRequests,
    isLoading,
    error,
    refetch,
  } = useQuery<ServiceRequest[]>({
    queryKey: [`/api/service-requests/user/${userId}`],
    enabled: !!userId,
  });

  // Fetch all technicians to get their names
  const { data: technicians } = useQuery<any[]>({
    queryKey: ['/api/technicians'],
    enabled: !!serviceRequests?.length,
  });

  // Handle error state
  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('serviceRequests.fetchError'),
      });
    }
  }, [error, toast, t]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">{t('common.error')}</h3>
        <p className="text-muted-foreground mb-4">{t('serviceRequests.fetchError')}</p>
        <Button onClick={() => refetch()} variant="outline">
          <Loader2 className="mr-2 h-4 w-4" />
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  if (!serviceRequests || serviceRequests.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">{t('serviceRequests.noRequests')}</h3>
          <p className="text-muted-foreground">{t('serviceRequests.noRequestsDescription')}</p>
        </CardContent>
      </Card>
    );
  }

  // Filter service requests based on active tab
  const allRequests = serviceRequests;
  const activeRequests = serviceRequests.filter(
    req => ['pending', 'assigned', 'in_progress'].includes(req.status)
  );
  const completedRequests = serviceRequests.filter(
    req => ['completed', 'paid'].includes(req.status)
  );

  // Find technician name by ID
  const getTechnicianName = (technicianId: number | null): string => {
    if (!technicianId || !technicians) return t('checkout.noTechnicianAssigned');
    const technician = technicians.find(t => t.id === technicianId);
    return technician?.user?.name || `Technician #${technicianId}`;
  };

  // Get color for status badge
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'in_progress':
        return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100';
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  // Service request card component
  const renderServiceCard = (request: ServiceRequest) => {
    return (
      <Card key={request.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{request.title}</CardTitle>
            <Badge className={getStatusColor(request.status)}>
              <div className="flex items-center">
                {t(`serviceRequests.${request.status}`)}
              </div>
            </Badge>
          </div>
          <CardDescription>
            {t('technician.date')}: {formatDate(request.createdAt)}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Service details */}
              <div>
                <h4 className="text-sm font-medium mb-2">{t('serviceRequests.serviceDetails')}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Wrench className="h-4 w-4 mr-2 text-neutral-500" />
                    <span>{t(`serviceTypes.${request.serviceType}`)}</span>
                  </div>
                  <div className="flex items-center">
                    <Home className="h-4 w-4 mr-2 text-neutral-500" />
                    <span>{t(`serviceForm.${request.propertyType}`)}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-neutral-500" />
                    <span>{request.city}, {request.address}</span>
                  </div>
                </div>
              </div>
              
              {/* Technician info */}
              <div>
                <h4 className="text-sm font-medium mb-2">{t('serviceRequests.technicianDetails')}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-2 text-neutral-500" />
                    <span>{getTechnicianName(request.technicianId)}</span>
                  </div>
                  {request.scheduledDate && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-neutral-500" />
                      <span>{formatDate(request.scheduledDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Progress tracker */}
            <ServiceRequestProgress status={request.status} />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs 
        defaultValue="all" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="all" className="relative">
            {t('serviceRequests.allRequests')}
            {allRequests.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                {allRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active" className="relative">
            {t('serviceRequests.activeRequests')}
            {activeRequests.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                {activeRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="relative">
            {t('serviceRequests.completedRequests')}
            {completedRequests.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                {completedRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {allRequests.length === 0 ? (
            <div className="text-center py-12 bg-neutral-50 rounded-lg border border-neutral-100">
              <Clock className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
              <h3 className="text-lg font-medium mb-2">{t('serviceRequests.noRequests')}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t('serviceRequests.noRequestsDescription')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {allRequests.map(renderServiceCard)}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active">
          {activeRequests.length === 0 ? (
            <div className="text-center py-12 bg-neutral-50 rounded-lg border border-neutral-100">
              <Wrench className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
              <h3 className="text-lg font-medium mb-2">{t('serviceRequests.noActiveRequests')}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t('serviceRequests.noActiveRequestsDescription')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeRequests.map(renderServiceCard)}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {completedRequests.length === 0 ? (
            <div className="text-center py-12 bg-neutral-50 rounded-lg border border-neutral-100">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
              <h3 className="text-lg font-medium mb-2">{t('serviceRequests.noCompletedRequests')}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t('serviceRequests.noCompletedRequestsDescription')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedRequests.map(renderServiceCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}