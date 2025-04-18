import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import ServiceRequestForm from '@/components/forms/ServiceRequestForm';

const ServiceRequestPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('serviceForm.title')} | {t('common.appName')}</title>
        <meta 
          name="description" 
          content={t('serviceForm.subtitle')} 
        />
      </Helmet>

      <div className="fade-in">
        <ServiceRequestForm />
      </div>
    </>
  );
};

export default ServiceRequestPage;
