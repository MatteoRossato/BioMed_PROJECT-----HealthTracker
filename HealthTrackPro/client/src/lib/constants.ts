// Health parameters
export const PARAMETER_TYPES = {
  BLOOD_PRESSURE_SYSTOLIC: 'blood_pressure_systolic',
  BLOOD_PRESSURE_DIASTOLIC: 'blood_pressure_diastolic',
  HEART_RATE: 'heart_rate',
  GLUCOSE: 'glucose'
} as const;

// Normal ranges for health parameters
export const NORMAL_RANGES = {
  BLOOD_PRESSURE_SYSTOLIC: { min: 90, max: 120 },
  BLOOD_PRESSURE_DIASTOLIC: { min: 60, max: 80 },
  HEART_RATE: { min: 60, max: 100 },
  GLUCOSE: { min: 70, max: 140 }
};

// Chart colors
export const CHART_COLORS = {
  BLOOD_PRESSURE_SYSTOLIC: {
    border: '#1976d2',
    background: 'rgba(25, 118, 210, 0.1)'
  },
  BLOOD_PRESSURE_DIASTOLIC: {
    border: '#42a5f5',
    background: 'rgba(66, 165, 245, 0.1)'
  },
  HEART_RATE: {
    border: '#9c27b0',
    background: 'rgba(156, 39, 176, 0.1)'
  },
  GLUCOSE: {
    border: '#f44336',
    background: 'rgba(244, 67, 54, 0.1)'
  },
  THRESHOLD: {
    border: 'rgba(244, 67, 54, 0.5)',
    background: 'transparent'
  }
};

// Icons for health parameters
export const ICONS = {
  BLOOD_PRESSURE: 'favorite',
  HEART_RATE: 'monitor_heart',
  GLUCOSE: 'water_drop'
};

// Units for health parameters
export const UNITS = {
  BLOOD_PRESSURE: 'mmHg',
  HEART_RATE: 'bpm',
  GLUCOSE: 'mg/dL'
};

// Routes
export const ROUTES = {
  AUTH: '/auth',
  DASHBOARD: '/'
};
