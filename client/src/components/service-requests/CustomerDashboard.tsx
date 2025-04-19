import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { CustomerServiceRequests } from './CustomerServiceRequests';

interface CustomerDashboardProps {
  userId: number;
}

export function CustomerDashboard({ userId }: CustomerDashboardProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // We use this as a placeholder to check if the user exists
  // But we'll directly use userId in the CustomerServiceRequests component
  const { isLoading, error, refetch } = useQuery({
    queryKey: [`/api/auth/user`], 
    retry: 1,
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
  
  if (error) {
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
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('serviceRequests.customerDashboard')}</h2>
      <p className="text-muted-foreground">{t('serviceRequests.trackServiceRequests')}</p>
      
      <CustomerServiceRequests userId={userId} />
    </div>
  );
}