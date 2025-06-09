import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let terrain;

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue
    scene.fog = new THREE.Fog(0x87ceeb, 300, 600);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 50;
    controls.maxPolarAngle = Math.PI / 2 - 0.1; // Don't go below ground horizon

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
    directionalLight.position.set(-150, 200, -150);
    directionalLight.castShadow = true;
    // Configure shadow camera
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 600;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Terrain
    createTerrain();

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);

    animate();
}

function createTerrain() {
    const TILE_SIZE = 1;
    const TERRAIN_WIDTH_TILES = 256; // Corresponds to cylinder height/length
    const TERRAIN_DEPTH_TILES = 256; // Corresponds to cylinder arc

    const terrainWidth = TERRAIN_WIDTH_TILES * TILE_SIZE;
    const terrainDepthArc = TERRAIN_DEPTH_TILES * TILE_SIZE;
    
    // Arc Length = radius * angle
    // Our angle for the walkable surface is PI/2 (a quarter circle)
    const radius = terrainDepthArc / (Math.PI / 2);

    const textureLoader = new THREE.TextureLoader();
    const terrainTexture = textureLoader.load('terrain_texture.png');
    terrainTexture.wrapS = THREE.ClampToEdgeWrapping;
    terrainTexture.wrapT = THREE.ClampToEdgeWrapping;

    // A cylinder geometry is created standing up along the Y axis.
    // We create a quarter-segment of it.
    const geometry = new THREE.CylinderGeometry(
        radius, // radiusTop
        radius, // radiusBottom
        terrainWidth, // height of cylinder
        128, // radialSegments for smoothness
        128, // heightSegments for smoothness
        true, // openEnded
        -Math.PI / 4, // thetaStart: centers the arc on an axis
        Math.PI / 2  // thetaLength: 1/4 of a circle
    );
    
    // Rotate it to be horizontal along the X axis.
    geometry.rotateZ(Math.PI / 2);

    const material = new THREE.MeshStandardMaterial({
        map: terrainTexture,
        roughness: 0.8,
        metalness: 0.2
    });

    terrain = new THREE.Mesh(geometry, material);
    terrain.receiveShadow = true;
    
    // Move the terrain down so its peak is at y=0
    terrain.position.y = -radius;
    scene.add(terrain);

    // Position camera and controls
    camera.position.set(0, 100, radius); 
    controls.target.set(0, 0, 0);
    controls.maxDistance = radius * 2.5;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

init();

