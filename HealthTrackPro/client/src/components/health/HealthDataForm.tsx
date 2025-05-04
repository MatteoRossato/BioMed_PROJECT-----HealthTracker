import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { PARAMETER_TYPES } from '@/lib/constants';

interface HealthDataFormProps {
  isOpen: boolean;
  onClose: () => void;
  formType: string;
}

// Define form schemas for different health data types
const bloodPressureSchema = z.object({
  systolic: z.coerce.number().min(70, "Valore minimo 70").max(200, "Valore massimo 200"),
  diastolic: z.coerce.number().min(40, "Valore minimo 40").max(130, "Valore massimo 130"),
  timestamp: z.string().refine(value => !!value, "Data e ora richieste")
});

const heartRateSchema = z.object({
  heartRate: z.coerce.number().min(40, "Valore minimo 40").max(220, "Valore massimo 220"),
  timestamp: z.string().refine(value => !!value, "Data e ora richieste")
});

const glucoseSchema = z.object({
  glucose: z.coerce.number().min(40, "Valore minimo 40").max(400, "Valore massimo 400"),
  timestamp: z.string().refine(value => !!value, "Data e ora richieste")
});

type BloodPressureFormValues = z.infer<typeof bloodPressureSchema>;
type HeartRateFormValues = z.infer<typeof heartRateSchema>;
type GlucoseFormValues = z.infer<typeof glucoseSchema>;

export default function HealthDataForm({ isOpen, onClose, formType }: HealthDataFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const now = new Date().toISOString().slice(0, 16);

  // Initialize the appropriate form based on formType
  const bloodPressureForm = useForm<BloodPressureFormValues>({
    resolver: zodResolver(bloodPressureSchema),
    defaultValues: {
      systolic: 120,
      diastolic: 80,
      timestamp: now
    }
  });

  const heartRateForm = useForm<HeartRateFormValues>({
    resolver: zodResolver(heartRateSchema),
    defaultValues: {
      heartRate: 70,
      timestamp: now
    }
  });

  const glucoseForm = useForm<GlucoseFormValues>({
    resolver: zodResolver(glucoseSchema),
    defaultValues: {
      glucose: 100,
      timestamp: now
    }
  });

  // Mutation for saving health data
  const saveMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/healthdata", data),
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/healthdata'] });
      
      // Show success message
      toast({
        title: "Dati salvati",
        description: "I dati sono stati salvati con successo"
      });
      
      // Close the form
      onClose();
    },
    onError: (error) => {
      console.error("Error saving health data:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio dei dati",
        variant: "destructive"
      });
    }
  });

  // Handle form submission based on form type
  const handleBloodPressureSubmit = (values: BloodPressureFormValues) => {
    // Save systolic value
    saveMutation.mutate({
      parameterType: PARAMETER_TYPES.BLOOD_PRESSURE_SYSTOLIC,
      value: values.systolic,
      timestamp: new Date(values.timestamp).toISOString()
    });
    
    // Save diastolic value
    saveMutation.mutate({
      parameterType: PARAMETER_TYPES.BLOOD_PRESSURE_DIASTOLIC,
      value: values.diastolic,
      timestamp: new Date(values.timestamp).toISOString()
    });
  };

  const handleHeartRateSubmit = (values: HeartRateFormValues) => {
    saveMutation.mutate({
      parameterType: PARAMETER_TYPES.HEART_RATE,
      value: values.heartRate,
      timestamp: new Date(values.timestamp).toISOString()
    });
  };

  const handleGlucoseSubmit = (values: GlucoseFormValues) => {
    saveMutation.mutate({
      parameterType: PARAMETER_TYPES.GLUCOSE,
      value: values.glucose,
      timestamp: new Date(values.timestamp).toISOString()
    });
  };

  // Get form title based on form type
  const getFormTitle = () => {
    switch(formType) {
      case 'bloodPressure':
        return 'Aggiungi Pressione Sanguigna';
      case 'heartRate':
        return 'Aggiungi Frequenza Cardiaca';
      case 'glucose':
        return 'Aggiungi Livello di Glucosio';
      default:
        return 'Aggiungi misurazione';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getFormTitle()}</DialogTitle>
        </DialogHeader>
        
        {formType === 'bloodPressure' && (
          <Form {...bloodPressureForm}>
            <form onSubmit={bloodPressureForm.handleSubmit(handleBloodPressureSubmit)} className="space-y-4">
              <FormField
                control={bloodPressureForm.control}
                name="systolic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pressione Sistolica (mmHg)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} min={70} max={200} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bloodPressureForm.control}
                name="diastolic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pressione Diastolica (mmHg)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} min={40} max={130} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bloodPressureForm.control}
                name="timestamp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data e ora</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Salvataggio..." : "Salva"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {formType === 'heartRate' && (
          <Form {...heartRateForm}>
            <form onSubmit={heartRateForm.handleSubmit(handleHeartRateSubmit)} className="space-y-4">
              <FormField
                control={heartRateForm.control}
                name="heartRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequenza Cardiaca (bpm)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} min={40} max={220} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={heartRateForm.control}
                name="timestamp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data e ora</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Salvataggio..." : "Salva"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {formType === 'glucose' && (
          <Form {...glucoseForm}>
            <form onSubmit={glucoseForm.handleSubmit(handleGlucoseSubmit)} className="space-y-4">
              <FormField
                control={glucoseForm.control}
                name="glucose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Livello di Glucosio (mg/dL)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} min={40} max={400} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={glucoseForm.control}
                name="timestamp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data e ora</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Salvataggio..." : "Salva"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
