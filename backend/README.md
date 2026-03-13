# Backend AgriSmart

API locale `FastAPI` pour la soutenance.

## Lancer l'API

```powershell
.\backend\run_api.ps1
```

## Endpoints utiles

- `GET /health` : verifie que l'API et le modele sont charges
- `POST /predict` : recoit une image et renvoie la prediction

## Variables d'environnement optionnelles

- `COHERE_API_KEY` : active un commentaire genere par Cohere
- `COHERE_MODEL` : permet de changer le modele Cohere

## Exemple de test rapide

```powershell
Invoke-WebRequest `
  -Uri http://127.0.0.1:8010/predict `
  -Method Post `
  -Form @{ file = Get-Item 'C:\projet phase 3\data\raw\healthy\00031d74-076e-4aef-b040-e068cd3576eb___R.S_HL 8315 copy 2.jpg' }
```
