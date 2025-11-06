#!/bin/bash

# Script pour mettre à jour les fonctions SQL dans Supabase
# Ajoute les colonnes de réseaux sociaux aux fonctions existantes

echo "🔄 Mise à jour des fonctions SQL Supabase pour les réseaux sociaux..."
echo ""

# Vérifier que les fichiers SQL existent
if [ ! -f "supabase/migrations/20250206_add_social_media.sql" ]; then
  echo "❌ Erreur: Le fichier de migration n'existe pas"
  exit 1
fi

if [ ! -f "supabase/functions/get_initiatives_in_bounds.sql" ]; then
  echo "❌ Erreur: Le fichier get_initiatives_in_bounds.sql n'existe pas"
  exit 1
fi

if [ ! -f "supabase/functions/get_initiatives_text_location.sql" ]; then
  echo "❌ Erreur: Le fichier get_initiatives_text_location.sql n'existe pas"
  exit 1
fi

echo "📋 Instructions pour mettre à jour Supabase:"
echo ""
echo "1️⃣  Ouvrir le SQL Editor dans Supabase Dashboard:"
echo "    https://supabase.com/dashboard/project/YOUR_PROJECT/sql"
echo ""
echo "2️⃣  Exécuter DANS L'ORDRE les fichiers SQL suivants:"
echo ""
echo "    A. Migration (ajouter les colonnes):"
echo "       📄 supabase/migrations/20250206_add_social_media.sql"
echo ""
echo "    B. Fonction get_initiatives_in_bounds:"
echo "       📄 supabase/functions/get_initiatives_in_bounds.sql"
echo ""
echo "    C. Fonction get_initiatives_text_location:"
echo "       📄 supabase/functions/get_initiatives_text_location.sql"
echo ""
echo "3️⃣  Vérifier que tout fonctionne:"
echo "    SELECT * FROM get_initiatives_in_bounds(-5.5, 41.0, 10.0, 51.5, NULL, false, 10);"
echo ""
echo "✅ Si la requête retourne des résultats avec facebook, instagram, etc., c'est bon!"
echo ""
echo "4️⃣  Importer les données de réseaux sociaux (optionnel):"
echo "    npm run import:social -- --dry-run  # Pour tester"
echo "    npm run import:social                # Pour importer"
echo ""

# Afficher le contenu des fichiers pour copier-coller
echo "📝 Contenu à copier-coller dans le SQL Editor:"
echo ""
echo "════════════════════════════════════════════════════════════"
echo "A. MIGRATION - 20250206_add_social_media.sql"
echo "════════════════════════════════════════════════════════════"
cat supabase/migrations/20250206_add_social_media.sql
echo ""
echo ""
echo "════════════════════════════════════════════════════════════"
echo "B. FONCTION - get_initiatives_in_bounds.sql"
echo "════════════════════════════════════════════════════════════"
cat supabase/functions/get_initiatives_in_bounds.sql
echo ""
echo ""
echo "════════════════════════════════════════════════════════════"
echo "C. FONCTION - get_initiatives_text_location.sql"
echo "════════════════════════════════════════════════════════════"
cat supabase/functions/get_initiatives_text_location.sql
echo ""
echo ""
echo "✨ Prêt à copier-coller dans Supabase SQL Editor!"
