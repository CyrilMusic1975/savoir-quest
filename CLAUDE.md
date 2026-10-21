# Consignes de travail sur Savoir Quest

Application de révision de 6e (PWA, JavaScript pur, sans build). Lire d'abord `README.md` puis `docs/ARCHITECTURE.md`.

## Commandes

```bash
npm test                      # tous les contrôles (obligatoire avant toute publication)
python3 -m http.server 8123   # serveur local (les modules JS ne marchent pas en file://)
```

## Règles du projet

- **Langue** : tout ce que voit l'élève est en français soigné ; le code, les identifiants et les commentaires courts restent cohérents avec l'existant.
- **Publier** = `git push origin main` (GitHub Pages). À chaque publication : incrémenter `VERSION` dans `sw.js` **et** le numéro affiché dans `index.html`, mettre à jour `CHANGELOG.md`, puis vérifier avec `curl -s <url>/sw.js | grep VERSION`.
- **Ne jamais** commiter le dossier `_source/` (cours et photos d'élève), ni un secret, ni le nom de l'élève.
- **Identifiants stables** : `id` de compétence et de question ne changent jamais (maîtrise, badges, répétition espacée). Ne renomme aucune clé `localStorage`.
- **Données** : ajouter des champs à un profil passe par `ensureProfile` (`js/state.js`) pour rester compatible avec les anciennes sauvegardes.
- **Contenu** : suivre `docs/CONTENU.md`. Reformuler les cours, ne jamais recopier. Construire les mauvaises réponses à partir de vraies erreurs de l'élève. Toute question doit avoir une explication.
- **Tests** : une nouvelle fonctionnalité de contenu ou de calcul reçoit un contrôle qui recalcule le résultat indépendamment ; vérifier qu'il échoue quand on casse volontairement le code.
- **Sobriété** : pas de dépendance, pas de framework, pas de logique dans `index.html`.

## Pièges connus

- GitHub Pages peut afficher « build terminé » pour la publication précédente : se fier au contenu de `sw.js` en ligne.
- Le service worker interroge d'abord le réseau ; un téléphone met à jour à la prochaine ouverture avec du réseau (parfois la deuxième).
- Les QCM générés doivent avoir **exactement 4 options distinctes** : prévoir plus de 3 mauvaises réponses candidates pour qu'il en reste assez après filtrage.
- `mc(...)` (QCM généré) ne comble pas les mauvaises réponses manquantes : les tests de générateurs le signalent (« il manque une mauvaise réponse »).
- Les événements envoyés à Firestore sont soumis à des règles strictes (`firestore.rules` du dossier `SavoirQuest-suivi`) : un nouveau champ d'événement doit être ajouté **aux règles**, à `js/sync.js` et au tableau de bord.

- Sur `localhost`, `js/sync.js` n'envoie **rien** (sauf `?sync=1`) : ne pas s'en étonner en testant. Si tu testes l'envoi, **supprime ensuite tes données d'essai** de Firestore (`events`, `backups`, `push`), après avoir vérifié qu'aucun vrai profil n'y figure.
- La sauvegarde (`backups`) est limitée à 750 000 caractères côté application et 800 000 côté règles ; si les profils grossissent, élaguer `missed`, `matches` ou `srs` dans `ensureProfile`.

## Éléments hors de ce dépôt

- `~/Desktop/SavoirQuest-suivi` : règles Firestore, tableau de bord parent, hébergement Firebase (projet `savoir-quest-suivi`). Toujours passer `--project savoir-quest-suivi` aux commandes `firebase`.
- `~/Desktop/SavoirQuest-bilans` (dépôt privé) : bilan hebdomadaire et rappel quotidien (GitHub Actions). Secrets : `FIREBASE_SA_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`.
- Après l'ajout de compétences, régénérer les libellés du tableau de bord (voir le README de `SavoirQuest-suivi`).
