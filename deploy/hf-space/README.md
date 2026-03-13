---
title: AgriSmart API
colorFrom: green
colorTo: gray
sdk: docker
app_port: 7860
---

# AgriSmart API

Backend FastAPI pour la detection des maladies du mais.

## Endpoints

- `GET /health`
- `POST /predict`

Ce Space embarque le modele final `TFLite` du projet.

## Secrets optionnels

Ajoutez ces secrets dans `Settings > Variables and secrets` du Space si vous voulez
un commentaire genere par Cohere :

- `COHERE_API_KEY`
- `COHERE_MODEL` avec `command-a-03-2025` si vous voulez forcer le modele
