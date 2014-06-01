#Assistant créateur de romans

##Le nom est poche!
Oui, il faut trouver autre chose...

##Qu'est-ce que c'est?
Le but primaire de cette application est d'être un outils pour l'écriture de romans (ou autre document demandant une organisation assez simple des informations et des liens entre elles); avec la gestion des diverses parties de celui-ci tel que: nom de l'oeuvre, fiche de l'auteur, résumé/synopsis, notes, personnages, lieux, chapitres, sections, etc.

L'outil pourrais probablement être aussi utilisé pour d'autres types de documents tel que prise de notes avec liens entre elles, mémoires, scénario de métrages ou pièce de théâtre.

##Quelle forme prendra l'outils?
Ce sera une application web locale (utilisant un serveur Apache local, tel que [sous Windows] WAMP ou EasyPHP).

###Pourquoi locale?
1. Simplement parce qu'avec le "**Cloud**" il y as possibilité que le serveur soit compromis ou disparaisse;
2. Avec un contenu publique (fonctionnalitée à venir et dont l'utilisation/l'activation sera optionnelle pour l'usager, *si et quand* un module de support "**Cloud**" serais ajouté), si vous avez une bonne idée d'histoire, vous risquez de vous faire plagier;
3. Par paranoia et volontée de contrôler totalement vos données;

Il n'est pas impossible qu'une fonctionnalitée de sauvegarde ("*backup*") vers le "**Cloud**" soit ajoutée beaucoup plus tard, et encore plus tard une fonctionnalitée de publication sur le site hébergeant l'application (mais il serait en fait préférable d'utiliser la fonctionnalitée de publication "*ePub*" à la place).

###Pourquoi est-ce une application web?
En partie pour la portabilitée entre les Systèmes d'Exploitations, en partie pour la transportabilitée (surtout si un support "**Cloud**" complet est ajouté), en partie par volontée que le projet soit "*Open Source*", pour ainsi dire.

##Quelles seront les fonctionnalitées?

###L'application supportera la création d'entitées telles que :

* Oeuvres(roman, nouvelle, mémoire)
* Chapitres
* Notes
* Personnages
* Lieux/véhicules de très grande taille (vaisseaux spaciaux, navires tel porte-avions, avions, etc)
* Objets/machines/véhicules de moyenne à petite taille (véhicule utilitaire sport, trottinette, etc)
* Et autres.

###Gabarit des entitées :
* Des gabarits pour chaque type d'entitées seront fournis;
* Ceux-ci seront modifiables pour refléter les besoins de l'auteur, tel qu'un besoin chez l'un de spécifier l'origine ethnique de chaques personnages au travers d'un choix (plutôt que dans la description générale) ou chez un autre auteur la préférence de mode de vie alimentaire (omnivore, végétaRien, végétaLien, etc);
* Il sera possible de modifier les gabarits par défaut de l'application;
* Il sera aussi possible de créer des gabarits spécifiques au projet chargé (à neuf ou à partir de ceux de l'application);

###Liaison entre les entitées (notes, personnages, etc) :
Les entitées pourront êtres liées entre elles (automatiquement par l'application ou manuellement), surtout les notes qui pourraient se référencer l'une-l'autre et/ou référencer un personnage et/ou un lieu (et/ou toute autre entitée);

Par exemple, une note nomme 1 lieu, 2 personnages et fait référence (pour rappel à l'auteur) à 4 autres notes qui iraient, dans l'ordre chronologique de lecture de l'oeuvre et selon ces notes elles-même, autant en aval qu'en amont de la présente note (ou transversalement pour les personnages et lieux). L'ordre des entitées-notes sera dictée par le lien direct (par opposition à discret, c'est à dire la mécanique de référencement) entre elles et non par leur ordre numérologique ou de création. Ex: les notes #23, 493 et 129 sont en ordre pour raconter l'histoire mais elles ont été créée dans l'ordre chronologique de 23, 129 et 493 (avec tout les numéros entre) puis réordonnées. Des notes pourront être liées à un chapitre ou un paragraphe afin de permettre à l'auteur de se rappeller les notes qui ont été réellement utilisées et à quel moment du récit.

###Autres fonctionnalitées :
* Un mécanisme de suivi des changements 
* Une "bibliothèque" pouvant contenir des liens (ouvre le fureteur système), images, extraits/citations, etc. L'idée de la bibliothèque est d'avoir des ressources qui ne font pas partie d'un quelconque projet/document. Des sources d'inspiration.
* Chaque projets aura une forme de "*moodboard*" dont les sources devront obligatoirement faire partie de la "bibliothèque", c'est à dire qu'une source ajoutée au "*moodboard*" en cours sera ajoutée à la "bibliothèque" puis liée au "*moodboard*" concerné, tout comme le "*moodboard*" en cours pourra être rempli à la carte avec le contenu de la "bibliothèque"
* Gestionnaire d'entitées (personnages, lieux, notes, etc) permettant l'ajout, la modification, la suppression, le déplacement et la copie de celles-ci
* Gestionnaire de projet permettant l'ajout, modification, suppression, déplacement et copie d'un auteur, projet ou chapitre ainsi que (dans le cas des chapitres uniquement) les renommer et les réordonner
* Assistant de création ePub(?)
* Les entitées pourront être référencée par leur numéro unique ou leur "nom", ex: #283 ou 'bob'
* Une fonction de recherche qui passe au travers du projet en cours et de la bibliothèque.


###Quelles fonctionnalitées ne seront pas présentes (au moins initialement) :
- Édition sur le site de l'Application (Module "**Cloud**")
- Copie de sauvegarde vers le site hébergeant l'application  (Module "**Cloud**")
- Copie de sauvegarde locale automatique et intégrale, c'est à dire sans le module "**Cloud**" et tel que décrit plus haut



##Comment seront sauvegardé les données?
L'application utilisera une base de données et des fichiers locaux à l'ordinateur de l'usager, séparés comme suit (et sujet à changement sans préavi quant au contenu exact de chaque fichier) :
* MySQL pour une partie des liens entre les entitées et les bribes d'information sous 64 caractères
* INI (format Ascii Texte de Microsoft) pour certaines configurations et préférences
* XML pour les gabarits, chapitres, structure du document (ordre des chapitres, etc), les entitées (note, personnage, etc)

##Les données seront-t'elles encryptées?
Non, sauf si le Module "**Cloud**" est mis en place, ce qui se déclinera en compte, contenu/oeuvres et sécurité sur le site hébergeant l'application.


(...)
