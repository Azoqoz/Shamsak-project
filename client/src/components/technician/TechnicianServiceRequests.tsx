import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Technician, ServiceRequest, User } from '@shared/schema';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  User as UserIcon, 
  MapPin, 
  Wrench, 
  Home, 
  CheckCircle2, 
  Loader2,
  AlertTriangle,
  Phone
} from 'lucide-react';
import { ServiceRequestProgress } from '@/components/service-requests/ServiceRequestProgress';

interface TechnicianServiceRequestsProps {
  technician: Technician;
}

export function TechnicianServiceRequests({ technician }: TechnicianServiceRequestsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');
  const [updatingRequestId, setUpdatingRequestId] = useState<number | null>(null);
  
  // Fetch service requests for this technician
  const { data: serviceRequests, isLoading, error } = useQuery<ServiceRequest[]>({
    queryKey: [`/api/service-requests/technician/${technician.id}`],
  });
  
  // Fetch all user details we need at once
  const { data: usersData } = useQuery<User[]>({
    queryKey: ['/api/auth/users'],
    enabled: !!serviceRequests?.length,
  });
  
  // Mutation to update service request status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest('PATCH', `/api/service-requests/${id}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/service-requests/technician/${technician.id}`] });
      toast({
        title: t('common.success'),
        description: t('technician.jobUpdated'),
      });
      setUpdatingRequestId(null);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('common.error'),
      });
      setUpdatingRequestId(null);
    }
  });
  
  // Handle status update
  const handleStatusUpdate = (id: number, newStatus: string) => {
    setUpdatingRequestId(id);
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">{t('common.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium">{t('common.error')}</h3>
        <p className="text-sm text-muted-foreground mt-2">
          {t('serviceRequests.fetchError')}
        </p>
      </div>
    );
  }

  // Filter requests by status for each tab
  const pendingRequests = serviceRequests?.filter(
    req => req.status === 'pending' || req.status === 'assigned'
  ) || [];
  
  const activeRequests = serviceRequests?.filter(
    req => req.status === 'in_progress'
  ) || [];
  
  const completedRequests = serviceRequests?.filter(
    req => req.status === 'completed' || req.status === 'paid'
  ) || [];

  // Status badge color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'assigned': return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border border-purple-300';
      case 'completed': return 'bg-green-100 text-green-800 border border-green-300';
      case 'paid': return 'bg-green-100 text-green-800 border border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border border-red-300';
      default: return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };
  
  // Status icon mapping
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 mr-1" />;
      case 'assigned': return <UserIcon className="h-4 w-4 mr-1" />;
      case 'in_progress': return <Wrench className="h-4 w-4 mr-1" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4 mr-1" />;
      case 'paid': return <CheckCircle2 className="h-4 w-4 mr-1" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  // Format date
  const formatDate = (date: Date | string | null) => {
    if (!date) return t('technician.notScheduled');
    return format(new Date(date), 'PPP');
  };

  // Render each service request card
  const renderServiceCard = (request: ServiceRequest) => {
    // Get customer details from the usersData array
    const customerData = usersData?.find(user => user.id === request.userId);
    
    return (
      <Card key={request.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{request.title}</CardTitle>
            <Badge className={getStatusColor(request.status)}>
              <div className="flex items-center">
                {getStatusIcon(request.status)}
                {t(`technician.status${request.status === 'in_progress' ? 'InProgress' : request.status.charAt(0).toUpperCase() + request.status.slice(1)}`)}
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
              {/* Client info */}
              <div>
                <h4 className="text-sm font-medium mb-2">{t('technician.clientDetails')}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-2 text-neutral-500" />
                    {!usersData ? (
                      <span className="flex items-center"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> {t('common.loading')}</span>
                    ) : customerData ? (
                      <span>{customerData.name}</span>
                    ) : (
                      <span>User #{request.userId}</span>
                    )}
                  </div>
                  {customerData && customerData.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-neutral-500" />
                      <span>{customerData.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-neutral-500" />
                    <span>{request.city}, {request.address}</span>
                  </div>
                </div>
              </div>
              
              {/* Job info */}
              <div>
                <h4 className="text-sm font-medium mb-2">{t('technician.jobDetails')}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Wrench className="h-4 w-4 mr-2 text-neutral-500" />
                    <span>{t(`serviceTypes.${request.serviceType}`)}</span>
                  </div>
                  <div className="flex items-center">
                    <Home className="h-4 w-4 mr-2 text-neutral-500" />
                    <span>{t(`serviceForm.${request.propertyType}`)}</span>
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
        
        <CardFooter className="flex justify-end pt-0">
          {request.status === 'pending' && (
            <Button 
              variant="default"
              onClick={() => handleStatusUpdate(request.id, 'assigned')}
              disabled={updatingRequestId === request.id}
            >
              {updatingRequestId === request.id ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('common.loading')}</>
              ) : (
                <><UserIcon className="mr-2 h-4 w-4" /> {t('technician.acceptRequest')}</>
              )}
            </Button>
          )}
          {request.status === 'assigned' && (
            <Button 
              variant="default"
              onClick={() => handleStatusUpdate(request.id, 'in_progress')}
              disabled={updatingRequestId === request.id}
            >
              {updatingRequestId === request.id ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('common.loading')}</>
              ) : (
                <><Wrench className="mr-2 h-4 w-4" /> {t('technician.startJob')}</>
              )}
            </Button>
          )}
          {request.status === 'in_progress' && (
            <Button 
              variant="default"
              onClick={() => handleStatusUpdate(request.id, 'completed')}
              disabled={updatingRequestId === request.id}
            >
              {updatingRequestId === request.id ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('common.loading')}</>
              ) : (
                <><CheckCircle2 className="mr-2 h-4 w-4" /> {t('technician.completeJob')}</>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs 
        defaultValue="pending" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="pending" className="relative">
            {t('technician.pendingJobs')}
            {pendingRequests.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active" className="relative">
            {t('technician.activeJobs')}
            {activeRequests.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                {activeRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="relative">
            {t('technician.completedJobs')}
            {completedRequests.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                {completedRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 bg-neutral-50 rounded-lg border border-neutral-100">
              <Clock className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
              <h3 className="text-lg font-medium mb-2">{t('technician.noPendingJobs')}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t('technician.noPendingJobsDescription')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map(renderServiceCard)}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active">
          {activeRequests.length === 0 ? (
            <div className="text-center py-12 bg-neutral-50 rounded-lg border border-neutral-100">
              <Wrench className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
              <h3 className="text-lg font-medium mb-2">{t('technician.noActiveJobs')}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t('technician.noActiveJobsDescription')}
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
              <h3 className="text-lg font-medium mb-2">{t('technician.noCompletedJobs')}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t('technician.noCompletedJobsDescription')}
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