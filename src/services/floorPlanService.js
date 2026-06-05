import * as THREE from 'three';

export const generateFloorPlanImage = async (world, cutHeight, imgWidth = 1024, imgHeight = 768) => {
  const scene = world.scene.three;
  const renderer = world.renderer.three;

  if (!scene || !renderer) {
    throw new Error('World renderer or scene not available');
  }

  const clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), cutHeight);

  const prevClipPlanes = renderer.clippingPlanes;
  const prevLocalClipping = renderer.localClippingEnabled;

  try {
    renderer.clippingPlanes = [clipPlane];
    renderer.localClippingEnabled = true;

    const box = new THREE.Box3().setFromObject(scene);
    if (box.isEmpty()) {
      throw new Error('Scene is empty, no model loaded');
    }

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const aspect = imgWidth / imgHeight;
    const maxDim = Math.max(size.x, size.y);
    const margin = 1.1;
    const d = maxDim * 0.5 * margin;

    const orthoCamera = new THREE.OrthographicCamera(
      -d * aspect, d * aspect, d, -d, 0.1, 1000
    );
    orthoCamera.position.set(center.x, center.y, 100);
    orthoCamera.lookAt(center.x, center.y, cutHeight);
    orthoCamera.up.set(0, 1, 0);

    const renderTarget = new THREE.WebGLRenderTarget(imgWidth, imgHeight);
    const prevTarget = renderer.getRenderTarget();

    renderer.setRenderTarget(renderTarget);
    renderer.clear();
    renderer.render(scene, orthoCamera);
    renderer.setRenderTarget(prevTarget);

    const pixels = new Uint8Array(imgWidth * imgHeight * 4);
    renderer.readRenderTargetPixels(renderTarget, 0, 0, imgWidth, imgHeight, pixels);

    const canvas = document.createElement('canvas');
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(imgWidth, imgHeight);

    for (let y = 0; y < imgHeight; y++) {
      for (let x = 0; x < imgWidth; x++) {
        const srcIdx = (y * imgWidth + x) * 4;
        const dstIdx = ((imgHeight - 1 - y) * imgWidth + x) * 4;
        imageData.data[dstIdx] = pixels[srcIdx];
        imageData.data[dstIdx + 1] = pixels[srcIdx + 1];
        imageData.data[dstIdx + 2] = pixels[srcIdx + 2];
        imageData.data[dstIdx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');

    renderTarget.dispose();

    return dataUrl;
  } finally {
    renderer.clippingPlanes = prevClipPlanes;
    renderer.localClippingEnabled = prevLocalClipping;
  }
};
