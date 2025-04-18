import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { REQUEST_STATUSES } from '@/lib/constants';
import { 
  UserRound, 
  Users,
  Drill,
  Wrench,
  FileText,
  MessageSquare,
  Eye,
  Check,
  X,
  Trash2,
  Edit
} from 'lucide-react';
import type { ServiceRequest, Technician, User, Contact } from '@shared/schema';

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Fetch all service requests
  const { data: serviceRequests, isLoading: isLoadingRequests } = useQuery<ServiceRequest[]>({
    queryKey: ['/api/service-requests/admin'],
  });

  // Fetch all technicians with user info
  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<(Technician & { user: User })[]>({
    queryKey: ['/api/technicians/admin'],
  });

  // Fetch all contacts
  const { data: contacts, isLoading: isLoadingContacts } = useQuery<Contact[]>({
    queryKey: ['/api/contacts/admin'],
  });

  // Mutation for updating service request status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await apiRequest('PATCH', `/api/service-requests/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests/admin'] });
      toast({
        title: t('common.success'),
        description: 'Status updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message || t('common.error'),
        variant: 'destructive',
      });
    },
  });

  // Mutation for marking contact as responded
  const markRespondedMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('PATCH', `/api/contacts/${id}/respond`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts/admin'] });
      toast({
        title: t('common.success'),
        description: 'Contact marked as responded',
      });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message || t('common.error'),
        variant: 'destructive',
      });
    },
  });

  // Filter service requests by status
  const filteredRequests = statusFilter && statusFilter !== 'all'
    ? serviceRequests?.filter(req => req.status === statusFilter)
    : serviceRequests;

  // Handle status change
  const handleStatusChange = (requestId: number, newStatus: string) => {
    updateStatusMutation.mutate({ id: requestId, status: newStatus });
  };

  // Handle marking contact as responded
  const handleMarkResponded = (contactId: number) => {
    markRespondedMutation.mutate(contactId);
  };

  // Get badge color based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'assigned': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('admin.dashboard')} | {t('common.appName')}</title>
      </Helmet>

      <div className="bg-neutral-50 min-h-screen py-8 fade-in">
        <div className="container mx-auto px-4">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">{t('admin.dashboard')}</CardTitle>
              <CardDescription>
                Manage service requests, technicians, and contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6 flex items-center">
                    <FileText className="h-8 w-8 text-primary mr-4" />
                    <div>
                      <p className="text-sm text-muted-foreground">Service Requests</p>
                      <p className="text-2xl font-bold">{serviceRequests?.length || 0}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 flex items-center">
                    <Drill className="h-8 w-8 text-secondary mr-4" />
                    <div>
                      <p className="text-sm text-muted-foreground">Technicians</p>
                      <p className="text-2xl font-bold">{technicians?.length || 0}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 flex items-center">
                    <MessageSquare className="h-8 w-8 text-yellow-500 mr-4" />
                    <div>
                      <p className="text-sm text-muted-foreground">Contacts</p>
                      <p className="text-2xl font-bold">{contacts?.length || 0}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 flex items-center">
                    <Users className="h-8 w-8 text-blue-500 mr-4" />
                    <div>
                      <p className="text-sm text-muted-foreground">Active Cities</p>
                      <p className="text-2xl font-bold">
                        {new Set(serviceRequests?.map(req => req.city)).size || 0}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="service-requests">
            <TabsList className="mb-6">
              <TabsTrigger value="service-requests" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                {t('admin.serviceRequests')}
              </TabsTrigger>
              <TabsTrigger value="technicians" className="flex items-center">
                <Wrench className="h-4 w-4 mr-2" />
                {t('admin.technicians')}
              </TabsTrigger>
              <TabsTrigger value="contacts" className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                {t('admin.contactMessages')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="service-requests" className="space-y-4">
              <div className="flex justify-end mb-4">
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {REQUEST_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {t(status.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Service Type</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingRequests ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : filteredRequests && filteredRequests.length > 0 ? (
                        filteredRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>{request.id}</TableCell>
                            <TableCell>{request.name}</TableCell>
                            <TableCell>{request.serviceType}</TableCell>
                            <TableCell>{request.city}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(request.status)}>
                                {t(`admin.${request.status}`)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(request.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Select
                                  defaultValue={request.status}
                                  onValueChange={(value) => handleStatusChange(request.id, value)}
                                >
                                  <SelectTrigger className="w-[120px] h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {REQUEST_STATUSES.map((status) => (
                                      <SelectItem key={status.value} value={status.value}>
                                        {t(status.labelKey)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            No service requests found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="technicians" className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Specialty</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Available</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingTechnicians ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : technicians && technicians.length > 0 ? (
                        technicians.map((technician) => (
                          <TableRow key={technician.id}>
                            <TableCell>{technician.id}</TableCell>
                            <TableCell>{technician.user.name}</TableCell>
                            <TableCell>{technician.user.city}</TableCell>
                            <TableCell>{technician.specialty}</TableCell>
                            <TableCell>
                              {technician.rating ? `${technician.rating.toFixed(1)}/5` : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {technician.available ? (
                                <Badge variant="success">Available</Badge>
                              ) : (
                                <Badge variant="secondary">Unavailable</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            No technicians found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contacts" className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingContacts ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : contacts && contacts.length > 0 ? (
                        contacts.map((contact) => (
                          <TableRow key={contact.id}>
                            <TableCell>{contact.id}</TableCell>
                            <TableCell>{contact.name}</TableCell>
                            <TableCell>{contact.email}</TableCell>
                            <TableCell>{contact.subject}</TableCell>
                            <TableCell>
                              {new Date(contact.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {contact.responded ? (
                                <Badge variant="success">Responded</Badge>
                              ) : (
                                <Badge variant="secondary">Pending</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {!contact.responded && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleMarkResponded(contact.id)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            No contact messages found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;
