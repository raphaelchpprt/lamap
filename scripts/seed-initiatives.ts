/**
 * Script de génération de données de test pour LaMap
 * Crée au moins une initiative par type pour tester l'application
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

/**
 * Données de test par type d'initiative
 * Localisations réelles à Paris et environs
 */
const INITIATIVES_DATA: Array<{
  name: string;
  type: InitiativeType;
  description: string;
  address: string;
  coordinates: [number, number]; // [longitude, latitude]
  website?: string;
  phone?: string;
  email?: string;
  verified: boolean;
}> = [
  // Ressourcerie
  {
    name: 'La Petite Rockette',
    type: 'Ressourcerie',
    description:
      "Ressourcerie associative du 11ème arrondissement. Collecte, réparation et vente d'objets de seconde main. Ateliers DIY et sensibilisation au réemploi.",
    address: '125 Rue du Chemin Vert, 75011 Paris',
    coordinates: [2.3846, 48.8586],
    website: 'https://www.lapetiterockette.org',
    phone: '+33143793350',
    email: 'contact@lapetiterockette.org',
    verified: true,
  },

  // Recyclerie
  {
    name: 'La Recyclerie',
    type: 'Recyclerie',
    description:
      "Tiers-lieu dédié à l'écologie urbaine installé dans une ancienne gare. Café-cantine, ateliers de réparation, ferme urbaine et événements éco-responsables.",
    address: '83 Boulevard Ornano, 75018 Paris',
    coordinates: [2.3468, 48.8989],
    website: 'https://www.larecyclerie.com',
    phone: '+33142579282',
    verified: true,
  },

  // Repair Café
  {
    name: 'Repair Café Belleville',
    type: 'Repair Café',
    description:
      "Atelier participatif de réparation d'objets. Tous les 2ème samedis du mois. Apportez vos objets cassés et réparez-les avec l'aide de bénévoles.",
    address: '32 Rue des Envierges, 75020 Paris',
    coordinates: [2.3886, 48.8726],
    email: 'repaircafe.belleville@gmail.com',
    verified: true,
  },

  // Atelier vélo
  {
    name: 'La Cyclofficine du 18ème',
    type: 'Atelier vélo',
    description:
      "Atelier vélo associatif et participatif. Auto-réparation accompagnée, vente de pièces détachées et vélos d'occasion. Ouvert mercredi et samedi.",
    address: '10 Rue des Fillettes, 75018 Paris',
    coordinates: [2.3598, 48.8929],
    website: 'https://www.heureux-cyclage.org',
    email: 'cyclofficine18@gmail.com',
    verified: true,
  },

  // Point de collecte
  {
    name: 'Le Relais - Point Collecte Textiles',
    type: 'Point de collecte',
    description:
      'Point de collecte de vêtements et textiles usagés. Dépôt dans les bornes Le Relais pour recyclage et valorisation textile.',
    address: 'Place de la République, 75011 Paris',
    coordinates: [2.3637, 48.8678],
    website: 'https://www.lerelais.org',
    verified: true,
  },

  // Composteur collectif
  {
    name: 'Compost des Lilas',
    type: 'Composteur collectif',
    description:
      'Composteur de quartier géré par les habitants. Dépôt libre de déchets organiques tous les samedis matin. Récupération de compost gratuit au printemps.',
    address: 'Square des Frères Chausson, 75020 Paris',
    coordinates: [2.4072, 48.8764],
    email: 'compostdeslilas@gmail.com',
    verified: true,
  },

  // AMAP
  {
    name: 'AMAP des Batignolles',
    type: 'AMAP',
    description:
      "Association pour le Maintien d'une Agriculture Paysanne. Paniers de légumes bio et locaux chaque mardi soir. Engagement par semestre.",
    address: '17 Rue des Moines, 75017 Paris',
    coordinates: [2.3206, 48.8898],
    website: 'https://amap-idf.org',
    email: 'amap.batignolles@gmail.com',
    verified: true,
  },

  // Jardin partagé
  {
    name: 'Jardin Partagé du Ruisseau',
    type: 'Jardin partagé',
    description:
      'Jardin collectif de 800m² géré par les habitants du quartier. Potager en permaculture, compost, animations et moments conviviaux.',
    address: '119 Rue du Ruisseau, 75018 Paris',
    coordinates: [2.3485, 48.8943],
    email: 'jardin.ruisseau@gmail.com',
    verified: true,
  },

  // Grainothèque
  {
    name: 'Grainothèque - Bibliothèque Faidherbe',
    type: 'Grainothèque',
    description:
      'Échange gratuit de graines entre jardiniers amateurs. Prenez et déposez librement vos graines potagères et florales. Semences libres et reproductibles.',
    address: '18 Rue Faidherbe, 75011 Paris',
    coordinates: [2.3834, 48.8515],
    website: 'https://equipement.paris.fr',
    verified: true,
  },

  // Friperie
  {
    name: 'Episode - Friperie Vintage',
    type: 'Friperie',
    description:
      'Grande friperie parisienne avec des milliers de vêtements vintage et de seconde main. Mode éthique et économie circulaire à petits prix.',
    address: '46 Rue de Rivoli, 75004 Paris',
    coordinates: [2.3561, 48.8572],
    website: 'https://www.episodeparis.com',
    verified: true,
  },

  // Donnerie
  {
    name: 'La Gratiferia',
    type: 'Donnerie',
    description:
      'Marché gratuit mensuel où tout se donne. Apportez ce que vous ne voulez plus, prenez ce dont vous avez besoin. Partage et convivialité.',
    address: "Parvis de l'Hôtel de Ville, 75004 Paris",
    coordinates: [2.3522, 48.8566],
    email: 'gratiferia.paris@gmail.com',
    verified: false,
  },

  // Épicerie sociale
  {
    name: 'Épicerie Solidaire du 19ème',
    type: 'Épicerie sociale',
    description:
      'Épicerie à prix réduits (-30% à -70%) pour les personnes en difficulté. Accès sur critères sociaux. Produits de qualité et accueil digne.',
    address: '12 Rue Cambrai, 75019 Paris',
    coordinates: [2.3823, 48.8797],
    phone: '+33142023456',
    verified: true,
  },

  // Épicerie vrac
  {
    name: 'Day by Day - Vrac et Zéro Déchet',
    type: 'Épicerie vrac',
    description:
      'Épicerie 100% vrac. Plus de 700 références alimentaires et produits du quotidien sans emballage. Apportez vos contenants ou achetez sur place.',
    address: '47 Boulevard de Magenta, 75010 Paris',
    coordinates: [2.3598, 48.8719],
    website: 'https://www.daybyday-shop.com',
    phone: '+33142056789',
    verified: true,
  },

  // Bibliothèque d'objets
  {
    name: 'La Bricothèque',
    type: "Bibliothèque d'objets",
    description:
      "Prêt gratuit d'outils et d'objets du quotidien entre voisins. Perceuse, échelle, karcher, appareil à raclette... Usage plutôt que propriété !",
    address: '28 Rue de la Fontaine au Roi, 75011 Paris',
    coordinates: [2.3715, 48.8685],
    email: 'bricotheque.paris@gmail.com',
    verified: true,
  },

  // SEL
  {
    name: 'SEL de Paris',
    type: 'SEL',
    description:
      'Système d\'Échange Local. Échange de services, savoirs et biens entre membres sans argent. Monnaie locale "la goutte". Convivialité et solidarité de quartier.',
    address: '42 Rue de Paradis, 75010 Paris',
    coordinates: [2.3523, 48.8745],
    website: 'https://sel-paris.org',
    email: 'contact@sel-paris.org',
    verified: false,
  },

  // Accorderie
  {
    name: 'Accorderie de Paris 20ème',
    type: 'Accorderie',
    description:
      "Réseau d'échange de services et de temps. 1h donnée = 1h reçue, quel que soit le service. Plomberie, garde d'enfants, cours de langue... Égalité et entraide.",
    address: '18 Rue Pixérécourt, 75020 Paris',
    coordinates: [2.3936, 48.8686],
    website: 'https://accorderie.fr',
    phone: '+33143669012',
    verified: true,
  },

  // Fab Lab
  {
    name: 'Electrolab - FabLab Paris',
    type: 'Fab Lab',
    description:
      'Laboratoire de fabrication numérique ouvert à tous. Imprimantes 3D, découpe laser, électronique, robotique. Ateliers, formations et accompagnement de projets.',
    address: '56 Rue de Bagnolet, 75020 Paris',
    coordinates: [2.4023, 48.8564],
    website: 'https://www.electrolab.fr',
    email: 'contact@electrolab.fr',
    verified: true,
  },

  // Coopérative
  {
    name: 'La Louve - Supermarché Coopératif',
    type: 'Coopérative',
    description:
      'Supermarché coopératif et participatif. Chaque coopérateur travaille 3h par mois et bénéficie de produits bio et locaux 20 à 30% moins chers.',
    address: '116 Rue des Poissonniers, 75018 Paris',
    coordinates: [2.3502, 48.8925],
    website: 'https://cooplalouve.fr',
    email: 'contact@cooplalouve.fr',
    verified: true,
  },

  // Tiers-lieu
  {
    name: 'La Station - Gare des Mines',
    type: 'Tiers-lieu',
    description:
      "Tiers-lieu d'innovation sociale et environnementale. Coworking, fablab, café solidaire, résidences d'artistes, événements culturels et projets citoyens.",
    address: '55 Rue Archereau, 75019 Paris',
    coordinates: [2.3692, 48.8925],
    website: 'https://www.lastation.paris',
    email: 'contact@lastation.paris',
    verified: true,
  },

  // Autre
  {
    name: 'Les Petites Cantines',
    type: 'Autre',
    description:
      "Restaurant participatif où les voisins cuisinent et mangent ensemble. Cantines de quartier pour créer du lien social et lutter contre l'isolement.",
    address: '15 Rue de Belleville, 75019 Paris',
    coordinates: [2.3789, 48.8724],
    website: 'https://lespetitescantines.fr',
    phone: '+33987654321',
    verified: true,
  },

  // Initiatives supplémentaires pour diversifier
  {
    name: 'Ressourcerie Créative',
    type: 'Ressourcerie',
    description:
      'Ressourcerie spécialisée dans les matériaux créatifs et artistiques. Récupération de tissus, papiers, bois et matériaux divers pour artistes et bricoleurs.',
    address: '89 Rue Oberkampf, 75011 Paris',
    coordinates: [2.3794, 48.8648],
    email: 'ressourcerie.creative@gmail.com',
    verified: false,
  },

  {
    name: 'Repair Café Nation',
    type: 'Repair Café',
    description:
      'Café de réparation tous les premiers samedis du mois. Spécialisés en électronique, couture et petits appareils électroménagers.',
    address: '58 Rue de Montreuil, 75011 Paris',
    coordinates: [2.3912, 48.8512],
    email: 'repaircafe.nation@gmail.com',
    verified: true,
  },

  {
    name: 'Vélorution Paris',
    type: 'Atelier vélo',
    description:
      'Atelier vélo autogéré. Apprentissage de la mécanique vélo, recyclage de vélos abandonnés et promotion de la mobilité cyclable.',
    address: '15 Passage Gatbois, 75012 Paris',
    coordinates: [2.3889, 48.8456],
    website: 'https://velorution.org',
    verified: false,
  },

  {
    name: 'AMAP du Marais',
    type: 'AMAP',
    description:
      'AMAP historique de Paris. Légumes, fruits, pain, fromages, viande et œufs de producteurs locaux. Distribution tous les jeudis soir.',
    address: '22 Rue du Pont aux Choux, 75003 Paris',
    coordinates: [2.3645, 48.8621],
    email: 'amap.marais@gmail.com',
    verified: true,
  },

  {
    name: 'Jardin sur le Toit',
    type: 'Jardin partagé',
    description:
      'Potager urbain sur les toits de Paris. Agriculture urbaine en bacs, ateliers de jardinage et événements éco-responsables avec vue panoramique.',
    address: 'Toit du Garage Beaubourg, 54 Rue Beaubourg, 75003 Paris',
    coordinates: [2.3546, 48.8632],
    website: 'https://jardinsurlestoit.fr',
    verified: true,
  },
];

/**
 * Fonction principale d'insertion des données
 */
async function seedInitiatives() {
  console.log('🌱 Début du seed des initiatives...\n');

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

  // Demander confirmation si des données existent déjà
  if (existingCount && existingCount > 0) {
    console.log('⚠️  Des initiatives existent déjà dans la base de données.');
    console.log(
      '   Ce script va AJOUTER de nouvelles initiatives (pas de suppression).\n'
    );
  }

  let insertedCount = 0;
  let errorCount = 0;

  // Insérer chaque initiative
  for (const initiative of INITIATIVES_DATA) {
    const {
      name,
      type,
      description,
      address,
      coordinates,
      website,
      phone,
      email,
      verified,
    } = initiative;

    // Créer le WKT (Well-Known Text) format pour PostGIS
    // Format: POINT(longitude latitude)
    const locationWKT = `POINT(${coordinates[0]} ${coordinates[1]})`;

    // Insérer dans Supabase
    const { error } = await supabase.from('initiatives').insert({
      name,
      type,
      description,
      address,
      location: locationWKT,
      website,
      phone,
      email,
      verified,
    });

    if (error) {
      console.error(
        `❌ Erreur lors de l'insertion de "${name}":`,
        error.message
      );
      errorCount++;
    } else {
      console.log(`✅ ${name} (${type})`);
      insertedCount++;
    }
  }

  // Résumé final
  console.log('\n' + '='.repeat(60));
  console.log('📈 RÉSUMÉ DU SEED');
  console.log('='.repeat(60));
  console.log(`✅ Initiatives insérées avec succès: ${insertedCount}`);
  console.log(`❌ Erreurs rencontrées: ${errorCount}`);
  console.log(`📊 Total dans la base: ${(existingCount || 0) + insertedCount}`);
  console.log('='.repeat(60) + '\n');

  // Vérifier la couverture des types
  const { data: typeCounts } = await supabase.rpc('get_initiative_types_count');

  if (typeCounts) {
    console.log('📊 Répartition par type:');
    typeCounts.forEach(({ type, count }: { type: string; count: number }) => {
      console.log(`   ${type}: ${count}`);
    });
  }

  console.log('\n✨ Seed terminé avec succès!\n');
}

// Exécution du script
seedInitiatives().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
