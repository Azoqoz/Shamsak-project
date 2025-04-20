import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { StarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { CITIES } from '@/lib/constants';
import type { Technician, User } from '@shared/schema';
import { getTranslatedText, technicianNames, specialties, technicianBios } from '@/lib/technicianTranslations';
import TechnicianCard from '@/components/technician/TechnicianCard';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const TechniciansPage = () => {
  const { t } = useTranslation();
  const { direction, language } = useLanguage();
  const { toast } = useToast();
  const [cityFilter, setCityFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: technicians, isLoading, error } = useQuery<(Technician & { user: User })[]>({
    queryKey: ['/api/technicians'],
  });

  // Filter technicians based on selected city and search query
  const filteredTechnicians = technicians?.filter(technician => {
    const matchesCity = cityFilter && cityFilter !== 'all' ? technician.user.city === cityFilter : true;
    const matchesSearch = searchQuery 
      ? technician.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        technician.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        technician.bio.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCity && matchesSearch;
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

  return (
    <>
      <Helmet>
        <title>{t('technicians.title')} | {t('common.appName')}</title>
        <meta 
          name="description" 
          content={t('technicians.subtitle')} 
        />
      </Helmet>

      <div className="bg-neutral-100 py-16 fade-in">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-neutral-800 mb-4">
              {t('technicians.title')}
            </h1>
            <p className="text-lg text-neutral-800 max-w-2xl mx-auto">
              {t('technicians.subtitle')}
            </p>
          </div>

          <div className="mb-8 flex flex-col md:flex-row justify-between gap-4">
            <div className="w-full md:w-1/3">
              <Input
                placeholder={`${t('common.search')}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-1/3">
              <Select 
                value={cityFilter} 
                onValueChange={setCityFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('serviceForm.cityPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('serviceForm.cityPlaceholder')}
                  </SelectItem>
                  {CITIES.map((city) => (
                    <SelectItem key={city.value} value={city.value}>
                      {t(city.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-center mb-4">
                    <Skeleton className="w-24 h-24 rounded-full" />
                  </div>
                  <div className="text-center">
                    <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                    <Skeleton className="h-4 w-1/2 mx-auto mb-3" />
                    <div className="flex justify-center mb-3">
                      <Skeleton className="h-4 w-1/4 mx-auto" />
                    </div>
                    <Skeleton className="h-12 w-5/6 mx-auto mb-4" />
                    <Skeleton className="h-6 w-1/3 mx-auto" />
                  </div>
                </div>
              ))
            ) : filteredTechnicians && filteredTechnicians.length > 0 ? (
              filteredTechnicians.map((technician) => (
                <TechnicianCard 
                  key={technician.id} 
                  technician={technician} 
                  variant="large"
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-lg text-gray-500">
                  {cityFilter 
                    ? t('technicians.noTechniciansInCity', { city: t(`serviceForm.${cityFilter}`) }) 
                    : t('technicians.noTechniciansAvailable')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TechniciansPage;
