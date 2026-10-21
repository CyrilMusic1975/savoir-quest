# Déploiement et exploitation

## Les trois éléments

| Élément | Où | Hébergé par | Publication |
|---|---|---|---|
| Application | Ce dépôt (public) | GitHub Pages, branche `main` | `git push` |
| Suivi parent | Dossier local `SavoirQuest-suivi` | Firebase (projet `savoir-quest-suivi`) | `firebase deploy` |
| Tâches planifiées | Dépôt privé `savoir-quest-bilans` | GitHub Actions | `git push` |

## Publier l'application

1. Modifier le code ou le contenu.
2. `npm test` doit être au vert.
3. **Incrémenter la version** : constante `VERSION` dans `sw.js` (`sq-v17` → `sq-v18`) et le numéro affiché dans `index.html` (`<div class="version">`). Sans cela, les téléphones peuvent garder d'anciens fichiers.
4. Si des fichiers ont été ajoutés, les inscrire dans la liste `FILES` de `sw.js` (préchargement hors ligne).
5. Mettre à jour `CHANGELOG.md`.
6. `git commit` puis `git push origin main`. GitHub Pages publie en 30 à 60 secondes.
7. Vérifier : `curl -s https://cyrilmusic1975.github.io/savoir-quest/sw.js | grep VERSION` doit afficher la nouvelle version.

> GitHub indique parfois « build terminé » pour la publication précédente : c'est le contenu de `sw.js` en ligne qui fait foi.

### Retour en arrière

`git revert <commit>` puis la même procédure, **avec une nouvelle version** de `sw.js` (le numéro ne doit jamais redescendre).

## Installer sur le téléphone (Android, Chrome)

1. Ouvrir l'adresse de l'application dans Chrome.
2. Menu ⋮ → **Installer l'application** (ou « Ajouter à l'écran d'accueil »).
3. L'icône apparaît sur l'écran d'accueil ; l'application s'ouvre en plein écran et fonctionne hors ligne après la première ouverture.
4. Pour les notifications : toucher **Activer** dans le bandeau de l'accueil, puis **Autoriser**. Sur Xiaomi (HyperOS) : Paramètres → Applications → Chrome → Économie de batterie → « Aucune restriction ».

**Mettre à jour** : fermer complètement l'application (la retirer des applis récentes) et la rouvrir avec du réseau, une ou deux fois. Le numéro de version en bas de l'accueil confirme la mise à jour.

## Suivi parent (Firebase)

Dossier `SavoirQuest-suivi/` (voir son README) : règles Firestore, page web du tableau de bord, configuration d'hébergement.

```bash
cd SavoirQuest-suivi
python3 build.py                                            # régénère public/index.html (libellés inclus)
firebase deploy --only hosting --project savoir-quest-suivi
firebase deploy --only firestore:rules --project savoir-quest-suivi
```

**Après l'ajout de compétences**, régénérer `labels.json` pour que le tableau de bord affiche leurs noms (la commande est dans le README du dossier), puis `build.py` et déployer l'hébergement.

## Tâches planifiées (dépôt privé)

| Tâche | Fichier | Horaire (UTC) | Rôle |
|---|---|---|---|
| Bilan hebdomadaire | `bilan.yml` | lundi 06:00 | Lit les résultats, écrit `bilans/AAAA-Sxx.md`, ouvre une issue (e-mail) |
| Rappel quotidien | `rappel.yml` | 15:30 et 16:30 | Envoie la notification si le profil n'a pas joué ; n'envoie qu'à 17 h heure de Paris (été et hiver) |

Lancement à la main : onglet *Actions* du dépôt privé → *Run workflow*. Pour le rappel, l'option `force=true` envoie immédiatement un message de test à tous les abonnés.

### Secrets (dépôt privé)

| Nom | Contenu |
|---|---|
| `FIREBASE_SA_KEY` | Clé JSON du compte de service `bilan-lecture` (rôle `datastore.viewer`, lecture seule) |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | Clés de signature des notifications. La clé publique est aussi dans `js/push.js` |

**Renouveler la clé du compte de service**

```bash
gcloud iam service-accounts keys create /tmp/nouvelle.json \
  --iam-account=bilan-lecture@savoir-quest-suivi.iam.gserviceaccount.com
gh secret set FIREBASE_SA_KEY -R <compte>/savoir-quest-bilans < /tmp/nouvelle.json
shred -u /tmp/nouvelle.json          # puis supprimer l'ancienne clé : gcloud iam service-accounts keys delete <id> --iam-account=…
```

Renouveler les clés VAPID oblige chaque téléphone à se réabonner (la clé publique change dans `push.js`).

## Restaurer la progression

Voir le [guide parent](GUIDE-PARENT.md) : téléchargement du fichier sur le tableau de bord, puis « Restaurer » dans l'application. En dernier recours, le fichier `sauvegardes/derniere-sauvegarde.json` du dépôt privé a le même format.

## Tester l'envoi en local

Sur `localhost` l'application n'envoie **rien** (événements, sauvegarde, notifications), pour ne pas mélanger des données d'essai à la base réelle. Pour tester volontairement : `http://localhost:8123/index.html?sync=1`, puis supprimer les données d'essai (`firebase firestore:delete /events --recursive …`, après avoir vérifié qu'aucun vrai profil n'y figure).

## Dépannage

| Symptôme | Cause probable | Action |
|---|---|---|
| L'ancien affichage persiste | Cache du téléphone | Fermer/rouvrir l'appli ; vérifier le numéro de version ; sinon effacer les données du site **après avoir sauvegardé** |
| Aucun résultat sur le tableau de bord | Pas de réseau, ou version trop ancienne (< v8) | Faire jouer une mission avec du réseau ; vérifier la file `sq_sync` |
| Connexion Google refusée | Compte non autorisé par les règles | Utiliser le compte parent défini dans `firestore.rules` |
| Pas de notification | Permission refusée, économie de batterie, appli non installée | Réglages du téléphone ; tester avec `force=true` |
| Le bilan du lundi n'arrive pas | Notifications GitHub désactivées, ou dépôt sans activité depuis 60 jours | Consulter l'onglet *Issues* et *Actions* |
| La progression a disparu | Données du site effacées | Télécharger la sauvegarde automatique sur le tableau de bord, puis « Restaurer » |

## Sauvegardes

- **Progression de l'élève** : sauvegarde automatique dans Firebase (collection `backups`) + copie hebdomadaire dans le dépôt privé ; le bouton « Sauvegarder » reste disponible.
- **Code** : historique Git du dépôt public.
- **Suivi parent et tâches** : voir leur README ; aucun export automatique des données Firestore n'est configuré.
