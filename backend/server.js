// Importation du module HTTP, nécessaire pour créer un serveur web
const http = require('http');

// Importation de l'application Express (qui est définie dans le fichier app.js)
const app = require('./app');

// Chargement des variables d'environnement à partir du fichier .env 
require('dotenv').config();

// Fonction pour normaliser le port et s'assurer qu'il est valide
// Cette fonction prend une valeur de port (de type string ou nombre) et renvoie soit un nombre, soit false si elle n'est pas valide.
const normalizePort = val => {
  // Conversion de la valeur en entier (base 10)
  const port = parseInt(val, 10);

  // Si la conversion en nombre échoue (valeur NaN), on retourne la valeur telle qu'elle est (en string)
  if (isNaN(port)) {
    return val;
  }

  // Si la valeur du port est un nombre positif, on la retourne
  if (port >= 0) {
    return port;
  }

  // Sinon, on retourne false, indiquant que la valeur du port n'est pas valide
  return false;
};

// On récupère le port depuis les variables d'environnement (.env) ou on utilise 4000 par défaut
const port = normalizePort(process.env.PORT || '4000');

// On définit le port à utiliser pour l'application Express
app.set('port', port);

// Fonction pour gérer les erreurs du serveur, comme un port déjà utilisé
const errorHandler = error => {
  // Si l'erreur ne concerne pas l'écoute du serveur, on la renvoie pour traitement ailleurs
  if (error.syscall !== 'listen') {
    throw error;
  }

  // Récupération de l'adresse du serveur (soit un pipe Unix, soit un port réseau)
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;

  // Gestion spécifique de certaines erreurs courantes
  switch (error.code) {
    // Cas où le port nécessite des privilèges élevés pour être utilisé
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1); // Arrêt du processus avec un code d'erreur
      break;

    // Cas où le port est déjà en cours d'utilisation par un autre processus
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1); // Arrêt du processus avec un code d'erreur
      break;

    // Pour les autres types d'erreurs, on les renvoie
    default:
      throw error;
  }
};

// Création du serveur HTTP en passant l'application Express comme gestionnaire des requêtes
const server = http.createServer(app);

// Attachement du gestionnaire d'erreur au serveur pour capturer les erreurs lors de l'exécution
server.on('error', errorHandler);

// Quand le serveur commence à écouter (est prêt), on affiche un message dans la console pour indiquer le port ou le pipe utilisé
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

// Le serveur commence à écouter sur le port défini plus tôt
server.listen(port);
