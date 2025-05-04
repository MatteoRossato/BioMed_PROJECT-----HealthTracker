import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import HealthChart from './HealthChart';
import { formatDateTime, getStatusColor } from '@/lib/utils/helpers';
import { PARAMETER_TYPES, UNITS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';

interface HealthDataCardProps {
  title: string;
  icon: string;
  parameterType: string;
  onAddClick: (type: string) => void;
  dateFrom: string;
  dateTo: string;
}

export default function HealthDataCard({ 
  title, 
  icon, 
  parameterType, 
  onAddClick,
  dateFrom,
  dateTo
}: HealthDataCardProps) {
  // Determine the query endpoints based on parameter type
  const isBP = parameterType === 'bloodPressure';
  const queryTypes = isBP 
    ? [PARAMETER_TYPES.BLOOD_PRESSURE_SYSTOLIC, PARAMETER_TYPES.BLOOD_PRESSURE_DIASTOLIC]
    : parameterType === 'heartRate'
      ? [PARAMETER_TYPES.HEART_RATE]
      : [PARAMETER_TYPES.GLUCOSE];

  // Fetch health data with token
  const queries = queryTypes.map(type => {
    return useQuery({
      queryKey: ['/api/healthdata', type, dateFrom, dateTo],
      queryFn: async ({ queryKey }) => {
        const token = localStorage.getItem('healthtrack_auth_token');
        const headers: Record<string, string> = {};
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const res = await fetch(`/api/healthdata?type=${type}&from=${dateFrom}&to=${dateTo}`, {
          headers: headers
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }
        
        return res.json();
      }
    });
  });

  // Check if any queries are loading
  const isLoading = queries.some(query => query.isLoading);
  
  // Get data and ensure it's always an array
  const data = queries.map(query => Array.isArray(query.data) ? query.data : []);
  
  // Get latest measurements from the fetched data
  const getLatestMeasurement = (dataSet: any[]) => {
    if (!dataSet || dataSet.length === 0) return null;
    
    const sortedData = [...dataSet].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return sortedData[0];
  };
  
  const latestMeasurements = data.map(getLatestMeasurement);
  
  // Units based on parameter type
  const unit = parameterType === 'bloodPressure' 
    ? UNITS.BLOOD_PRESSURE 
    : parameterType === 'heartRate'
      ? UNITS.HEART_RATE
      : UNITS.GLUCOSE;

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 bg-primary text-white flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm opacity-90">
            {latestMeasurements[0] 
              ? `Ultimo aggiornamento: ${formatDateTime(latestMeasurements[0].timestamp)}` 
              : 'Nessun dato'}
          </p>
        </div>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {parameterType === 'bloodPressure' ? (
              <div className="flex gap-4 mb-6">
                <div className="bg-muted rounded-lg p-4 flex-1 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Sistolica</p>
                  <p className={`text-3xl font-medium ${latestMeasurements[0] ? getStatusColor(PARAMETER_TYPES.BLOOD_PRESSURE_SYSTOLIC, parseFloat(latestMeasurements[0]?.value || '0')) : ''}`}>
                    {latestMeasurements[0] ? parseFloat(latestMeasurements[0].value).toFixed(0) : '-'}
                  </p>
                  <p className="text-xs text-muted-foreground">{unit}</p>
                </div>
                <div className="bg-muted rounded-lg p-4 flex-1 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Diastolica</p>
                  <p className={`text-3xl font-medium ${latestMeasurements[1] ? getStatusColor(PARAMETER_TYPES.BLOOD_PRESSURE_DIASTOLIC, parseFloat(latestMeasurements[1]?.value || '0')) : ''}`}>
                    {latestMeasurements[1] ? parseFloat(latestMeasurements[1].value).toFixed(0) : '-'}
                  </p>
                  <p className="text-xs text-muted-foreground">{unit}</p>
                </div>
              </div>
            ) : (
              <div className="bg-muted rounded-lg p-4 mb-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">Ultimo valore</p>
                <div className="flex items-center justify-center">
                  <p 
                    className={`text-3xl font-medium ${latestMeasurements[0] ? getStatusColor(queryTypes[0], parseFloat(latestMeasurements[0]?.value || '0')) : ''}`}
                  >
                    {latestMeasurements[0] ? parseFloat(latestMeasurements[0].value).toFixed(0) : '-'}
                  </p>
                  {latestMeasurements[0] && getStatusColor(queryTypes[0], parseFloat(latestMeasurements[0].value)) === 'error-color' && (
                    <span className="error-color ml-2" title="Valore superiore al normale">⚠️</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{unit}</p>
              </div>
            )}

            <div className="mb-4 h-[300px]">
              <HealthChart 
                data={data} 
                parameterTypes={queryTypes}
                showThreshold={parameterType === 'glucose'}
              />
            </div>
            
            <Button 
              className="w-full"
              onClick={() => onAddClick(parameterType)}
            >
              Aggiungi misurazione
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
