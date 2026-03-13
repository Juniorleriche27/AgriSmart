# GitHub vers Hugging Face Space

## 1. Pousser le projet sur GitHub

Dans `C:\projet phase 3` :

```powershell
git add .
git commit -m "Prepare GitHub and Hugging Face deployment"
git branch -M main
git remote add origin https://github.com/Juniorleriche27/AgriSmart.git
git push -u origin main
```

## 2. Creer un token Hugging Face

Dans Hugging Face :

- ouvrez `Settings`
- ouvrez `Access Tokens`
- creez un token avec permission `Write`

Gardez ce token en lieu sur.

## 3. Ajouter le secret dans GitHub

Dans le repo GitHub `Juniorleriche27/AgriSmart` :

- ouvrez `Settings`
- `Secrets and variables`
- `Actions`
- `New repository secret`

Nom :

```text
HF_TOKEN
```

Valeur :

- collez le token Hugging Face cree a l'etape precedente

## 4. Lancer la synchronisation

Des que le repo est pousse sur GitHub et que `HF_TOKEN` est defini :

- le workflow GitHub `Sync To Hugging Face Space` peut pousser le backend vers le Space

Vous pouvez :

- soit refaire un `git push`
- soit lancer le workflow manuellement depuis `Actions`

## 5. Resultat attendu

Le Space :

```text
https://huggingface.co/spaces/Juniorleriche/agrismart-api
```

devrait ensuite construire automatiquement l'API Docker.

L'URL publique a utiliser dans l'application sera ensuite :

```text
https://juniorleriche-agrismart-api.hf.space
```

ou l'URL publique indiquee par le Space une fois deploye.
