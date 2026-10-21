# Données et confidentialité

L'application est destinée à un **enfant mineur**. Le principe retenu : collecter le strict nécessaire, informer l'enfant, n'ouvrir l'accès qu'au parent.

## Ce qui reste sur le téléphone

Toute la progression (profils, points, badges, erreurs, séance en cours) est stockée dans le navigateur (`localStorage`). Rien n'est nécessaire côté serveur pour jouer. Le bouton « Sauvegarder » exporte un fichier JSON ; « Restaurer » le réimporte (fusion en gardant le profil qui a le plus de points).

## Ce qui est envoyé au parent

À chaque réponse, un événement est envoyé à un projet Firebase **dédié** (base Firestore hébergée dans l'Union européenne, zone `eur3`) :

| Champ | Exemple | Envoyé |
|---|---|---|
| Prénom du profil | « Alex » | toujours (20 caractères au plus) |
| Compétence, matière | `dec_chiffre`, `maths` | toujours |
| Résultat | juste ou faux | toujours |
| Date | horodatage | toujours |
| Temps de réponse | 4 200 ms | toujours |
| Cas précis | « millièmes » | si pertinent |
| Identifiant de question | `fr_h109` | si question de banque |
| Réponse donnée, bonne réponse, énoncé | « 3 », « 4 », « Dans 217,384… » | **uniquement en cas d'erreur** |

Ne sont **jamais** envoyés : nom de famille, adresse, photo, localisation, identifiant publicitaire. Aucun outil de mesure d'audience, aucun cookie tiers, aucune police externe.

Si les notifications sont activées, l'abonnement du navigateur (adresse du service de notification et clés publiques) et le prénom du profil sont enregistrés dans la collection `push`, pour envoyer le rappel de 17 h 30.

L'enfant est informé dans l'application : le panneau « Réglages et sauvegarde » indique ce que voient ses parents.

## Qui peut lire quoi

| Acteur | Droits |
|---|---|
| Application de l'enfant (connexion anonyme) | **Écrire** des événements bien formés ; enregistrer son abonnement. Ne peut rien lire, modifier ni supprimer |
| Parent (connexion Google, un seul compte autorisé par les règles) | Lire et supprimer les événements et abonnements |
| Tâches planifiées (compte de service) | **Lecture seule** de la base |
| Toute autre personne | Aucun accès |

Les règles de sécurité (`firestore.rules`, dans le dossier du suivi parent) imposent : champs autorisés uniquement, types et longueurs contrôlés, pas de modification.

**Limite connue :** sans code d'association, une personne qui connaîtrait l'adresse du dépôt pourrait théoriquement *écrire* de faux résultats. Elle ne pourrait rien lire ni modifier. Si cela arrivait, la parade serait d'activer Firebase App Check.

## Où sont conservés les bilans

Le bilan hebdomadaire (prénom, statistiques, dernières erreurs) est enregistré dans un **dépôt GitHub privé**. La clé d'accès en lecture seule à la base est un secret chiffré de ce dépôt.

## Conservation et suppression

- Les événements ne sont **pas purgés automatiquement** (aucune durée de conservation n'est programmée).
- Pour tout effacer : `firebase firestore:delete /events --recursive --force --project savoir-quest-suivi` (et de même pour `/push`), ou depuis la console Firebase.
- Pour arrêter l'envoi : désinstaller l'application ou effacer les données du site dans le navigateur ; le jeu continue de fonctionner sans le suivi tant qu'aucune connexion n'est possible.
- Pour supprimer les bilans : supprimer les fichiers du dossier `bilans/` du dépôt privé.
- Pour tout supprimer définitivement : supprimer le projet Firebase et le dépôt privé.

## Contenu d'élève et droits d'auteur

Les cours, contrôles et photographies fournis pour concevoir les exercices restent dans un dossier local exclu de Git. Les questions publiées sont reformulées et ne reproduisent pas les documents des enseignants.

## Points à améliorer

- Programmer une durée de conservation (par exemple 12 mois) avec suppression automatique.
- Activer Firebase App Check si l'adresse du dépôt venait à circuler.
- Remplacer le prénom par un pseudonyme dans les événements si le suivi s'étend à d'autres enfants.
