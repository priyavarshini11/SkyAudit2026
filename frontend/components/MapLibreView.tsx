"use client";

import React, { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { 
  Layers, 
  Eye, 
  EyeOff, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  MapPin, 
  Activity, 
  Loader2
} from "lucide-react";
import { Project, FullAnalysisResponse } from "@/lib/api";

interface MapLibreViewProps {
  project: Project;
  analysis: FullAnalysisResponse | null;
}

export const MapLibreView: React.FC<MapLibreViewProps> = ({ project, analysis }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  const [basemapStyle, setBasemapStyle] = useState<"satellite" | "dark" | "osm">("satellite");
  const [showCorridor, setShowCorridor] = useState(true);
  const [showCenterline, setShowCenterline] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Basemap tile definitions
  const BASEMAP_STYLES = {
    satellite: {
      version: 8 as const,
      sources: {
        "esri-satellite": {
          type: "raster" as const,
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          ],
          tileSize: 256,
          attribution: "Esri World Imagery"
        }
      },
      layers: [
        {
          id: "satellite-layer",
          type: "raster" as const,
          source: "esri-satellite",
          minzoom: 0,
          maxzoom: 19
        }
      ]
    },
    dark: {
      version: 8 as const,
      sources: {
        "carto-dark": {
          type: "raster" as const,
          tiles: [
            "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          ],
          tileSize: 256,
          attribution: "CARTO"
        }
      },
      layers: [
        {
          id: "carto-dark-layer",
          type: "raster" as const,
          source: "carto-dark",
          minzoom: 0,
          maxzoom: 19
        }
      ]
    },
    osm: {
      version: 8 as const,
      sources: {
        "osm-tiles": {
          type: "raster" as const,
          tiles: [
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          ],
          tileSize: 256,
          attribution: "OpenStreetMap"
        }
      },
      layers: [
        {
          id: "osm-layer",
          type: "raster" as const,
          source: "osm-tiles",
          minzoom: 0,
          maxzoom: 19
        }
      ]
    }
  };

  // Determine center coordinates from project geometry or fallback
  const getInitialCoordinates = (): [number, number] => {
    if (project.geometry && project.geometry.coordinates) {
      const coords = project.geometry.coordinates;
      if (Array.isArray(coords) && coords.length > 0) {
        const midIndex = Math.floor(coords.length / 2);
        return [coords[midIndex][0], coords[midIndex][1]];
      }
    }
    // Default Delhi-Mumbai Sohna corridor coords
    return [77.045, 28.210];
  };

  // Initialize MapLibre purely in browser
  useEffect(() => {
    let isMounted = true;
    let mapInstance: any = null;

    const initMap = async () => {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      try {
        const maplibregl = await import("maplibre-gl");

        if (!isMounted || !mapContainerRef.current) return;

        const center = getInitialCoordinates();

        mapInstance = new maplibregl.Map({
          container: mapContainerRef.current,
          style: BASEMAP_STYLES[basemapStyle],
          center: center,
          zoom: 13,
          pitch: 30,
          bearing: 15,
          attributionControl: false
        });

        mapInstance.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
        mapInstance.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

        mapInstance.on("load", () => {
          if (!isMounted) return;
          setIsMapReady(true);

          // Add Road Centerline GeoJSON source
          if (project.geometry) {
            mapInstance.addSource("road-centerline", {
              type: "geojson",
              data: project.geometry
            });

            mapInstance.addLayer({
              id: "road-centerline-glow",
              type: "line",
              source: "road-centerline",
              layout: { "line-join": "round", "line-cap": "round" },
              paint: {
                "line-color": "#38bdf8",
                "line-width": 8,
                "line-opacity": 0.4,
                "line-blur": 3
              }
            });

            mapInstance.addLayer({
              id: "road-centerline-line",
              type: "line",
              source: "road-centerline",
              layout: { "line-join": "round", "line-cap": "round" },
              paint: {
                "line-color": "#0284c7",
                "line-width": 4
              }
            });
          }

          // Add Corridor Buffer Polygon Source
          const corridorGeojson = analysis?.corridor_geojson || project.corridor_geometry;
          if (corridorGeojson) {
            mapInstance.addSource("corridor-buffer", {
              type: "geojson",
              data: corridorGeojson
            });

            mapInstance.addLayer({
              id: "corridor-buffer-fill",
              type: "fill",
              source: "corridor-buffer",
              paint: {
                "fill-color": "#38bdf8",
                "fill-opacity": 0.15
              }
            });

            mapInstance.addLayer({
              id: "corridor-buffer-outline",
              type: "line",
              source: "corridor-buffer",
              paint: {
                "line-color": "#0ea5e9",
                "line-width": 2,
                "line-dasharray": [2, 2]
              }
            });
          }

          // Add Markers
          if (project.geometry && project.geometry.coordinates && project.geometry.coordinates.length > 1) {
            const startPt = project.geometry.coordinates[0];
            const endPt = project.geometry.coordinates[project.geometry.coordinates.length - 1];

            const startEl = document.createElement("div");
            startEl.className = "flex items-center justify-center w-7 h-7 rounded-full bg-sky-500 border-2 border-white shadow-lg text-white font-bold text-[10px]";
            startEl.innerText = "CH0";
            new maplibregl.Marker({ element: startEl })
              .setLngLat([startPt[0], startPt[1]])
              .setPopup(new maplibregl.Popup().setHTML(`<div style="color:#000;padding:4px;font-size:12px;"><strong>Start Node</strong><br/>CH 0+000</div>`))
              .addTo(mapInstance);

            const endEl = document.createElement("div");
            endEl.className = "flex items-center justify-center w-7 h-7 rounded-full bg-rose-500 border-2 border-white shadow-lg text-white font-bold text-[10px]";
            endEl.innerText = "END";
            new maplibregl.Marker({ element: endEl })
              .setLngLat([endPt[0], endPt[1]])
              .setPopup(new maplibregl.Popup().setHTML(`<div style="color:#000;padding:4px;font-size:12px;"><strong>End Chainage</strong><br/>${project.project_length_km || 18.4} km</div>`))
              .addTo(mapInstance);
          }
        });

        mapInstance.on("error", (e: any) => {
          console.warn("MapLibre map notice:", e);
        });

        mapRef.current = mapInstance;
      } catch (err: any) {
        console.error("MapLibre initialization exception:", err);
        setMapError(err.message || "Failed to load MapLibre WebGL instance");
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          // Ignore cleanup error
        }
        mapRef.current = null;
      }
    };
  }, [project.project_id, basemapStyle]);

  // Dynamic layer visibility updates
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    try {
      if (map.getLayer("corridor-buffer-fill")) {
        map.setLayoutProperty("corridor-buffer-fill", "visibility", showCorridor ? "visible" : "none");
      }
      if (map.getLayer("corridor-buffer-outline")) {
        map.setLayoutProperty("corridor-buffer-outline", "visibility", showCorridor ? "visible" : "none");
      }
      if (map.getLayer("road-centerline-line")) {
        map.setLayoutProperty("road-centerline-line", "visibility", showCenterline ? "visible" : "none");
        map.setLayoutProperty("road-centerline-glow", "visibility", showCenterline ? "visible" : "none");
      }
    } catch (err) {
      console.warn("Layer visibility update deferred:", err);
    }
  }, [showCorridor, showCenterline]);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col border border-slate-800 shadow-xl">
      
      {/* Top Map Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Interactive Geospatial Corridor
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                WebGL 60 FPS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              50m Metric Right-of-Way • {project.location_text}
            </p>
          </div>
        </div>

        {/* Layer Controls & Basemap Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Basemap Switcher */}
          <div className="flex items-center bg-[#070b14] border border-slate-700/80 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setBasemapStyle("satellite")}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                basemapStyle === "satellite" ? "bg-sky-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setBasemapStyle("dark")}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                basemapStyle === "dark" ? "bg-sky-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Dark Matter
            </button>
            <button
              onClick={() => setBasemapStyle("osm")}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                basemapStyle === "osm" ? "bg-sky-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Street Map
            </button>
          </div>

          {/* 50m Corridor toggle */}
          <button
            onClick={() => setShowCorridor(!showCorridor)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              showCorridor 
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" 
                : "bg-slate-800/80 text-slate-400 border border-slate-700"
            }`}
          >
            {showCorridor ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>50m Corridor</span>
          </button>

          {/* Road Centerline toggle */}
          <button
            onClick={() => setShowCenterline(!showCenterline)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              showCenterline 
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/30" 
                : "bg-slate-800/80 text-slate-400 border border-slate-700"
            }`}
          >
            {showCenterline ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Alignment Line</span>
          </button>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="relative w-full h-[400px] lg:h-[480px] bg-[#070b14] overflow-hidden select-none">
        
        {/* MapLibre DOM Node */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Loading Spinner */}
        {!isMapReady && !mapError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070b14]/80 text-sky-400 gap-2 z-10">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-xs text-slate-400 font-medium">Initializing WebGL Corridor Engine...</span>
          </div>
        )}

        {/* Change Detection Heatmap Overlay Badge */}
        <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 text-xs shadow-2xl space-y-2 pointer-events-auto max-w-xs z-10">
          <div className="font-bold text-slate-200 flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              <span>Multi-Spectral Legend</span>
            </span>
            <span className="text-[10px] font-mono text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-500/30">
              Sentinel-2 10m
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-rose-500 shadow-sm shadow-rose-500/50 shrink-0" />
                <span className="text-slate-300">Paved / Active Surface</span>
              </div>
              <span className="font-mono text-slate-400">High Disturbance</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-500 shadow-sm shadow-amber-500/50 shrink-0" />
                <span className="text-slate-300">Vegetation Clearing (ΔNDVI)</span>
              </div>
              <span className="font-mono text-slate-400">Earthwork</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-cyan-500/60 border border-cyan-400 shrink-0" />
                <span className="text-slate-300">50m Monitored Right-of-Way</span>
              </div>
              <span className="font-mono text-slate-400">Buffered</span>
            </div>
          </div>
        </div>

        {/* Compass & Quick Orientation HUD */}
        <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 flex items-center gap-2 font-mono shadow-lg z-10">
          <Compass className="w-3.5 h-3.5 text-sky-400 animate-spin-slow" />
          <span>WGS84 • EPSG:4326</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-bold">10m Ground Resolution</span>
        </div>

      </div>

      {/* Footer Corridor Summary */}
      <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-400"></span>
          <span>Target Alignment: </span>
          <strong className="text-white">{project.project_name}</strong>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <span>Corridor Length: </span>
            <strong className="text-sky-400 font-mono">{project.project_length_km || 18.4} km</strong>
          </div>
          <div>
            <span>Contractor: </span>
            <strong className="text-slate-200">{project.contractor_name || "NHAI EPC Division"}</strong>
          </div>
        </div>
      </div>

    </div>
  );
};
