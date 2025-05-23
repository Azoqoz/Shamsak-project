import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Technician, User, ServiceRequest } from '@shared/schema';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, CreditCard, Clock, DollarSign, AlertCircle } from 'lucide-react';

// Try to load Stripe if public key is available
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) 
  : null;

// Create Stripe payment form component
const StripePaymentForm = ({ 
  clientSecret, 
  onSuccess, 
  onError 
}: { 
  clientSecret: string; 
  onSuccess: () => void; 
  onError: (error: any) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { t } = useTranslation();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setIsProcessing(true);
    
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: 'if_required'
    });
    
    if (result.error) {
      setIsProcessing(false);
      onError(result.error);
    } else {
      onSuccess();
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement className="mb-6" />
      <Button 
        type="submit" 
        className="w-full py-6 text-lg"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            {t('checkout.processing')}
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            {t('checkout.confirmPayment')}
          </>
        )}
      </Button>
    </form>
  );
};

const CheckoutPage = () => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [useStripeElements, setUseStripeElements] = useState(false);

  // Fetch service request details
  const { data: serviceRequest, isLoading: isLoadingRequest, error } = useQuery<ServiceRequest>({
    queryKey: ['/api/service-requests', id],
    retry: false,
  });

  // Fetch technician details if available
  const { data: technician, isLoading: isLoadingTechnician } = useQuery<Technician & { user: User }>({
    queryKey: ['/api/technicians', serviceRequest?.technicianId],
    enabled: !!serviceRequest?.technicianId,
    retry: false,
  });

  // Create payment intent mutation
  const { mutate: createPaymentIntent, isPending: isCreatingIntent } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/service-requests/${id}/create-payment-intent`);
      return res.json();
    },
    onSuccess: (data) => {
      // If we have a client secret and Stripe is loaded, use Stripe Elements
      if (data.clientSecret && stripePromise) {
        setClientSecret(data.clientSecret);
        setUseStripeElements(true);
      } else {
        // Otherwise fall back to simulated payment
        simulatePayment();
      }
    },
    onError: (error) => {
      toast({
        title: t('checkout.paymentIntentError'),
        description: error.message || t('common.error'),
        variant: 'destructive',
      });
    },
  });

  // Update payment status mutation
  const { mutate: updatePaymentStatus, isPending: isUpdatingPayment } = useMutation({
    mutationFn: async (paymentIntentId?: string) => {
      const paymentData = {
        isPaid: true,
        paymentIntentId: paymentIntentId || `pi_${Date.now()}` // Use real payment intent ID if available
      };
      const res = await apiRequest('PATCH', `/api/service-requests/${id}/payment`, paymentData);
      return res.json();
    },
    onSuccess: () => {
      setPaymentSuccess(true);
      setUseStripeElements(false);
      setClientSecret(null);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests', id] });
      
      toast({
        title: t('checkout.paymentSuccess'),
        description: t('checkout.paymentSuccessDescription'),
      });
    },
    onError: (error) => {
      toast({
        title: t('checkout.paymentError'),
        description: error.message || t('common.error'),
        variant: 'destructive',
      });
      setIsPaymentProcessing(false);
      setUseStripeElements(false);
      setClientSecret(null);
    },
  });

  // Simulate a payment process
  const simulatePayment = () => {
    setIsPaymentProcessing(true);
    
    // Simulate payment processing delay
    setTimeout(() => {
      updatePaymentStatus(undefined);
    }, 2000);
  };

  // Handle Stripe payment success
  const handleStripePaymentSuccess = () => {
    // Real payment successful through Stripe
    updatePaymentStatus(clientSecret?.split('_secret_')[0]); // Extract payment intent ID from client secret
  };

  // Handle Stripe payment error
  const handleStripePaymentError = (error: any) => {
    toast({
      title: t('checkout.paymentError'),
      description: error.message || t('common.error'),
      variant: 'destructive',
    });
    setUseStripeElements(false);
    setClientSecret(null);
  };

  // Handle payment button click
  const handlePayNow = () => {
    createPaymentIntent();
  };

  if (isLoadingRequest) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-12 w-3/4 mb-6" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error || !serviceRequest) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-4">{t('checkout.serviceNotFound')}</h1>
          <p className="mb-6">{t('checkout.invalidRequest')}</p>
          <Button onClick={() => setLocation('/')}>
            {t('common.backHome')}
          </Button>
        </div>
      </div>
    );
  }

  // Calculate formatted price
  const formattedPrice = serviceRequest.price ? `${serviceRequest.price} SAR` : 'N/A';

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          {paymentSuccess ? t('checkout.paymentComplete') : t('checkout.checkout')}
        </h1>

        {paymentSuccess ? (
          <Alert className="mb-8 bg-green-50 border-green-200">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <AlertDescription className="text-green-600 font-medium">
              {t('checkout.bookingConfirmed')}
            </AlertDescription>
          </Alert>
        ) : serviceRequest.isPaid ? (
          <Alert className="mb-8 bg-green-50 border-green-200">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <AlertDescription className="text-green-600 font-medium">
              {t('checkout.alreadyPaid')}
            </AlertDescription>
          </Alert>
        ) : null}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('checkout.orderSummary')}</CardTitle>
            <CardDescription>{t('checkout.bookingDetails')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">{t('serviceForm.serviceType')}:</span>
                <Badge variant="outline">
                  {t(`serviceType.${serviceRequest.serviceType}`)}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">{t('checkout.bookingId')}:</span>
                <span className="text-neutral-600">{serviceRequest.id}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">{t('checkout.bookingDate')}:</span>
                <span className="text-neutral-600">
                  {typeof serviceRequest.createdAt === 'string' ? 
                    new Date(serviceRequest.createdAt).toLocaleDateString() : 
                    serviceRequest.createdAt instanceof Date ? 
                      serviceRequest.createdAt.toLocaleDateString() : 
                      '-'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">{t('serviceForm.city')}:</span>
                <span className="text-neutral-600">{serviceRequest.city}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">{t('serviceForm.propertyType')}:</span>
                <span className="text-neutral-600">
                  {t(`propertyType.${serviceRequest.propertyType}`)}
                </span>
              </div>
              
              <Separator />
              
              {isLoadingTechnician ? (
                <Skeleton className="h-16 w-full" />
              ) : technician ? (
                <div className="flex justify-between items-center py-2">
                  <div>
                    <span className="font-medium">{t('checkout.technician')}:</span>
                    <div className="text-neutral-600">{technician.user.name}</div>
                    <div className="text-sm text-neutral-500">{technician.specialty}</div>
                  </div>
                  <div className="flex items-center text-primary">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{technician.experience}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2 text-neutral-500">
                  {t('checkout.noTechnicianAssigned')}
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between items-center font-bold">
                <span>{t('checkout.total')}:</span>
                <span className="text-xl text-primary">{formattedPrice}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {!serviceRequest.isPaid && !paymentSuccess ? (
              useStripeElements && clientSecret && stripePromise ? (
                // Render Stripe payment form if Elements is available
                <div className="w-full">
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <StripePaymentForm
                      clientSecret={clientSecret}
                      onSuccess={handleStripePaymentSuccess}
                      onError={handleStripePaymentError}
                    />
                  </Elements>
                </div>
              ) : (
                // Fallback to simple payment button
                <Button 
                  onClick={handlePayNow} 
                  className="w-full py-6 text-lg"
                  disabled={isCreatingIntent || isPaymentProcessing || isUpdatingPayment}
                >
                  {isCreatingIntent || isPaymentProcessing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      {t('checkout.processing')}
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      {t('checkout.payNow')} - {formattedPrice}
                    </>
                  )}
                </Button>
              )
            ) : (
              <div className="flex gap-4 w-full">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setLocation('/')}
                >
                  {t('common.backHome')}
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => setLocation('/service-request')}
                >
                  {t('checkout.bookAnother')}
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
        
        <div className="text-center text-sm text-neutral-500">
          <p className="mb-2">{t('checkout.securePayment')}</p>
          <div className="flex justify-center gap-2">
            <DollarSign className="h-4 w-4" />
            <CreditCard className="h-4 w-4" />
          </div>
        </div>
        
        {!stripePromise && !serviceRequest.isPaid && !paymentSuccess && (
          <Alert className="mt-4 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <AlertDescription className="text-yellow-600">
              {t('checkout.stripePublicKeyMissing')}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;