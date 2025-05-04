import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface DateFilterProps {
  onFilterChange: (dateFrom: string, dateTo: string) => void;
}

export default function DateFilter({ onFilterChange }: DateFilterProps) {
  // Get today and one month ago for default values
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const [dateFrom, setDateFrom] = useState(formatDateForInput(oneMonthAgo));
  const [dateTo, setDateTo] = useState(formatDateForInput(today));
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleApplyFilter = () => {
    // Validate dates
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    
    if (fromDate > toDate) {
      toast({
        title: "Errore",
        description: "La data di inizio deve essere precedente alla data di fine",
        variant: "destructive"
      });
      return;
    }
    
    // Apply filter
    onFilterChange(dateFrom, dateTo);
    
    toast({
      title: "Filtro applicato",
      description: `Dati filtrati dal ${dateFrom} al ${dateTo}`
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-3">Filtra per data</h3>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="date-from">
              Data inizio
            </label>
            <Input 
              type="date" 
              id="date-from" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="date-to">
              Data fine
            </label>
            <Input 
              type="date" 
              id="date-to" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleApplyFilter}>
              Applica filtro
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
