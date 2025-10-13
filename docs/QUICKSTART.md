# 🚀 Quick Start Guide - LaMap

Step-by-step guide to launch LaMap in 10 minutes.

## ⚡ Express Setup (experienced developer)

```bash
# 1. Install essential dependencies
npm install clsx tailwind-merge lucide-react

# 2. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your Mapbox and Supabase keys

# 3. Configure Supabase database
# Execute SQL in supabase.com/dashboard

# 4. Launch development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📝 Detailed Setup (beginner)

### Step 1: Check prerequisites

```bash
# Check Node.js (minimum 18, recommended 20+)
node --version

# Check npm
npm --version
```

If Node.js is not installed: [nodejs.org](https://nodejs.org)

---

### Step 2: Clone and install

```bash
# Clone the project
git clone https://github.com/your-username/lamap.git
cd lamap

# Install all dependencies
npm install

# Install missing essential dependencies
npm install clsx tailwind-merge lucide-react
```

---

### Step 3: Get API keys

#### A) Mapbox (free up to 50k requests/month)

1. Create an account on [mapbox.com](https://www.mapbox.com)
2. Go to [Account > Tokens](https://account.mapbox.com/access-tokens/)
3. Copy your **Default Public Token** (starts with `pk.`)

#### B) Supabase (free)

1. Create an account on [supabase.com](https://supabase.com)
2. Click on "New Project"
3. Fill in:
   - **Name**: `lamap`
   - **Database Password**: Generate a strong password
   - **Region**: Choose the closest (e.g., `eu-west-1` for Europe)
4. Wait 2-3 minutes for the project to be created
5. Once created, go to **Settings > API**
6. Note:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public** key: `eyJhbGciOi...`

---

### Step 4: Configure environment variables

Create a `.env.local` file at the project root:

```bash
# Copy the template
cp .env.example .env.local

# Or create manually:
touch .env.local
```

Edit `.env.local` and replace with your real keys:

```bash
# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbHh4eHh4In0.xxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxx
```

⚠️ **Important**: Never commit `.env.local` to Git!

---

### Step 5: Configure Supabase database

#### a) Create a Supabase project (if not already done)

1. Go to [supabase.com](https://supabase.com)
2. Log in or create an account (free)
3. Click on **"New Project"** (green button at top right)
4. Fill in the form:
   - **Name**: `lamap`
   - **Database Password**: Generate a strong password (click "Generate a password")
   - **Region**: Choose `Europe West (Ireland)` or the closest to you
   - **Pricing Plan**: Leave "Free" selected
5. Click on **"Create new project"**
6. ⏳ Wait 2-3 minutes for the project to be created (a progress bar will display)

#### b) Retrieve API keys

Once the project is created:

1. You're automatically on the project dashboard
2. In the left menu, click on the ⚙️ **Settings** icon (at the bottom)
3. Click on **API** in the submenu
4. Note these two values (you'll need them for `.env.local`):
   - **Project URL**: `https://xxxxxxxxx.supabase.co`
   - **anon public** (in the "Project API keys" section): `eyJhbGc...` (very long key)

#### c) Create the `initiatives` table

1. In the left menu, click on **SQL Editor** (icon `</>`)
2. Click on **"+ New Query"** at the top left
3. Copy-paste this SQL:

```sql
-- Enable PostGIS extension for geolocation
CREATE EXTENSION IF NOT EXISTS postgis;

-- Initiatives table
CREATE TABLE initiatives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  address TEXT,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  verified BOOLEAN DEFAULT false,
  image_url TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  opening_hours JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spatial index to improve geographic query performance
CREATE INDEX initiatives_location_idx ON initiatives USING GIST(location);

-- Index on type for filters
CREATE INDEX initiatives_type_idx ON initiatives(type);

-- Enable Row Level Security
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read initiatives
CREATE POLICY "Public read access to initiatives" ON initiatives
  FOR SELECT USING (true);

-- Policy: Only authenticated users can create
CREATE POLICY "Creation for authenticated users" ON initiatives
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Only the creator can modify their initiative
CREATE POLICY "Modification by owner only" ON initiatives
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Only the creator can delete their initiative
CREATE POLICY "Deletion by owner only" ON initiatives
  FOR DELETE USING (auth.uid() = user_id);
```

4. Click on the **"Run"** button (bottom right) or press `Cmd/Ctrl + Enter`
5. ✅ Verify that the message **"Success. No rows returned"** appears at the bottom
6. 🎉 Your database is ready!

---

### Step 6: Add test data (optional)

In the same **SQL Editor**, execute:

```sql
-- Insert some test initiatives
INSERT INTO initiatives (name, type, description, address, location) VALUES
(
  'Ressourcerie de Belleville',
  'Ressourcerie',
  'Collection, sorting and sale of second-hand items',
  '12 rue de Belleville, 75020 Paris',
  ST_SetSRID(ST_MakePoint(2.3894, 48.8724), 4326)
),
(
  'AMAP des Batignolles',
  'AMAP',
  'Weekly organic vegetable basket',
  '8 rue Cardinet, 75017 Paris',
  ST_SetSRID(ST_MakePoint(2.3122, 48.8842), 4326)
),
(
  'Repair Café Lyon',
  'Repair Café',
  'Collaborative repair workshops every Saturday',
  '15 rue de la République, 69002 Lyon',
  ST_SetSRID(ST_MakePoint(4.8357, 45.7640), 4326)
);
```

---

### Step 7: Launch the project

```bash
# Start the development server
npm run dev
```

You should see:

```
  ▲ Next.js 15.x
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.5s
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Step 8: Verify everything works

✅ **Checklist**:
- [ ] The home page loads without errors
- [ ] The Mapbox map displays correctly
- [ ] Test initiatives appear on the map (if you added them)
- [ ] Filters work
- [ ] No errors in the browser console (F12)

---

## 🐛 Troubleshooting

### Error: "Module not found: Can't resolve 'clsx'"

```bash
npm install clsx tailwind-merge
```

### Error: "Invalid Mapbox token"

1. Verify that your token starts with `pk.`
2. Check that there are no spaces before/after in `.env.local`
3. Restart the server after modifying `.env.local`

```bash
# Stop the server: Ctrl + C
npm run dev
```

### Error: "fetch failed" or Supabase error

1. Verify that the Supabase URL is correct (must end with `.supabase.co`)
2. Verify that the `anon` key is fully copied
3. Verify that the SQL has been executed (`initiatives` table exists)

To check the table in Supabase:
- Go to **Table Editor** > search for `initiatives`

### Map doesn't display

1. Open the browser console (F12)
2. Check if there are Mapbox errors
3. Verify that the Mapbox token is properly configured
4. Try reloading the page (Cmd/Ctrl + R)

### Port 3000 already in use

```bash
# Launch on another port
npm run dev -- -p 3001
```

---

## 🧪 Run tests

```bash
# Unit tests
npm test

# Tests in watch mode (for development)
npm test -- --watch

# Tests with coverage
npm test -- --coverage
```

---

## 📦 Production build

```bash
# Create an optimized build
npm run build

# Run the production build locally
npm start
```

---

## 🔄 Next steps

1. **Read the complete documentation**: `README.md`
2. **Consult best practices**: `BEST_PRACTICES.md`
3. **Understand the architecture**: `CONTEXT_ENGINEERING.md`
4. **Install optional dependencies**: `DEPENDENCIES.md`

---

## 🆘 Need help?

- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **Mapbox Documentation**: [docs.mapbox.com](https://docs.mapbox.com/mapbox-gl-js/api/)
- **GitHub Issues**: [github.com/your-username/lamap/issues](https://github.com)

---

## ✅ Complete checklist

- [ ] Node.js 18+ installed
- [ ] Project cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Essential dependencies added (`clsx`, `tailwind-merge`, `lucide-react`)
- [ ] Mapbox account created
- [ ] Mapbox token obtained
- [ ] Supabase account created
- [ ] Supabase project configured
- [ ] SQL executed in Supabase
- [ ] `.env.local` file created and filled
- [ ] Server launched (`npm run dev`)
- [ ] Page accessible at http://localhost:3000
- [ ] Mapbox map visible
- [ ] No errors in the console

**Estimated time**: 10-15 minutes

---

**Last updated:** October 10, 2025
