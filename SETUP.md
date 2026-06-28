# SETUP.md — Project Initialization Guide
## Filahi — Getting the monorepo running from zero

> Follow these steps in order. Don't skip.
> Estimated time: 2–3 hours for complete setup.

---

## Prerequisites

```bash
node --version     # Must be >= 20.x
pnpm --version     # Must be >= 9.x (install: npm i -g pnpm)
git --version      # Any recent version
expo --version     # Must be >= 0.18.x (install: npm i -g expo-cli)
```

---

## Step 1: Initialize Monorepo

```bash
mkdir filahi && cd filahi
git init

# Create pnpm workspace config
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
EOF

# Create root package.json
cat > package.json << 'EOF'
{
  "name": "filahi",
  "private": true,
  "scripts": {
    "dev:web": "pnpm --filter web dev",
    "dev:driver": "pnpm --filter driver start",
    "build:web": "pnpm --filter web build",
    "typecheck": "pnpm -r typecheck",
    "db:generate-types": "supabase gen types typescript --local > packages/types/src/database.ts"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0"
  }
}
EOF

# Create Turborepo config
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "typecheck": { "dependsOn": ["^build"] }
  }
}
EOF

# .gitignore
cat > .gitignore << 'EOF'
node_modules
.next
dist
.env
.env.local
.env.*.local
*.env
.turbo
.expo
EOF
```

---

## Step 2: Shared Packages

```bash
mkdir -p packages/types/src packages/supabase/src packages/utils/src packages/ui/src

# packages/types/package.json
cat > packages/types/package.json << 'EOF'
{
  "name": "@filahi/types",
  "version": "0.0.1",
  "main": "./src/index.ts",
  "scripts": { "typecheck": "tsc --noEmit" }
}
EOF

# Create the domain types file
cat > packages/types/src/index.ts << 'EOF'
export type UserRole = 'farmer' | 'driver' | 'courier' | 'buyer' | 'admin'
export type TripStatus = 'pending' | 'accepted' | 'in_transit' | 'arrived_hub' | 'delivered' | 'settled' | 'disputed'
export type Millimes = number  // ALL prices as integers in millimes

export function formatTND(millimes: Millimes): string {
  return (millimes / 1000).toLocaleString('fr-TN', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  }) + ' TND'
}

export interface AIListingExtraction {
  product_name: string
  quantity: number
  unit: 'kg' | 'hara' | 'litra' | 'crate' | 'piece' | 'ton'
  location_name: string
  asking_price_tnd: number | null
  harvest_date: string | null
  notes: string | null
  confidence_score: number
}

export interface LocationPing {
  driver_id: string
  trip_id: string
  lat: number
  lng: number
  timestamp: string
}
EOF
```

---

## Step 3: Create Next.js Web App

```bash
cd apps
pnpm create next-app@latest web \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd web

# Install Supabase
pnpm add @supabase/supabase-js @supabase/ssr

# Install map library
pnpm add react-map-gl maplibre-gl

# Install UI
pnpm add @radix-ui/react-* class-variance-authority clsx tailwind-merge lucide-react

# Install i18n
pnpm add next-intl

# Create .env.local (copy from ENVIRONMENT.md)
cp ../../.env.example .env.local
```

### Key Next.js file structure:
```
apps/web/src/
├── app/
│   ├── [locale]/
│   │   ├── marketplace/
│   │   │   └── page.tsx
│   │   ├── orders/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── admin/
│   │       ├── layout.tsx        ← Admin auth check
│   │       ├── page.tsx          ← KPI dashboard
│   │       ├── trips/page.tsx    ← Live map
│   │       ├── farmers/page.tsx
│   │       ├── drivers/page.tsx
│   │       └── ledger/page.tsx
│   └── api/
│       ├── webhooks/
│       │   └── whatsapp/route.ts
│       └── trips/
│           ├── validate-otp/route.ts
│           └── create/route.ts
├── components/
│   ├── map/
│   │   └── LiveDriverMap.tsx
│   └── marketplace/
│       └── ListingCard.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts             ← Browser client
│   │   └── server.ts             ← Server client (cookies)
│   └── utils/
│       ├── otp.ts
│       └── price.ts
└── middleware.ts                 ← Auth + admin check
```

---

## Step 4: Create Expo Driver App

```bash
cd ../..
cd apps
npx create-expo-app driver --template blank-typescript
cd driver

# Install dependencies
npx expo install expo-location expo-task-manager
npx expo install expo-secure-store expo-network
pnpm add @supabase/supabase-js @react-native-async-storage/async-storage

# Create .env
cat > .env << 'EOF'
EXPO_PUBLIC_SUPABASE_URL=your-url-here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key-here
EXPO_PUBLIC_BG_LOCATION_TASK=DRIVER_LOCATION_TASK
EXPO_PUBLIC_GPS_INTERVAL_MS=45000
EOF
```

### Key Expo config (app.json):
```json
{
  "expo": {
    "name": "Filahi Driver",
    "slug": "filahi-driver",
    "version": "1.0.0",
    "android": {
      "package": "tn.filahi.driver",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "FOREGROUND_SERVICE",
        "FOREGROUND_SERVICE_LOCATION"
      ]
    },
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Filahi a besoin de votre position pour suivre vos livraisons."
        }
      ]
    ]
  }
}
```

---

## Step 5: Supabase Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Initialize (from project root)
supabase init

# Start local Supabase
supabase start

# Copy local keys to your env files
supabase status
# Shows: API URL, anon key, service_role key

# Enable PostGIS extension
# Go to: Supabase Dashboard → Project → Database → Extensions → Enable PostGIS

# Run migrations (copy SQL from DATA_MODELS.md)
supabase db push

# Generate TypeScript types
pnpm db:generate-types
```

---

## Step 6: Meta WhatsApp Setup

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create new App → Business type
3. Add "WhatsApp" product
4. Get your: `Phone Number ID`, `Access Token`, `App Secret`
5. Add to `.env.local`
6. For local testing, install ngrok: `npx ngrok http 3000`
7. Set webhook URL in Meta dashboard: `https://your-ngrok-url/api/webhooks/whatsapp`
8. Set verify token to match `META_WA_WEBHOOK_VERIFY_TOKEN`
9. Subscribe to: `messages` webhook field

---

## Step 7: Verify Everything Works

```bash
# From root
pnpm install
pnpm typecheck   # Must return 0 errors

# Start web
pnpm dev:web     # http://localhost:3000

# Start driver app (on your Android device or emulator)
pnpm dev:driver  # Scan QR code with Expo Go

# Test WhatsApp webhook locally
curl -X GET "http://localhost:3000/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test123"
# Must return: test123
```

---

## Step 8: Development Workflow

```bash
# Start everything
pnpm dev:web &
pnpm dev:driver &

# After any DB schema change
supabase db diff         # See what changed
supabase db push         # Apply to local
pnpm db:generate-types   # Regenerate TS types

# Build driver APK for testing
cd apps/driver
eas build --platform android --profile preview

# Deploy web to Vercel
vercel --prod
```

---

## Common Issues

**"supabase: command not found"**
→ `npm install -g supabase` then restart terminal

**Expo background location not working**
→ Must run on real device, not simulator. Ensure Android permissions in app.json include `ACCESS_BACKGROUND_LOCATION`.

**WhatsApp webhook failing**
→ Check Meta dashboard → Webhooks → show error details. Most common: signature mismatch (wrong `META_WA_APP_SECRET`).

**PostGIS functions missing**
→ Go to Supabase Dashboard → Database → Extensions → Enable PostGIS. Then re-run migrations.

**TypeScript errors after DB change**
→ Run `pnpm db:generate-types` to regenerate the database types file.
