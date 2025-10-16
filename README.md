# Projekt: Flyttströmmar – Intern analysportal

## Syfte

Projektet handlar om att bygga en privat webbtjänst där inloggade användare kan se och analysera företagsflyttar i Sverige.  
Tjänsten ska visa olika typer av diagram som beskriver flyttströmmar mellan olika geografiska områden, exempelvis hur många företag som har flyttat till Gävle kommun ett visst år.

Användaren ska kunna filtrera vilka flyttar som ligger till grund för diagrammen, t.ex. genom att välja:

- Flyttår (flerval)  
- Antal anställda (flerval, fasta intervall)  
- Bolagsformer (flerval)  
- Branschkluster (flerval)  
- Ett geografiskt område (län, kommun, stad, område)  

---

## Teknisk miljö

- React Router v7 (routing och layout)  
- Drizzle ORM (PostgreSQL-databas)  
- Better Auth (inloggning)  
- shadcn/ui + TailwindCSS (komponentbibliotek)  

---

## Målbild

> En inloggad användare kan välja filter och se ett stapeldiagram som visar totalt antal företagsflyttar till valt område per år.

Tjänsten ska på sikt kunna visa många olika diagram.  
Varje diagram bör vara en självständig enhet som:

- Har en rubrikmall (t.ex. “Flyttar till {valt område}”)  
- Vet vilken diagramtyp som ska användas (t.ex. stapeldiagram, linjediagram, etc.)  
- Vet vilken databasfråga som behövs för att beräkna sitt data  

Strukturen ska göra det enkelt att lägga till nya diagram i framtiden utan att ändra övrig kod.

---

## Arbetssteg – Från databas till första diagram

1. **Skapa databasmodellen för företagsflyttar**  
   - Skapa en ny tabell som representerar företagsflyttar.  
   - Tabellen ska innehålla uppgifter som möjliggör filtrering efter flyttår, antal anställda, bolagsform, branschkluster och geografiskt område.  
   - Lägg till både från-område och till-område för varje flytt och stöd för olika nivåer (län, kommun etc.).  
   - Ska bara vara **en tabell** (`relocation` föreslaget namn).  

2. **Fylla databasen**  
   - Skapa ett script eller kommando som fyller tabellen med fejkade företagsflyttar.  
   - Testdatat ska innehålla realistiska värden (kommunnamn, årtal, antal anställda osv.).  
   - Det ska finnas tillräckligt mycket data för att kunna visa skillnader i diagrammen (flera hundra eller tusen rader).  
   - Syftet är att snabbt kunna testa filtrering och visualisering utan att behöva riktig data.  

3. **Skapa gränssnitt för filter**  
   - Bygg ett panel- eller formulärliknande gränssnitt där användaren kan välja filter.  
   - Filtren ska motsvara de fält som finns i databasen.  
   - Filtren ska vara interaktiva och kunna kombineras.  
   - Filtreringsvalen ska lagras i URL:en (via React Router) så att användaren kan dela eller återkomma till samma vy.  

4. **Skapa och visa diagrammet**  
   - Skapa en struktur för att definiera ett diagram med:  
     - en titelmall (som ändras beroende på valda filter)  
     - funktion som hämtar och beräknar data från databasen  
     - diagramtyp (t.ex. stapeldiagram)  
   - Skapa en komponent eller sektion i gränssnittet där diagrammet visas.  
   - Säkerställ att det uppdateras när filtren ändras.  
   - Presentera data tydligt med axlar, etiketter och tooltip.  
