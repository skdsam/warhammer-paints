# Aurelian Paint Vault (Warhammer Paint App)

A complete, high-performance desktop application for Warhammer hobbyists and miniature painters to track their paint collections, plan army schemes, and document step-by-step recipes.

Built with **Tauri**, **React**, **TypeScript**, **Zustand**, and **Tailwind CSS**.

## Features & Pages

The application is split into several dedicated tools to help you manage your hobby:

### 🎨 Catalog (All Paints)
- **Massive Database:** Browse over 1,300 professional hobby paints from top brands including Citadel, Vallejo, Army Painter, ProAcryl, and AK Interactive.
- **Advanced Filtering:** Filter by brand, paint type (Base, Layer, Shade, Contrast, Xpress, Mecha, etc.), or use the text search to find exactly what you need.
- **Inventory Management:** Mark paints as **Owned** or add them to your **Wishlist**.
- **Army Integration:** Directly add any paint to your Strategic Army palettes right from the catalog.

### 📦 My Paints & 🌟 Wishlist
- **My Paints:** A dedicated view of your physical paint collection. Never accidentally buy a duplicate pot of Nuln Oil again.
- **Wishlist:** Keep track of the colors you need to pick up on your next trip to the hobby store.

### 🛡️ Strategic Armies (Army Planner)
- Create and organize core paint palettes for your various factions and projects.
- Select from predefined Warhammer 40k and Age of Sigmar factions, or use Custom tags.
- **Reference Images:** Upload inspiration images for your army (images are automatically compressed to save storage).
- **Palette Tracking:** Add paints from the catalog to build your army's unified color scheme.

### 📸 Model Gallery
- Document your completed or work-in-progress individual models.
- **Photo Uploads:** Upload high-quality photos of your miniatures.
- **Paint Tagging:** Tag the exact paints used on each model.
- **Quick Navigation:** Click any tagged paint on a model to instantly jump to it in the catalog.

### 📝 Recipe Builder
- Build step-by-step painting recipes (e.g., "Ultramarine Armor", "Tyranid Carapace").
- Detail the exact technique (Basecoat, Glaze, Drybrush) and the corresponding paint used for each step.

### 🎡 Color Wheel & 🔄 Paint Converter
- **Color Wheel:** Explore color theory. Find complementary, analogous, and triadic color schemes to make your miniatures pop.
- **Paint Converter:** Looking for an alternative? Easily find equivalent colors across different brands (e.g., matching a Citadel color to a Vallejo equivalent).

### 📚 Tutorials & Guides
- A built-in knowledge base for hobbyists.
- Learn about the properties of different paint types (Base, Layer, Contrast, Washes).
- Read up on advanced techniques like Glazing, Wet Blending, and Zenithal Highlighting.

### ⚙️ Settings
- Customize the app to your liking, including appearance and data management.

## Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS, Lucide React icons.
- **State Management:** Zustand (with local persistence for instant loading and offline capability).
- **Backend / Desktop Frame:** Tauri (Rust).
- **Build Tool:** Vite.

## Development

To run the application locally:

```bash
# Install dependencies
npm install
# or
pnpm install

# Run the Tauri development server
npm run tauri dev
# or
pnpm tauri dev
```

To build the executable for your OS:

```bash
npm run tauri build
```

## Author
Created by **SkdSam**.
