# Guide parent

Ce guide explique, sans jargon, comment utiliser Savoir Quest au quotidien et en tirer le meilleur parti.

## Le principe en une minute

Votre enfant ouvre l'application sur son téléphone et lance la **mission du jour** : 10 questions, environ 5 minutes, présentées comme un match de football. L'application choisit les questions en fonction de ses erreurs récentes et de ce qu'il a étudié en classe. Chaque lundi, vous recevez un **bilan** de ce qu'il réussit et de ce qu'il rate.

## Installer l'application (une seule fois)

1. Sur son téléphone Android, ouvrir l'adresse de l'application dans **Chrome**.
2. Menu ⋮ → **Installer l'application**. Une icône « SQ » apparaît sur l'écran d'accueil.
3. Lancer l'application, créer son profil (son prénom) et jouer une première mission **avec du réseau**.
4. Toucher **Activer** dans le bandeau « Rappel à 17 h 30 », puis **Autoriser**.
   Sur Xiaomi : Paramètres → Applications → Chrome → Économie de batterie → « Aucune restriction », sinon les notifications peuvent être bloquées.

L'application fonctionne ensuite **sans connexion**. Les mises à jour arrivent toutes seules : il suffit de la fermer et de la rouvrir (une à deux fois).

## Ce que voit votre enfant

| Écran | À quoi ça sert |
|---|---|
| **Mission du jour** | Match de 10 questions : une bonne réponse est un but, une erreur est un but adverse |
| **Choisir une matière** | S'entraîner sur une matière précise |
| **Mes erreurs** | Reprendre ce qu'il a raté |
| **Ma collection** | Cartes de joueur, badges, records, matchs, saisons |
| **Réglages et sauvegarde** | Chrono, sons, sauvegarde de la progression |

La **série de jours** et la **saison** de la semaine (Bronze → Champion) l'encouragent à revenir un peu chaque jour. Perdre un match n'enlève aucun point.

## Suivre sa progression

### Le bilan du lundi

Chaque lundi matin, un e-mail GitHub (« Bilan Savoir Quest — 2026-Sxx ») contient le bilan de la semaine et du mois : réussite par matière, compétences à retravailler, cas précis ratés, réussites hésitantes (bonnes réponses mais lentes), dernières erreurs avec **sa réponse** et la bonne, et des pistes d'exercices. Les bilans sont aussi classés dans le dépôt privé des bilans.

### Le tableau de bord

Adresse : https://savoir-quest-suivi.web.app — connexion avec le compte Google du parent autorisé. On y choisit le profil et la période ; les boutons **Bilan (.md)** et **Copier le bilan** produisent le rapport à la demande.

### Comment lire les chiffres

- **Réussite supérieure à 80 %** : la compétence est acquise.
- **Entre 60 et 80 %** : à consolider, l'application la repropose.
- **Moins de 60 %** : à retravailler ; les cas précis ratés indiquent exactement quoi (par exemple « millièmes » ou « 7×8 »).
- **Réussites hésitantes** : il connaît la réponse mais met du temps ; la compétence est fragile.

## Faire évoluer les exercices

L'application est conçue pour s'enrichir de ce que l'enfant étudie.

1. **Déposer** les documents dans `MathQuest/_source/cours/<matière>/` : de préférence un **PDF par document** (ou des photos nettes en JPEG), nommés par chapitre et par type, par exemple `maths/decimaux-controle-corrige.pdf`. Les **contrôles corrigés** sont les plus précieux.
2. **Demander** à l'assistant de les lire et d'en tirer des exercices (précisez la date du prochain contrôle si elle existe).
3. **Relire** quelques questions en jouant et signaler celles qui semblent ambiguës ou fausses : elles seront reformulées.

Ces documents restent sur l'ordinateur ; ils ne sont **jamais publiés**. Les questions sont reformulées, pas recopiées. Le détail technique est dans [CONTENU.md](CONTENU.md).

## Sauvegarder la progression

La progression est enregistrée **automatiquement** après chaque mission (avec du réseau). Rien à faire au quotidien.

**Si le téléphone est réinitialisé ou si les données de Chrome sont effacées**, la progression se restaure ainsi :

1. Sur le tableau de bord, section **Sauvegardes automatiques**, toucher **Télécharger** à côté de la sauvegarde la plus récente (un fichier est téléchargé).
2. Envoyer ce fichier sur le téléphone de l'enfant.
3. Dans l'application : **Réglages et sauvegarde → Restaurer**, puis choisir le fichier. Les profils, points, badges et cartes reviennent.

Une copie supplémentaire de la dernière sauvegarde est archivée chaque lundi dans le dépôt privé (`sauvegardes/derniere-sauvegarde.json`) : elle sert de secours si le projet Firebase disparaissait. Le bouton **Sauvegarder** des réglages reste utile pour exporter un fichier à la main.

## Questions fréquentes

**Les résultats n'apparaissent pas sur le tableau de bord.** Il faut qu'une mission ait été jouée avec du réseau et que l'application soit à jour (numéro de version affiché en bas de l'accueil).

**Le rappel de 17 h 30 n'arrive pas.** Vérifier l'autorisation des notifications et l'économie de batterie de Chrome ; si l'enfant a déjà joué ce jour-là, aucun rappel n'est envoyé.

**Une question me semble fausse ou ambiguë.** Notez son texte et signalez-la : elle sera corrigée.

**Mon enfant peut-il arrêter le suivi ?** Les résultats sont envoyés automatiquement ; l'application l'indique dans ses réglages. Pour tout effacer ou supprimer, voir [DONNEES-ET-CONFIDENTIALITE.md](DONNEES-ET-CONFIDENTIALITE.md).

**Qu'est-ce qui est envoyé exactement ?** Le prénom du profil, la matière, juste ou faux, la date, le temps de réponse, et en cas d'erreur la question et les réponses. S'y ajoute la sauvegarde automatique de la progression (points, badges, erreurs à revoir…). Rien d'autre.

**Ma sauvegarde ne s'affiche pas sur le tableau de bord.** Il faut qu'une mission ait été jouée avec du réseau, avec l'application en v18 ou plus.
