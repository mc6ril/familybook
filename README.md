README BOCOLOCO CHART
DEV:

# Avant tout départ, s'aligner avec le code pré-existant (syntaxe)

## Back

    - cd Back/
    - npm install
    - add .env file and there environment variables
    - npx nodemon (démarre le serveur sur le port 3001)

## Front

    - cd Front/
    - npm install
    - npm start (démarre le projet sur le port 3000)

## Fichier .env (Sont indiqués uniquement les clés, demandez les valeurs)

- Attention : Les variables d'environnement du FRONT doivent commencer par : REACT*APP*

---

### FRONT

- REACT_APP_BASE_URL

---

### BACK

    -   DB_PASSWORD
    -   SHOPIFY_SHOP_NAME
    -   SHOPIFY_API_KEY
    -   SHOPIFY_API_PASSWORD
    -   STRIPE_API_KEY
    -   BOCOTECH_BASE_URL

---

## Installation de mySQL

- Télécharger [mySQL](http://dev.mysql.com/downloads/mysql/#downloads)
- Télécharger la version DMG Archive (la première)
- Sur l’écran suivant, cliquez sur « no thanks, just start my download »
- Suivre les étapes d’installations en acceptant tous les choix par défaut.
- Créez un mot de passe sur votre machine qui correspond au .env du back (DB_PASSWORD)

Une fois terminé, ouvrez le terminal et entrez les commandes suivantes :

       echo 'export PATH=/usr/local/mysql/bin:$PATH' >> ~/.bash_profile
       . ~/.bash_profile
       mysql -u root -p[motDePasse]

- en cas de modification de mot de passe à effectuer : SET PASSWORD FOR 'root'@'localhost' = 'azertyui';

#### Pour initiliser une nouvelle base de données

- Se positionner dans le fichier racine dans lequel nous avons crée notre fichier bocoloco_chart
- mysql -u root -p bocolocodb < bocolocodb_20211103_1345.sql (le nom de la base de donnée peut changer selon les versions)
- Une fois cette commande validé, relancer votre projet.

Déconnexion de mySql

-                             Exit ou quit

#### Quelques commandes utiles

- Afficher toutes les tables : show tables;
- Afficher les colonnes d'une tables: describe nom_du_tableau;
- Afficher les lignes / colonnes d'une tables : select \* from nom_du_tableau
- Ajouter une colonne à la table : alter table nom_du_tableau ADD nom_colonne type_colonne NULL / NOT NULL
- Modifier une colonne de la table : a la place de ADD, utiliser MODIFY ou CHANGE à la place
- Ajouter une ligne de donnée à un tableau : INSERT INTO nom_table set critères;
- Modifier une ligne de donnée dans un tableau : UPDATE nom_table SET nom_colonne;
- Supprimer une ligne d'un tableau : DELETE FROM nom_table where critères;

---

### Quelques règles à savoir

- SUR MAC : case insensitive
- SUR SERVEUR : case sensitive
- Faire attention à la table CRM_customers. Elle s'appelle CRM_Customers (avec un grand C) et sur le serveur, CRM_customers. N'engendrera pas d'erreurs sur mac mais va planter sur le serveur. Bien la nommer avec un petit "c"
# familybook
