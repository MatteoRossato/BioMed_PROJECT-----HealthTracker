# HealthTrack - Monitoraggio dei Parametri Vitali

HealthTrack è un'applicazione full-stack progettata per aiutare gli utenti a monitorare i propri parametri vitali come pressione sanguigna, frequenza cardiaca e livelli di glucosio. L'applicazione consente di registrare le misurazioni, visualizzare grafici di tendenza e ricevere avvisi quando i valori superano le soglie normali.

![HealthTrack Dashboard](https://via.placeholder.com/800x450.png?text=HealthTrack+Dashboard)

## Caratteristiche Principali

- **Autenticazione Utente**: Sistema completo di registrazione e login con JWT per la sicurezza
- **Monitoraggio Parametri Vitali**: Registrazione di pressione sanguigna (sistolica/diastolica), frequenza cardiaca e livelli di glucosio
- **Visualizzazione Dati**: Grafici interattivi per monitorare i trend nel tempo
- **Sistema di Avvisi**: Notifiche automatiche quando i valori superano le soglie di sicurezza
- **Filtri per Date**: Possibilità di filtrare i dati per intervalli di date
- **Interfaccia Responsive**: Design ottimizzato per dispositivi mobili e desktop

## Stack Tecnologico

### Frontend
- **React**: Libreria JavaScript per costruire l'interfaccia utente
- **Tailwind CSS & shadcn/ui**: Framework CSS per lo styling e componenti UI
- **Chart.js**: Libreria per la creazione di grafici interattivi
- **React Query**: Gestione dello stato server e delle richieste API
- **Zod**: Validazione dei dati lato client

### Backend
- **Node.js & Express**: Server backend
- **PostgreSQL**: Database relazionale per la persistenza dei dati
- **Drizzle ORM**: ORM per l'interazione con il database
- **JWT**: Autenticazione basata su token
- **Passport.js**: Middleware di autenticazione

## Architettura dell'Applicazione

L'applicazione è strutturata secondo un'architettura client-server moderna:

```
/
├── client/                # Frontend React
│   ├── src/
│   │   ├── components/    # Componenti UI riutilizzabili
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility e configurazioni
│   │   ├── pages/         # Pagine dell'applicazione
│   │   └── ...
├── db/                    # Configurazione del database
├── server/                # Backend Express
│   ├── auth.ts            # Logica di autenticazione
│   ├── routes.ts          # Definizione delle rotte API
│   ├── storage.ts         # Accesso al database
│   └── ...
└── shared/                # Codice condiviso tra client e server
    └── schema.ts          # Schema del database e validazione
```

## Entità di Dati

### Utenti
Gli utenti possono registrarsi, effettuare il login e gestire i propri dati sanitari.

### Parametri Sanitari
Le principali entità di dati includono:
- **Pressione Sanguigna**: Sistolica e diastolica (mmHg)
- **Frequenza Cardiaca**: Battiti al minuto (BPM)
- **Livelli di Glucosio**: mg/dL

## Funzionalità Principali

### Schermata di Login/Registrazione
La schermata di autenticazione permette agli utenti di creare un nuovo account o accedere con le proprie credenziali.

![Schermata di Login](https://via.placeholder.com/800x450.png?text=Login+Screen)

### Dashboard
La dashboard principale mostra:
- Card per ogni tipo di parametro vitale
- Grafici di tendenza per ciascun parametro
- Valori più recenti con indicazione visiva (verde, giallo, rosso) in base ai valori normali
- Filtri per la visualizzazione dei dati per intervallo di date

![Dashboard](https://via.placeholder.com/800x450.png?text=Dashboard+View)

### Inserimento Dati
Gli utenti possono aggiungere nuove misurazioni tramite moduli dedicati:

![Inserimento Dati](https://via.placeholder.com/800x450.png?text=Data+Entry+Form)

### Grafici di Tendenza
I grafici mostrano l'andamento dei parametri nel tempo, con linee di soglia per i valori normali:

![Grafici di Tendenza](https://via.placeholder.com/800x450.png?text=Trend+Charts)

## Implementazione Tecnica

### Database Schema
L'applicazione utilizza PostgreSQL con Drizzle ORM e il seguente schema:

```typescript
// Tabella utenti
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Tabella dei dati sanitari
export const healthData = pgTable('health_data', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  parameterType: text('parameter_type').notNull(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  notes: text('notes')
});
```

### Autenticazione
L'autenticazione utilizza JWT (JSON Web Tokens):

```typescript
export const generateToken = (userId: number): string => {
  const secret = process.env.JWT_SECRET || 'default_secret_key';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};
```

### API REST
Le principali API esposte includono:

- `POST /api/auth/register`: Registrazione utente
- `POST /api/auth/login`: Login utente
- `GET /api/healthdata`: Recupero dei dati sanitari filtrabili
- `POST /api/healthdata`: Inserimento nuovi dati sanitari
- `GET /api/healthdata/latest`: Recupero degli ultimi valori registrati

### Visualizzazione Dati
I grafici sono implementati con Chart.js e React:

```tsx
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
```

## Come Iniziare

### Prerequisiti
- Node.js
- PostgreSQL

### Installazione

1. Clona il repository
```bash
git clone https://github.com/tuonome/healthtrack.git
cd healthtrack
```

2. Installa le dipendenze
```bash
npm install
```

3. Configura il database
```bash
npm run db:push  # Applica lo schema al database
npm run db:seed  # Popola il database con dati di esempio
```

4. Avvia l'applicazione
```bash
npm run dev
```

5. Accedi all'applicazione
```
URL: http://localhost:5000
Utente di prova: test@example.com
Password: password123
```

## Conclusioni

HealthTrack è un'applicazione completa per il monitoraggio dei parametri vitali, realizzata con tecnologie moderne e un'architettura scalabile. L'interfaccia utente intuitiva e le funzionalità di visualizzazione dei dati la rendono uno strumento efficace per tenere sotto controllo la propria salute.

---

© 2025 HealthTrack | Sviluppato con ❤️ per la tua salute