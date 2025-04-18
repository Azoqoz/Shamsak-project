import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { StarIcon } from 'lucide-react';
import type { Technician, User } from '@shared/schema';

const TechniciansSection = () => {
  const { t } = useTranslation();

  const { data: technicians, isLoading } = useQuery<(Technician & { user: User })[]>({
    queryKey: ['/api/technicians/featured'],
  });

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
    <section id="technicians" className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-800 mb-4">
            {t('technicians.title')}
          </h2>
          <p className="text-lg text-neutral-800 max-w-2xl mx-auto">
            {t('technicians.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-gray-300"></div>
                </div>
                <div className="text-center">
                  <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto mb-3"></div>
                  <div className="flex justify-center mb-3">
                    <div className="h-4 bg-gray-300 rounded w-1/4 mx-auto"></div>
                  </div>
                  <div className="h-12 bg-gray-300 rounded w-5/6 mx-auto mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/3 mx-auto"></div>
                </div>
              </div>
            ))
          ) : technicians && technicians.length > 0 ? (
            technicians.map((technician) => (
              <div key={technician.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="mb-4 relative">
                  <div className="w-24 h-24 rounded-full mx-auto bg-gray-200 flex items-center justify-center overflow-hidden">
                    {technician.profileImage ? (
                      <img 
                        src={technician.profileImage} 
                        alt={technician.user.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          // Replace with first letter of name
                          target.style.display = 'none';
                          target.parentElement?.querySelector('.fallback-initial')?.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <span className="text-4xl text-gray-400 font-bold">
                        {technician.user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="fallback-initial hidden text-4xl text-gray-400 font-bold">
                      {technician.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute bottom-0 right-1/2 transform translate-x-12 bg-yellow-500 text-xs text-neutral-800 px-2 py-1 rounded-full">
                    <span>{t('technicians.certified')}</span>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-1">{technician.user.name}</h3>
                  <p className="text-primary mb-2">{technician.user.city}</p>
                  <div className="flex justify-center mb-3">
                    <div className="flex text-accent">
                      {renderStars(technician.rating || 0)}
                    </div>
                    <span className="text-sm text-neutral-800 ml-2">
                      {technician.rating ? `${technician.rating.toFixed(1)} (${technician.reviewCount} ${t('technicians.reviews')})` : 'New'}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-800 mb-4">{technician.bio}</p>
                  <Link href={`/technicians/${technician.id}`} className="text-primary hover:underline">
                    {t('technicians.viewProfile')}
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-lg text-gray-500">
                No technicians available at the moment.
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-10 text-center">
          <Link href="/technicians">
            <Button
              variant="secondary"
              className="font-bold text-white"
            >
              {t('technicians.viewAll')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TechniciansSection;
