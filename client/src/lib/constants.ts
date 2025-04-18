// Service types with base prices in SAR
export const SERVICE_TYPES = [
  { value: 'installation', labelKey: 'serviceForm.installation', basePrice: 500 },
  { value: 'maintenance', labelKey: 'serviceForm.maintenance', basePrice: 300 },
  { value: 'assessment', labelKey: 'serviceForm.assessment', basePrice: 200 },
];

// Cities in Saudi Arabia
export const CITIES = [
  { value: 'riyadh', labelKey: 'serviceForm.riyadh' },
  { value: 'jeddah', labelKey: 'serviceForm.jeddah' },
  { value: 'dammam', labelKey: 'serviceForm.dammam' },
  { value: 'mecca', labelKey: 'serviceForm.mecca' },
  { value: 'medina', labelKey: 'serviceForm.medina' },
];

// Property types
export const PROPERTY_TYPES = [
  { value: 'residential', labelKey: 'serviceForm.residential' },
  { value: 'commercial', labelKey: 'serviceForm.commercial' },
];

// Service request statuses
export const REQUEST_STATUSES = [
  { value: 'pending', labelKey: 'admin.pending' },
  { value: 'assigned', labelKey: 'admin.assigned' },
  { value: 'completed', labelKey: 'admin.completed' },
  { value: 'cancelled', labelKey: 'admin.cancelled' },
];
