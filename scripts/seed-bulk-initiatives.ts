/**
 * Script de génération massive de données de test pour LaMap
 * Crée 100 initiatives par type (2000 au total)
 */

// Charger les variables d'environnement depuis .env.local
import { join } from 'path';

import { config } from 'dotenv';

config({ path: join(__dirname, '..', '.env.local') });

import { createClient } from '@supabase/supabase-js';

import type { InitiativeType } from '../src/types/initiative';

// Récupération des variables d'environnement
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Variables d'environnement manquantes:");
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Client Supabase avec service role key (bypass RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Tous les types d'initiatives
const INITIATIVE_TYPES: InitiativeType[] = [
  'Ressourcerie',
  'Recyclerie',
  'Repair Café',
  'Atelier vélo',
  'Point de collecte',
  'Composteur collectif',
  'AMAP',
  'Jardin partagé',
  'Grainothèque',
  'Friperie',
  'Donnerie',
  'Épicerie sociale',
  'Épicerie vrac',
  "Bibliothèque d'objets",
  'SEL',
  'Accorderie',
  'Fab Lab',
  'Coopérative',
  'Tiers-lieu',
  'Autre',
];

// Arrondissements de Paris avec coordonnées centrales
const PARIS_DISTRICTS = [
  { num: 1, name: '1er', center: [2.3412, 48.8608] as [number, number] },
  { num: 2, name: '2ème', center: [2.3418, 48.8694] as [number, number] },
  { num: 3, name: '3ème', center: [2.3619, 48.8638] as [number, number] },
  { num: 4, name: '4ème', center: [2.3546, 48.8565] as [number, number] },
  { num: 5, name: '5ème', center: [2.3485, 48.8446] as [number, number] },
  { num: 6, name: '6ème', center: [2.3304, 48.8501] as [number, number] },
  { num: 7, name: '7ème', center: [2.3123, 48.8556] as [number, number] },
  { num: 8, name: '8ème', center: [2.3136, 48.8742] as [number, number] },
  { num: 9, name: '9ème', center: [2.3418, 48.8766] as [number, number] },
  { num: 10, name: '10ème', center: [2.3632, 48.876] as [number, number] },
  { num: 11, name: '11ème', center: [2.3788, 48.8594] as [number, number] },
  { num: 12, name: '12ème', center: [2.3889, 48.8412] as [number, number] },
  { num: 13, name: '13ème', center: [2.3599, 48.8322] as [number, number] },
  { num: 14, name: '14ème', center: [2.3272, 48.8333] as [number, number] },
  { num: 15, name: '15ème', center: [2.3004, 48.8412] as [number, number] },
  { num: 16, name: '16ème', center: [2.2686, 48.8637] as [number, number] },
  { num: 17, name: '17ème', center: [2.3175, 48.8873] as [number, number] },
  { num: 18, name: '18ème', center: [2.3444, 48.8927] as [number, number] },
  { num: 19, name: '19ème', center: [2.3824, 48.8838] as [number, number] },
  { num: 20, name: '20ème', center: [2.3989, 48.8643] as [number, number] },
];

// Noms de rues variés
const STREET_NAMES = [
  'Rue de la République',
  'Avenue Jean Jaurès',
  'Boulevard Voltaire',
  'Rue du Commerce',
  'Place de la Nation',
  'Rue des Pyrénées',
  'Avenue Gambetta',
  'Rue de Belleville',
  'Boulevard de Ménilmontant',
  'Rue de la Roquette',
  'Avenue Parmentier',
  'Rue Oberkampf',
  'Rue des Boulets',
  'Avenue Ledru-Rollin',
  'Rue du Faubourg Saint-Antoine',
  'Boulevard Beaumarchais',
  'Rue de Charonne',
  'Place de la Bastille',
  'Rue Saint-Maur',
  'Avenue de la République',
  'Rue des Envierges',
  'Rue de Bagnolet',
  'Rue Pelleport',
  'Rue des Couronnes',
  'Boulevard de Belleville',
  'Rue de Crimée',
  'Avenue Secrétan',
  'Rue de Meaux',
  'Rue Louis Blanc',
  'Quai de Valmy',
  'Rue du Faubourg du Temple',
  'Boulevard de la Villette',
  'Rue de Lancry',
  'Rue Beaurepaire',
  'Avenue Claude Vellefaux',
];

// Templates de noms par type
const NAME_TEMPLATES: Record<InitiativeType, string[]> = {
  Ressourcerie: [
    'Ressourcerie de',
    'La Ressourcerie',
    'Ressourcerie du',
    'Atelier Ressourcerie',
    'Ressourcerie Solidaire',
  ],
  Recyclerie: [
    'Recyclerie de',
    'La Recyclerie',
    'Recyclerie du',
    'Espace Recyclerie',
    'Centre de Recyclage',
  ],
  'Repair Café': [
    'Repair Café',
    'Café Réparation',
    'Atelier Repair Café',
    'Repair Café du',
    'Café de Réparation',
  ],
  'Atelier vélo': [
    'Atelier Vélo',
    'Cyclofficine de',
    'Vélo École',
    'Atelier Vélo du',
    'Vélociste Solidaire',
  ],
  'Point de collecte': [
    'Point Collecte',
    'Collecte Textiles',
    'Point de Tri',
    'Station Collecte',
    'Borne de Collecte',
  ],
  'Composteur collectif': [
    'Compost de',
    'Composteur du',
    'Compost Partagé',
    'Composteur Collectif',
    'Compost de Quartier',
  ],
  AMAP: ['AMAP de', 'AMAP du', 'AMAP', 'Association AMAP', 'AMAP Bio'],
  'Jardin partagé': [
    'Jardin Partagé',
    'Jardin Collectif',
    'Jardin de',
    'Potager Partagé',
    'Jardin Communautaire',
  ],
  Grainothèque: [
    'Grainothèque de',
    'Grainothèque',
    'Échange de Graines',
    'Bibliothèque de Graines',
    'Grainothèque du',
  ],
  Friperie: [
    'Friperie de',
    'La Friperie',
    'Friperie du',
    'Vintage Shop',
    'Seconde Main',
  ],
  Donnerie: [
    'Donnerie de',
    'La Gratiferia',
    'Donnerie du',
    'Espace Don',
    'Marché Gratuit',
  ],
  'Épicerie sociale': [
    'Épicerie Sociale',
    'Épicerie Solidaire',
    'Épicerie de',
    'Solidarité Alimentaire',
    'Épicerie du',
  ],
  'Épicerie vrac': [
    'Épicerie Vrac',
    'Vrac et Bio',
    'Zéro Déchet',
    'Épicerie sans Emballage',
    'Day by Day',
  ],
  "Bibliothèque d'objets": [
    'Bricothèque',
    "Bibliothèque d'Objets",
    "Prêt d'Outils",
    "Outil'thèque",
    'La Bricothèque',
  ],
  SEL: ['SEL de', 'SEL du', "Système d'Échange Local", 'SEL', 'Échange Local'],
  Accorderie: [
    'Accorderie de',
    'Accorderie du',
    'Accorderie',
    'Réseau Accorderie',
    'Temps pour Temps',
  ],
  'Fab Lab': [
    'Fab Lab',
    'FabLab de',
    'Atelier Numérique',
    'Fab Lab du',
    'Laboratoire de Fabrication',
  ],
  Coopérative: [
    'Coopérative de',
    'La Coopérative',
    'Coop du',
    'Supermarché Coopératif',
    'Coopérative',
  ],
  'Tiers-lieu': [
    'Tiers-lieu de',
    'La Station',
    'Tiers-lieu du',
    'Espace Collaboratif',
    'Hub',
  ],
  Autre: ['Initiative de', 'Projet', 'Association', 'Collectif', 'Espace'],
};

// Descriptions templates
const DESCRIPTION_TEMPLATES: Record<InitiativeType, string[]> = {
  Ressourcerie: [
    "Collecte, tri et revente d'objets de seconde main. Donnez une seconde vie aux objets !",
    "Ressourcerie associative proposant des ateliers de réparation et sensibilisation à l'économie circulaire.",
    "Lieu de collecte et valorisation d'objets. Ateliers créatifs et vente solidaire.",
  ],
  Recyclerie: [
    "Centre de recyclage et valorisation des déchets. Contribution à l'économie circulaire.",
    'Recyclerie engagée dans la transformation des déchets en ressources.',
    'Point de collecte et recyclage pour un environnement plus propre.',
  ],
  'Repair Café': [
    "Atelier participatif de réparation d'objets. Lutte contre l'obsolescence programmée.",
    "Café de réparation où l'on apprend à réparer ensemble. Convivialité et partage de savoir-faire.",
    "Réparez vos objets avec l'aide de bénévoles. Gratuit et ouvert à tous.",
  ],
  'Atelier vélo': [
    'Atelier vélo participatif. Auto-réparation accompagnée et vente de pièces détachées.',
    'Apprenez à réparer et entretenir votre vélo. Outils et conseils gratuits.',
    "Cyclofficine associative pour promouvoir la mobilité douce et l'autonomie vélo.",
  ],
  'Point de collecte': [
    'Point de collecte pour textiles, piles et déchets spéciaux. Recyclage responsable.',
    'Station de tri et collecte. Contribuez à un environnement plus propre.',
    'Borne de collecte accessible 24h/24. Recyclez facilement vos textiles usagés.',
  ],
  'Composteur collectif': [
    'Composteur de quartier géré par les habitants. Réduisez vos déchets organiques.',
    'Compost partagé et gratuit. Chaque samedi matin, venez déposer vos épluchures.',
    'Compostage collectif pour un quartier zéro déchet. Récupération de compost au printemps.',
  ],
  AMAP: [
    "Association pour le Maintien d'une Agriculture Paysanne. Paniers bio hebdomadaires.",
    'Circuit court et produits locaux de saison. Engagement solidaire avec les producteurs.',
    'AMAP proposant légumes, fruits, pain et produits fermiers. Distribution hebdomadaire.',
  ],
  'Jardin partagé': [
    'Jardin collectif où habitants cultivent ensemble. Ateliers jardinage et moments conviviaux.',
    'Potager urbain en permaculture. Partage de récoltes et de savoir-faire.',
    'Jardin participatif ouvert à tous. Cultivez vos légumes en ville !',
  ],
  Grainothèque: [
    'Échange gratuit de graines entre jardiniers. Préservons la biodiversité végétale.',
    'Bibliothèque de graines libres et reproductibles. Prenez, déposez, partagez !',
    'Grainothèque participative pour semences potagères et florales.',
  ],
  Friperie: [
    'Friperie proposant vêtements et accessoires de seconde main. Mode éthique et petits prix.',
    'Mode vintage et économie circulaire. Large choix de vêtements de qualité.',
    'Friperie solidaire avec des milliers de pièces uniques. Alternative à la fast-fashion.',
  ],
  Donnerie: [
    "Marché gratuit mensuel. Donnez ce que vous n'utilisez plus, prenez ce dont vous avez besoin.",
    'Espace de don et récupération gratuit. Principe du gratuit et du partage.',
    'Donnerie permanente. Apportez, prenez, tout est gratuit !',
  ],
  'Épicerie sociale': [
    'Épicerie à prix réduits pour personnes en difficulté. Produits de qualité et accueil digne.',
    'Supermarché solidaire avec -30% à -70%. Accès sur critères sociaux.',
    'Épicerie sociale et solidaire. Aide alimentaire dans le respect et la dignité.',
  ],
  'Épicerie vrac': [
    'Épicerie 100% vrac et zéro déchet. Apportez vos contenants ou achetez sur place.',
    'Vrac, bio et local. Plus de 500 références sans emballage.',
    'Épicerie sans emballage. Réduisez vos déchets plastiques tout en faisant vos courses.',
  ],
  "Bibliothèque d'objets": [
    "Prêt gratuit d'outils et objets du quotidien. Usage plutôt que propriété !",
    "Bibliothèque d'objets entre voisins. Perceuse, échelle, appareil à raclette...",
    'Bricothèque de quartier. Empruntez gratuitement les outils dont vous avez besoin.',
  ],
  SEL: [
    "Système d'Échange Local sans argent. Services, savoirs et biens s'échangent librement.",
    "Réseau d'entraide et d'échange basé sur le temps. Monnaie locale virtuelle.",
    'SEL pour créer du lien social et de la solidarité de quartier.',
  ],
  Accorderie: [
    "Réseau d'échange de services et de temps. 1h donnée = 1h reçue, quel que soit le service.",
    "Accorderie basée sur l'égalité. Plomberie, garde d'enfants, cours... tout se vaut !",
    "Échange de temps et de services entre membres. Principe d'égalité et de solidarité.",
  ],
  'Fab Lab': [
    'Laboratoire de fabrication numérique ouvert à tous. Imprimante 3D, découpe laser...',
    'Fab Lab avec machines de prototypage. Ateliers, formations et accompagnement de projets.',
    'Atelier de fabrication collaborative. Électronique, robotique, impression 3D.',
  ],
  Coopérative: [
    'Supermarché coopératif et participatif. Membres-propriétaires, produits bio et locaux.',
    'Coopérative avec gouvernance démocratique. Chaque membre travaille et décide.',
    'Structure coopérative engagée. Produits de qualité à prix justes.',
  ],
  'Tiers-lieu': [
    'Espace hybride de coworking et de création. Innovation sociale et convivialité.',
    "Tiers-lieu d'innovation sociale. Café, ateliers, résidences d'artistes et événements.",
    'Hub collaboratif et culturel. Coworking, fablab et café associatif.',
  ],
  Autre: [
    "Initiative d'économie sociale et solidaire. Engagement pour une société plus durable.",
    'Projet citoyen et participatif. Créer du lien et de la solidarité.',
    'Association engagée dans la transition écologique et sociale.',
  ],
};

/**
 * Génère un nombre aléatoire entre min et max (inclus)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Choisit un élément aléatoire dans un tableau
 */
function randomChoice<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

/**
 * Génère des coordonnées aléatoires autour d'un point central
 * Rayon d'environ 500m
 */
function randomizeCoordinates(center: [number, number]): [number, number] {
  const [lng, lat] = center;
  // Environ 0.005 degrés = ~500m à Paris
  const offsetLng = (Math.random() - 0.5) * 0.01;
  const offsetLat = (Math.random() - 0.5) * 0.01;
  return [lng + offsetLng, lat + offsetLat];
}

/**
 * Génère un numéro de téléphone français
 */
function generatePhone(): string {
  return `+33${randomInt(1, 9)}${randomInt(10, 99)}${randomInt(10, 99)}${randomInt(10, 99)}${randomInt(10, 99)}`;
}

/**
 * Génère un email
 */
function generateEmail(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20);
  return `contact@${slug}.org`;
}

/**
 * Génère une initiative aléatoire pour un type donné
 */
function generateInitiative(type: InitiativeType, index: number) {
  const district = randomChoice(PARIS_DISTRICTS);
  const streetName = randomChoice(STREET_NAMES);
  const nameTemplate = randomChoice(NAME_TEMPLATES[type]);
  const description = randomChoice(DESCRIPTION_TEMPLATES[type]);

  const streetNumber = randomInt(1, 200);
  const address = `${streetNumber} ${streetName}, 750${district.num.toString().padStart(2, '0')} Paris`;

  // Nom de l'initiative
  let name: string;
  if (nameTemplate.includes('de') || nameTemplate.includes('du')) {
    name = `${nameTemplate} ${district.name}`;
  } else {
    name = `${nameTemplate} - ${district.name} (#${index + 1})`;
  }

  // Coordonnées randomisées autour du centre de l'arrondissement
  const coordinates = randomizeCoordinates(district.center);

  // 70% verified, 30% not verified
  const verified = Math.random() < 0.7;

  // 50% have phone, 40% have email, 30% have website
  const phone = Math.random() < 0.5 ? generatePhone() : undefined;
  const email = Math.random() < 0.4 ? generateEmail(name) : undefined;
  const website =
    Math.random() < 0.3
      ? `https://www.${name.toLowerCase().replace(/\s+/g, '')}.fr`
      : undefined;

  return {
    name,
    type,
    description,
    address,
    coordinates,
    website,
    phone,
    email,
    verified,
  };
}

/**
 * Fonction principale d'insertion des données
 */
async function seedBulkInitiatives() {
  console.log('🌱 Début du seed BULK (100 initiatives par type)...\n');

  // Vérifier la connexion Supabase
  const { error: connectionError } = await supabase
    .from('initiatives')
    .select('count')
    .limit(1);

  if (connectionError) {
    console.error(
      '❌ Erreur de connexion à Supabase:',
      connectionError.message
    );
    process.exit(1);
  }

  console.log('✅ Connexion à Supabase établie\n');

  // Compter les initiatives existantes
  const { count: existingCount } = await supabase
    .from('initiatives')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Initiatives existantes: ${existingCount}\n`);

  console.log(
    '⚠️  Ce script va générer et insérer 2000 initiatives (100 par type).'
  );
  console.log('   Cela peut prendre quelques minutes...\n');

  let totalInserted = 0;
  let totalErrors = 0;

  // Pour chaque type d'initiative
  for (const type of INITIATIVE_TYPES) {
    console.log(`\n📦 Génération de 100 initiatives de type "${type}"...`);

    let typeInserted = 0;
    let typeErrors = 0;

    // Générer 100 initiatives par type
    for (let i = 0; i < 100; i++) {
      const initiative = generateInitiative(type, i);

      // Créer le WKT (Well-Known Text) format pour PostGIS
      const locationWKT = `POINT(${initiative.coordinates[0]} ${initiative.coordinates[1]})`;

      // Insérer dans Supabase
      const { error } = await supabase.from('initiatives').insert({
        name: initiative.name,
        type: initiative.type,
        description: initiative.description,
        address: initiative.address,
        location: locationWKT,
        website: initiative.website,
        phone: initiative.phone,
        email: initiative.email,
        verified: initiative.verified,
      });

      if (error) {
        typeErrors++;
        totalErrors++;
        if (typeErrors <= 3) {
          // Afficher seulement les 3 premières erreurs par type
          console.error(`   ❌ Erreur: ${error.message}`);
        }
      } else {
        typeInserted++;
        totalInserted++;
      }

      // Afficher la progression tous les 25 inserts
      if ((i + 1) % 25 === 0) {
        console.log(`   ✓ ${i + 1}/100 insérées pour ${type}`);
      }
    }

    console.log(`✅ ${type}: ${typeInserted} insérées, ${typeErrors} erreurs`);
  }

  // Résumé final
  console.log('\n' + '='.repeat(70));
  console.log('📈 RÉSUMÉ DU SEED BULK');
  console.log('='.repeat(70));
  console.log(`✅ Initiatives insérées avec succès: ${totalInserted}`);
  console.log(`❌ Erreurs rencontrées: ${totalErrors}`);
  console.log(`📊 Total dans la base: ${(existingCount || 0) + totalInserted}`);
  console.log('='.repeat(70) + '\n');

  console.log('✨ Seed BULK terminé avec succès!\n');
}

// Exécution du script
seedBulkInitiatives().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
