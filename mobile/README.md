# Mobile AgriSmart

Application `Expo React Native` pour la demonstration camera.

## Lancer l'application

```powershell
cd mobile
npm start
```

Puis ouvrez `Expo Go` sur le telephone et scannez le QR code.

## Generer un APK Android

Depuis `mobile/` :

```powershell
npx eas-cli login
npm run apk
```

Le profil `preview` genere un vrai fichier `.apk` installable directement sur Android.

## Installer l'APK

- attendez la fin du build EAS
- ouvrez le lien donne par Expo
- telechargez l'APK sur le telephone
- autorisez l'installation depuis la source demandee
- installez l'application

## Ce que fait l'application

- ouvre la camera du telephone
- prend une photo de la feuille
- envoie l'image a l'API `FastAPI`
- affiche la classe predite, la confiance et un conseil rapide

## Point important

Le champ `Adresse API` doit contenir l'IP du laptop, par exemple :

```text
http://192.168.137.1:8010
```
