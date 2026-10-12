# Caffè Loja (caffeloja.com) ☕

An artisan coffee roastery, specialty brew bar, and e-commerce web application built with **Next.js (App Router, JS/JSX)** and **MongoDB / Mongoose**.

---

## 🌟 Tech Stack & Architecture

- **Framework**: Next.js 16 (App Router)
- **Language**: Pure JavaScript & JSX (`.js`, `.jsx`) — **No TypeScript / TSX**
- **Database**: MongoDB with Mongoose ODM & Native MongoDB Driver
- **Styling**: Vanilla CSS with custom coffee-inspired design system & dark glassmorphism
- **Icons**: Lucide React

---

## 🚀 Getting Started

### 1. Configure MongoDB Connection

Copy `.env.example` or edit [`.env.local`](file:///e:/nextjs%20projects/caffeloja.com/.env.local):

```env
# Local MongoDB instance:
MONGODB_URI=mongodb://127.0.0.1:27017/caffeloja

# Or MongoDB Atlas cluster:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/caffeloja?retryWrites=true&w=majority

MONGODB_DB=caffeloja
```

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 📦 Project Structure

```
caffeloja.com/
├── .env.example                # Environment variable template
├── .env.local                  # Local MongoDB connection configuration
├── jsconfig.json               # Path resolution configuration (@/*)
├── next.config.js              # Next.js configuration
├── package.json                # Project scripts & dependencies
└── src/
    ├── app/
    │   ├── globals.css         # Rich Vanilla CSS coffee-themed design system
    │   ├── layout.jsx          # Root layout with CartProvider, Navbar & Footer
    │   ├── page.jsx            # Homepage (Hero, Roasts, Craftsmanship, Reviews)
    │   ├── menu/page.jsx       # Interactive Catalog & Filterable Menu
    │   ├── about/page.jsx      # Story of the Lisbon Roastery & Direct Trade
    │   ├── reserve/page.jsx    # Table & Tasting Masterclass Booking
    │   └── api/
    │       ├── health/         # GET MongoDB connection status
    │       ├── products/       # GET/POST Coffee products
    │       ├── products/seed/  # POST Seed initial artisan coffee data
    │       ├── reservations/   # GET/POST Tasting & Table reservations
    │       └── newsletter/     # POST Email newsletter subscription
    ├── components/
    │   ├── Navbar.jsx          # Responsive navigation & cart badge
    │   ├── Footer.jsx          # Footer & newsletter form
    │   ├── CoffeeCard.jsx      # Product card with roast meter & grind selection
    │   ├── CartDrawer.jsx      # Slide-out cart & express checkout
    │   └── DbStatusBadge.jsx   # Live MongoDB indicator & 1-click DB seeder
    ├── context/
    │   └── CartContext.jsx     # Client cart state & localStorage persistence
    ├── data/
    │   └── coffeeData.js       # Seed catalog for single-origins, blends & pastries
    ├── lib/
    │   ├── mongodb.js          # Native MongoDB connection cache
    │   └── mongoose.js         # Mongoose connection cache for App Router
    └── models/
        ├── Product.js          # Mongoose Product model
        ├── Order.js            # Mongoose Order model
        ├── Reservation.js      # Mongoose Reservation model
        └── Newsletter.js       # Mongoose Newsletter subscriber model
```

---

## 🔌 API Routes

- `GET /api/health` — Returns MongoDB connection state and server health.
- `GET /api/products` — Queries products from MongoDB (with category and featured filtering).
- `POST /api/products` — Adds a new coffee product to the catalog.
- `POST /api/products/seed` — Seeds default single-origin coffees and items into MongoDB.
- `POST /api/reservations` — Saves guest reservations to the MongoDB `reservations` collection.
- `POST /api/newsletter` — Saves subscriber emails to MongoDB.
