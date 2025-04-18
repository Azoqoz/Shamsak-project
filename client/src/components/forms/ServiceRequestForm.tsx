import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { insertServiceRequestSchema, type InsertServiceRequest } from '@shared/schema';
import { SERVICE_TYPES, CITIES, PROPERTY_TYPES } from '@/lib/constants';

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
import { CheckCircle2 } from 'lucide-react';

// Extend the schema with validation
const extendedSchema = insertServiceRequestSchema.extend({
  email: z.string().email({ message: 'serviceForm.invalidEmail' }),
  terms: z.boolean().refine(val => val === true, {
    message: 'serviceForm.requiredField',
  }),
});

type FormValues = z.infer<typeof extendedSchema>;

const ServiceRequestForm = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  // Pre-select service type from URL if available
  const searchParams = new URLSearchParams(window.location.search);
  const preSelectedService = searchParams.get('service');

  const defaultValues: Partial<FormValues> = {
    serviceType: preSelectedService || '',
    name: '',
    phone: '',
    email: '',
    city: '',
    propertyType: '',
    additionalDetails: '',
    terms: false,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(extendedSchema),
    defaultValues,
  });

  // Update service type when URL param changes
  useEffect(() => {
    if (preSelectedService) {
      form.setValue('serviceType', preSelectedService);
    }
  }, [preSelectedService, form]);

  const { mutate, isPending, isSuccess, reset: resetMutation } = useMutation({
    mutationFn: async (data: InsertServiceRequest) => {
      const res = await apiRequest('POST', '/api/service-requests', data);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests'] });
      toast({
        title: t('common.success'),
        description: t('serviceForm.successMessage'),
      });
      // Reset form after successful submission
      form.reset(defaultValues);
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
    // Omit the terms field as it's only for UI validation
    const { terms, ...requestData } = data;
    mutate(requestData);
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
              onSubmit={form.handleSubmit(onSubmit)} 
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
                        {...field} 
                        rows={4} 
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                disabled={isPending}
              >
                {isPending ? t('common.loading') : t('serviceForm.submitRequest')}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
};

export default ServiceRequestForm;
