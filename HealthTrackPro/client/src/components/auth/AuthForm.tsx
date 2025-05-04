import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { registerUser, loginUser } from '@/lib/auth';
import { ROUTES } from '@/lib/constants';

// Form schemas
const loginSchema = z.object({
  email: z.string().email("Inserisci un indirizzo email valido"),
  password: z.string().min(6, "La password deve essere di almeno 6 caratteri")
});

const registerSchema = z.object({
  username: z.string().min(3, "Il nome utente deve essere di almeno 3 caratteri"),
  email: z.string().email("Inserisci un indirizzo email valido"),
  password: z.string().min(6, "La password deve essere di almeno 6 caratteri"),
  confirmPassword: z.string().min(6, "La password deve essere di almeno 6 caratteri")
}).refine(data => data.password === data.confirmPassword, {
  message: "Le password non corrispondono",
  path: ["confirmPassword"]
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthForm() {
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const handleLogin = async (values: LoginFormValues) => {
    try {
      setIsLoading(true);
      await loginUser(values.email, values.password);
      toast({
        title: "Accesso effettuato",
        description: "Benvenuto su HealthTrack!",
      });
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Errore di accesso",
        description: error instanceof Error ? error.message : "Credenziali non valide",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (values: RegisterFormValues) => {
    try {
      setIsLoading(true);
      await registerUser(values.username, values.email, values.password);
      toast({
        title: "Registrazione completata",
        description: "Account creato con successo!",
      });
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Errore di registrazione",
        description: error instanceof Error ? error.message : "Errore durante la registrazione",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <span className="text-5xl text-primary">❤️</span>
          </div>
          <h1 className="text-2xl font-medium text-primary">HealthTrack</h1>
          <p className="text-muted-foreground mt-2">Monitora la tua salute, giorno per giorno</p>
        </div>

        {isLoginForm ? (
          <>
            <h2 className="text-xl font-medium mb-4">Accedi</h2>
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="La tua email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="La tua password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Accesso in corso..." : "Accedi"}
                </Button>
              </form>
            </Form>
            <div className="text-center mt-4 text-sm">
              <p className="text-muted-foreground">
                Non hai un account?{" "}
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-medium"
                  onClick={() => setIsLoginForm(false)}
                >
                  Registrati
                </Button>
              </p>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-medium mb-4">Registrati</h2>
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome utente</FormLabel>
                      <FormControl>
                        <Input placeholder="Il tuo nome utente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="La tua email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Crea una password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conferma Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Conferma la password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Registrazione in corso..." : "Registrati"}
                </Button>
              </form>
            </Form>
            <div className="text-center mt-4 text-sm">
              <p className="text-muted-foreground">
                Hai già un account?{" "}
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-medium"
                  onClick={() => setIsLoginForm(true)}
                >
                  Accedi
                </Button>
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
