# Synchronisation du projet

## Base projet active

Tous les fichiers synchronises dans cette note concernent :

- `C:\projet phase 3`

## Contributions reperees

- `notebooks/AgriSmart_DL.ipynb`
  - notebook final principal
  - execute et valide
  - integre les apports utiles d'Eli et de Kevin
  - produit directement les artefacts finaux dans `models/final/`
  - enregistre les checkpoints intermediaires dans `models/checkpoints/`

- `notebooks/contributions/CNN_Projet_AgriSmart_travail_de_kevin.ipynb`
  - notebook de Kevin
  - conserve comme reference
  - apport repris dans le notebook final : sauvegarde explicite du modele final au format Keras

- `notebooks/contributions/Projet_AgriSmartProjet_travail_de_Eli.ipynb`
  - notebook d'Eli
  - conserve comme reference
  - apports repris dans le notebook final : audit des images, comparaison globale et export TFLite

- `models/archive/agrismart_model_modele_Eli.tflite`
  - ancien export TFLite conserve comme archive de contribution

## Decision de synchronisation

Le modele final pour l'application est :

- `models/final/agrismart_model_final.tflite`

Le modele Keras final est :

- `models/final/agrismart_model_final.keras`

Le manifeste associe est :

- `models/final/model_metadata.json`

## Etat application

- le modele final est pret pour integration
- les classes et dimensions d'entree sont documentees
- une API locale `FastAPI` est presente dans `backend/`
- une application `Expo React Native` est presente dans `mobile/`
- la demo mobile repose sur la camera du telephone et l'endpoint `POST /predict`
- des fichiers de deploiement en ligne ont ete ajoutes : `railway.json`, `render.yaml`, `requirements.txt`
- un commentaire optionnel via Cohere est maintenant prevu dans l'API si `COHERE_API_KEY` est defini

## Point de vigilance

Le modele final TFLite utilise l'ordre de classes suivant :

1. `common_rust`
2. `healthy`
3. `northern_leaf_blight`

L'application doit respecter exactement cet ordre au moment d'afficher la prediction.
