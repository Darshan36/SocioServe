// backend/config/services.js

export const SERVICE_CATEGORIES = [
  {
    category: "Household",
    services: [
      { id: "cleaning", label: "Cleaning", hourlyRate: 150 },
      { id: "cooking", label: "Cooking", hourlyRate: 200 },
      { id: "laundry", label: "Laundry", hourlyRate: 120 },
      { id: "dishwashing", label: "Dishwashing", hourlyRate: 100 },
    ]
  },
  {
    category: "Care",
    services: [
      { id: "babysitting", label: "Babysitting", hourlyRate: 250 },
      { id: "eldercare", label: "Elder Care", hourlyRate: 300 },
      { id: "petcare", label: "Pet Care", hourlyRate: 180 },
      { id: "patientcare", label: "Patient Care", hourlyRate: 400 },
    ]
  },
  {
    category: "Other",
    services: [
      { id: "driver", label: "Driver", hourlyRate: 200 },
      { id: "gardener", label: "Gardener", hourlyRate: 150 },
      { id: "security", label: "Watchman", hourlyRate: 180 },
    ]
  }
];

// Helper to get hourly rate by ID
export const getServiceRate = (serviceId) => {
  for (const cat of SERVICE_CATEGORIES) {
    const service = cat.services.find(s => s.id === serviceId || s.label === serviceId);
    if (service) return service.hourlyRate;
  }
  return 150; // Default fallback if not found
};