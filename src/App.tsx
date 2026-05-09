import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { PaintGrid } from "./components/PaintGrid";
import { ColorWheel } from "./components/ColorWheel";
import { RecipeBuilder } from "./components/RecipeBuilder";
import { ArmyPlanner } from "./components/ArmyPlanner";
import { PaintConverter } from "./components/PaintConverter";
import { Settings } from "./components/Settings";
import { ModelGallery } from "./components/ModelGallery";
import { Tutorials } from "./components/Tutorials";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="flex min-h-screen bg-bg-dark text-text-primary">
      {/* Sidebar - Fixed */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content - Scrollable with offset for sidebar */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            {activeTab === "all" && <PaintGrid filterMode="all" />}
            {activeTab === "owned" && <PaintGrid filterMode="owned" />}
            {activeTab === "wishlist" && <PaintGrid filterMode="wishlist" />}
            {activeTab === "wheel" && <ColorWheel />}
            {activeTab === "converter" && <PaintConverter />}
            {activeTab === "armies" && <ArmyPlanner />}
            {activeTab === "recipes" && <RecipeBuilder />}
            {activeTab === "models" && <ModelGallery setActiveTab={setActiveTab} />}
            {activeTab === "tutorials" && <Tutorials />}
            {activeTab === "settings" && <Settings />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[-1]">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-brand-primary)_0%,_transparent_70%)]" />
      </div>
    </div>
  );
}

export default App;
