# Permessi lavorativi

Applicazione full-stack (Next.js 16, Prisma 7, PostgreSQL / Supabase) per richieste e approvazioni di permessi: API REST, autenticazione JWT, UI CSR con dashboard dipendente/responsabile, statistiche mensili e documentazione OpenAPI servita da `/openapi.yaml` con interfaccia Swagger in `/api-docs`.

## Variabili d’ambiente

| Variabile | Uso |
|-----------|-----|
| `DATABASE_URL` | **Pooler** Supabase: host `…pooler.supabase.com`, porta **6543**, query `?pgbouncer=true` (runtime app in [`lib/prisma.ts`](lib/prisma.ts)) |
| `DIRECT_URL` | **Connessione diretta al DB** per `prisma migrate`: host **`db.<PROJECT_REF>.supabase.co`**, porta **5432** (copia da Dashboard → *Connect* → *ORM* / *URI* in modalità **Direct connection**). Non usare il pooler qui se ottieni `P1001`. |
| `JWT_SECRET` | Segreto H256 per i JWT (minimo 16 caratteri) |

### Se `prisma migrate dev` fallisce con `P1001`

1. **Progetto in pausa** (piano gratuito): in Supabase *Project Settings* riattiva il progetto.
2. **`DIRECT_URL` sbagliato**: in Dashboard → **Connect to your project** → stringa **Direct** (host `db.xxxxx.supabase.co`, user di solito `postgres`, password del database). Evita `pooler.supabase.com:5432` per le migrazioni se la rete non la raggiunge.
3. **`DATABASE_URL`**: deve essere la stringa **Transaction** (porta **6543**), non la 5432 del pooler, per l’app.
4. **Password con caratteri speciali**: codifica la password nell’URL (es. `@` → `%40`).
5. **Firewall / VPN / IPv6**: prova un’altra rete o controlla che non blocchi l’uscita sulla 5432/6543.

## Comandi

```bash
npm install
npx prisma migrate deploy   # applica migrazioni (richiede DIRECT_URL)
npm run db:seed               # dati di esempio (password: Password123!)
npm run dev
```

- Swagger UI: [http://localhost:3000/api-docs](http://localhost:3000/api-docs) (incolla il token da login in **Authorize**).
- Utenti seed: `anna.rossi@azienda.test`, `luca.neri@azienda.test` (dipendenti); `laura.bianchi@azienda.test`, `marco.verdi@azienda.test` (responsabili).

## Sicurezza API (DELETE)

- **Dipendente:** `DELETE /api/richieste/{id}` solo per richieste **proprie** in stato **IN_ATTESA** (come tabella API della consegna).
- **Responsabile:** stesso endpoint consente di eliminare richieste in stato **APPROVATO** (come regole di sicurezza della consegna).

## Prisma 7

URL del database non sono nello `schema.prisma`; il client usa l’adapter `pg` in [`lib/prisma.ts`](lib/prisma.ts). Le migrazioni leggono `DIRECT_URL` (o fallback `DATABASE_URL`) da [`prisma.config.ts`](prisma.config.ts).
"# permessi" 
