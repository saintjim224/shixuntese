import { Alert, Button, Select, Tag } from 'antd';
import { ArrowRight, BriefcaseBusiness, Flame, Layers3, MapPinned, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { CITY_COORDINATES, DEMO_JOBS, JOB_CATEGORIES } from '../data/catalog';
import type { CityJobStat, MapStats } from '../types';

type AmapRuntimeConfig = {
  key?: string;
  securityJsCode?: string;
  serviceHost?: string;
};

declare global {
  interface Window {
    QITOFFER_AMAP_CONFIG?: AmapRuntimeConfig;
    _AMapSecurityConfig?: {
      securityJsCode?: string;
      serviceHost?: string;
    };
    AMapLoader?: {
      load: (options: Record<string, unknown>) => Promise<any>;
    };
  }
}

const CHINA_BOUNDS = {
  minLng: 73,
  maxLng: 135,
  minLat: 18,
  maxLat: 54
};

export default function MapHeat() {
  const [stats, setStats] = useState<MapStats>(() => demoMapStats());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [mapError, setMapError] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const runtimeAmapConfig = getAmapRuntimeConfig();
  const amapKey = pickConfigValue(runtimeAmapConfig.key, import.meta.env.VITE_AMAP_KEY);
  const amapSecurityCode = pickConfigValue(runtimeAmapConfig.securityJsCode, import.meta.env.VITE_AMAP_SECURITY_JS_CODE);
  const amapServiceHost = pickConfigValue(runtimeAmapConfig.serviceHost, import.meta.env.VITE_AMAP_SERVICE_HOST);

  useEffect(() => {
    api.mapStats()
      .then((result) => {
        setStats(result.items.length ? result : demoMapStats());
        setError('');
      })
      .catch((err: Error) => {
        setStats(demoMapStats());
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = useMemo(() => {
    if (!category) return stats.items;
    return stats.items
      .map((item) => {
        const hit = item.categories.find((bucket) => bucket.name === category);
        return hit ? { ...item, jobCount: hit.value, categories: [hit] } : null;
      })
      .filter(Boolean) as CityJobStat[];
  }, [category, stats.items]);

  const topCities = useMemo(
    () => [...filteredItems].sort((a, b) => b.jobCount - a.jobCount).slice(0, 8),
    [filteredItems]
  );

  useEffect(() => {
    if (!amapKey || !mapRef.current) {
      return;
    }
    if (!amapServiceHost && !amapSecurityCode) {
      setMapReady(false);
      setMapError('已配置高德 Key，但缺少 VITE_AMAP_SECURITY_JS_CODE 或 VITE_AMAP_SERVICE_HOST。生产环境建议使用 serviceHost 代理安全密钥。');
      return;
    }
    let disposed = false;
    let mapInstance: any;

    async function renderMap() {
      try {
        if (amapServiceHost) {
          window._AMapSecurityConfig = { serviceHost: amapServiceHost };
        } else if (amapSecurityCode) {
          window._AMapSecurityConfig = { securityJsCode: amapSecurityCode };
        }
        await ensureAmapLoader();
        const AMap = await window.AMapLoader!.load({
          key: amapKey,
          version: '2.0',
          plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.HeatMap']
        });
        if (AMap.getConfig) {
          AMap.getConfig().appname = 'amap-jsapi-skill';
        }
        if (disposed || !mapRef.current) return;
        mapInstance = new AMap.Map(mapRef.current, {
          viewMode: '3D',
          pitch: 35,
          zoom: 4.2,
          center: [104.1954, 35.8617],
          mapStyle: 'amap://styles/normal'
        });
        mapInstance.addControl(new AMap.Scale());
        mapInstance.addControl(new AMap.ToolBar({ position: { right: '16px', top: '16px' } }));
        mapInstance.plugin(['AMap.HeatMap'], () => {
          const heatmap = new AMap.HeatMap(mapInstance, {
            radius: 38,
            opacity: [0, 0.82],
            gradient: {
              0.2: '#35d2ac',
              0.45: '#2f80ed',
              0.7: '#f5c369',
              1: '#ff5a5f'
            }
          });
          heatmap.setDataSet({
            data: filteredItems.map((item) => ({ lng: item.lng, lat: item.lat, count: item.jobCount })),
            max: Math.max(...filteredItems.map((item) => item.jobCount), 1)
          });
        });
        filteredItems.slice(0, 12).forEach((item) => {
          const marker = new AMap.Marker({
            position: [item.lng, item.lat],
            title: `${item.name} ${item.jobCount} 个岗位`,
            offset: new AMap.Pixel(-10, -10)
          });
          marker.on('click', () => navigate(`/jobs?city=${encodeURIComponent(item.name)}`));
          mapInstance.add(marker);
        });
        setMapReady(true);
        setMapError('');
      } catch (err) {
        setMapReady(false);
        setMapError(err instanceof Error ? err.message : '高德地图加载失败，请检查 key 和安全密钥配置。');
      }
    }

    renderMap();
    return () => {
      disposed = true;
      if (mapInstance) {
        mapInstance.destroy();
      }
      setMapReady(false);
    };
  }, [amapKey, amapSecurityCode, amapServiceHost, filteredItems, navigate]);

  return (
    <div className="map-page">
      <section className="map-hero">
        <div>
          <span className="product-kicker"><Flame size={16} />职位热力图</span>
          <h1>把岗位分布放到地图上，城市机会一眼看清。</h1>
          <p>统计来自后端职位表，覆盖省会城市和重点 IT 城市。配置高德 key 后会加载真实热力图，未配置时显示静态降级版。</p>
        </div>
        <div className="map-hero-actions">
          <Select
            allowClear
            placeholder="岗位方向"
            value={category || undefined}
            onChange={(value) => setCategory(value || '')}
            options={JOB_CATEGORIES.map((item) => ({ label: item, value: item }))}
          />
          <Button icon={<RefreshCw size={16} />} onClick={() => window.location.reload()}>
            刷新
          </Button>
        </div>
      </section>

      {(error || mapError || !amapKey) && (
        <Alert
          className="map-config-alert"
          type={amapKey && mapError ? 'warning' : 'info'}
          showIcon
          message={amapKey && mapError ? '高德地图暂未加载成功' : '当前使用静态热力降级视图'}
          description={
            amapKey && mapError
              ? mapError
              : '开发环境可在 client/.env.local 配置 VITE_AMAP_KEY；部署后也可直接编辑 app/amap-config.js，填写 key 和 securityJsCode 或 serviceHost 后刷新页面。'
          }
        />
      )}

      <section className="map-layout">
        <div className="map-canvas-panel">
          {amapKey && !mapError ? <div className="amap-canvas" ref={mapRef} /> : <StaticHeatmap items={filteredItems} />}
          {loading && <div className="map-loading">正在读取岗位热力数据</div>}
          {amapKey && !mapReady && !mapError && <div className="map-loading">正在加载高德地图</div>}
        </div>

        <aside className="map-side-panel">
          <div className="map-total">
            <span><Layers3 size={17} />岗位覆盖</span>
            <strong>{filteredItems.reduce((sum, item) => sum + item.jobCount, 0)}</strong>
            <small>{category || '全部方向'}，{filteredItems.length} 个城市</small>
          </div>
          <div className="map-top-list">
            {topCities.map((item, index) => (
              <button key={item.name} type="button" onClick={() => navigate(`/jobs?city=${encodeURIComponent(item.name)}`)}>
                <span>{index + 1}</span>
                <strong>{item.name}</strong>
                <em>{item.jobCount} 个岗位</em>
                <ArrowRight size={15} />
              </button>
            ))}
          </div>
          <Button block type="primary" icon={<BriefcaseBusiness size={17} />} onClick={() => navigate('/jobs')}>
            查看全部职位
          </Button>
        </aside>
      </section>
    </div>
  );
}

function StaticHeatmap({ items }: { items: CityJobStat[] }) {
  const max = Math.max(...items.map((item) => item.jobCount), 1);
  return (
    <div className="static-china-map" aria-label="静态职位热力图">
      <div className="static-map-grid" />
      <MapPinned className="static-map-icon" size={72} />
      {items.map((item) => {
        const left = ((item.lng - CHINA_BOUNDS.minLng) / (CHINA_BOUNDS.maxLng - CHINA_BOUNDS.minLng)) * 100;
        const top = (1 - (item.lat - CHINA_BOUNDS.minLat) / (CHINA_BOUNDS.maxLat - CHINA_BOUNDS.minLat)) * 100;
        const size = 14 + (item.jobCount / max) * 34;
        return (
          <button
            key={item.name}
            className="heat-point"
            style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }}
            title={`${item.name} ${item.jobCount} 个岗位`}
            type="button"
          >
            <span>{item.name}</span>
          </button>
        );
      })}
    </div>
  );
}

function demoMapStats(): MapStats {
  const categoryByCity = new Map<string, Record<string, number>>();
  DEMO_JOBS.forEach((job) => {
    const current = categoryByCity.get(job.city) || {};
    current[job.category] = (current[job.category] || 0) + 1;
    categoryByCity.set(job.city, current);
  });
  const items = CITY_COORDINATES.map((city) => {
    const categories = Object.entries(categoryByCity.get(city.name) || {})
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    return {
      ...city,
      jobCount: categories.reduce((sum, item) => sum + item.value, 0),
      categories
    };
  }).filter((item) => item.jobCount > 0);
  return {
    items,
    totalJobs: items.reduce((sum, item) => sum + item.jobCount, 0),
    maxCount: Math.max(...items.map((item) => item.jobCount), 1)
  };
}

function getAmapRuntimeConfig(): AmapRuntimeConfig {
  return typeof window === 'undefined' ? {} : window.QITOFFER_AMAP_CONFIG || {};
}

function pickConfigValue(runtimeValue: unknown, buildValue: unknown) {
  const runtime = typeof runtimeValue === 'string' ? runtimeValue.trim() : '';
  if (runtime) return runtime;
  return typeof buildValue === 'string' ? buildValue.trim() : '';
}

function ensureAmapLoader() {
  if (window.AMapLoader) {
    return Promise.resolve();
  }
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-amap-loader="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('高德地图加载器下载失败。')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://webapi.amap.com/loader.js';
    script.async = true;
    script.dataset.amapLoader = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('高德地图加载器下载失败。'));
    document.head.appendChild(script);
  });
}
