import { useMemo } from 'react';
import BottleScene from '../three/BottleScene';
import type { BottleSpec } from '../types';

/**
 * Development-only page used by scripts/render-bottles.mjs to produce the
 * studio product photography from the same 3D model the storefront shows.
 *   /__studio?shape=classic&liquid=%23EBDDB4&cap=gold&glass=clear&name=Eclat&yaw=0&zoom=1
 */
const StudioRender = () => {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const spec: BottleSpec = {
    shape: (params.get('shape') as BottleSpec['shape']) || 'classic',
    liquid: params.get('liquid') || '#EBDDB4',
    cap: (params.get('cap') as BottleSpec['cap']) || 'gold',
    glass: (params.get('glass') as BottleSpec['glass']) || 'clear',
  };
  const w = Number(params.get('w') || 900);
  const h = Number(params.get('h') || 1125);
  return (
    <div style={{ width: w, height: h, background: params.get('bg') || 'transparent' }}>
      <BottleScene
        spec={spec}
        name={params.get('name') || 'NB'}
        mode="static"
        quality={(params.get('quality') as 'high' | 'low') || 'high'}
        initialYaw={Number(params.get('yaw') || 0)}
        zoom={Number(params.get('zoom') || 1)}
        cameraY={Number(params.get('cy') || 0)}
        preserveDrawingBuffer
        interactive={false}
        className="h-full w-full"
        onReady={() => {
          setTimeout(() => {
            (window as unknown as { __studioReady: boolean }).__studioReady = true;
          }, 600);
        }}
      />
    </div>
  );
};

export default StudioRender;
