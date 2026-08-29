# FANTAMURETTO

Regia locale per l'asta del fantacalcio: listone, fasce personali, budget, rose avversarie e probabili XI.

## Utilizzo online

La versione pubblicata con GitHub Pages non richiede installazione. Tutti i dati personali dell'asta restano nel browser del dispositivo utilizzato.

Le Fasce possono essere trasferite tra dispositivi dalla schermata **Fasce**:

1. sul primo dispositivo selezionare **Esporta fasce**;
2. trasferire il file `fantamuretto-fasce-AAAA-MM-GG.json`;
3. sul secondo dispositivo selezionare **Importa fasce**.

L'importazione sostituisce soltanto Fasce, prezzi obiettivo e ordine delle priorità. Non modifica acquisti, squadre avversarie o impostazioni dell'asta.

## Primo accesso e Fasce neutre

Chi apre il sito per la prima volta può scegliere se usare una base neutrale, importare un proprio file oppure partire da zero. La base neutrale è generata dai valori del listone e copre i posti necessari alle rose configurate: è volutamente incompleta e deve essere personalizzata.

La schermata Fasce mostra sempre quanti giocatori sono classificati e quanti restano da valutare. Quando cambia il listone viene proposto un aggiornamento facoltativo che aggiunge soltanto i nuovi suggerimenti: prezzi, ordine e fasce già scelti dall'utente non vengono sovrascritti. Il comando **Ripristina base neutrale** sostituisce invece tutte le Fasce e richiede una conferma esplicita.

Le Fasce personali non sono incluse nel repository pubblico. Rimangono nel browser o nel file JSON esportato dall'utente.

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

Il workflow GitHub Pages pubblica automaticamente la nuova versione. Ogni giocatore usa un identificatore stabile indipendente dalla squadra: nuovi acquisti di Serie A compaiono nel listone da valutare, mentre i trasferimenti interni aggiornano il club senza perdere Fasce, prezzi, acquisti o cronologia. Al primo avvio della versione aggiornata l'app conserva anche una copia locale dello stato precedente alla migrazione.

I vecchi file Fasce basati sulla coppia `Nome|Squadra` restano importabili. Gli elementi relativi a giocatori non più presenti nel listone vengono ignorati e segnalati durante l'importazione.

### Correzioni e giocatori manuali

Dalla schermata **Asta live** il pulsante **+ Giocatore** permette di inserire immediatamente un nuovo calciatore con nome, ruolo, squadra, quotazione e FVM. Dalla scheda di qualsiasi giocatore si possono inoltre correggere squadra e valori tramite **Modifica dati giocatore**.

Queste modifiche restano nel browser e non alterano `data/players.json`. I giocatori aggiunti manualmente mantengono lo stesso identificatore stabile usato dal listone: se un aggiornamento ufficiale introduce in seguito lo stesso giocatore, la voce ufficiale prende automaticamente il suo posto senza scollegare Fasce o risultati d'asta. Le correzioni applicate a un giocatore ufficiale possono essere annullate con **Ripristina dati ufficiali**.

Se il nome ufficiale non coincide esattamente ma è molto simile a quello inserito manualmente, il controllo anti-doppione mostra entrambe le voci e richiede di scegliere **Unisci con quello ufficiale** oppure **Sono giocatori diversi**. L'unione trasferisce alla nuova chiave ufficiale Fasce, acquisti, chiamate, formazioni e cronologia; prima dell'operazione viene conservata nel browser una copia dello stato precedente.

## Dati e privacy

L'app non usa un database e non sincronizza dati personali tra dispositivi. Acquisti, prezzi, nomi delle squadre e configurazioni sono memorizzati nel `localStorage` del browser. I file Fasce esportati sono esclusi da Git tramite `.gitignore`.
