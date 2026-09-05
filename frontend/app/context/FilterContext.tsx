"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { Category } from "../types/category";
import { State } from "@/app/types/state";
import { City } from "../types/city";

interface FilterContextType {
  isLoading: boolean;
  selectedCities: City[];
  setSelectedCities: (cities: City[]) => void;
  toggleCity: (city: City) => void;
  selectedCategory: Category | null;
  setSelectedCategory: (category: Category | null) => void;
  selectedState: State | null; // جدید
  setSelectedState: (state: State | null) => void;
  priceMin: number | null; // جدید
  setPriceMin: (price: number | null) => void;
  priceMax: number | null; // جدید
  setPriceMax: (price: number | null) => void;
  hasImage: boolean; // جدید
  setHasImage: (value: boolean) => void;
  isUrgent: boolean; // جدید (فقط فوری‌ها)
  setIsUrgent: (value: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true); // ✅
  const hasLoaded = useRef(false); // ✅ برای یک بار اجرا

  const [selectedCities, setSelectedCitiesState] = useState<City[]>([]);
  const [selectedCategory, setSelectedCategoryState] =
    useState<Category | null>(null);
  const [selectedState, setSelectedStateState] = useState<State | null>(null);
  const [priceMin, setPriceMinState] = useState<number | null>(null);
  const [priceMax, setPriceMaxState] = useState<number | null>(null);
  const [hasImage, setHasImageState] = useState<boolean>(false);
  const [isUrgent, setIsUrgentState] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // بارگذاری از localStorage
  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    const storedCities = localStorage.getItem("selectedCities");
    if (storedCities) {
      try {
        const parsed = JSON.parse(storedCities);
        setSelectedCitiesState(parsed);
        // console.log("✅ Parsed cities:", parsed);
      } catch (e) {
        console.error("❌ Failed to parse cities:", e);
      }
    }
    const storedCategory = localStorage.getItem("selectedCategory");
    if (storedCategory) {
      try {
        setSelectedCategoryState(JSON.parse(storedCategory));
      } catch {}
    }
    const storedState = localStorage.getItem("selectedState");
    if (storedState) {
      try {
        setSelectedStateState(JSON.parse(storedState));
      } catch {}
    }
    const storedPriceMin = localStorage.getItem("priceMin");
    if (storedPriceMin) {
      try {
        setPriceMinState(JSON.parse(storedPriceMin));
      } catch {}
    }
    const storedPriceMax = localStorage.getItem("priceMax");
    if (storedPriceMax) {
      try {
        setPriceMaxState(JSON.parse(storedPriceMax));
      } catch {}
    }
    const storedHasImage = localStorage.getItem("hasImage");
    if (storedHasImage) {
      try {
        setHasImageState(JSON.parse(storedHasImage));
      } catch {}
    }
    const storedIsUrgent = localStorage.getItem("isUrgent");
    if (storedIsUrgent) {
      try {
        setIsUrgentState(JSON.parse(storedIsUrgent));
      } catch {}
    }
    setIsLoading(false);
  }, []);

  // ذخیره در localStorage
  // useEffect(() => {
  //   localStorage.setItem("selectedCities", JSON.stringify(selectedCities));
  // }, [selectedCities]);

  useEffect(() => {
    if (selectedCities)
      localStorage.setItem("selectedCities", JSON.stringify(selectedCities));
    else localStorage.removeItem("selectedCities");
  }, [selectedCities]);
  useEffect(() => {
    if (selectedCategory)
      localStorage.setItem(
        "selectedCategory",
        JSON.stringify(selectedCategory),
      );
    else localStorage.removeItem("selectedCategory");
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedState)
      localStorage.setItem("selectedState", JSON.stringify(selectedState));
    else localStorage.removeItem("selectedState");
  }, [selectedState]);

  useEffect(() => {
    if (priceMin !== null)
      localStorage.setItem("priceMin", JSON.stringify(priceMin));
    else localStorage.removeItem("priceMin");
  }, [priceMin]);

  useEffect(() => {
    if (priceMax !== null)
      localStorage.setItem("priceMax", JSON.stringify(priceMax));
    else localStorage.removeItem("priceMax");
  }, [priceMax]);

  useEffect(() => {
    localStorage.setItem("hasImage", JSON.stringify(hasImage));
  }, [hasImage]);

  useEffect(() => {
    localStorage.setItem("isUrgent", JSON.stringify(isUrgent));
  }, [isUrgent]);

  // توابع
  const setSelectedCities = (cities: City[]) => setSelectedCitiesState(cities);

  const toggleCity = (city: City) => {
    const exists = selectedCities.some((c) => c.id === city.id);
    if (exists) {
      setSelectedCitiesState(selectedCities.filter((c) => c.id !== city.id));
    } else {
      setSelectedCitiesState([...selectedCities, city]);
    }
  };

  const setSelectedCategory = (category: Category | null) =>
    setSelectedCategoryState(category);
  const setSelectedState = (state: State | null) =>
    setSelectedStateState(state);
  const setPriceMin = (price: number | null) => setPriceMinState(price);
  const setPriceMax = (price: number | null) => setPriceMaxState(price);
  const setHasImage = (value: boolean) => setHasImageState(value);
  const setIsUrgent = (value: boolean) => setIsUrgentState(value);

  const clearFilters = () => {
    setSelectedCities([]);
    setSelectedCategory(null);
    setSelectedState(null);
    setPriceMin(null);
    setPriceMax(null); 
    setHasImage(false);
    setIsUrgent(false);
    setSearchQuery("");
    localStorage.removeItem("selectedCities");
    localStorage.removeItem("selectedCategory");
    localStorage.removeItem("selectedState");
    localStorage.removeItem("priceMin");
    localStorage.removeItem("priceMax");
    localStorage.removeItem("hasImage");
    localStorage.removeItem("isUrgent");
  };
  return (
    <FilterContext.Provider
      value={{
        isLoading,
        selectedCities,
        setSelectedCities,
        toggleCity,
        selectedCategory,
        setSelectedCategory,
        selectedState,
        setSelectedState,
        priceMin,
        setPriceMin,
        priceMax,
        setPriceMax,
        hasImage,
        setHasImage,
        isUrgent,
        setIsUrgent,
        searchQuery,
        setSearchQuery,
        clearFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
};
