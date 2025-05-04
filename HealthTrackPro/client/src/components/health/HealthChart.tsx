import { useEffect, useRef } from 'react';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartOptions, LineController, Filler } from 'chart.js';
import { prepareChartData } from '@/lib/utils/helpers';
import { CHART_COLORS, NORMAL_RANGES, PARAMETER_TYPES } from '@/lib/constants';

// Estendi il tipo per includere le proprietà personalizzate che usiamo
declare module 'chart.js' {
  interface LineElementOptionsByLine {
    borderDash?: number[];
    pointRadius?: number;
  }
}

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController, Filler);

interface HealthChartProps {
  data: any[][];
  parameterTypes: string[];
  showThreshold?: boolean;
}

export default function HealthChart({ data, parameterTypes, showThreshold = false }: HealthChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Prepare data for each dataset
    const datasets = data.map((dataSet, index) => {
      const paramType = parameterTypes[index];
      const chartData = prepareChartData(dataSet, paramType);
      
      let colorKey: 'BLOOD_PRESSURE_SYSTOLIC' | 'BLOOD_PRESSURE_DIASTOLIC' | 'HEART_RATE' | 'GLUCOSE' | 'THRESHOLD' = 'BLOOD_PRESSURE_SYSTOLIC';
      
      switch(paramType) {
        case PARAMETER_TYPES.BLOOD_PRESSURE_SYSTOLIC:
          colorKey = 'BLOOD_PRESSURE_SYSTOLIC';
          break;
        case PARAMETER_TYPES.BLOOD_PRESSURE_DIASTOLIC:
          colorKey = 'BLOOD_PRESSURE_DIASTOLIC';
          break;
        case PARAMETER_TYPES.HEART_RATE:
          colorKey = 'HEART_RATE';
          break;
        case PARAMETER_TYPES.GLUCOSE:
          colorKey = 'GLUCOSE';
          break;
        default:
          colorKey = 'BLOOD_PRESSURE_SYSTOLIC';
      }
      
      return {
        label: getLabelFromParameterType(paramType),
        data: chartData.values,
        borderColor: CHART_COLORS[colorKey].border,
        backgroundColor: CHART_COLORS[colorKey].background,
        tension: 0.3,
        fill: true
      };
    });

    // Add threshold line for glucose if needed
    if (showThreshold && parameterTypes[0] === PARAMETER_TYPES.GLUCOSE) {
      const maxDataPoints = Math.max(...data.map(d => d.length), 1);
      datasets.push({
        label: 'Soglia massima',
        data: Array(maxDataPoints).fill(NORMAL_RANGES.GLUCOSE.max),
        borderColor: CHART_COLORS.THRESHOLD.border,
        backgroundColor: CHART_COLORS.THRESHOLD.background,
        // @ts-ignore - borderDash è una proprietà valida ma TypeScript non la riconosce
        borderDash: [5, 5],
        tension: 0,
        fill: false,
        // @ts-ignore - pointRadius è una proprietà valida ma TypeScript non la riconosce
        pointRadius: 0
      });
    }

    // Get all labels (dates) from all datasets
    const allLabels = data.flatMap(dataSet => 
      prepareChartData(dataSet, parameterTypes[0]).labels
    );
    
    // Remove duplicates and sort
    const uniqueLabelsSet = new Set(allLabels);
    const uniqueLabels = Array.from(uniqueLabelsSet).sort((a, b) => {
      // Parse dates and compare
      const dateA = new Date(a.split(' ')[0] + ' ' + new Date().getFullYear());
      const dateB = new Date(b.split(' ')[0] + ' ' + new Date().getFullYear());
      return dateA.getTime() - dateB.getTime();
    });

    // Chart configuration
    const options: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          suggestedMin: getMinValue(parameterTypes[0]),
          suggestedMax: getMaxValue(parameterTypes[0])
        }
      }
    };

    // Create the chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: uniqueLabels.length > 0 ? uniqueLabels : ['Nessun dato'],
          datasets: datasets.length > 0 ? datasets : []
        },
        options
      });
    }

    // Cleanup function to destroy chart on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, parameterTypes, showThreshold]);

  // Helper function to get label from parameter type
  function getLabelFromParameterType(parameterType: string): string {
    switch(parameterType) {
      case PARAMETER_TYPES.BLOOD_PRESSURE_SYSTOLIC:
        return 'Sistolica';
      case PARAMETER_TYPES.BLOOD_PRESSURE_DIASTOLIC:
        return 'Diastolica';
      case PARAMETER_TYPES.HEART_RATE:
        return 'Frequenza Cardiaca';
      case PARAMETER_TYPES.GLUCOSE:
        return 'Livello di Glucosio';
      default:
        return parameterType;
    }
  }

  // Helper function to get min value for chart scale
  function getMinValue(parameterType: string): number {
    switch(parameterType) {
      case PARAMETER_TYPES.BLOOD_PRESSURE_SYSTOLIC:
        return 80;
      case PARAMETER_TYPES.BLOOD_PRESSURE_DIASTOLIC:
        return 40;
      case PARAMETER_TYPES.HEART_RATE:
        return 40;
      case PARAMETER_TYPES.GLUCOSE:
        return 40;
      default:
        return 0;
    }
  }

  // Helper function to get max value for chart scale
  function getMaxValue(parameterType: string): number {
    switch(parameterType) {
      case PARAMETER_TYPES.BLOOD_PRESSURE_SYSTOLIC:
        return 180;
      case PARAMETER_TYPES.BLOOD_PRESSURE_DIASTOLIC:
        return 130;
      case PARAMETER_TYPES.HEART_RATE:
        return 120;
      case PARAMETER_TYPES.GLUCOSE:
        return 220;
      default:
        return 200;
    }
  }

  return (
    <canvas ref={chartRef}></canvas>
  );
}
