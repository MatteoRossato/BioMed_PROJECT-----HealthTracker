import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DateFilter from '@/components/health/DateFilter';
import HealthDataCard from '@/components/health/HealthDataCard';
import HealthDataForm from '@/components/health/HealthDataForm';
import HealthChart from '@/components/health/HealthChart';
import AlertNotification from '@/components/ui/alert-notification';
import { Card, CardContent } from '@/components/ui/card';
import { getAlertMessage } from '@/lib/utils/helpers';
import { PARAMETER_TYPES } from '@/lib/constants';

export default function DashboardPage() {
  // State for date filtering
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const [dateFrom, setDateFrom] = useState(formatDateForInput(oneMonthAgo));
  const [dateTo, setDateTo] = useState(formatDateForInput(today));
  
  // State for health data form
  const [formType, setFormType] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // State for alerts
  const [alerts, setAlerts] = useState<{title: string, message: string}[]>([]);

  // Fetch latest health data for alerts
  const { data: latestData } = useQuery({
    queryKey: ['/api/healthdata/latest'],
    queryFn: () => fetch('/api/healthdata/latest').then(res => res.json())
  });

  // Check for abnormal values and show alerts
  useEffect(() => {
    if (latestData) {
      const newAlerts: {title: string, message: string}[] = [];
      
      // Check blood pressure
      if (latestData.bloodPressure?.systolic) {
        const systolicValue = parseFloat(latestData.bloodPressure.systolic.value);
        const alertMessage = getAlertMessage(PARAMETER_TYPES.BLOOD_PRESSURE_SYSTOLIC, systolicValue);
        if (alertMessage) {
          newAlerts.push({
            title: "Attenzione",
            message: alertMessage
          });
        }
      }
      
      if (latestData.bloodPressure?.diastolic) {
        const diastolicValue = parseFloat(latestData.bloodPressure.diastolic.value);
        const alertMessage = getAlertMessage(PARAMETER_TYPES.BLOOD_PRESSURE_DIASTOLIC, diastolicValue);
        if (alertMessage) {
          newAlerts.push({
            title: "Attenzione",
            message: alertMessage
          });
        }
      }
      
      // Check heart rate
      if (latestData.heartRate) {
        const heartRateValue = parseFloat(latestData.heartRate.value);
        const alertMessage = getAlertMessage(PARAMETER_TYPES.HEART_RATE, heartRateValue);
        if (alertMessage) {
          newAlerts.push({
            title: "Attenzione",
            message: alertMessage
          });
        }
      }
      
      // Check glucose
      if (latestData.glucose) {
        const glucoseValue = parseFloat(latestData.glucose.value);
        const alertMessage = getAlertMessage(PARAMETER_TYPES.GLUCOSE, glucoseValue);
        if (alertMessage) {
          newAlerts.push({
            title: "Attenzione",
            message: alertMessage
          });
        }
      }
      
      setAlerts(newAlerts);
    }
  }, [latestData]);

  // Handle date filter change
  const handleDateFilterChange = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
  };

  // Handle opening the form for adding health data
  const handleAddHealthData = (type: string) => {
    setFormType(type);
    setIsFormOpen(true);
  };

  // Handle closing the form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFormType(null);
  };

  // Fetch all health data for weekly trend
  const { data: allHealthData } = useQuery({
    queryKey: ['/api/healthdata', dateFrom, dateTo],
    queryFn: async () => {
      const token = localStorage.getItem('healthtrack_auth_token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`/api/healthdata?from=${dateFrom}&to=${dateTo}`, {
        headers: headers
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }
      
      return res.json();
    }
  });

  // Prepare data for weekly trend chart
  const getHealthDataByType = (type: string) => {
    if (!allHealthData || !Array.isArray(allHealthData)) return [];
    return allHealthData.filter((item: any) => item.parameterType === type);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-medium mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Monitora i tuoi parametri vitali nel tempo</p>
      </div>

      <DateFilter onFilterChange={handleDateFilterChange} />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        <HealthDataCard
          title="Pressione Sanguigna"
          icon="❤️"
          parameterType="bloodPressure"
          onAddClick={handleAddHealthData}
          dateFrom={dateFrom}
          dateTo={dateTo}
        />
        
        <HealthDataCard
          title="Frequenza Cardiaca"
          icon="💓"
          parameterType="heartRate"
          onAddClick={handleAddHealthData}
          dateFrom={dateFrom}
          dateTo={dateTo}
        />
        
        <HealthDataCard
          title="Livelli di Glucosio"
          icon="💧"
          parameterType="glucose"
          onAddClick={handleAddHealthData}
          dateFrom={dateFrom}
          dateTo={dateTo}
        />
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-xl font-medium mb-4">Andamento settimanale</h3>
          <div className="h-[400px]">
            <HealthChart 
              data={[
                getHealthDataByType(PARAMETER_TYPES.BLOOD_PRESSURE_SYSTOLIC),
                getHealthDataByType(PARAMETER_TYPES.HEART_RATE),
                getHealthDataByType(PARAMETER_TYPES.GLUCOSE)
              ]}
              parameterTypes={[
                PARAMETER_TYPES.BLOOD_PRESSURE_SYSTOLIC,
                PARAMETER_TYPES.HEART_RATE,
                PARAMETER_TYPES.GLUCOSE
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Health Data Form */}
      {formType && (
        <HealthDataForm 
          isOpen={isFormOpen} 
          onClose={handleCloseForm} 
          formType={formType} 
        />
      )}

      {/* Alerts */}
      {alerts.map((alert, index) => (
        <AlertNotification
          key={index}
          title={alert.title}
          message={alert.message}
          type="error"
          duration={5000 + (index * 1000)}
          onClose={() => {
            const newAlerts = [...alerts];
            newAlerts.splice(index, 1);
            setAlerts(newAlerts);
          }}
        />
      ))}
    </DashboardLayout>
  );
}
