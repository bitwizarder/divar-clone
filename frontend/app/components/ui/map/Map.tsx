"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    coords: [number, number];
    name: string;
  }>;
  // اضافه کردن پراپ‌های lat و lng برای موقعیت‌یابی ساده
  lat?: number;
  lng?: number;
}

export default function Map({
  center = [35.6995, 51.3378],
  zoom = 15,
  markers = [],
  lat,
  lng,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // اگر lat و lng داده شده، مرکز نقشه را روی آن نقطه قرار بده
  const effectiveCenter: [number, number] =
    lat !== undefined && lng !== undefined ? [lat, lng] : center;

  const effectiveMarkers =
    lat !== undefined && lng !== undefined
      ? [{ coords: [lat, lng] as [number, number], name: "موقعیت آگهی" }]
      : markers;

  useEffect(() => {
    // جلوگیری از اجرا در سرور
    if (typeof window === "undefined") return;

    let isMounted = true;

    const initMap = async () => {
      // بارگذاری داینامیک leaflet فقط در کلاینت
      const L = await import("leaflet");

      // رفع مشکل آیکون‌های پیش‌فرض
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      if (!mapRef.current || !isMounted) return;

      // ایجاد نقشه
      const map = L.map(mapRef.current).setView(effectiveCenter, zoom);
      mapInstanceRef.current = map;

      // لایه‌ی Tile
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // افزودن مارکرها
      effectiveMarkers.forEach((marker) => {
        L.marker(marker.coords).addTo(map).bindPopup(marker.name);
      });
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [effectiveCenter, zoom, effectiveMarkers]);

  return <div ref={mapRef} style={{ height: "100%", width: "100%" }} />;
}