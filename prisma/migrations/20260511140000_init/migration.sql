-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Ruolo" AS ENUM ('DIPENDENTE', 'RESPONSABILE');

-- CreateEnum
CREATE TYPE "StatoRichiesta" AS ENUM ('IN_ATTESA', 'APPROVATO', 'RIFIUTATO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "ruolo" "Ruolo" NOT NULL DEFAULT 'DIPENDENTE',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoriaPermesso" (
    "id" TEXT NOT NULL,
    "descrizione" TEXT NOT NULL,

    CONSTRAINT "CategoriaPermesso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RichiestaPermesso" (
    "id" TEXT NOT NULL,
    "dataRichiesta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataInizio" TIMESTAMP(3) NOT NULL,
    "dataFine" TIMESTAMP(3) NOT NULL,
    "motivazione" TEXT NOT NULL,
    "stato" "StatoRichiesta" NOT NULL DEFAULT 'IN_ATTESA',
    "categoriaId" TEXT NOT NULL,
    "richiedenteId" TEXT NOT NULL,
    "dataValutazione" TIMESTAMP(3),
    "valutatoreId" TEXT,

    CONSTRAINT "RichiestaPermesso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaPermesso_descrizione_key" ON "CategoriaPermesso"("descrizione");

-- CreateIndex
CREATE INDEX "RichiestaPermesso_richiedenteId_idx" ON "RichiestaPermesso"("richiedenteId");

-- CreateIndex
CREATE INDEX "RichiestaPermesso_stato_idx" ON "RichiestaPermesso"("stato");

-- CreateIndex
CREATE INDEX "RichiestaPermesso_dataInizio_dataFine_idx" ON "RichiestaPermesso"("dataInizio", "dataFine");

-- AddForeignKey
ALTER TABLE "RichiestaPermesso" ADD CONSTRAINT "RichiestaPermesso_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaPermesso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RichiestaPermesso" ADD CONSTRAINT "RichiestaPermesso_richiedenteId_fkey" FOREIGN KEY ("richiedenteId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RichiestaPermesso" ADD CONSTRAINT "RichiestaPermesso_valutatoreId_fkey" FOREIGN KEY ("valutatoreId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
