# Demo Guide

## 1. Lancer l'API

Depuis la racine du projet :

```powershell
.\backend\run_api.ps1
```

L'API AgriSmart ecoute sur le port `8010`.

## 2. Trouver l'adresse IP du laptop

Dans un autre terminal :

```powershell
ipconfig
```

Reperez l'adresse IPv4 du Wi-Fi ou du hotspot du laptop.

Exemple :

```text
192.168.137.1
```

L'adresse a saisir dans l'application sera alors :

```text
http://192.168.137.1:8010
```

## 3. Lancer l'application mobile

Dans un autre terminal :

```powershell
cd mobile
npm start
```

Puis :

- ouvrez `Expo Go` sur le telephone
- scannez le QR code
- autorisez la camera

## 3bis. Variante APK Android

Depuis `mobile/` :

```powershell
npx eas-cli login
npm run apk
```

Puis :

- ouvrez le lien de build Expo recu a la fin
- telechargez l'APK sur le telephone
- installez l'application
- ouvrez l'application AgriSmart installee
- renseignez l'adresse API du laptop

## 4. Deroule de la demonstration

1. Ouvrir l'application AgriSmart
2. Verifier la connexion avec le bouton `Tester l'API`
3. Cadrer une feuille de mais
4. Appuyer sur `Prendre photo`
5. Appuyer sur `Analyser la feuille`
6. Montrer le diagnostic, la confiance et le conseil rapide

## 5. Point reseau important

Le telephone et le laptop doivent etre sur le meme reseau.

Le plus simple pour demain :

- activez le hotspot du laptop
- connectez le telephone sur ce hotspot
- utilisez l'IP du laptop dans l'application

## 5bis. Variante en ligne

Si l'API est deployee en ligne sur `Railway` ou `Render`, il n'est plus necessaire d'utiliser l'IP du laptop.

Il suffit de saisir dans l'application une adresse du type :

```text
https://agrismart-api.onrender.com
```

ou

```text
https://agrismart-api.up.railway.app
```

## 6. Plan B

Preparez aussi :

- 3 images de feuilles deja pretes
- une courte video de demonstration
- une capture ecran de l'application avec resultat
