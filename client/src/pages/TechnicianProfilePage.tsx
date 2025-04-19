import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar, Mail, MapPin, Phone, Star, StarIcon, Award, Drill, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { FaSolarPanel, FaTools, FaClipboardCheck } from 'react-icons/fa';
import type { Technician, User } from '@shared/schema';
import ReviewsSection from '@/components/technician/ReviewsSection';

const TechnicianProfilePage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { direction } = useLanguage();
  const params = useParams();
  const id = params?.id || '0';
  const technicianId = parseInt(id);

  // Fetch technician data
  const {
    data: technician,
    isLoading,
    error,
  } = useQuery<Technician & { user: User }>({
    queryKey: [`/api/technicians/${technicianId}`],
    enabled: !!technicianId && !isNaN(technicianId),
  });

  if (error) {
    toast({
      title: t('common.error'),
      description: error instanceof Error ? error.message : t('common.error'),
      variant: 'destructive',
    });
  }

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={`full-${i}`} className="fill-yellow-500 text-yellow-500 h-5 w-5" />);
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className="text-yellow-500 h-5 w-5" />
          <div className="absolute top-0 left-0 overflow-hidden w-1/2">
            <StarIcon className="fill-yellow-500 text-yellow-500 h-5 w-5" />
          </div>
        </div>
      );
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<StarIcon key={`empty-${i}`} className="text-yellow-500 h-5 w-5" />);
    }

    return stars;
  };

  if (isLoading) {
    return (
      <div className="bg-neutral-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3 flex justify-center">
                  <Skeleton className="w-48 h-48 rounded-full" />
                </div>
                <div className="md:w-2/3">
                  <Skeleton className="h-12 w-3/4 mb-4" />
                  <Skeleton className="h-6 w-1/2 mb-2" />
                  <Skeleton className="h-6 w-1/3 mb-4" />
                  <Skeleton className="h-24 w-full mb-6" />
                  <Skeleton className="h-10 w-40" />
                </div>
              </div>
              <div className="mt-12">
                <Skeleton className="h-12 w-full mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!technician) {
    return (
      <div className="bg-neutral-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('technicians.notFound')}</h1>
          <p className="mb-6">{t('technicians.technicianNotFoundMessage')}</p>
          <Link href="/technicians">
            <Button variant="secondary">{t('technicians.backToTechnicians')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const services = [
    {
      icon: <FaSolarPanel className="text-2xl" />,
      titleKey: 'services.installTitle',
      descriptionKey: 'services.installDesc',
    },
    {
      icon: <FaTools className="text-2xl" />,
      titleKey: 'services.maintenanceTitle',
      descriptionKey: 'services.maintenanceDesc',
    },
    {
      icon: <FaClipboardCheck className="text-2xl" />,
      titleKey: 'services.assessmentTitle',
      descriptionKey: 'services.assessmentDesc',
    },
  ];

  return (
    <>
      <Helmet>
        <title>
          {technician.user.name} | {t('common.appName')}
        </title>
        <meta name="description" content={technician.bio} />
      </Helmet>

      <div className="bg-neutral-50 py-16 fade-in">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3 flex justify-center">
                  <div className="relative">
                    <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {technician.profileImage ? (
                        <img
                          src={technician.profileImage}
                          alt={technician.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-7xl text-gray-400">{technician.user.name.charAt(0)}</span>
                      )}
                    </div>

                  </div>
                </div>
                <div className="md:w-2/3">
                  <div className="mb-2">
                    <h1 className="text-3xl font-bold">{technician.user.name}</h1>
                  </div>
                  <div className="flex items-center mb-2">
                    <MapPin className={`h-4 w-4 text-black ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                    <span>{technician.user.city}</span>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className={`flex text-accent ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`}>{renderStars(technician.rating || 0)}</div>
                    <span className="text-sm text-neutral-800">
                      {technician.rating
                        ? `${technician.rating.toFixed(1)} (${technician.reviewCount} ${t('technicians.reviews')})`
                        : 'New'}
                    </span>
                  </div>
                  <p className="mb-6">{technician.bio}</p>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Badge variant="outline" className="flex items-center">
                      <Drill className={`h-3 w-3 ${direction === 'rtl' ? 'ml-1' : 'mr-1'}`} />
                      {technician.specialty}
                    </Badge>
                    <Badge variant="outline" className="flex items-center">
                      <Award className={`h-3 w-3 ${direction === 'rtl' ? 'ml-1' : 'mr-1'}`} />
                      {technician.certifications}
                    </Badge>
                    <Badge variant="outline" className="flex items-center">
                      <Clock className={`h-3 w-3 ${direction === 'rtl' ? 'ml-1' : 'mr-1'}`} />
                      {technician.experience} {t('technicians.years')}
                    </Badge>
                  </div>
                  <Link href={`/request-service?technician=${technician.id}`}>
                    <Button className="bg-primary text-white">
                      {t('services.requestService')}
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="mt-12">
                <Tabs defaultValue="services">
                  <TabsList className="mb-6">
                    <TabsTrigger value="services">{t('navigation.services')}</TabsTrigger>
                    <TabsTrigger value="reviews">{t('technicians.reviews')}</TabsTrigger>
                    <TabsTrigger value="contact">{t('navigation.contact')}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="services">
                    <h2 className="text-2xl font-bold mb-6">{t('services.title')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {services.map((service, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="bg-black bg-opacity-10 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                              <div className="text-black text-2xl">
                                {service.icon}
                              </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">{t(service.titleKey)}</h3>
                            <p className="text-neutral-800 mb-4">{t(service.descriptionKey)}</p>
                            <Link
                              href={`/request-service?service=${service.titleKey}&technician=${technician.id}`}
                              className="text-black hover:underline flex items-center font-medium"
                            >
                              {t('services.requestService')}
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews">
                    <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
                    <ReviewsSection technician={technician} />
                  </TabsContent>

                  <TabsContent value="contact">
                    <h2 className="text-2xl font-bold mb-6">{t('contact.title')}</h2>
                    <div className="bg-neutral-100 p-6 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="flex items-start">
                          <Phone className={`text-black mt-1 h-5 w-5 ${direction === 'rtl' ? 'ml-3' : 'mr-3'}`} />
                          <div>
                            <h3 className="font-bold mb-1">{t('contact.phoneTitle')}</h3>
                            <p>{technician.user.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Mail className={`text-black mt-1 h-5 w-5 ${direction === 'rtl' ? 'ml-3' : 'mr-3'}`} />
                          <div>
                            <h3 className="font-bold mb-1">{t('contact.emailTitle')}</h3>
                            <p>{technician.user.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6">
                        <Link href={`/request-service?technician=${technician.id}`}>
                          <Button className="bg-primary text-white">
                            {t('services.requestService')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TechnicianProfilePage;
