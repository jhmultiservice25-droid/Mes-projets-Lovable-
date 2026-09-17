"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { projects } from "@/lib/demo-data";
import { healthFacilities, kasaVubuPilot, kasaVubuQuartiers } from "@/lib/pilot-data";
import { territorialAssets } from "@/lib/territory-data";

type Place = { label: string; lat: number; lon: number };
type LayerKey = "commune" | "quartiers" | "parcelles" | "equipements" | "sante" | "projets";
type LayerState = Record<LayerKey, boolean>;

declare global {
  interface Window {
    L?: any;
  }
}

const initialLayers: LayerState = {
  commune: true,
  quartiers: true,
  parcelles: false,
  equipements: true,
  sante: true,
  projets: true,
};

const categoryLabels: Record<string, string> = {
  ADMINISTRATION: "Administration",
  SANTE: "Santé",
  EDUCATION: "Éducation",
  MARCHE: "Marché",
  CULTURE: "Culture",
};

const categoryColors: Record<string, string> = {
  ADMINISTRATION: "#0077b6",
  SANTE: "#168b65",
  EDUCATION: "#d49b00",
  MARCHE: "#cf3d4f",
  CULTURE: "#6b5ca5",
};

async function ensureLeaflet() {
  if (window.L) return window.L;

  if (!document.querySelector('link[data-ecommune-leaflet="true"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.dataset.ecommuneLeaflet = "true";
    document.head.appendChild(link);
  }

  const existing = document.querySelector('script[data-ecommune-leaflet="true"]') as HTMLScriptElement | null;
  if (!existing) {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.dataset.ecommuneLeaflet = "true";
    document.body.appendChild(script);
  }

  await new Promise<void>((resolve, reject) => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      if (window.L) {
        window.clearInterval(timer);
        resolve();
      } else if (Date.now() - started > 12000) {
        window.clearInterval(timer);
        reject(new Error("Leaflet n'a pas pu être chargé."));
      }
    }, 80);
  });

  return window.L;
}

export function CommuneMap({ initialPlace }: { initialPlace?: Place }) {
  const [center, setCenter] = useState<Place>(initialPlace || { label: "Maison communale de Kasa-Vubu", ...kasaVubuPilot.center });
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapStatus, setMapStatus] = useState("Initialisation de la carte…");
  const [message, setMessage] = useState("");
  const [layers, setLayers] = useState<LayerState>(initialLayers);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerGroupsRef = useRef<Record<LayerKey, any> | null>(null);

  const geolocatedHealth = useMemo(() => healthFacilities.filter((facility) => facility.lat != null && facility.lon != null), []);
  const geolocatedAssets = useMemo(() => territorialAssets.filter((asset) => asset.lat != null && asset.lon != null && asset.category !== "SANTE"), []);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      if (!mapContainerRef.current || mapRef.current) return;
      try {
        const L = await ensureLeaflet();
        if (cancelled || !mapContainerRef.current) return;

        const map = L.map(mapContainerRef.current, { zoomControl: true, attributionControl: true }).setView(
          [center.lat, center.lon],
          15,
        );
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        const groups: Record<LayerKey, any> = {
          commune: L.layerGroup().addTo(map),
          quartiers: L.layerGroup().addTo(map),
          parcelles: L.layerGroup(),
          equipements: L.layerGroup().addTo(map),
          sante: L.layerGroup().addTo(map),
          projets: L.layerGroup().addTo(map),
        };

        mapRef.current = map;
        layerGroupsRef.current = groups;

        for (const asset of geolocatedAssets) {
          const marker = L.circleMarker([asset.lat, asset.lon], {
            radius: 7,
            color: "#ffffff",
            weight: 2,
            fillColor: categoryColors[asset.category] || "#0077b6",
            fillOpacity: 0.95,
          });
          marker.bindPopup(
            `<strong>${asset.name}</strong><br/><span>${categoryLabels[asset.category] || asset.category} • ${asset.subtype}</span><br/><small>${asset.validation.replaceAll("_", " ")}</small>`,
          );
          marker.addTo(groups.equipements);
        }

        for (const facility of geolocatedHealth) {
          const marker = L.circleMarker([facility.lat, facility.lon], {
            radius: 7,
            color: "#ffffff",
            weight: 2,
            fillColor: "#168b65",
            fillOpacity: 0.95,
          });
          marker.bindPopup(`<strong>${facility.name}</strong><br/><span>${facility.type}</span><br/><small>${facility.status}</small>`);
          marker.addTo(groups.sante);
        }

        for (const project of projects.filter((item) => item.lat != null && item.lon != null)) {
          const marker = L.circleMarker([Number(project.lat), Number(project.lon)], {
            radius: 7,
            color: "#ffffff",
            weight: 2,
            fillColor: "#1656a3",
            fillOpacity: 0.9,
          });
          const progress = project.physical == null ? "Avancement à documenter" : `${project.physical}% physique`;
          marker.bindPopup(`<strong>${project.name}</strong><br/><span>${project.sector}</span><br/><small>${progress} • ${project.sourceLabel}</small>`);
          marker.addTo(groups.projets);
        }

        try {
          const response = await fetch("/api/map/boundaries");
          const data = await response.json();
          const features = data.geojson?.features || [];
          const communeFeatures = features.filter((feature: any) => feature.properties?.boundaryClass === "commune");
          const quartierFeatures = features.filter((feature: any) => feature.properties?.boundaryClass === "quartier");

          if (communeFeatures.length) {
            const communeLayer = L.geoJSON({ type: "FeatureCollection", features: communeFeatures }, {
              style: { color: "#00a3df", weight: 4, opacity: 0.95 },
              onEachFeature: (feature: any, layer: any) => layer.bindTooltip(feature.properties?.relationName || "Kasa-Vubu"),
            }).addTo(groups.commune);
            const bounds = communeLayer.getBounds();
            if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20], maxZoom: 16 });
          }

          if (quartierFeatures.length) {
            L.geoJSON({ type: "FeatureCollection", features: quartierFeatures }, {
              style: { color: "#e4b11b", weight: 2, opacity: 0.8, dashArray: "5 5" },
              onEachFeature: (feature: any, layer: any) => layer.bindTooltip(feature.properties?.relationName || "Quartier"),
            }).addTo(groups.quartiers);
          }

          setMapStatus(
            features.length
              ? `Limites OSM chargées • relation ${data.relationId} • ${quartierFeatures.length ? "quartiers détectés" : "quartiers en attente"}`
              : "Fond OSM actif • limites dynamiques temporairement indisponibles",
          );
          if (data.warning) setMessage(data.warning);

          try {
            const parcelResponse = await fetch("/api/map/parcels");
            const parcelData = await parcelResponse.json();
            if (parcelData.geojson?.features?.length) {
              L.geoJSON(parcelData.geojson, {
                style: { color: "#6b5ca5", weight: 1.2, opacity: 0.8, fillOpacity: 0.08 },
                onEachFeature: (feature: any, layer: any) => layer.bindPopup(`<strong>Parcelle ${feature.properties?.reference || feature.properties?.numero || ""}</strong><br/><small>${feature.properties?.validationStatus || "À valider"}</small>`),
              }).addTo(groups.parcelles);
            }
          } catch {
            // La couche parcellaire reste vide tant qu'un référentiel officiel n'est pas raccordé.
          }
        } catch {
          setMapStatus("Fond OSM actif • limites dynamiques temporairement indisponibles");
        }
      } catch (error) {
        setMapStatus("Impossible de charger le moteur cartographique interactif.");
        setMessage(error instanceof Error ? error.message : "Erreur cartographique");
      }
    }

    initialize();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerGroupsRef.current = null;
      }
    };
  }, [geolocatedAssets, geolocatedHealth]);

  useEffect(() => {
    const map = mapRef.current;
    const groups = layerGroupsRef.current;
    if (!map || !groups) return;
    (Object.keys(layers) as LayerKey[]).forEach((key) => {
      const group = groups[key];
      if (layers[key] && !map.hasLayer(group)) map.addLayer(group);
      if (!layers[key] && map.hasLayer(group)) map.removeLayer(group);
    });
  }, [layers]);

  function focusPlace(place: Place, zoom = 17) {
    setCenter(place);
    setResults([]);
    mapRef.current?.setView([place.lat, place.lon], zoom, { animate: true });
  }

  async function search(event: FormEvent) {
    event.preventDefault();
    if (query.trim().length < 3) return;
    setLoading(true);
    setMessage("");
    const localMatches = [...territorialAssets, ...healthFacilities]
      .filter((item) => item.lat != null && item.lon != null && item.name.toLowerCase().includes(query.toLowerCase()))
      .map((item) => ({ label: item.name, lat: Number(item.lat), lon: Number(item.lon) }));

    if (localMatches.length) {
      setResults(localMatches.slice(0, 5));
      setLoading(false);
      return;
    }

    const response = await fetch(`/api/map/search?q=${encodeURIComponent(query)}`);
    const data = await response.json().catch(() => ({ results: [] }));
    setResults(data.results || []);
    if (!data.results?.length) setMessage(data.warning || "Aucun lieu trouvé dans le contexte de Kasa-Vubu.");
    setLoading(false);
  }

  function toggleLayer(key: LayerKey) {
    setLayers((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <div className="map-layout">
      <section className="panel map-panel">
        <div className="map-toolbar">
          <form onSubmit={search} className="map-search">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher avenue, quartier, école, marché, centre de santé…" />
            <button className="primary-btn">{loading ? "Recherche…" : "Localiser"}</button>
          </form>
          <span className="map-source">OSM • relation {kasaVubuPilot.osmRelationId} • pilote Kasa-Vubu</span>
        </div>
        {results.length > 0 && <div className="search-results">
          {results.map((result) => <button key={`${result.label}-${result.lat}-${result.lon}`} onClick={() => focusPlace(result)}>{result.label}</button>)}
        </div>}
        {message && <div className="inline-warning map-inline-warning">{message}</div>}
        <div ref={mapContainerRef} className="leaflet-commune-map" aria-label="Carte interactive de la commune de Kasa-Vubu" />
        <div className="map-caption"><strong>{center.label}</strong><span>{center.lat.toFixed(5)}, {center.lon.toFixed(5)} • {mapStatus}</span></div>
      </section>

      <aside className="panel map-side">
        <div className="panel-head"><div><h2>Couches territoriales</h2><p>Référentiel géographique communal</p></div></div>
        <Layer checked={layers.commune} onChange={() => toggleLayer("commune")} label="Limite de Kasa-Vubu" meta={`OSM ${kasaVubuPilot.osmRelationId}`} />
        <Layer checked={layers.quartiers} onChange={() => toggleLayer("quartiers")} label={`Quartiers (${kasaVubuQuartiers.length})`} meta="limites dynamiques" />
        <Layer checked={layers.parcelles} onChange={() => toggleLayer("parcelles")} label="Parcelles / domaine" meta="0 officielle chargée" />
        <Layer checked={layers.equipements} onChange={() => toggleLayer("equipements")} label="Équipements publics" meta={`${geolocatedAssets.length} repères`} />
        <Layer checked={layers.sante} onChange={() => toggleLayer("sante")} label="Structures sanitaires" meta={`${geolocatedHealth.length} géolocalisées`} />
        <Layer checked={layers.projets} onChange={() => toggleLayer("projets")} label="Fatshimétrie / projets" meta={`${projects.filter((project) => project.lat != null && project.lon != null).length} géolocalisés / ${projects.length} suivis`} />

        <div className="map-legend" aria-label="Légende de la carte">
          <span><i className="legend-dot admin" /> Administration</span>
          <span><i className="legend-dot health" /> Santé</span>
          <span><i className="legend-dot education" /> Éducation</span>
          <span><i className="legend-dot market" /> Marché</span>
          <span><i className="legend-dot culture" /> Culture</span>
        </div>

        <div className="legal-note"><strong>Valeur juridique des limites</strong><p>La carte charge la relation OSM de Kasa-Vubu comme référentiel opérationnel. Une limite opposable doit être validée par l’autorité administrative compétente et archivée avec sa source.</p></div>

        <div className="project-map-list">
          <h3>Équipements repérés</h3>
          {geolocatedAssets.map((asset) => <button key={asset.id} onClick={() => focusPlace({ label: asset.name, lat: Number(asset.lat), lon: Number(asset.lon) })}>
            <span>{categoryLabels[asset.category]}</span><strong>{asset.name}</strong><small>{asset.validation.replaceAll("_", " ")}</small>
          </button>)}
        </div>

        <div className="project-map-list health-map-list">
          <h3>Santé</h3>
          {geolocatedHealth.map((facility) => <button key={facility.id} onClick={() => focusPlace({ label: facility.name, lat: Number(facility.lat), lon: Number(facility.lon) })}>
            <span>{facility.quartier || facility.type}</span><strong>{facility.name}</strong><small>{facility.status}</small>
          </button>)}
        </div>
      </aside>
    </div>
  );
}

function Layer({ checked, onChange, label, meta }: { checked: boolean; onChange: () => void; label: string; meta: string }) {
  return <label className="layer-row"><input type="checkbox" checked={checked} onChange={onChange} /><span>{label}</span><small>{meta}</small></label>;
}
