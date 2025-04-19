import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { Technician, ServiceRequest } from '@shared/schema';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  ClipboardList, 
  MapPin,
  PhoneCall,
  User,
  XCircle,
  LoaderCircle,
  Wrench,
} from 'lucide-react';

// Service request details dialog component
const ServiceRequestDetailsDialog = ({ serviceRequest, userId, technicianId }: { 
  serviceRequest: ServiceRequest; 
  userId: number;
  technicianId: number;
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Mutation to update service request status
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      setIsUpdating(true);
      const res = await apiRequest(
        'PATCH',
        `/api/service-requests/${serviceRequest.id}/status`,
        { status: newStatus }
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests/technician', technicianId] });
      toast({
        title: t('common.success'),
        description: t('technician.jobUpdated'),
      });
      setIsUpdating(false);
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message || t('common.error'),
      });
      setIsUpdating(false);
    },
  });

  // Handler for updating status
  const handleStatusUpdate = (newStatus: string) => {
    updateStatusMutation.mutate(newStatus);
  };

  // Get display status based on the status code
  const getStatusDisplay = (status: string) => {
    return t(`technician.status${status.charAt(0).toUpperCase() + status.slice(1)}`);
  };

  // Determine which actions to show based on current status
  const renderStatusActions = (status: string) => {
    switch (status) {
      case 'assigned':
        return (
          <Button 
            onClick={() => handleStatusUpdate('in_progress')}
            disabled={isUpdating}
          >
            {isUpdating ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Wrench className="mr-2 h-4 w-4" />}
            {t('technician.startJob')}
          </Button>
        );
      case 'in_progress':
        return (
          <Button 
            onClick={() => handleStatusUpdate('completed')}
            disabled={isUpdating}
          >
            {isUpdating ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            {t('technician.completeJob')}
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{serviceRequest.title}</DialogTitle>
        <DialogDescription>
          {t('serviceForm.serviceType')}: {t(`serviceForm.${serviceRequest.serviceType}`)}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium">{t('profile.client')}</h4>
            <p className="text-sm flex items-center">
              <User className="h-4 w-4 mr-2 text-neutral-500" />
              {t('serviceRequests.clientId')}: {serviceRequest.userId}
            </p>
            <p className="text-sm flex items-center">
              <PhoneCall className="h-4 w-4 mr-2 text-neutral-500" />
              {t('common.contactDetails')}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium">{t('profile.location')}</h4>
            <p className="text-sm flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-neutral-500" />
              {serviceRequest.city}, {serviceRequest.address}
            </p>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium">{t('serviceForm.additionalDetails')}</h4>
          <p className="text-sm mt-1">{serviceRequest.description}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium">{t('checkout.status')}</h4>
          <Badge className="mt-1">
            {getStatusDisplay(serviceRequest.status)}
          </Badge>
        </div>
        
        <div>
          <h4 className="text-sm font-medium">{t('checkout.bookingDate')}</h4>
          <p className="text-sm flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-neutral-500" />
            {new Date(serviceRequest.scheduledDate || serviceRequest.createdAt || '').toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <DialogFooter>
        {renderStatusActions(serviceRequest.status)}
      </DialogFooter>
    </DialogContent>
  );
};

// Main TechnicianDashboard component
const TechnicianDashboard = ({ technician }: { technician: Technician }) => {
  const { t } = useTranslation();
  const { direction } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);

  // Fetch service requests for this technician
  const { 
    data: serviceRequests, 
    isLoading: serviceRequestsLoading,
    error: serviceRequestsError,
    refetch: refetchServiceRequests
  } = useQuery<ServiceRequest[]>({
    queryKey: [`/api/service-requests/technician/${technician.id}`],
    retry: 2,
    retryDelay: 1000
  });

  // Mutation to update technician availability
  const updateAvailabilityMutation = useMutation({
    mutationFn: async (available: boolean) => {
      setIsUpdatingAvailability(true);
      const res = await apiRequest(
        'PATCH', 
        `/api/technicians/${technician.id}/availability`, 
        { available }
      );
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData([`/api/technicians/user/${technician.userId}`], data);
      toast({
        title: t('common.success'),
        description: data.available 
          ? t('technician.availabilityOn') 
          : t('technician.availabilityOff'),
      });
      setIsUpdatingAvailability(false);
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message || t('common.error'),
      });
      setIsUpdatingAvailability(false);
    },
  });

  // Filter service requests by status with proper typing
  const pendingJobs = Array.isArray(serviceRequests) 
    ? serviceRequests.filter((req: ServiceRequest) => req.status === 'assigned') 
    : [];
  const activeJobs = Array.isArray(serviceRequests) 
    ? serviceRequests.filter((req: ServiceRequest) => req.status === 'in_progress') 
    : [];
  const completedJobs = Array.isArray(serviceRequests) 
    ? serviceRequests.filter((req: ServiceRequest) => ['completed', 'paid'].includes(req.status)) 
    : [];

  // Toggle technician availability
  const handleAvailabilityToggle = () => {
    updateAvailabilityMutation.mutate(!technician.available);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('technician.dashboard')}</CardTitle>
          <CardDescription>{t('technician.manageTasks')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium mb-1">{t('technicians.availability')}</h3>
              <p className="text-sm text-neutral-500">
                {technician.available 
                  ? t('technician.currentlyAvailable')
                  : t('technician.currentlyUnavailable')}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                checked={technician.available} 
                onCheckedChange={handleAvailabilityToggle}
                disabled={isUpdatingAvailability}
              />
              <span className="font-medium text-sm">
                {technician.available ? t('technicians.available') : t('technicians.unavailable')}
              </span>
            </div>
          </div>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" className="relative">
                {t('technician.pendingJobs')}
                {pendingJobs.length > 0 && (
                  <Badge 
                    className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 h-5 w-5 p-0 flex items-center justify-center rounded-full"
                    variant="destructive"
                  >
                    {pendingJobs.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="active" className="relative">
                {t('technician.activeJobs')}
                {activeJobs.length > 0 && (
                  <Badge 
                    className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 h-5 w-5 p-0 flex items-center justify-center rounded-full"
                    variant="default"
                  >
                    {activeJobs.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">
                {t('technician.completedJobs')}
              </TabsTrigger>
            </TabsList>

            {serviceRequestsLoading ? (
              <div className="py-8 text-center">
                <LoaderCircle className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p>{t('common.loading')}</p>
              </div>
            ) : serviceRequestsError ? (
              <div className="py-8 text-center space-y-4">
                <div className="text-destructive">
                  <XCircle className="h-8 w-8 mx-auto mb-4" />
                  <p>{t('common.error')}</p>
                  <p className="text-sm mt-2 max-w-md mx-auto">
                    {serviceRequestsError instanceof Error 
                      ? serviceRequestsError.message.includes("Invalid service request ID")
                        ? "No service requests found for your account. You'll see requests here once you're assigned to jobs."
                        : serviceRequestsError.message
                      : t('serviceRequests.fetchError')}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => refetchServiceRequests()}
                  className="mx-auto"
                >
                  <LoaderCircle className="mr-2 h-4 w-4" />
                  {t('common.retry')}
                </Button>
              </div>
            ) : (
              <>
                {/* Pending Jobs Tab */}
                <TabsContent value="pending">
                  <ScrollArea className="h-[400px]">
                    {pendingJobs.length === 0 ? (
                      <div className="py-8 text-center text-neutral-500">
                        <ClipboardList className="h-8 w-8 mx-auto mb-4 text-neutral-400" />
                        <p>{t('technician.noPendingJobs')}</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('serviceForm.serviceType')}</TableHead>
                            <TableHead>{t('profile.client')}</TableHead>
                            <TableHead>{t('profile.location')}</TableHead>
                            <TableHead>{t('technician.date')}</TableHead>
                            <TableHead>{t('common.actions')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingJobs.map((job: ServiceRequest) => (
                            <TableRow key={job.id}>
                              <TableCell>
                                {t(`serviceForm.${job.serviceType}`)}
                              </TableCell>
                              <TableCell>{t('serviceRequests.clientId')}: {job.userId}</TableCell>
                              <TableCell>{job.city}</TableCell>
                              <TableCell>
                                {new Date(job.scheduledDate || job.createdAt || '').toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      {t('serviceRequests.viewDetails')}
                                    </Button>
                                  </DialogTrigger>
                                  <ServiceRequestDetailsDialog 
                                    serviceRequest={job} 
                                    userId={technician.userId} 
                                    technicianId={technician.id}
                                  />
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </ScrollArea>
                </TabsContent>

                {/* Active Jobs Tab */}
                <TabsContent value="active">
                  <ScrollArea className="h-[400px]">
                    {activeJobs.length === 0 ? (
                      <div className="py-8 text-center text-neutral-500">
                        <Wrench className="h-8 w-8 mx-auto mb-4 text-neutral-400" />
                        <p>{t('technician.noActiveJobs')}</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('serviceForm.serviceType')}</TableHead>
                            <TableHead>{t('profile.client')}</TableHead>
                            <TableHead>{t('profile.location')}</TableHead>
                            <TableHead>{t('technician.startedOn')}</TableHead>
                            <TableHead>{t('common.actions')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeJobs.map((job: ServiceRequest) => (
                            <TableRow key={job.id}>
                              <TableCell>
                                {t(`serviceForm.${job.serviceType}`)}
                              </TableCell>
                              <TableCell>{t("serviceRequests.clientId")}: {job.userId}</TableCell>
                              <TableCell>{job.city}</TableCell>
                              <TableCell>
                                {new Date(job.updatedAt || job.createdAt || '').toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      {t('serviceRequests.viewDetails')}
                                    </Button>
                                  </DialogTrigger>
                                  <ServiceRequestDetailsDialog 
                                    serviceRequest={job} 
                                    userId={technician.userId} 
                                    technicianId={technician.id}
                                  />
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </ScrollArea>
                </TabsContent>

                {/* Completed Jobs Tab */}
                <TabsContent value="completed">
                  <ScrollArea className="h-[400px]">
                    {completedJobs.length === 0 ? (
                      <div className="py-8 text-center text-neutral-500">
                        <CheckCircle className="h-8 w-8 mx-auto mb-4 text-neutral-400" />
                        <p>{t('technician.noCompletedJobs')}</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('serviceForm.serviceType')}</TableHead>
                            <TableHead>{t('profile.client')}</TableHead>
                            <TableHead>{t('profile.location')}</TableHead>
                            <TableHead>{t('technician.completedOn')}</TableHead>
                            <TableHead>{t('checkout.paymentStatus')}</TableHead>
                            <TableHead>{t('common.actions')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {completedJobs.map((job: ServiceRequest) => (
                            <TableRow key={job.id}>
                              <TableCell>
                                {t(`serviceForm.${job.serviceType}`)}
                              </TableCell>
                              <TableCell>{t("serviceRequests.clientId")}: {job.userId}</TableCell>
                              <TableCell>{job.city}</TableCell>
                              <TableCell>
                                {new Date(job.updatedAt || job.createdAt || '').toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge variant={job.status === 'paid' ? 'success' : 'outline'}>
                                  {job.status === 'paid' ? t('checkout.paid') : t('checkout.pending')}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      {t('serviceRequests.viewDetails')}
                                    </Button>
                                  </DialogTrigger>
                                  <ServiceRequestDetailsDialog 
                                    serviceRequest={job} 
                                    userId={technician.userId}
                                    technicianId={technician.id}
                                  />
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </ScrollArea>
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicianDashboard;