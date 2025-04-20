import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CustomerServiceRequests } from './CustomerServiceRequests';

interface CustomerDashboardProps {
  userId: number;
}

export function CustomerDashboard({ userId }: CustomerDashboardProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // We won't use the separate query since we're already using the useAuth hook
  // This simplifies our code and reduces chances of authentication errors
  
  // If there's no user or user ID doesn't match, don't display anything
  if (!user || user.id !== userId) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {t('common.notAuthenticated')}
          </AlertDescription>
        </Alert>
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