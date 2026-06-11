import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Categories from "@/pages/Categories";
import Search from "@/pages/Search";
import WallpaperDetail from "@/pages/WallpaperDetail";
import Favorites from "@/pages/Favorites";
import Downloads from "@/pages/Downloads";
import Settings from "@/pages/Settings";
import Feedback from "@/pages/Feedback";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:id" element={<Categories />} />
          <Route path="/search" element={<Search />} />
          <Route path="/wallpaper/:id" element={<WallpaperDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/:tab" element={<Settings />} />
          <Route path="/feedback" element={<Feedback />} />
        </Route>
      </Routes>
    </Router>
  );
}
