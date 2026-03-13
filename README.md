# AgriSmart - Projet Phase 3

Ce depot contient le notebook final, le modele final, une API locale de demonstration et une application mobile Expo pour la soutenance.

## Structure

```text
projet phase 3/
|-- README.md
|-- backend/
|   |-- app/
|   |-- README.md
|   |-- requirements.txt
|   |-- run_api.ps1
|-- data/
|   |-- archive/
|   |-- raw/
|-- docs/
|   |-- brief/
|   |-- planning/
|   |-- presentation/
|   |-- SYNC_STATUS.md
|-- mobile/
|   |-- App.tsx
|   |-- app.json
|   |-- src/
|-- models/
|   |-- archive/
|   |-- checkpoints/
|   |-- final/
|-- notebooks/
|   |-- AgriSmart_DL.ipynb
|   |-- contributions/
|-- outputs/
|   |-- figures/
|   |-- reports/
```

## Fichiers principaux

- notebook final : `notebooks/AgriSmart_DL.ipynb`
- modele final application : `models/final/agrismart_model_final.tflite`
- archive Keras du modele final : `models/final/agrismart_model_final.keras`
- metadonnees application : `models/final/model_metadata.json`
- backend de demo : `backend/app/main.py`
- application Expo : `mobile/App.tsx`
- guide de demo : `docs/presentation/DEMO_GUIDE.md`
- guide GitHub vers Space : `docs/presentation/GITHUB_TO_SPACE.md`
- note de synchronisation : `docs/SYNC_STATUS.md`
- cahier des charges PDF : `docs/brief/Projet Deep Learning - AgriSmart _ Detection de maladies des cultures.pdf`
- plan de travail : `docs/planning/plan_du_travail.md`
- config Railway : `railway.json`
- config Render : `render.yaml`

## Regles de lecture

- `notebooks/AgriSmart_DL.ipynb` est la version finale a presenter
- `notebooks/contributions/` contient les notebooks d'Eli et Kevin comme references
- `models/checkpoints/` contient les sauvegardes intermediaires d'entrainement
- `models/final/` contient les artefacts a utiliser pour l'application
- `backend/` contient l'API FastAPI qui charge le modele TFLite
- `mobile/` contient l'application Expo React Native pour la demonstration camera
- `.github/workflows/` contient la synchronisation automatique vers Hugging Face Spaces

## Mise en ligne

`GitHub` sert a heberger le code du projet.

Pour mettre l'API en ligne, il faut connecter ce repo a une plateforme qui execute Python, par exemple :

- `Railway` avec `railway.json`
- `Render` avec `render.yaml`

L'application Android n'a pas besoin d'etre reconstruite pour changer d'API, car l'adresse backend peut etre saisie directement dans l'application.
