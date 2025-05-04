import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { getAuthUser, logoutUser } from '@/lib/auth';
import { ROUTES } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const user = getAuthUser();

  useEffect(() => {
    if (!user) {
      navigate(ROUTES.AUTH);
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast({
        title: "Logout effettuato",
        description: "Arrivederci!",
      });
      navigate(ROUTES.AUTH);
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il logout",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-white shadow">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <span className="mr-2">❤️</span>
            <h1 className="text-xl font-medium">HealthTrack</h1>
          </div>
          <div className="flex items-center">
            <span className="mr-4 hidden md:inline">{user.username}</span>
            <button 
              className="flex items-center hover:bg-primary-foreground/10 px-2 py-1 rounded-md transition-colors focus:outline-none"
              onClick={handleLogout}
            >
              <span className="mr-1">🚪</span>
              <span className="hidden sm:inline">Esci</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="bg-muted py-4 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2023 HealthTrack. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>
  );
}
