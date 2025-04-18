import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Technician, User } from '@shared/schema';
import LocationRadiusSelector from '@/components/map/LocationRadiusSelector';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface LocationFilterState {
  lat: number;
  lng: number;
  radius: number;
}

const TechnicianMapPage = () => {
  const { t } = useTranslation();
  const { direction } = useLanguage();
  const [locationFilter, setLocationFilter] = useState<LocationFilterState | null>(null);
  
  const { data: technicians, isLoading } = useQuery<(Technician & { user: User })[]>({
    queryKey: ['/api/technicians'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Handle location radius filter change
  const handleLocationChange = (location: { lat: number; lng: number; radius: number }) => {
    setLocationFilter(location);
  };
  
  // Calculate distance between two points using the Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };
  
  // Filter technicians based on location radius
  const filteredTechnicians = locationFilter && technicians
    ? technicians.filter((tech) => {
        if (!tech.latitude || !tech.longitude) return false;
        
        const techLat = parseFloat(tech.latitude);
        const techLng = parseFloat(tech.longitude);
        
        // Calculate distance between user and technician
        const distance = calculateDistance(
          locationFilter.lat,
          locationFilter.lng,
          techLat,
          techLng
        );
        
        // A technician is visible if:
        // 1. The user is within the technician's service radius
        // 2. The technician is within the user's selected radius
        const techServiceRadius = tech.serviceRadius || 0;
        return distance <= techServiceRadius && distance <= locationFilter.radius;
      })
    : [];
    
  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>{t('technicians.title')} | {t('common.appName')}</title>
      </Helmet>
      
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{t('map.findNearby')}</h1>
        <p className="text-gray-600 mb-8">{t('map.adjustRadius')}</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map and filter column */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('map.selectRadius')}</CardTitle>
              </CardHeader>
              <CardContent>
                <LocationRadiusSelector 
                  technicians={technicians || []}
                  onChange={handleLocationChange}
                  initialRadius={25}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Results column */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t('map.techniciansInRadius')}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : !locationFilter ? (
                  <p className="text-gray-500 py-4">{t('map.searchingLocation')}</p>
                ) : filteredTechnicians.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-2">{t('map.noTechniciansFound')}</p>
                    <p className="text-sm text-gray-400">{t('map.adjustRadius')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTechnicians.map((tech) => (
                      <div 
                        key={tech.id} 
                        className="border rounded-md p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium">
                              {tech.user.name}
                            </h3>
                            <p className="text-sm text-gray-600">{tech.specialty}</p>
                          </div>
                          <div className={`text-right ${direction === 'rtl' ? 'text-left' : 'text-right'}`}>
                            <div className="flex items-center justify-end">
                              <span className="text-amber-500 mr-1">★</span>
                              <span className="font-medium">{tech.rating?.toFixed(1) || '4.0'}</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {tech.reviewCount} {t('technicians.reviews')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-sm text-gray-500">
                          <div>
                            <p>{tech.user.city}</p>
                            <p>{tech.serviceRadius} {t('map.km')}</p>
                          </div>
                          <a 
                            href={`/technicians/${tech.id}`} 
                            className="text-primary hover:underline"
                          >
                            {t('technicians.viewProfile')}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianMapPage;