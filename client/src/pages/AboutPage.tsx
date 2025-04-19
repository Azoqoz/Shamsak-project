import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Sun } from 'lucide-react';

const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('footer.aboutUs')} | {t('common.appName')}</title>
        <meta 
          name="description" 
          content="Learn about Shamsak, our mission and vision for solar energy in Saudi Arabia" 
        />
      </Helmet>

      <div className="bg-neutral-100 py-16 fade-in">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <Sun className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">
                {t('footer.aboutUs')}
              </h1>
              <p className="text-lg text-neutral-700">
                {t('common.tagline')}
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Our Mission</h2>
              <p className="text-neutral-700 mb-6">
                At Shamsak, our mission is to accelerate the adoption of clean, renewable solar energy in Saudi Arabia. 
                We believe that by connecting homeowners and businesses with qualified solar technicians, we can make the transition 
                to sustainable energy seamless and accessible to everyone.
              </p>
              
              <h2 className="text-2xl font-bold text-primary mb-4">Our Vision</h2>
              <p className="text-neutral-700 mb-6">
                Our vision is to empower every building in the Kingdom with solar power, contributing to the nation's 
                renewable energy goals and Saudi Vision 2030. We aim to build a future where clean energy is the standard, 
                not the exception.
              </p>

              <h2 className="text-2xl font-bold text-primary mb-4">How We Work</h2>
              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-2 mr-4 mt-1">
                    <span className="text-green-600 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-800 mb-1">Connection</h3>
                    <p className="text-neutral-700">We connect you with certified solar technicians in your area who have the skills and experience to meet your needs.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-2 mr-4 mt-1">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-800 mb-1">Quality Assurance</h3>
                    <p className="text-neutral-700">All technicians on our platform are vetted for their expertise, ensuring you receive professional service.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-2 mr-4 mt-1">
                    <span className="text-green-600 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-800 mb-1">Support</h3>
                    <p className="text-neutral-700">From inquiry to installation, we're with you every step of the way, providing information and support.</p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-primary mb-4">Our Commitment to Saudi Vision 2030</h2>
              <p className="text-neutral-700 mb-6">
                Shamsak is committed to supporting Saudi Arabia's Vision 2030, which aims to reduce the dependency on oil
                and diversify the economy. Through promoting renewable energy adoption, we contribute to the goal of having 
                50% of Saudi Arabia's energy coming from renewable sources by 2030.
              </p>

              <div className="bg-neutral-100 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-neutral-800 mb-2">Join Us in Powering the Future</h3>
                <p className="text-neutral-700">
                  Whether you're a homeowner looking to install solar panels, a business aiming to reduce energy costs, 
                  or a skilled technician wanting to join our network, Shamsak is here to facilitate your solar journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;