export const SERVICE_CATEGORIES = [
  {
    category: "Household",
    services: [
      { 
        id: "cleaning", 
        label: "Cleaning", 
        icon: "🧹", 
        hourlyRate: 150, // Price per hour in INR
        color: "blue",   // For badge UI: bg-blue-100 text-blue-700
        desc: "Sweeping, mopping, and dusting of all rooms."
      },
      { 
        id: "cooking", 
        label: "Cooking", 
        icon: "🍳", 
        hourlyRate: 200, 
        color: "orange",
        desc: "Preparation of breakfast, lunch, or dinner." 
      },
      { 
        id: "laundry", 
        label: "Laundry", 
        icon: "👕", 
        hourlyRate: 120, 
        color: "indigo",
        desc: "Washing, drying, and folding clothes."
      },
      { 
        id: "dishwashing", 
        label: "Dishwashing", 
        icon: "🍽️", 
        hourlyRate: 100, 
        color: "teal",
        desc: "Cleaning of utensils and kitchen area."
      },
    ]
  },
  {
    category: "Care",
    services: [
      { 
        id: "babysitting", 
        label: "Babysitting", 
        icon: "👶", 
        hourlyRate: 250, 
        color: "pink",
        desc: "Child care, feeding, and basic engagement."
      },
      { 
        id: "eldercare", 
        label: "Elder Care", 
        icon: "👵", 
        hourlyRate: 300, 
        color: "purple",
        desc: "Assistance for seniors with daily activities."
      },
      { 
        id: "petcare", 
        label: "Pet Care", 
        icon: "🐾", 
        hourlyRate: 180, 
        color: "green",
        desc: "Walking, feeding, and grooming pets."
      },
      { 
        id: "patientcare", 
        label: "Patient Care", 
        icon: "🏥", 
        hourlyRate: 400, 
        color: "red",
        desc: "Professional nursing assistance for patients."
      },
    ]
  },
  {
    category: "Other",
    services: [
      { 
        id: "driver", 
        label: "Driver", 
        icon: "🚗", 
        hourlyRate: 200, 
        color: "slate",
        desc: "Personal driving service for local trips."
      },
      { 
        id: "gardener", 
        label: "Gardener", 
        icon: "🌻", 
        hourlyRate: 150, 
        color: "lime",
        desc: "Watering, trimming, and basic garden maintenance."
      },
      { 
        id: "security", 
        label: "Watchman", 
        icon: "👮", 
        hourlyRate: 180, 
        color: "zinc",
        desc: "Gatekeeping and premises monitoring."
      },
    ]
  }
];

// Helper to get hourly rate by ID (Useful for Backend Calculation)
export const getServiceRate = (serviceId) => {
  for (const cat of SERVICE_CATEGORIES) {
    const service = cat.services.find(s => s.id === serviceId || s.label === serviceId);
    if (service) return service.hourlyRate;
  }
  return 0; // Default fallback
};