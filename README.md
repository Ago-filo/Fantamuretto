# FANTAMURETTO

Regia locale per l'asta del fantacalcio: listone, fasce personali, budget, rose avversarie e probabili XI.

## Utilizzo online

La versione pubblicata con GitHub Pages non richiede installazione. Tutti i dati personali dell'asta restano nel browser del dispositivo utilizzato.

Il piano d'asta può essere trasferito tra dispositivi dalla schermata **Fasce**:

1. sul primo dispositivo selezionare **Esporta piano**;
2. trasferire il file `fantamuretto-piano-AAAA-MM-GG.json`;
3. sul secondo dispositivo selezionare **Importa piano**.

Il file comprende Fasce, prezzi obiettivo, ordine delle priorità, giocatori aggiunti manualmente, correzioni locali al listone, impostazioni pre-asta e modifiche alle Probabili XI. L'importazione non contiene e non modifica acquisti, chiamate, registro o andamento live dell'asta già presenti sul dispositivo.

### Fasce da Excel o CSV

Il comando **Fasce CSV** permette di esportare un modello apribile con Excel. Il file contiene le colonne `Giocatore`, `Squadra`, `Ruolo`, `Fascia` e `Prezzo`: le Fasce e i prezzi già presenti sono precompilati, mentre gli altri giocatori restano con le ultime due celle vuote.

Dopo le modifiche, salvare da Excel come **CSV UTF-8** e usare **Importa Fasce CSV**. Sono accettati file separati da punto e virgola, virgola o tabulazione. Le colonne minime sono `Giocatore` e `Fascia`; `Prezzo` vale 1 se lasciato vuoto. `Squadra` è consigliata perché permette di distinguere eventuali omonimi, mentre `Ruolo` è informativa. Le righe senza Fascia restano fuori dalle valutazioni. L'importazione CSV sostituisce soltanto Fasce, prezzi e ordine, senza modificare listone locale, impostazioni o andamento dell'asta.

## Primo accesso e Fasce neutre

Chi apre il sito per la prima volta può scegliere se usare una base neutrale, importare un proprio file oppure partire da zero. La base neutrale non usa quotazioni ufficiali: inserisce tutti i giocatori in Tier D a 1 credito, lasciando all'utente ogni valutazione.

La schermata Fasce mostra sempre quanti giocatori sono classificati e quanti restano da valutare. Quando cambia il listone viene proposto un aggiornamento facoltativo che aggiunge soltanto i nuovi suggerimenti: prezzi, ordine e fasce già scelti dall'utente non vengono sovrascritti. Il comando **Ripristina base neutrale** sostituisce invece tutte le Fasce e richiede una conferma esplicita.

Il piano personale non è incluso nel repository pubblico. Rimane nel browser o nel file JSON esportato dall'utente.

## Minaccia avversaria

La scheda del giocatore mostra un indice di pressione avversaria da 0 a 100, le tre squadre più pericolose e un'indicazione operativa: **Chiama ora**, **Rischio asta** oppure **Tienilo nascosto**. Lo stesso indice compare nelle raccomandazioni della Bussola d'asta.

Per ogni avversario viene calcolato un punteggio combinando bisogno residuo nel ruolo, capacità massima di rilancio, appetibilità del giocatore, avanzamento della rosa e comportamento di spesa osservato. I punteggi individuali vengono aggregati con `100 × (1 − e^(-0,18 × somma punteggi))`. È un indice strategico comparativo, non una probabilità statistica di acquisto.

L'affidabilità cresce assegnando ogni acquisto alla squadra corretta: all'inizio è una stima basata soprattutto sui posti liberi, mentre durante l'asta incorpora crediti e prezzi realmente registrati.

## Avvio locale

È richiesto Node.js.

```bash
npm start
```

Aprire quindi [http://localhost:4173](http://localhost:4173).

## Aggiornamento del listone

Il listone condiviso si trova in `data/players.json`. Dopo averlo aggiornato:

```bash
git add data/players.json
git commit -m "Aggiorna listone"
git push
```

Un CSV Fantapazz con colonne `Ruolo;Calciatore;Squadra;Quotazione` può essere importato con:

```bash
node scripts/import-fantapazz-list.mjs "percorso/al/Listone_Fantapazz.csv"
```

Le righe senza squadra vengono considerate uscite dalla Serie A e non entrano nel listone. L'importatore riconcilia abbreviazioni, iniziali e piccoli refusi per conservare gli identificatori già usati da Fasce e cronologia. Il FVM resta soltanto come dato tecnico di compatibilità e non viene mostrato né utilizzato nelle analisi.

Il workflow GitHub Pages pubblica automaticamente la nuova versione. Ogni giocatore usa un identificatore stabile indipendente dalla squadra: nuovi acquisti di Serie A compaiono nel listone da valutare, mentre i trasferimenti interni aggiornano il club senza perdere Fasce, prezzi, acquisti o cronologia. Al primo avvio della versione aggiornata l'app conserva anche una copia locale dello stato precedente alla migrazione.

I vecchi file Fasce basati sulla coppia `Nome|Squadra` restano importabili. Gli elementi relativi a giocatori non più presenti nel listone vengono ignorati e segnalati durante l'importazione.

### Correzioni e giocatori manuali

Dalla schermata **Asta live** il pulsante **+ Giocatore** permette di inserire immediatamente un nuovo calciatore con nome, ruolo, squadra e quotazione di riferimento. Dalla scheda di qualsiasi giocatore si possono inoltre correggere squadra e valori tramite **Modifica dati giocatore**.

Queste modifiche restano nel browser e non alterano `data/players.json`. I giocatori aggiunti manualmente mantengono lo stesso identificatore stabile usato dal listone: se un aggiornamento ufficiale introduce in seguito lo stesso giocatore, la voce ufficiale prende automaticamente il suo posto senza scollegare Fasce o risultati d'asta. Le correzioni applicate a un giocatore ufficiale possono essere annullate con **Ripristina dati ufficiali**.

La precedenza manuale viene conservata per singolo campo: per esempio una squadra corretta localmente resta invariata, mentre la quotazione di riferimento continua a ricevere gli aggiornamenti ufficiali se non è stata modificata manualmente.

## Valori personali e quotazione ufficiale

Fascia, ordine e prezzo massimo scelti dall'utente sono gli unici valori usati dalla Bussola, dalla minaccia avversaria, dalle alternative e dai controlli di sostenibilità. La quotazione Fantapazz è soltanto un riferimento visivo e non sostituisce mai il prezzo personale; viene usata unicamente per proporre l'ordine automatico delle Probabili XI. Un giocatore fuori dalle Fasce resta **Non valutato**.

Se il nome ufficiale non coincide esattamente ma è molto simile a quello inserito manualmente, il controllo anti-doppione mostra entrambe le voci e richiede di scegliere **Unisci con quello ufficiale** oppure **Sono giocatori diversi**. L'unione trasferisce alla nuova chiave ufficiale Fasce, acquisti, chiamate, formazioni e cronologia; prima dell'operazione viene conservata nel browser una copia dello stato precedente.

## Dati e privacy

L'app non usa un database e non sincronizza dati personali tra dispositivi. Acquisti, prezzi, nomi delle squadre e configurazioni sono memorizzati nel `localStorage` del browser. I piani esportati sono esclusi da Git tramite `.gitignore`.
