import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { Ruolo, StatoRichiesta } from "../app/generated/prisma/enums";

const PASSWORD = "Password123!";

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  await prisma.richiestaPermesso.deleteMany();
  await prisma.user.deleteMany();
  await prisma.categoriaPermesso.deleteMany();

  const catFerie = await prisma.categoriaPermesso.create({
    data: { descrizione: "Ferie" },
  });
  const catVisita = await prisma.categoriaPermesso.create({
    data: { descrizione: "Visita medica" },
  });
  const catPersonale = await prisma.categoriaPermesso.create({
    data: { descrizione: "Permesso personale" },
  });

  const resp1 = await prisma.user.create({
    data: {
      nome: "Laura",
      cognome: "Bianchi",
      email: "laura.bianchi@azienda.test",
      passwordHash,
      ruolo: Ruolo.RESPONSABILE,
    },
  });
  await prisma.user.create({
    data: {
      nome: "Marco",
      cognome: "Verdi",
      email: "marco.verdi@azienda.test",
      passwordHash,
      ruolo: Ruolo.RESPONSABILE,
    },
  });

  const dip1 = await prisma.user.create({
    data: {
      nome: "Anna",
      cognome: "Rossi",
      email: "anna.rossi@azienda.test",
      passwordHash,
      ruolo: Ruolo.DIPENDENTE,
    },
  });
  const dip2 = await prisma.user.create({
    data: {
      nome: "Luca",
      cognome: "Neri",
      email: "luca.neri@azienda.test",
      passwordHash,
      ruolo: Ruolo.DIPENDENTE,
    },
  });

  const m = 4;
  const y = 2026;
  const inizioMese = new Date(Date.UTC(y, m, 5));
  const fineMese = new Date(Date.UTC(y, m, 9));

  await prisma.richiestaPermesso.create({
    data: {
      richiedenteId: dip1.id,
      categoriaId: catFerie.id,
      dataInizio: inizioMese,
      dataFine: fineMese,
      motivazione: "Settimana al mare",
      stato: StatoRichiesta.IN_ATTESA,
    },
  });

  await prisma.richiestaPermesso.create({
    data: {
      richiedenteId: dip1.id,
      categoriaId: catVisita.id,
      dataInizio: new Date(Date.UTC(y, m, 12)),
      dataFine: new Date(Date.UTC(y, m, 12)),
      motivazione: "Controllo annuale",
      stato: StatoRichiesta.APPROVATO,
      dataValutazione: new Date(Date.UTC(y, m, 1)),
      valutatoreId: resp1.id,
    },
  });

  await prisma.richiestaPermesso.create({
    data: {
      richiedenteId: dip2.id,
      categoriaId: catPersonale.id,
      dataInizio: new Date(Date.UTC(y, m, 20)),
      dataFine: new Date(Date.UTC(y, m, 22)),
      motivazione: "Trasloco",
      stato: StatoRichiesta.RIFIUTATO,
      dataValutazione: new Date(Date.UTC(y, m, 2)),
      valutatoreId: resp1.id,
    },
  });

  await prisma.richiestaPermesso.create({
    data: {
      richiedenteId: dip2.id,
      categoriaId: catFerie.id,
      dataInizio: new Date(Date.UTC(y, m, 25)),
      dataFine: new Date(Date.UTC(y, m, 28)),
      motivazione: "Ponte fine mese",
      stato: StatoRichiesta.APPROVATO,
      dataValutazione: new Date(Date.UTC(y, m, 3)),
      valutatoreId: resp1.id,
    },
  });

  console.log("Seed completato. Password per tutti gli utenti:", PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
