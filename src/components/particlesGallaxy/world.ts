console.log("world");
import Utils from "../Utils/index";
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Points,
  BufferGeometry,
  BufferAttribute,
  PointsMaterial,
  AdditiveBlending,
} from "three";

interface World {
  init: (canvas: HTMLCanvasElement, canvasRect: DOMRect) => void;
  sizes: {
    width: number;
    height: number;
    canvasWidth: number | null;
    canvasHeight: number | null;
  };
  canvas: HTMLCanvasElement | null;
  canvasRect: DOMRect | null;
  renderer: WebGLRenderer | null;
  scene: Scene;
  camera: PerspectiveCamera | null;
  fov: number;
  aspectRatio: number | null;
  near: number;
  far: number;
}

const world: World = {
  init,
  sizes: {
    width: window.innerWidth,
    height: window.innerHeight,
    canvasWidth: null,
    canvasHeight: null,
  },
  canvas: null,
  canvasRect: null,
  renderer: null,
  scene: new Scene(),
  camera: null,
  fov: 50,
  aspectRatio: null,
  near: 0.1,
  far: 1000,
};

function init(canvas: HTMLCanvasElement, canvasRect: DOMRect) {
  console.log("world init");

  world.canvas = canvas;
  world.canvasRect = canvasRect;

  const { width, height } = world.canvasRect;
  world.sizes.canvasWidth = width;
  world.sizes.canvasHeight = height;

  _createRenderer(world.canvas);
  _createCamera();

  _createMesh();

  _tick();

  _addGUI();
  Utils.setupOrbitControl(world.camera!, canvas);
}

function _createRenderer(canvas: HTMLCanvasElement) {
  world.renderer = new WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });
  world.renderer.setSize(world.sizes.canvasWidth!, world.sizes.canvasHeight!);
  world.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
}

function _createCamera() {
  world.aspectRatio = world.sizes.canvasWidth! / world.sizes.canvasHeight!;

  world.camera = new PerspectiveCamera(
    world.fov,
    world.aspectRatio,
    world.near,
    world.far,
  );

  world.camera.position.set(5, 5, 5);
}

function _tick() {
  requestAnimationFrame(_tick);

  world.renderer && world.renderer.render(world.scene, world.camera!);
}

interface Parameters {
  count: number;
  size: number;
  radius: number;
  branches: number;
  spin: number;
  randomness: number;
  randomnessPower: number;
}

const parameters: Parameters = {
  count: 100000,
  size: 0.02,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
};

function _createMesh() {
  const geometry = new BufferGeometry();

  const positions = new Float32Array(parameters.count * 3);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    const radius = Math.random() * parameters.radius;
    const spinAngle = radius * parameters.spin;
    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);

    // if (i < 20) {
    //   console.log(branchAngle);
    // }

    positions[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
  }

  geometry.setAttribute("position", new BufferAttribute(positions, 3));

  const material = new PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: true,
    blending: AdditiveBlending,
  });

  const mesh = new Points(geometry, material);
  world.scene.add(mesh);
}

function _addGUI() {
  Utils.setupGUI();
}

export default world;