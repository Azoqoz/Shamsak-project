import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';

const TermsPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('footer.terms')} | {t('common.appName')}</title>
        <meta 
          name="description" 
          content="Terms of Service for Shamsak - the terms governing your use of our solar connection platform" 
        />
      </Helmet>

      <div className="bg-neutral-100 py-16 fade-in">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <FileText className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">
                {t('footer.terms')}
              </h1>
              <p className="text-lg text-neutral-700">
                Last Updated: April 19, 2025
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4">Agreement to Terms</h2>
                <p className="text-neutral-700 mb-4">
                  These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Shamsak ("we," "us" or "our"), concerning your access to and use of the Shamsak website and services.
                </p>
                <p className="text-neutral-700">
                  By accessing or using our service, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-primary mb-4">Description of Service</h2>
                <p className="text-neutral-700 mb-4">
                  Shamsak is a platform that connects homeowners and businesses with solar technicians in Saudi Arabia. We provide a marketplace where users can:
                </p>
                <ul className="list-disc list-inside text-neutral-700 space-y-1 mb-4">
                  <li>Request solar installation, maintenance, or assessment services</li>
                  <li>Browse and select from qualified solar technicians</li>
                  <li>Schedule and pay for solar services</li>
                  <li>Rate and review technicians</li>
                </ul>
                <p className="text-neutral-700">
                  For technicians, we provide a platform to offer services, manage bookings, and grow their client base.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-primary mb-4">User Accounts</h2>
                <p className="text-neutral-700 mb-4">
                  When you create an account with us, you guarantee that the information you provide is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account.
                </p>
                <p className="text-neutral-700 mb-4">
                  You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer or device. You agree to accept responsibility for all activities that occur under your account or password.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-primary mb-4">User Responsibilities</h2>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">All Users</h3>
                <ul className="list-disc list-inside text-neutral-700 space-y-1 mb-4">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Not use the service for any illegal or unauthorized purpose</li>
                </ul>

                <h3 className="text-xl font-semibold text-neutral-800 mb-2">Clients</h3>
                <ul className="list-disc list-inside text-neutral-700 space-y-1 mb-4">
                  <li>Provide accurate details about your property and service needs</li>
                  <li>Be available for scheduled appointments or provide timely notice of cancellation</li>
                  <li>Pay for services as agreed</li>
                  <li>Provide reasonable access to your property for service provision</li>
                </ul>

                <h3 className="text-xl font-semibold text-neutral-800 mb-2">Technicians</h3>
                <ul className="list-disc list-inside text-neutral-700 space-y-1">
                  <li>Maintain up-to-date certifications and qualifications</li>
                  <li>Provide services as described and agreed</li>
                  <li>Attend scheduled appointments on time</li>
                  <li>Maintain professional standards and quality workmanship</li>
                  <li>Adhere to safety protocols and regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-primary mb-4">Payments and Fees</h2>
                <p className="text-neutral-700 mb-4">
                  We may charge service fees for the use of our platform. All applicable fees will be clearly disclosed before you complete a transaction. Payment for technician services will be processed through our platform, and technicians will receive payment according to our payment schedule.
                </p>
                <p className="text-neutral-700">
                  All payments must be made using the payment methods we support. You agree to provide accurate and complete payment information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-primary mb-4">Limitation of Liability</h2>
                <p className="text-neutral-700 mb-4">
                  To the maximum extent permitted by law, Shamsak shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, or other intangible losses, resulting from:
                </p>
                <ul className="list-disc list-inside text-neutral-700 space-y-1">
                  <li>Your use or inability to use our service</li>
                  <li>Any service provided by a technician found through our platform</li>
                  <li>Unauthorized access to or use of our servers and/or personal information stored therein</li>
                  <li>Any interruption or cessation of transmission to or from our service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-primary mb-4">Dispute Resolution</h2>
                <p className="text-neutral-700">
                  Any disputes arising out of or relating to these Terms of Service shall first be attempted to be resolved through negotiation. If the dispute cannot be resolved through negotiation, it shall be submitted to binding arbitration in accordance with the laws of the Kingdom of Saudi Arabia.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-primary mb-4">Changes to Terms</h2>
                <p className="text-neutral-700">
                  We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-primary mb-4">Contact Us</h2>
                <p className="text-neutral-700">
                  If you have any questions about these Terms, please contact us at:
                </p>
                <div className="bg-neutral-100 p-4 rounded-md mt-2">
                  <p className="font-medium">Email: terms@shamsak.sa</p>
                  <p className="font-medium">Phone: +966 51 234 567</p>
                  <p className="font-medium">Address: King Fahd Road, Riyadh, Saudi Arabia</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsPage;