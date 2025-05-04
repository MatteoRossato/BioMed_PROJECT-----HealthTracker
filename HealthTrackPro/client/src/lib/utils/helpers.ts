import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { NORMAL_RANGES, PARAMETER_TYPES } from '../constants';

// Format date to display
export const formatDate = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'd MMMM yyyy', { locale: it });
};

// Format time to display
export const formatTime = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'HH:mm', { locale: it });
};

// Format date and time to display
export const formatDateTime = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'd MMMM yyyy, HH:mm', { locale: it });
};

// Check if value is outside normal range
export const isOutsideRange = (parameterType: string, value: number): boolean => {
  switch(parameterType) {
    case PARAMETER_TYPES.BLOOD_PRESSURE_SYSTOLIC:
      return value > NORMAL_RANGES.BLOOD_PRESSURE_SYSTOLIC.max || value < NORMAL_RANGES.BLOOD_PRESSURE_SYSTOLIC.min;
    case PARAMETER_TYPES.BLOOD_PRESSURE_DIASTOLIC:
      return value > NORMAL_RANGES.BLOOD_PRESSURE_DIASTOLIC.max || value < NORMAL_RANGES.BLOOD_PRESSURE_DIASTOLIC.min;
    case PARAMETER_TYPES.HEART_RATE:
      return value > NORMAL_RANGES.HEART_RATE.max || value < NORMAL_RANGES.HEART_RATE.min;
    case PARAMETER_TYPES.GLUCOSE:
      return value > NORMAL_RANGES.GLUCOSE.max || value < NORMAL_RANGES.GLUCOSE.min;
    default:
      return false;
  }
};

// Format value with unit
export const formatValueWithUnit = (parameterType: string, value: number): string => {
  switch(parameterType) {
    case PARAMETER_TYPES.BLOOD_PRESSURE_SYSTOLIC:
    case PARAMETER_TYPES.BLOOD_PRESSURE_DIASTOLIC:
      return `${value} mmHg`;
    case PARAMETER_TYPES.HEART_RATE:
      return `${value} bpm`;
    case PARAMETER_TYPES.GLUCOSE:
      return `${value} mg/dL`;
    default:
      return value.toString();
  }
};

// Get status color based on value
export const getStatusColor = (parameterType: string, value: number): string => {
  if (isOutsideRange(parameterType, value)) {
    // Check if high or low
    switch(parameterType) {
      case PARAMETER_TYPES.BLOOD_PRESSURE_SYSTOLIC:
        return value > NORMAL_RANGES.BLOOD_PRESSURE_SYSTOLIC.max ? 'error-color' : 'warning-color';
      case PARAMETER_TYPES.BLOOD_PRESSURE_DIASTOLIC:
        return value > NORMAL_RANGES.BLOOD_PRESSURE_DIASTOLIC.max ? 'error-color' : 'warning-color';
      case PARAMETER_TYPES.HEART_RATE:
        return value > NORMAL_RANGES.HEART_RATE.max ? 'error-color' : 'warning-color';
      case PARAMETER_TYPES.GLUCOSE:
        return value > NORMAL_RANGES.GLUCOSE.max ? 'error-color' : 'warning-color';
      default:
        return 'text-foreground';
    }
  }
  
  return 'success-color';
};

// Get alert message for abnormal value
export const getAlertMessage = (parameterType: string, value: number): string | null => {
  if (!isOutsideRange(parameterType, value)) return null;
  
  switch(parameterType) {
    case PARAMETER_TYPES.BLOOD_PRESSURE_SYSTOLIC:
      return `Pressione sistolica fuori range: ${value} mmHg`;
    case PARAMETER_TYPES.BLOOD_PRESSURE_DIASTOLIC:
      return `Pressione diastolica fuori range: ${value} mmHg`;
    case PARAMETER_TYPES.HEART_RATE:
      return `Frequenza cardiaca fuori range: ${value} bpm`;
    case PARAMETER_TYPES.GLUCOSE:
      return `Livello di glucosio fuori range: ${value} mg/dL`;
    default:
      return null;
  }
};

// Prepare data for charts
export function prepareChartData(data: any[], parameterType: string) {
  if (!data || data.length === 0) return { labels: [], values: [] };
  
  // Sort by timestamp
  const sortedData = [...data].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  return {
    labels: sortedData.map(item => format(new Date(item.timestamp), 'd MMM', { locale: it })),
    values: sortedData.map(item => parseFloat(item.value))
  };
}
