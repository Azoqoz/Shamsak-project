// Translation mappings for technician data
// This file contains translations for data that comes from the database

// Technician name translations
export const technicianNames: Record<string, string> = {
  'Ahmed Al-Otaibi': 'أحمد العتيبي',
  'Khaled Al-Ghamdi': 'خالد الغامدي',
  'Mohammed Al-Harbi': 'محمد الحربي',
};

// Technician specialty translations
export const specialties: Record<string, string> = {
  'Solar Panel Installation': 'تركيب الألواح الشمسية',
  'Maintenance and Repair': 'الصيانة والإصلاح',
  'Energy Efficiency Assessment': 'تقييم كفاءة الطاقة',
  'Solar Consultation': 'استشارات الطاقة الشمسية',
};

// Technician bio translations
export const technicianBios: Record<string, string> = {
  'Specialized in maintenance and troubleshooting of solar systems with 6 years of hands-on experience fixing complex issues.': 
    'متخصص في صيانة وإصلاح أنظمة الطاقة الشمسية مع 6 سنوات من الخبرة العملية في إصلاح المشكلات المعقدة.',
  
  'Energy efficiency expert with 8 years of experience in commercial solar systems and comprehensive energy assessments.': 
    'خبير في كفاءة الطاقة مع 8 سنوات من الخبرة في أنظمة الطاقة الشمسية التجارية وتقييمات الطاقة الشاملة.',
  
  'Experienced solar technician specializing in residential solar panel installation and system optimization.': 
    'فني طاقة شمسية ذو خبرة متخصص في تركيب الألواح الشمسية السكنية وتحسين النظام.',
  
  'Experienced solar technician specializing in residential solar panel installation with 7 years of experience working with top brands.': 
    'فني طاقة شمسية ذو خبرة متخصص في تركيب الألواح الشمسية السكنية مع 7 سنوات من الخبرة في العمل مع أفضل العلامات التجارية.',
};

// Review content translations
export const reviewContents: Record<string, string> = {
  'Ahmed installed our solar panels efficiently and professionally. Highly recommend his services.': 
    'قام أحمد بتركيب الألواح الشمسية لدينا بكفاءة واحترافية. أوصي بشدة بخدماته.',
  
  'Khaled provided excellent energy assessment service. Very thorough and knowledgeable.': 
    'قدم خالد خدمة ممتازة لتقييم الطاقة. شامل جدًا وذو معرفة واسعة.',
  
  'Mohammed helped us set up our home solar system. Great attention to detail and excellent follow-up.': 
    'ساعدنا محمد في إعداد نظام الطاقة الشمسية المنزلي. اهتمام كبير بالتفاصيل ومتابعة ممتازة.',
  
  'The team was professional and completed the installation on time. Very satisfied with the work.': 
    'كان الفريق محترفًا وأكمل التركيب في الوقت المحدد. راضٍ جدًا عن العمل.',
};

// Certification translations
export const certifications: Record<string, string> = {
  'Solar System Maintenance Specialist': 'أخصائي صيانة أنظمة الطاقة الشمسية',
  'Energy Efficiency Expert, Solar System Designer': 'خبير كفاءة الطاقة، مصمم أنظمة الطاقة الشمسية',
  'Advanced Solar Installation Certification': 'شهادة متقدمة في تركيب الطاقة الشمسية',
  'Saudi Renewable Energy Certificate, Advanced Solar Installation': 'شهادة الطاقة المتجددة السعودية، تركيب الطاقة الشمسية المتقدم',
};

// City name translations
export const cities: Record<string, string> = {
  'Riyadh': 'الرياض',
  'Jeddah': 'جدة',
  'Dammam': 'الدمام',
  'Mecca': 'مكة',
  'Medina': 'المدينة',
  'Abha': 'أبها',
  'Tabuk': 'تبوك',
  'Khobar': 'الخبر',
  'Dhahran': 'الظهران',
  'Jubail': 'الجبيل',
};

// Helper function to get translated value or return original if no translation exists
export function getTranslatedText(originalText: string, translations: Record<string, string>): string {
  return translations[originalText] || originalText;
}