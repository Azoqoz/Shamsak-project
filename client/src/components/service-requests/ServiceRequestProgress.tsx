import { useTranslation } from 'react-i18next';
import { CheckCircle, Circle } from 'lucide-react';

interface ServiceRequestProgressProps {
  status: string;
}

export function ServiceRequestProgress({ status }: ServiceRequestProgressProps) {
  const { t } = useTranslation();
  
  // Define our progress steps
  const steps = [
    { key: 'pending', label: t('serviceProgress.pending') },
    { key: 'assigned', label: t('serviceProgress.assigned') },
    { key: 'in_progress', label: t('serviceProgress.inProgress') },
    { key: 'completed', label: t('serviceProgress.completed') }
  ];
  
  // Map status to numerical progress
  const getProgressIndex = (status: string) => {
    switch (status) {
      case 'pending': return 0;
      case 'assigned': return 1;
      case 'in_progress': return 2;
      case 'completed': return 3;
      case 'paid': return 3; // Paid is also considered completed in progress display
      case 'cancelled': return -1; // Special case
      default: return 0;
    }
  };
  
  const currentStepIndex = getProgressIndex(status);
  
  // For cancelled requests, show a special state
  if (status === 'cancelled') {
    return (
      <div className="p-4 bg-red-50 rounded-lg text-center">
        <p className="text-red-800 font-medium">
          {t('serviceProgress.cancelled')}
        </p>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div key={step.key} className="flex flex-col items-center">
            <div className={`
              h-8 w-8 rounded-full flex items-center justify-center 
              ${index <= currentStepIndex ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-500'}
            `}>
              {index < currentStepIndex ? (
                <CheckCircle className="h-5 w-5" />
              ) : index === currentStepIndex ? (
                <div className="h-2 w-2 bg-white rounded-full" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </div>
            <div className="mt-2 text-xs text-center">
              {step.label}
            </div>
          </div>
        ))}
      </div>
      
      {/* Progress bar */}
      <div className="mt-4 relative">
        <div className="h-1 bg-neutral-200 w-full rounded-full">
          <div 
            className="h-1 bg-primary rounded-full"
            style={{ 
              width: `${currentStepIndex / (steps.length - 1) * 100}%`,
              transition: 'width 0.5s ease' 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}