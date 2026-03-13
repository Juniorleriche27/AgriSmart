# Plan de travail - Projet Deep Learning AgriSmart

## 1. Contexte

AgriSmart veut valider la faisabilite d'un systeme de diagnostic de maladies des cultures a partir d'images de feuilles.  
Le prototype doit cibler en priorite le manioc ou le mais, rester leger pour des telephones basiques, et produire une comparaison claire entre un CNN simple et un modele de transfer learning.

## 2. Objectif general

Construire un prototype de classification d'images capable de distinguer 2 a 3 classes de feuilles :

- feuille saine
- maladie fongique
- maladie virale

Le projet doit demontrer :

- la faisabilite technique
- la performance de deux approches de deep learning
- la possibilite d'un deploiement via API

## 3. Livrables attendus

### Livrable 1: Notebook

Fichier attendu : `AgriSmart_DL.ipynb`

Contenu minimal :

- chargement et exploration du dataset
- pretraitement des images
- data augmentation
- implementation d'un CNN simple
- implementation d'un modele MobileNetV2 en transfer learning
- phase de fine-tuning
- evaluation avec accuracy, precision, recall, F1-score
- matrices de confusion
- courbes d'entrainement
- tableau comparatif final
- conclusion courte en Markdown

### Livrable 2: Presentation PDF

Presentation de 10 slides maximum contenant :

- probleme agricole
- objectif du projet
- choix du dataset
- methodologie
- comparaison des modeles
- resultats
- limites
- perspectives : TFLite, extension a d'autres cultures, modele economique

### Livrable 3: Prototype de deploiement

Une API simple avec `FastAPI` ou `Flask`, consommee par une interface `Streamlit` ou equivalente.

## 4. Strategie technique recommandee

### Choix du dataset

Utiliser un sous-ensemble du dataset PlantVillage disponible sur Kaggle.  
Pour rester aligne avec la consigne, limiter le projet a 2 ou 3 classes.

Choix recommande :

- 1 classe saine
- 1 ou 2 classes de maladies frequentes

### Taille des images

Standardiser les images en `160 x 160`.

### Pretraitement obligatoire

- nettoyage du dataset
- verification des classes et du nombre d'images
- suppression des images corrompues si necessaire
- redimensionnement
- normalisation des pixels
- separation train / validation / test

### Data augmentation

Simuler les conditions du terrain avec :

- rotation legere
- zoom
- translation
- changement de luminosite
- flips horizontaux si pertinents

## 5. Modeles a comparer

### Modele 1: CNN simple

Architecture cible :

- 2 a 3 blocs `Conv2D + MaxPooling`
- couche `Flatten` ou `GlobalAveragePooling`
- couches denses
- couche finale `Softmax`

But :

- servir de baseline
- mesurer ce qu'un modele simple peut apprendre sans poids pre-entraines

### Modele 2: Transfer Learning

Modele recommande : `MobileNetV2`

Pourquoi :

- plus leger que VGG16
- plus adapte a un contexte mobile
- plus coherent avec une future conversion TFLite

Phases :

- charger `MobileNetV2` pre-entraine
- geler la base
- entrainer la tete de classification
- degeler une partie des couches
- lancer le fine-tuning avec un faible learning rate

## 6. Metriques et validation

Comparer les modeles avec :

- accuracy
- precision
- recall
- F1-score
- matrice de confusion

Visualisations a produire :

- courbe de perte train / validation
- courbe d'accuracy train / validation
- matrice de confusion
- tableau comparatif final

## 7. Critere de decision

Le meilleur modele ne sera pas choisi seulement sur l'accuracy.  
Le choix final doit tenir compte de :

- la performance globale
- la robustesse sur les classes
- le temps d'entrainement
- la taille du modele
- la facilite de deploiement

Conclusion attendue :

- faisabilite demontree ou non
- limites actuelles
- recommandations pour une version terrain

## 8. Plan d'execution

### Phase 1: Preparation

- creer l'arborescence du projet
- telecharger le dataset
- selectionner les classes
- verifier l'equilibre des donnees

### Phase 2: Exploration et pretraitement

- visualiser quelques images par classe
- compter les images par categorie
- appliquer resize et normalisation
- construire les generateurs ou pipelines TensorFlow

### Phase 3: Premier modele

- implementer le CNN simple
- entrainer et sauvegarder les resultats
- analyser les courbes et erreurs

### Phase 4: Transfer learning

- implementer MobileNetV2
- entrainer avec base gelee
- faire le fine-tuning
- comparer avec le CNN simple

### Phase 5: Evaluation finale

- calculer toutes les metriques
- generer les matrices de confusion
- produire le tableau comparatif
- rediger la conclusion

### Phase 6: Deploiement prototype

- exporter le meilleur modele
- creer une API de prediction
- creer une petite interface Streamlit
- tester une prediction de bout en bout

### Phase 7: Communication

- preparer les slides
- resumer les resultats pour l'investisseur
- presenter les limites et perspectives

## 9. Proposition d'organisation des fichiers

```text
projet phase 3/
|-- data/
|   |-- raw/
|   |-- processed/
|-- notebooks/
|   |-- AgriSmart_DL.ipynb
|-- models/
|   |-- cnn_simple.keras
|   |-- mobilenetv2_best.keras
|-- app/
|   |-- api.py
|   |-- streamlit_app.py
|-- outputs/
|   |-- figures/
|   |-- confusion_matrices/
|   |-- reports/
|-- plan_du_travail.md
```

## 10. Outils recommandes

- Python
- Jupyter Notebook
- TensorFlow / Keras
- scikit-learn
- matplotlib / seaborn
- FastAPI ou Flask
- Streamlit

## 11. Risques et points d'attention

- dataset trop desequilibre entre les classes
- surapprentissage du CNN simple
- ecart entre images de laboratoire et conditions reelles
- modele trop lourd pour une application mobile
- faible generalisation si le nombre de classes est trop reduit

## 12. Recommandation finale

Pour ce projet, la meilleure trajectoire est :

1. commencer avec un sous-ensemble propre de PlantVillage
2. etablir une baseline avec un CNN simple
3. passer rapidement a MobileNetV2
4. retenir le modele le plus leger et le plus stable
5. preparer une demonstration simple via API + Streamlit
6. proposer ensuite une conversion TFLite comme perspective

## 13. Prochaines actions immediates

- creer la structure du projet
- choisir les 2 ou 3 classes definitives
- lancer le notebook `AgriSmart_DL.ipynb`
- entrainer le CNN simple
- entrainer MobileNetV2
- comparer les resultats
- preparer le mini-support investisseur
