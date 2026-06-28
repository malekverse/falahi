# GLOSSARY.md — Domain Terms & Tunisian Vocabulary
## Filahi — Required reading for AI agents writing user-facing content

> This file prevents the AI agent from producing incorrect Tunisian terms, wrong units,
> or culturally tone-deaf copy. Reference it before writing any string the user will see.

---

## 1. Core Business Terms

| Term | Meaning | Usage in codebase |
|---|---|---|
| **Gachara** | Traditional agricultural middleman who exploits farmers | Used in marketing copy; never in UI strings shown to farmers or drivers |
| **Filahi** (فلاحي) | "My farmer" in Tunisian Arabic | Product name |
| **Mandra** | Informal garage/yard used for storage | Refers to micro-hub in farmer/driver conversations |
| **Kias fadha** | "Empty truck" — driver returning with no cargo | Used in driver value proposition copy |
| **Nasba** | Fraud/scam — specifically cargo being offloaded early | Internal code comment term for cargo theft risk |
| **Djej Arbi** (دجاج عربي) | Free-range / countryside chicken or eggs | Product category display name |
| **Hara** (حارة) | Unit = 1 crate of 30 eggs | Mapping: `unit = 'hara'`, display as "حارة" |
| **D17** | Tunisian postal transfer (used to pay farmers) | Phase 1 payout method |
| **Flousi / Flouci** | Tunisian mobile wallet app; also colloquial for "money" | Payment method in Phase 2 |
| **Walletii** | Ooredoo Tunisia mobile wallet | Payment method alternative in Phase 2 |
| **Ktef** | Tunisian slang: "connections/nepotism" | Internal documentation only; never in UI |
| **CNSS** | Caisse Nationale de Sécurité Sociale (social security) | Legal/admin context |
| **INDP** | Instance Nationale de Protection des Données Personnelles | Data compliance context |
| **APIA** | Agence de Promotion des Investissements Agricoles | Grant/funding context |
| **CIN** | Carte d'Identité Nationale (national ID card) | Driver verification; stored securely |

---

## 2. Tunisian Units of Measurement (Produce)

| Unit | `unit` field value | Description | Approx. equivalent |
|---|---|---|---|
| Kilogram | `kg` | Standard weight | 1 kg |
| Hara | `hara` | Egg crate | 30 eggs |
| Litre | `litra` | Liquid (milk, oil) | 1 L |
| Caisse / Crate | `crate` | Generic wooden/plastic crate | ~20–25 kg of produce |
| Piece | `piece` | Individual items (watermelon, pumpkin) | 1 unit |
| Tonne | `ton` | Bulk agricultural weight | 1,000 kg |

---

## 3. Tunisian Darija Phrases (WhatsApp Bot)

These exact phrases and variations must be handled by the Whisper + LLM pipeline:

### Selling / Listing Intent
- "3andi..." / "عندي..." — "I have..."
- "nheb nbii3..." / "نحب نبيع..." — "I want to sell..."
- "bi3" / "بيع" — "sell" / "for sale"
- "wejdin l'ejmaah" / "وجدين للجماعة" — "ready for pickup"
- "fi" + location — "in [location name]"

### Common Product Names (Darija → Standard)
| Darija | Standard Name | category |
|---|---|---|
| بيض بلدي / beydh bledi | Organic Eggs | `eggs` |
| دجاج عربي / djej arbi | Free-range Chicken | `other` |
| طماطم / tamatem | Tomatoes | `vegetables` |
| بطاطا / btata | Potatoes | `vegetables` |
| بصل / bsel | Onions | `vegetables` |
| قارص / qars | Citrus (lemon/orange) | `fruit` |
| عسل / 3asel | Honey | `honey` |
| زيت زيتون / zit ziton | Olive Oil | `olive_oil` |
| تمر / tmer | Dates | `fruit` |
| فلفل / felfel | Peppers | `vegetables` |
| كرنون / kernoun | Artichoke | `vegetables` |
| فول / foul | Fava Beans | `legumes` |
| حومص / houmous | Chickpeas | `legumes` |

### Regions / Governorates (common mispronunciations to handle)
| Farmer says | Maps to |
|---|---|
| "المطر" / Mateur | Mateur, Bizerte |
| "بيجة" / Béja | Béja |
| "سيدي بوزيد" / Sidi Bouzid | Sidi Bouzid |
| "بجة" | Béja (alternate spelling) |
| "الهامة" | Hammamet |
| "نابل" / Nabeul | Nabeul |
| "قفصة" / Gafsa | Gafsa |
| "قيروان" / Kairouèn | Kairouan |

### Payment / Status Queries (bot must recognize these)
- "وش جاني فلوسي؟" — "Did my money arrive?"
- "فلوسي وصلو؟" — "Did my money arrive?" (alternate)
- "الدفع" — "payment"
- "وشيا باش دير" — "what should I do?"

---

## 4. Product Category Rules (Phase 1 Approved Only)

The AI agent must enforce this. Do not accept listings for non-approved categories.

| Approved ✅ | Rejected ❌ in Phase 1 |
|---|---|
| Eggs (djej arbi) | Fresh milk (cold chain required) |
| Honey | Fresh meat (cold chain required) |
| Olive oil | Yogurt / dairy (cold chain required) |
| Potatoes | Live animals |
| Onions | Fish / seafood |
| Citrus fruit | Frozen products |
| Seasonal vegetables (tomatoes, peppers, artichoke) | |
| Legumes (fava beans, chickpeas) | |
| Dates | |
| Dried herbs | |

**Code enforcement:** The `product_category` ENUM in the DB does not include cold-chain categories. The LLM prompt must include: "If the product requires refrigeration (milk, meat, yogurt, fish), respond with confidence_score = 0 and a note explaining it is not currently supported."

---

## 5. Geographic Context

### Key Agricultural Production Regions
| Region | Known For | Typical Drive to Tunis |
|---|---|---|
| Béja | Wheat, potatoes, vegetables | 90 min |
| Sidi Bouzid | Tomatoes, peppers, potatoes | 3.5 hours |
| Kairouan | Olive oil, sheep, dates | 2 hours |
| Nabeul / Cap Bon | Citrus, tomatoes, wine grapes | 1 hour |
| Mateur / Bizerte | Eggs, dairy (Phase 2), vegetables | 1 hour |
| Gafsa | Dates, pomegranates | 5 hours |
| Siliana | Olive oil, almonds | 2.5 hours |

### Key Delivery Zones (Tunis Urban Area)
| Zone Name | Neighborhoods Included |
|---|---|
| Zone La Marsa | La Marsa, Sidi Bou Said, Gammarth, La Soukra |
| Zone Ennasr | Ennasr, Ariana, Menzah 5–9 |
| Zone Cité Olympique | Montplaisir, El Menzah 1–4, Mutuelleville |
| Zone Centre Ville | Tunis Medina, Bab Souika, Bab Bhar |
| Zone Ben Arous | Ben Arous, Mégrine, Rades |

### Micro-Hub Location (Phase 1: one hub only)
- **Name:** Hub Bir El Kassaa
- **Address:** Route de Sfax, Bir El Kassaa, Ben Arous Governorate
- **Coordinates:** 10.2417°E, 36.7525°N
- **Why here:** Intersection of all major southern highway entries into Tunis; adjacent to existing wholesale market (Marché de Gros); low commercial real estate cost

---

## 6. Currency & Number Formatting

- **All prices stored as integers in millimes** (1 TND = 1000 millimes)
- Never use floating point for money
- Display format: `1.500 TND` (Tunisian convention uses period as thousands separator)
- Locale code: `ar-TN` for Arabic display, `fr-TN` for French display
- Always show 3 decimal places: `2.500 TND` not `2.5 TND`

---

## 7. Driver Tier System Vocabulary

| Internal Term | Driver-Facing Label (FR) | Driver-Facing Label (AR) |
|---|---|---|
| `trust_tier: 1` | Nouveau Chauffeur | سائق جديد |
| `trust_tier: 2` | Chauffeur Vérifié | سائق موثوق |
| `trust_tier: 3` | Chauffeur Élite | سائق نخبة |

Tier upgrade conditions (must be enforced in code):
- Tier 1 → 2: 5+ completed trips, avg rating ≥ 4.0, no disputes
- Tier 2 → 3: 20+ completed trips, avg rating ≥ 4.5, no disputes in last 10 trips

---

## 8. Trip Status — Display Labels

| DB Status | Admin Label | Driver Label (app) | Buyer Label |
|---|---|---|---|
| `pending` | En attente de chauffeur | Disponible | Commande confirmée |
| `accepted` | Chauffeur assigné | Ma mission | En préparation |
| `in_transit` | En route vers le hub | En cours | En chemin 🚛 |
| `arrived_hub` | Arrivé au hub | Au hub | Au hub de tri |
| `delivered` | Livré au hub | Terminé ✅ | En livraison finale |
| `settled` | Réglé | Paiement reçu | Livré ✅ |
| `disputed` | ⚠ Litige ouvert | — | Problème détecté |
