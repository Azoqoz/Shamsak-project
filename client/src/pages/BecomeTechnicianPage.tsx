import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Wrench, CheckCircle, Calendar, Star, Banknote, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BecomeTechnicianPage = () => {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: <Users className="h-10 w-10 text-green-500" />,
      title: "Expand Your Client Base",
      description: "Connect with homeowners and businesses looking for quality solar services throughout Saudi Arabia."
    },
    {
      icon: <Calendar className="h-10 w-10 text-green-500" />,
      title: "Flexible Scheduling",
      description: "Set your own availability and manage appointments on your own terms."
    },
    {
      icon: <Banknote className="h-10 w-10 text-green-500" />,
      title: "Secure Payments",
      description: "Receive payments promptly through our secure platform with transparent fee structure."
    },
    {
      icon: <Star className="h-10 w-10 text-green-500" />,
      title: "Build Your Reputation",
      description: "Gain ratings and reviews that showcase your expertise and help you stand out."
    }
  ];

  const requirements = [
    "Valid professional certification in solar installation or related field",
    "Minimum 1 year of experience in the solar industry",
    "Liability insurance coverage",
    "Government-issued photo identification",
    "Ability to provide quality service and maintain high customer satisfaction",
    "Commitment to follow all safety protocols and regulations"
  ];

  const steps = [
    {
      number: "01",
      title: "Create an Account",
      description: "Sign up and complete your basic profile with contact information."
    },
    {
      number: "02",
      title: "Complete Your Profile",
      description: "Add your certifications, experience, service areas, and showcase your expertise."
    },
    {
      number: "03",
      title: "Verification Process",
      description: "Our team will review your qualifications and verify your credentials."
    },
    {
      number: "04",
      title: "Start Receiving Requests",
      description: "Once approved, you'll begin receiving service requests from clients in your area."
    }
  ];

  return (
    <>
      <Helmet>
        <title>{t('footer.becomeTech')} | {t('common.appName')}</title>
        <meta 
          name="description" 
          content="Join our network of solar technicians and grow your business with Shamsak" 
        />
      </Helmet>

      <div className="bg-neutral-100 py-16 fade-in">
        {/* Hero Section */}
        <div className="container mx-auto px-4 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Wrench className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-6">
              {t('footer.becomeTech')}
            </h1>
            <p className="text-xl text-neutral-700 mb-8 max-w-3xl mx-auto">
              Join our network of professional solar technicians and grow your business by connecting with clients throughout Saudi Arabia.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-6 text-lg">
                Apply Now
              </Button>
            </Link>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="container mx-auto px-4 mb-16">
          <h2 className="text-3xl font-bold text-neutral-800 mb-8 text-center">Why Join Shamsak?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">{benefit.title}</h3>
                <p className="text-neutral-700">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements Section */}
        <div className="bg-gradient-to-r from-primary to-green-700 text-white py-16 mb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Requirements to Join</h2>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
                <ul className="space-y-4">
                  {requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-6 w-6 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-lg">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="container mx-auto px-4 mb-16">
          <h2 className="text-3xl font-bold text-neutral-800 mb-12 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col transform group-hover:-translate-y-2 transition-transform">
                  <div className="text-3xl font-bold text-primary mb-4">{step.number}</div>
                  <h3 className="text-xl font-bold text-neutral-800 mb-3">{step.title}</h3>
                  <p className="text-neutral-700 flex-grow">{step.description}</p>
                  
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 text-4xl text-neutral-300">
                      →
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="bg-neutral-800 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-6">Ready to Grow Your Solar Business?</h2>
              <p className="text-xl text-neutral-300 mb-8">
                Join Shamsak today and become part of the growing renewable energy community in Saudi Arabia.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/register">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-8">
                    Apply Now
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 font-bold px-8">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BecomeTechnicianPage;