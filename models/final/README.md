# Final Model

Le modele final a utiliser pour l'application est :

- `agrismart_model_final.tflite`

Ce modele est maintenant exporte directement depuis le notebook final :

- `notebooks/AgriSmart_DL.ipynb`

Chemins standards :

- `models/final/agrismart_model_final.tflite`
- `models/final/agrismart_model_final.keras`
- `models/final/model_metadata.json`

Ordre exact des classes :

1. `common_rust`
2. `healthy`
3. `northern_leaf_blight`

Contraintes techniques :

- taille d'entree : `160 x 160 x 3`
- type d'entree : `float32`
- forme d'execution recommandee pour l'application : `1 x 160 x 160 x 3`

Recommendation pour l'application :

- utiliser `agrismart_model_final.tflite` comme modele de production
- charger l'ordre des classes depuis `model_metadata.json`
- conserver `agrismart_model_final.keras` comme archive de travail
