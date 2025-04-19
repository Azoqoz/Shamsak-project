import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { LockIcon } from 'lucide-react';

const PrivacyPolicyPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('footer.privacy')} | {t('common.appName')}</title>
        <meta 
          name="description" 
          content="Shamsak privacy policy - how we handle and protect your personal information" 
        />
      </Helmet>

      <div className="bg-neutral-100 py-16 fade-in">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <LockIcon className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">
                {t('footer.privacy')}
              </h1>
              <p className="text-lg text-neutral-700">
                Last Updated: April 19, 2025
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4">Introduction</h2>
                <p className="text-neutral-700 mb-4">
                  Shamsak ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services that connect homeowners and businesses with solar technicians in Saudi Arabia.
                </p>
                <p className="text-neutral-700">
                  Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site or use our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-primary mb-4">Information We Collect</h2>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">Personal Data</h3>
                <p className="text-neutral-700 mb-4">
                  We may collect personal information that you provide when using our service, including but not limited to:
                </p>
                <ul className="list-disc list-inside text-neutral-700 mb-4 space-y-1">
                  <li>Full name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Address and location information</li>
                  <li>Details about your property for service assessment</li>
                  <li>Professional qualifications and experience (for technicians)</li>
                  <li>Payment information</li>
                </ul>

                <h3 className="text-xl font-semibold text-neutral-800 mb-2">Usage Data</h3>
                <p className="text-neutral-700 mb-4">
                  We may also collect information about how you access and use our website:
                </p>
                <ul className="list-disc list-inside text-neutral-700 space-y-1">
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Time and date of your visit</li>
                  <li>Pages you viewed</li>
                  <li>Time spent on those pages</li>
                  <li>Device information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-primary mb-4">How We Use Your Information</h2>
                <p className="text-neutral-700 mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-neutral-700 space-y-1">
                  <li>Provide, operate, and maintain our services</li>
                  <li>Connect clients with appropriate solar technicians</li>
                  <li>Process and complete transactions</li>
                  <li>Send administrative information</li>
                  <li>Respond to inquiries and offer support</li>
                  <li>Improve, personalize, and enhance our services</li>
                  <li>Monitor usage of our services</li>
                  <li>Detect, prevent, and address technical issues</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-primary mb-4">Disclosure of Your Information</h2>
                <p className="text-neutral-700 mb-4">
                  We may share your information with:
                </p>
                <ul className="list-disc list-inside text-neutral-700 space-y-1">
                  <li><strong>Service Providers:</strong> Third parties that help us operate, maintain, and enhance our platform</li>
                  <li><strong>Solar Technicians:</strong> When you request services, your information will be shared with the technicians you are connected with</li>
                  <li><strong>Business Partners:</strong> Trusted companies we work with to provide services</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-primary mb-4">Security of Your Information</h2>
                <p className="text-neutral-700 mb-4">
                  We use administrative, technical, and physical security measures to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-primary mb-4">Your Rights</h2>
                <p className="text-neutral-700 mb-4">
                  Depending on your location, you may have certain rights regarding your personal information, including:
                </p>
                <ul className="list-disc list-inside text-neutral-700 space-y-1">
                  <li>The right to access your personal information</li>
                  <li>The right to rectify inaccurate information</li>
                  <li>The right to request deletion of your information</li>
                  <li>The right to restrict or object to processing</li>
                  <li>The right to data portability</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-primary mb-4">Changes to This Privacy Policy</h2>
                <p className="text-neutral-700">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-primary mb-4">Contact Us</h2>
                <p className="text-neutral-700">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <div className="bg-neutral-100 p-4 rounded-md mt-2">
                  <p className="font-medium">Email: privacy@shamsak.sa</p>
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

export default PrivacyPolicyPage;