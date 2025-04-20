import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { StarIcon } from 'lucide-react';
import { Technician, User } from '@shared/schema';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslatedText, technicianNames, specialties, technicianBios } from '@/lib/technicianTranslations';

interface TechnicianCardProps {
  technician: Technician & { user: User };
  variant?: 'small' | 'large';
}

const TechnicianCard = ({ technician, variant = 'large' }: TechnicianCardProps) => {
  const { t } = useTranslation();
  const { language, direction } = useLanguage();
  
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

  const translatedName = language === 'ar' 
    ? getTranslatedText(technician.user.name, technicianNames)
    : technician.user.name;
  
  const translatedSpecialty = language === 'ar'
    ? getTranslatedText(technician.specialty, specialties)
    : technician.specialty;
  
  const translatedBio = language === 'ar'
    ? getTranslatedText(technician.bio || t('technicians.noBio'), technicianBios)
    : technician.bio || t('technicians.noBio');

  if (variant === 'small') {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-xl text-green-500 font-bold">
              {translatedName.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">
              {translatedName}
            </h3>
            <p className="text-xs text-gray-500">{translatedSpecialty}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all hover:transform hover:scale-[1.02] border border-transparent hover:border-green-100">
      <div className="mb-4 relative flex justify-center">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center overflow-hidden shadow-md ring-2 ring-green-200 ring-opacity-50">
          {technician.user.profileImage ? (
            <img 
              src={technician.user.profileImage} 
              alt={translatedName} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.style.display = 'none';
                target.parentElement?.querySelector('.fallback-initial')?.classList.remove('hidden');
              }}
            />
          ) : (
            <span className="text-5xl text-green-500 font-bold">
              {translatedName.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="fallback-initial hidden text-5xl text-green-500 font-bold">
            {translatedName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="absolute -bottom-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
          {translatedSpecialty}
        </div>
      </div>
      <div className="text-center mt-6">
        <div className="mb-1">
          <h3 className="text-xl font-bold text-gray-800">
            {translatedName}
          </h3>
        </div>
        <p className="text-primary mb-2 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${direction === 'rtl' ? 'ml-1' : 'mr-1'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {language === 'ar' ? t(`serviceForm.${technician.user.city.toLowerCase()}`) : technician.user.city}
        </p>
        <div className="flex justify-center mb-3">
          <div className="flex text-yellow-500">
            {renderStars(technician.rating || 0)}
          </div>
          <span className={`text-sm text-neutral-600 ${direction === 'rtl' ? 'mr-2' : 'ml-2'}`}>
            {technician.rating 
              ? `${technician.rating.toFixed(1)} (${technician.reviewCount} ${t('technicians.reviews')})` 
              : 'New'
            }
          </span>
        </div>
        <div className="bg-gray-50 p-3 rounded-md mb-4 h-16 overflow-hidden text-ellipsis">
          <p className="text-sm text-neutral-600 line-clamp-2">
            {translatedBio}
          </p>
        </div>
        <Link 
          href={`/technicians/${technician.id}`} 
          className="bg-primary text-white px-5 py-2 rounded-md inline-block hover:bg-opacity-90 transition-colors text-sm font-medium"
        >
          {t('technicians.viewProfile')}
        </Link>
      </div>
    </div>
  );
};

export default TechnicianCard;