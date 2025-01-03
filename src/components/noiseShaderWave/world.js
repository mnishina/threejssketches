// reference -> https://www.youtube.com/watch?v=kxXaIHi1j4w

console.log("world noiseShaderWave");

import * as THREE from "three";
import { gsap } from "gsap";
import vertexShader from "./shaders/vertex2.glsl";
import fragmentShader from "./shaders/fragment.glsl";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const debug = {
  controls: null,
};

const $ = {
  canvas: document.querySelector("#canvas"),
};

const world = {
  init,
  sizes: {
    width: innerWidth,
    height: innerHeight,
  },
  scene: new THREE.Scene(),
  camera: null,
  geometry: null,
  material: null,
  mesh: null,
  renderer: null,
  clock: new THREE.Clock(),
  time: 0,
  loadManager: new THREE.LoadingManager(),
  textureLoader: new THREE.TextureLoader(),
  texture: {
    noise: {
      tex: null,
      url: "/noise.png",
    },
    image: {
      tex: null,
      url: "/image.png",
    },
  },
};

function init() {
  console.log("world init");

  const loadContainer = document.querySelector("#load");
  const itemProgress = document.querySelector(".itemProgress");

  world.loadManager.onError = (itemURL) => {
    console.log("error", itemURL);
  };

  world.loadManager.onStart = () => {
    _createCamera();
    _createRenderer();
  };

  world.loadManager.onProgress = (itemURL, itemLoaded, itemTotal) => {
    console.log("progress", itemURL, itemLoaded, itemTotal);

    let loadNum = (itemLoaded / itemTotal) * 100;

    itemProgress.textContent = `${loadNum}`;
  };

  world.loadManager.onLoad = () => {
    console.log("loaded");

    _createMesh();

    _debug();
    _tick();

    loadContainer.classList.add("loaded");

    // カメラポジションのアニメーション
    gsap.to(world.camera.position, {
      x: 3,
      y: -8,
      z: 7,
      duration: 2, // アニメーション時間（秒）
      ease: "power2.inOut", // イージング
      onUpdate: () => {
        debug.controls.update();
      },
    });
  };

  world.textureLoader.manager = world.loadManager;
  world.texture.noise.tex = world.textureLoader.load(world.texture.noise.url);
  world.texture.image.tex = world.textureLoader.load(world.texture.image.url);
  world.texture.noise.tex.wrapS = THREE.RepeatWrapping;
  world.texture.noise.tex.wrapT = THREE.RepeatWrapping;
}

function _createCamera() {
  world.camera = new THREE.PerspectiveCamera(
    24,
    world.sizes.width / world.sizes.height,
    0.1,
    1000,
  );
  world.camera.position.set(0, 0, 10);
  world.scene.add(world.camera);
}

function _createRenderer() {
  world.renderer = new THREE.WebGLRenderer({
    canvas: $.canvas,
    antialias: true,
    transparent: true,
    depthWrite: false,
  });
  world.renderer.setSize(world.sizes.width, world.sizes.height, false);
  world.renderer.setClearColor(0x000000, 0);
}

function _createMesh() {
  world.geometry = new THREE.PlaneGeometry(2, 3, 24, 24);
  world.material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    // wireframe: true,
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: {
        value: world.elapsedTime,
      },
      uNoiseTex: {
        value: world.texture.noise.tex,
      },
      uImageTex: {
        value: world.texture.image.tex,
      },
    },
  });
  world.mesh = new THREE.Mesh(world.geometry, world.material);
  world.mesh.position.set(0, -0.1, 0);
  world.scene.add(world.mesh);
}

function _debug() {
  debug.controls = new OrbitControls(world.camera, $.canvas);
}

function _tick() {
  requestAnimationFrame(_tick);

  world.time = world.clock.getElapsedTime();
  world.material.uniforms.uTime.value = world.time;

  debug.controls.update();

  world.renderer.render(world.scene, world.camera);
}

export default world;
