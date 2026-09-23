import { lazy, Suspense, useEffect, useState } from 'react';
import { WebGLBoundary, hasWebGL } from './webgl';
import type { BottleSceneProps } from '../../three/BottleScene';
import { assetUrl } from '../../lib/format';
import { useDeviceQuality } from '../../hooks/useDeviceQuality';

// three.js + R3F live in their own chunk and load only when a 3D view is shown.
const BottleScene = lazy(() => import('../../three/BottleScene'));

type Props = Omit<BottleSceneProps, 'quality' | 'onReady'> & {
  poster?: string;
  posterAlt?: string;
  className?: string;
  posterClassName?: string;
};

/**
 * Shows a studio render immediately, then cross-fades to the live 3D bottle
 * once three.js has loaded and drawn its first frames.
 */
const Bottle3D = ({ poster, posterAlt = '', className = '', posterClassName = 'object-contain', ...scene }: Props) => {
  const quality = useDeviceQuality();
  const [ready, setReady] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => setSupported(hasWebGL()), []);

  const posterEl = poster ? (
    <img
      src={assetUrl(poster)}
      alt={posterAlt}
      className={`pointer-events-none absolute inset-0 h-full w-full select-none transition-opacity duration-1000 ease-lux ${posterClassName} ${ready ? 'opacity-0' : 'opacity-100'}`}
      draggable={false}
    />
  ) : (
    <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${ready ? 'opacity-0' : 'opacity-100'}`}>
      <span className="h-px w-16 skeleton" />
    </div>
  );

  return (
    <div className={className || 'relative'}>
      {posterEl}
      {supported && (
        <WebGLBoundary fallback={null}>
          <Suspense fallback={null}>
            <BottleScene
              {...scene}
              quality={quality}
              onReady={() => setReady(true)}
              className={`absolute inset-0 transition-opacity duration-1000 ease-lux ${ready ? 'opacity-100' : 'opacity-0'}`}
            />
          </Suspense>
        </WebGLBoundary>
      )}
    </div>
  );
};

export default Bottle3D;
