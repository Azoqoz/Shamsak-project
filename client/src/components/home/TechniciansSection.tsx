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
      stars.push(<StarIcon key={`full-${i}`} className="fill-sunny-yellow text-sunny-yellow h-4 w-4" />);
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className="text-sunny-yellow h-4 w-4" />
          <div className="absolute top-0 left-0 overflow-hidden w-1/2">
            <StarIcon className="fill-sunny-yellow text-sunny-yellow h-4 w-4" />
          </div>
        </div>
      );
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<StarIcon key={`empty-${i}`} className="text-sunny-yellow h-4 w-4" />);
    }

    return stars;
  };

  return (
    <section id="technicians" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-800 mb-4">
            {t('technicians.title')}
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
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
              <div key={technician.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all hover:transform hover:scale-[1.02] border border-transparent hover:border-eco-green hover:border-opacity-20">
                <div className="mb-4 relative flex justify-center">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center overflow-hidden shadow-md ring-2 ring-eco-green ring-opacity-30">
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
                      <span className="text-5xl text-eco-green font-bold">
                        {technician.user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="fallback-initial hidden text-5xl text-eco-green font-bold">
                      {technician.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 bg-sunny-yellow bg-opacity-20 text-neutral-800 px-3 py-1 rounded-full text-xs font-semibold">
                    {technician.specialty}
                  </div>
                </div>
                <div className="text-center mt-6">
                  <div className="mb-1">
                    <h3 className="text-xl font-bold text-gray-800">{technician.user.name}</h3>
                  </div>
                  <p className="text-eco-green mb-2 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {technician.user.city}
                  </p>
                  <div className="flex justify-center mb-3">
                    <div className="flex">
                      {renderStars(technician.rating || 0)}
                    </div>
                    <span className="text-sm text-neutral-600 ml-2">
                      {technician.rating ? `${technician.rating.toFixed(1)} (${technician.reviewCount} ${t('technicians.reviews')})` : 'New'}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md mb-4 h-16 overflow-hidden text-ellipsis">
                    <p className="text-sm text-neutral-600 line-clamp-2">{technician.bio}</p>
                  </div>
                  <Link 
                    href={`/technicians/${technician.id}`} 
                    className="bg-eco-green text-white px-5 py-2 rounded-md inline-block hover:bg-opacity-90 transition-all hover:shadow-md text-sm font-medium"
                  >
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
              variant="default"
              className="bg-sunny-yellow hover:bg-sunny-yellow hover:bg-opacity-90 text-neutral-900 font-medium px-6 py-2 rounded-md"
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
