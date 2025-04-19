import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CircleCheckBig, Wrench, FileText, Clock, Calendar, MapPin, User, Mail, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ServiceRequest, Technician } from '@shared/schema';
import { format } from 'date-fns';

// Status badge component based on service request status
const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  
  const getVariant = () => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'assigned':
        return 'outline';
      case 'in_progress':
        return 'default';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'destructive';
      case 'paid':
        return 'success';
      default:
        return 'outline';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'pending':
        return t('technician.statusPending');
      case 'assigned':
        return t('technician.statusAssigned');
      case 'in_progress':
        return t('technician.statusInProgress');
      case 'completed':
        return t('technician.statusCompleted');
      case 'cancelled':
        return t('technician.statusCancelled');
      case 'paid':
        return t('technician.statusPaid');
      default:
        return status;
    }
  };

  return (
    <Badge variant={getVariant() as any}>{getLabel()}</Badge>
  );
};

// Service request details dialog component
const ServiceRequestDetailsDialog = ({ serviceRequest, userId }: { serviceRequest: ServiceRequest; userId: number }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // Define mutation for updating service request status
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest('PATCH', `/api/service-requests/${id}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/service-requests/technician/${userId}`] });
      toast({
        title: t('common.success'),
        description: t('technician.jobUpdated'),
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Function to handle status update buttons
  const handleStatusUpdate = (newStatus: string) => {
    statusMutation.mutate({ id: serviceRequest.id, status: newStatus });
  };

  // Determine which buttons to show based on current status
  const renderActionButtons = () => {
    switch (serviceRequest.status) {
      case 'pending':
        return (
          <Button onClick={() => handleStatusUpdate('assigned')} className="w-full">
            {t('technician.acceptRequest')}
          </Button>
        );
      case 'assigned':
        return (
          <Button onClick={() => handleStatusUpdate('in_progress')} className="w-full">
            {t('technician.startJob')}
          </Button>
        );
      case 'in_progress':
        return (
          <Button onClick={() => handleStatusUpdate('completed')} className="w-full">
            {t('technician.completeJob')}
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{t('technician.viewRequest')}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('technician.jobDetails')}</DialogTitle>
          <DialogDescription>{serviceRequest.title}</DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" /> {t('technician.jobType')}
              </h4>
              <p className="text-sm">{serviceRequest.serviceType}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" /> {t('technician.jobStatus')}
              </h4>
              <StatusBadge status={serviceRequest.status} />
            </div>
            
            {serviceRequest.scheduledDate && (
              <div>
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> {t('technician.jobDate')}
                </h4>
                <p className="text-sm">{format(new Date(serviceRequest.scheduledDate), 'PPP')}</p>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {t('technician.jobLocation')}
              </h4>
              <p className="text-sm">{serviceRequest.city}, {serviceRequest.address}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium">{t('technician.clientDetails')}</h4>
              <div className="mt-2 space-y-2">
                <p className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" /> {serviceRequest.userId}
                </p>
                <p className="text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4" /> client@example.com
                </p>
                <p className="text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4" /> +966 XXXXXXXX
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">{t('serviceForm.additionalDetails')}</h4>
          <p className="text-sm">{serviceRequest.description}</p>
        </div>
        
        <div className="flex justify-end mt-4">
          {renderActionButtons()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Technician Dashboard Component
const TechnicianDashboard = ({ technician }: { technician: Technician }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // Fetch service requests for the technician
  const { data: serviceRequests = [], isLoading } = useQuery<ServiceRequest[]>({
    queryKey: [`/api/service-requests/technician/${technician.id}`],
    refetchOnWindowFocus: true,
  });
  
  // Filter service requests by status
  const pendingRequests = serviceRequests.filter(req => req.status === 'pending' || req.status === 'assigned');
  const activeRequests = serviceRequests.filter(req => req.status === 'in_progress');
  const completedRequests = serviceRequests.filter(req => req.status === 'completed' || req.status === 'paid');
  
  // Calculate performance metrics
  const totalJobs = serviceRequests.length;
  const completionRate = totalJobs > 0 ? (completedRequests.length / totalJobs) * 100 : 0;
  
  // Toggle availability mutation
  const toggleAvailabilityMutation = useMutation({
    mutationFn: async (available: boolean) => {
      const res = await apiRequest('PATCH', `/api/technicians/${technician.id}`, { available });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/technicians/${technician.userId}`] });
      toast({
        title: t('common.success'),
        description: technician.available 
          ? t('technician.currentlyUnavailable') 
          : t('technician.currentlyAvailable'),
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Handle availability toggle
  const handleAvailabilityToggle = () => {
    toggleAvailabilityMutation.mutate(!technician.available);
  };
  
  // Render service request table
  const renderServiceRequestTable = (requests: ServiceRequest[]) => {
    if (requests.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">{t('technician.noRequests')}</p>
        </div>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('serviceForm.serviceType')}</TableHead>
            <TableHead>{t('technician.clientName')}</TableHead>
            <TableHead>{t('technician.jobLocation')}</TableHead>
            <TableHead>{t('technician.jobStatus')}</TableHead>
            <TableHead>{t('admin.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.serviceType}</TableCell>
              <TableCell>Client #{request.userId}</TableCell>
              <TableCell>{request.city}</TableCell>
              <TableCell>
                <StatusBadge status={request.status} />
              </TableCell>
              <TableCell>
                <ServiceRequestDetailsDialog serviceRequest={request} userId={technician.userId} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p>{t('common.loading')}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('technician.dashboard')}</CardTitle>
          <CardDescription>{t('technician.manageTasks')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start justify-between mb-6">
            {/* Availability Toggle */}
            <div className="flex items-center space-x-2">
              <Switch 
                id="availability" 
                checked={technician.available}
                onCheckedChange={handleAvailabilityToggle}
              />
              <Label htmlFor="availability" className="font-medium">
                {technician.available ? t('technicians.available') : t('technicians.unavailable')}
              </Label>
              <p className="text-sm text-muted-foreground ml-2">
                {technician.available 
                  ? t('technician.currentlyAvailable') 
                  : t('technician.currentlyUnavailable')}
              </p>
            </div>
            
            {/* Overview Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="bg-secondary/20 rounded-lg p-3 text-center min-w-[100px]">
                <p className="text-3xl font-bold">{totalJobs}</p>
                <p className="text-sm text-muted-foreground">{t('technician.totalJobs')}</p>
              </div>
              <div className="bg-secondary/20 rounded-lg p-3 text-center min-w-[100px]">
                <p className="text-3xl font-bold">{technician.rating || '-'}</p>
                <p className="text-sm text-muted-foreground">{t('technician.avgRating')}</p>
              </div>
              <div className="bg-secondary/20 rounded-lg p-3 text-center min-w-[100px]">
                <p className="text-3xl font-bold">{completionRate.toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground">{t('technician.completionRate')}</p>
              </div>
            </div>
          </div>
          
          {/* Job Tabs */}
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="upcoming">
                {t('technician.upcomingJobs')} ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="active">
                {t('technician.pendingJobs')} ({activeRequests.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                {t('technician.completedJobs')} ({completedRequests.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              {renderServiceRequestTable(pendingRequests)}
            </TabsContent>
            <TabsContent value="active">
              {renderServiceRequestTable(activeRequests)}
            </TabsContent>
            <TabsContent value="completed">
              {renderServiceRequestTable(completedRequests)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Performance Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('technician.myPerformance')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t('technician.completionRate')}</Label>
                <span>{completionRate.toFixed(0)}%</span>
              </div>
              <Progress value={completionRate} />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t('technician.avgRating')}</Label>
                <span>{technician.rating || 0}/5</span>
              </div>
              <Progress value={(technician.rating || 0) * 20} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicianDashboard;