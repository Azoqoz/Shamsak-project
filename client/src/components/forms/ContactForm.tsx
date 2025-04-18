import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { insertContactSchema, type InsertContact } from '@shared/schema';

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

// Extend the schema with validation
const extendedSchema = insertContactSchema.extend({
  email: z.string().email({ message: 'serviceForm.invalidEmail' }),
});

type FormValues = z.infer<typeof extendedSchema>;

const ContactForm = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const defaultValues: FormValues = {
    name: '',
    email: '',
    subject: '',
    message: '',
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(extendedSchema),
    defaultValues,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: InsertContact) => {
      const res = await apiRequest('POST', '/api/contacts', data);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
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
    mutate(data);
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="bg-neutral-100 p-6 rounded-lg shadow-md"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel className="font-bold">
                {t('contact.name')}
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
          name="email"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel className="font-bold">
                {t('contact.email')}
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
          name="subject"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel className="font-bold">
                {t('contact.subject')}
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
          name="message"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel className="font-bold">
                {t('contact.message')}
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
        
        <Button
          type="submit"
          className="w-full bg-primary text-white font-bold py-3 px-6"
          disabled={isPending}
        >
          {isPending ? t('common.loading') : t('contact.sendMessage')}
        </Button>
      </form>
    </Form>
  );
};

export default ContactForm;
