import { Component, Suspense, useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { assetUrl } from '../lib/format';

/** Loads an admin-uploaded .glb and scales it to the same height as the procedural bottle. */
const Model = ({ url, targetHeight }: { url: string; targetHeight: number }) => {
  const { scene } = useGLTF(assetUrl(url));
  const object = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const scale = size.y > 0 ? targetHeight / size.y : 1;
    clone.scale.setScalar(scale);
    const scaledBox = new THREE.Box3().setFromObject(clone);
    const center = scaledBox.getCenter(new THREE.Vector3());
    clone.position.set(-center.x, -scaledBox.min.y, -center.z);
    clone.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.castShadow = true;
    });
    return clone;
  }, [scene, targetHeight]);
  return <primitive object={object} />;
};

class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const GLBModel = ({ url, targetHeight, fallback }: { url: string; targetHeight: number; fallback: ReactNode }) => (
  <ModelBoundary fallback={fallback}>
    <Suspense fallback={fallback}>
      <Model url={url} targetHeight={targetHeight} />
    </Suspense>
  </ModelBoundary>
);

export default GLBModel;
