import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { insertServiceRequestSchema, type InsertServiceRequest, type Technician, type User } from '@shared/schema';
import { SERVICE_TYPES, CITIES, PROPERTY_TYPES } from '@/lib/constants';
import { getTranslatedText, technicianNames, specialties, cities } from '@/lib/technicianTranslations';

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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, StarIcon, Drill, Clock } from 'lucide-react';

// Create a custom validation schema for the form
// This is separate from the insertServiceRequestSchema which is used for API requests
const formSchema = z.object({
  name: z.string().min(1, { message: 'serviceForm.requiredField' }),
  phone: z.string().min(1, { message: 'serviceForm.requiredField' }),
  email: z.string().min(1, { message: 'serviceForm.requiredField' }).email({ message: 'serviceForm.invalidEmail' }),
  city: z.string().min(1, { message: 'serviceForm.requiredField' }),
  propertyType: z.string().min(1, { message: 'serviceForm.requiredField' }),
  serviceType: z.string().min(1, { message: 'serviceForm.requiredField' }),
  address: z.string().optional(),
  additionalDetails: z.string().optional(),
  terms: z.boolean().refine(val => val === true, {
    message: 'serviceForm.requiredField',
  }),
});

// Define FormValues based on our custom schema
type FormValues = z.infer<typeof formSchema>;

// Helper function to render star ratings
const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<StarIcon key={`full-${i}`} className="fill-yellow-500 text-yellow-500 h-4 w-4" />);
  }

  if (hasHalfStar) {
    stars.push(
      <div key="half" className="relative">
        <StarIcon className="text-yellow-500 h-4 w-4" />
        <div className="absolute top-0 left-0 overflow-hidden w-1/2">
          <StarIcon className="fill-yellow-500 text-yellow-500 h-4 w-4" />
        </div>
      </div>
    );
  }

  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<StarIcon key={`empty-${i}`} className="text-yellow-500 h-4 w-4" />);
  }

  return stars;
};

const ServiceRequestForm = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<number | null>(null);
  const [servicePrice, setServicePrice] = useState<number | null>(null);

  // Pre-select service type from URL if available
  const searchParams = new URLSearchParams(window.location.search);
  const preSelectedService = searchParams.get('service');
  const preSelectedTechnician = searchParams.get('technician');

  // Fetch all technicians
  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<(Technician & { user: User })[]>({
    queryKey: ['/api/technicians'],
  });

  const defaultValues: Partial<FormValues> = {
    serviceType: preSelectedService || '',
    name: '',
    phone: '',
    email: '',
    city: '',
    propertyType: '',
    additionalDetails: '', // Initialize with empty string to avoid null/undefined issues
    terms: false,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Update service type when URL param changes
  useEffect(() => {
    if (preSelectedService) {
      form.setValue('serviceType', preSelectedService);
    }
  }, [preSelectedService, form]);

  // Pre-select technician if provided in URL
  useEffect(() => {
    if (preSelectedTechnician && technicians) {
      const techId = parseInt(preSelectedTechnician);
      if (!isNaN(techId)) {
        setSelectedTechnicianId(techId);
        // Get the selected technician from the array
        const tech = technicians.find(t => t.id === techId);
        if (tech && form.getValues('serviceType')) {
          updateServicePrice(tech, form.getValues('serviceType'));
        }
      }
    }
  }, [preSelectedTechnician, technicians, form]);

  // Update price when service type or technician changes
  const updateServicePrice = (technician: Technician, serviceType: string) => {
    if (!technician || !serviceType) {
      setServicePrice(null);
      return;
    }

    // Get the technician's specific price for the service type, or fallback to base price
    let price = null;
    const serviceTypeObj = SERVICE_TYPES.find(type => type.value === serviceType);
    const basePrice = serviceTypeObj?.basePrice || 0;
    
    switch (serviceType) {
      case 'installation':
        price = technician.installationPrice || basePrice;
        break;
      case 'maintenance':
        price = technician.maintenancePrice || basePrice;
        break;
      case 'assessment':
        price = technician.assessmentPrice || basePrice;
        break;
    }
    
    setServicePrice(price);
  };

  // Watch for service type changes to update price
  useEffect(() => {
    const subscription = form.watch(value => {
      if (value.serviceType && selectedTechnicianId && technicians) {
        const tech = technicians.find(t => t.id === selectedTechnicianId);
        if (tech) {
          updateServicePrice(tech, value.serviceType as string);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, selectedTechnicianId, technicians]);

  const { mutate, isPending, isSuccess, reset: resetMutation } = useMutation({
    mutationFn: async (data: InsertServiceRequest) => {
      const res = await apiRequest('POST', '/api/service-requests', data);
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests'] });
      
      // Show success message
      toast({
        title: t('common.success'),
        description: t('serviceForm.successMessage'),
      });
      
      // Redirect to checkout page with the new service request ID
      if (data && data.id) {
        setLocation(`/checkout/${data.id}`);
      } else {
        // If for some reason we don't get an ID back, reset the form
        form.reset(defaultValues);
      }
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message || t('common.error'),
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("Form submitted with data:", data);
    
    // Check if a technician is selected
    if (!selectedTechnicianId || !servicePrice) {
      toast({
        title: t('common.error'),
        description: t('serviceForm.noTechnicianSelected'),
        variant: 'destructive',
      });
      console.log("Submission blocked: No technician or price selected");
      return;
    }
    
    // Check if user is logged in
    if (!user) {
      toast({
        title: t('common.error'),
        description: t('serviceForm.loginRequired'),
        variant: 'destructive',
      });
      console.log("Submission blocked: User not logged in");
      return;
    }
    
    // Omit the terms field as it's only for UI validation
    const { terms, ...formData } = data;
    
    // Create a properly typed service request object that matches InsertServiceRequest
    const serviceRequest: InsertServiceRequest = {
      userId: user.id,
      technicianId: selectedTechnicianId,
      title: `${formData.serviceType} Service Request`,
      description: formData.additionalDetails || `Service request for ${formData.serviceType}`,
      address: formData.address || formData.city,
      city: formData.city,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      serviceType: formData.serviceType as any, // Cast to match expected enum
      propertyType: formData.propertyType as any, // Cast to match expected enum
      // Other required fields with defaults or null values
      latitude: null,
      longitude: null,
      scheduledDate: null
    };
    
    console.log("Sending service request:", serviceRequest);
    
    try {
      mutate(serviceRequest);
    } catch (error) {
      console.error("Error in mutation:", error);
      toast({
        title: t('common.error'),
        description: "Error submitting form: " + (error instanceof Error ? error.message : "Unknown error"),
        variant: 'destructive',
      });
    }
  };

  // Reset success state when user starts typing again
  useEffect(() => {
    const subscription = form.watch(() => {
      if (isSuccess) {
        resetMutation();
      }
    });
    return () => subscription.unsubscribe();
  }, [form, isSuccess, resetMutation]);

  return (
    <section id="request-service" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-neutral-800 mb-4">
              {t('serviceForm.title')}
            </h2>
            <p className="text-lg text-neutral-800">
              {t('serviceForm.subtitle')}
            </p>
          </div>
          
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(onSubmit, errors => {
                console.log("Form validation errors:", errors);
                toast({
                  title: t('common.error'),
                  description: t('serviceForm.requiredField'),
                  variant: 'destructive',
                });
              })}
              className="bg-neutral-100 p-6 md:p-8 rounded-lg shadow-md"
            >
              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <FormLabel className="font-bold">
                      {t('serviceForm.serviceType')}
                    </FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('serviceForm.serviceTypePlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SERVICE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {t(type.labelKey)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">
                        {t('serviceForm.fullName')}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel className="font-bold">
                        {t('serviceForm.phone')}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <FormLabel className="font-bold">
                      {t('serviceForm.email')}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <FormLabel className="font-bold">
                      {t('serviceForm.city')}
                    </FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('serviceForm.cityPlaceholder')} />
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
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <FormLabel className="font-bold">
                      {t('serviceForm.propertyType')}
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        {PROPERTY_TYPES.map((type) => (
                          <div key={type.value} className="flex items-center">
                            <RadioGroupItem value={type.value} id={type.value} />
                            <label htmlFor={type.value} className="ml-2">
                              {t(type.labelKey)}
                            </label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="additionalDetails"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <FormLabel className="font-bold">
                      {t('serviceForm.additionalDetails')}
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        value={field.value || ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        rows={4} 
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Technician Selection */}
              <div className="mb-6">
                <FormLabel className="font-bold block mb-3">
                  {t('serviceForm.selectTechnician')}
                </FormLabel>
                
                {isLoadingTechnicians ? (
                  <div className="space-y-3">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : !technicians || technicians.length === 0 ? (
                  <div className="text-center py-4 bg-gray-100 rounded">
                    <p>{t('serviceForm.noTechniciansAvailable')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {technicians
                      .filter(tech => tech.available)
                      .map((technician) => {
                        // Get price for the selected service type with base price fallback
                        let price = 0;
                        const serviceType = form.getValues('serviceType');
                        const serviceTypeObj = SERVICE_TYPES.find(type => type.value === serviceType);
                        const basePrice = serviceTypeObj?.basePrice || 0;
                        
                        if (serviceType === 'installation') {
                          price = technician.installationPrice || basePrice;
                        } else if (serviceType === 'maintenance') {
                          price = technician.maintenancePrice || basePrice;
                        } else if (serviceType === 'assessment') {
                          price = technician.assessmentPrice || basePrice;
                        }
                        
                        return (
                          <Card 
                            key={technician.id} 
                            className={`cursor-pointer transition-all ${
                              selectedTechnicianId === technician.id 
                                ? 'border-2 border-primary shadow-md' 
                                : 'hover:shadow-md'
                            }`}
                            onClick={() => {
                              setSelectedTechnicianId(technician.id);
                              updateServicePrice(technician, form.getValues('serviceType'));
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                  {technician.profileImage ? (
                                    <img
                                      src={technician.profileImage}
                                      alt={technician.user.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-2xl text-gray-400">
                                      {technician.user.name.charAt(0)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h3 className="font-bold">
                                        {language === 'ar' 
                                          ? getTranslatedText(technician.user.name, technicianNames) 
                                          : technician.user.name}
                                      </h3>
                                      <p className="text-sm text-neutral-600">
                                        {language === 'ar' 
                                          ? getTranslatedText(technician.user.city, cities) 
                                          : technician.user.city}
                                      </p>
                                      <div className="flex items-center mt-1">
                                        <div className="flex mr-1">
                                          {renderStars(technician.rating || 0)}
                                        </div>
                                        <span className="text-xs">
                                          ({technician.reviewCount || 0})
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        <Badge variant="outline" className="flex items-center text-xs">
                                          <Drill className="h-3 w-3 mr-1" />
                                          {language === 'ar' 
                                            ? getTranslatedText(technician.specialty, specialties) 
                                            : technician.specialty}
                                        </Badge>
                                        <Badge variant="outline" className="flex items-center text-xs">
                                          <Clock className="h-3 w-3 mr-1" />
                                          {language === 'ar' 
                                            ? `${technician.experience} ${t('technicians.yearsExperience')}` 
                                            : `${technician.experience} ${t('technicians.yearsExperience')}`}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bold text-primary text-lg">
                                        {price} SAR
                                      </div>
                                      <div className="text-xs text-neutral-600">
                                        {t('serviceForm.priceLabel')}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                )}
                
                {/* Show the selected service price if a technician is selected */}
                {selectedTechnicianId && servicePrice && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{t('serviceForm.totalPrice')}</span>
                      </div>
                      <div className="font-bold text-xl">
                        {servicePrice} SAR
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="mb-6 flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm">
                        {t('serviceForm.terms')}
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              {isSuccess && (
                <Alert className="mb-6 bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-600">
                    {t('serviceForm.successMessage')}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button
                type="submit"
                className="w-full bg-primary text-white font-bold py-3 px-6"
                disabled={isPending || !selectedTechnicianId || !servicePrice}
              >
                {isPending ? t('common.loading') : `${t('serviceForm.bookNow')} - ${t('serviceForm.totalPrice')}: ${servicePrice || 0} SAR`}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
};

export default ServiceRequestForm;
