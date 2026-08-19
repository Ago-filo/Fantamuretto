# FANTAMURETTO

Regia locale per l'asta del fantacalcio: listone, fasce personali, budget, rose avversarie e probabili XI.

## Utilizzo online

La versione pubblicata con GitHub Pages non richiede installazione. Tutti i dati personali dell'asta restano nel browser del dispositivo utilizzato.

Le Fasce possono essere trasferite tra dispositivi dalla schermata **Fasce**:

1. sul primo dispositivo selezionare **Esporta fasce**;
2. trasferire il file `fantamuretto-fasce-AAAA-MM-GG.json`;
3. sul secondo dispositivo selezionare **Importa fasce**.

L'importazione sostituisce soltanto Fasce, prezzi obiettivo e ordine delle priorità. Non modifica acquisti, squadre avversarie o impostazioni dell'asta.

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

Il workflow GitHub Pages pubblica automaticamente la nuova versione. Le Fasce già salvate nel browser non vengono sovrascritte; durante una successiva importazione l'app ignora e segnala gli elementi non compatibili con il listone corrente.

## Dati e privacy

L'app non usa un database e non sincronizza dati personali tra dispositivi. Acquisti, prezzi, nomi delle squadre e configurazioni sono memorizzati nel `localStorage` del browser. I file Fasce esportati sono esclusi da Git tramite `.gitignore`.
