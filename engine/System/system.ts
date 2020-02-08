
import { Animation, AnimationManager } from './animation';

import '@babylonjs/core/Animations/animatable';

import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Color3, Matrix, Vector3 } from '@babylonjs/core/Maths/math';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { CubeTexture } from '@babylonjs/core/Materials/Textures/cubetexture';
import '@babylonjs/core/Misc/dds';
import '@babylonjs/core/Materials/Textures/Loaders/ddsTextureLoader';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { GlowLayer } from '@babylonjs/core/Layers/glowLayer';

import dustTexture from '../../asset/circle_05.png';
import remove from 'lodash/remove';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { PearlMesh } from '../Entity/pearlMesh';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export class System {

    /**
    * Max Hardware scaling of BabylonJS Engine
    */
    maxScaling = 1;

    /**
    * BabylonJS Engine
    */
    engine: Engine;

    /**
     * BabylonJS Scene
     */
    scene: Scene;

    /**
     * BabylonJS Camera
     */
    camera: ArcRotateCamera;

    /**
     * BabylonJS starGlowLayer
     */
    starGlowLayer: GlowLayer;

    /**
     * BabylonJS starGlowLayer
     */
    dustGlowLayer: GlowLayer;

    /**
     * BabylonJS Skybox
     */
    skybox: Mesh;

    /**
     * BabylonJS Skybox Material
     */
    skyboxMaterial: PBRMaterial;

    /**
     * Manage all the animations only for this 3D Scene
     */
    animationManager: AnimationManager;

    /**
     * Canvas used to draw the 3D scene
     */
    canvas: HTMLCanvasElement;

    dustTexture: Texture;

    /**
     * Creates a new System
     * @param canvas Element where the scene will be drawn
     */
    constructor(canvas: HTMLCanvasElement) {
        // if (!Engine.isSupported()) throw 'WebGL not supported';
        this.canvas = canvas;
        // For now keep false as the last argument of the engine,
        // We don't want the canvas to adapt to screen ratio as it slow down too much the scene
        // preserveDrawingBuffer and stencil needed for screenshot
        // let engineOption;
        // if (!screenshot) engineOption = { limitDeviceRatio: this.maxScaling };
        // else engineOption = { limitDeviceRatio: this.maxScaling, preserveDrawingBuffer: true, stencil: true };
        // let engineOption = { limitDeviceRatio: this.maxScaling, preserveDrawingBuffer: true, stencil: true };
        let engineOption = {  };
        this.engine = new Engine(this.canvas, true, engineOption, false);
        // NOTE to avoid request for manifest files because it can block loading on safari
        this.engine.enableOfflineSupport = false;

        this.animationManager = new AnimationManager();
        this.loadCheck = new Animation(this.animationManager);
        this.buildScene();
        // Glow layer takes too much performance
        // this.addGlow();
        // this.addSky();
        this.addDustMesh();
        this.addPlanetMesh();
        // this.addLight();
        // this.addControl();

        this.dustTexture = new Texture(dustTexture, this.scene);

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    addControl() {
        this.camera.attachControl(this.canvas);
    }

    addGlow() {
        this.starGlowLayer = new GlowLayer("glow", this.scene, {
            mainTextureFixedSize: 2,
            blurKernelSize: 32
        });
        this.starGlowLayer.intensity = 100;
        // let int = 0;
        // this.scene.registerBeforeRender(() => {
        //     this.starGlowLayer.intensity = 100 + Math.cos(int / 20) * 10;
        //     int++;
        // });
    }

    size = 300;
    buildScene() {
        this.scene = new Scene(this.engine);
        // this.scene.shadowsEnabled = false;
        this.scene.ambientColor = new Color3(0.0, 0.0, 0.0);
        // this.scene.clearColor = new Color4(0.0, 0.0, 0.0, 0.0);
        this.scene.autoClear = false; // Color buffer
        this.scene.autoClearDepthAndStencil = false; // Depth and stencil, obviously
        this.scene.blockfreeActiveMeshesAndRenderingGroups = true;
        // Can't freeze because of particles
        // this.scene.freezeActiveMeshes();
        // Can't blockMaterialDirtyMechanism because of PBR
        // this.scene.blockMaterialDirtyMechanism = true;
        // this.scene.setRenderingAutoClearDepthStencil(renderingGroupIdx, autoClear, depth, stencil);

        this.camera = new ArcRotateCamera('camera', 0, Math.PI/6, 10, Vector3.Zero(), this.scene);
        this.camera.setTarget(Vector3.Zero());
    }

    addSky() {
        this.skybox = MeshBuilder.CreateSphere("sbsphere", { diameter: 32 }, this.scene);
        this.skybox.scaling = new Vector3(this.size + 20, this.size + 20, this.size + 20);
        this.skyboxMaterial = new PBRMaterial("skyBox", this.scene);
        this.skyboxMaterial.backFaceCulling = false;
        this.skyboxMaterial.roughness = 0.2;
        this.skybox.material = this.skyboxMaterial;
        
        // let alpha = 0;
        // this.scene.registerBeforeRender(() => {
        //     alpha += 0.01;
        //     this.scene.environmentTexture.setReflectionTextureMatrix(Matrix.RotationY(alpha));
        // });
    }

    loadCheck: Animation;
    sceneTexture: CubeTexture;
    setSky(design: number) {
        let asseturl = 'https://asset.wazana.io/';
        let mapcolor = 'mapcolor' + design.toString();

        this.sceneTexture = CubeTexture.CreateFromPrefilteredData(asseturl + 'dds/' + mapcolor + '.dds', this.scene);
        this.loadCheck.infinite(() => {
            if (this.sceneTexture.isReady()) {
                this.loadCheck.stop();
                this.sceneTexture.gammaSpace = false;
                this.scene.environmentTexture = this.sceneTexture;
                // this.skyboxMaterial.reflectionTexture = this.sceneTexture.clone();
                // this.skyboxMaterial.reflectionTexture.level = 0.2;
                // this.skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
                this.sendToSkyChangeListeners();
            }
        });
    }

    listeners: Array<Function> = [];
    addSkyChangeListener(callback: Function) {
        this.listeners.push(callback);
    }

    removeSkyChangeListener(callback: Function) {
        remove(this.listeners, (c) => { c == callback });
    }

    sendToSkyChangeListeners() {
        for (let i = 0; i < this.listeners.length; i++) {
            this.listeners[i](this.sceneTexture);
        }
        // Freeze all material to have better performance
        for (let i = 0; i < this.scene.materials.length; i++) {
            const material = this.scene.materials[i];
            material.unfreeze();
        }
        setTimeout(() => {
            for (let i = 0; i < this.scene.materials.length; i++) {
                const material = this.scene.materials[i];
                material.freeze();
            }
        }, 100);
    }

    light: DirectionalLight
    addLight() {
        this.light = new DirectionalLight('light', new Vector3(1, -1, 0), this.scene);
        this.light.diffuse = new Color3(1, 1, 1);
        this.light.intensity = 0.5;
    }

    dustMesh: Mesh;
    dustMaterial: StandardMaterial;
    addDustMesh() {
        this.dustMaterial = new StandardMaterial("dustMaterial", this.scene);
        this.dustMaterial.maxSimultaneousLights = 0;
        this.dustMaterial.diffuseColor = Color3.Black();
        this.dustMaterial.specularColor = Color3.Black();
        this.dustMaterial.emissiveColor = new Color3(1, 1, 0);

        // this.mesh = MeshBuilder.CreateIcoSphere(this.key + "star", { radius: 1, flat: true, subdivisions: 2 }, this.system.scene);
        // this.mesh.isBlocker = false;
        this.dustMesh = MeshBuilder.CreateSphere("dust", { diameter: 1 }, this.scene);
        this.dustMesh.alwaysSelectAsActiveMesh = true;
        this.dustMesh.doNotSyncBoundingInfo = true;
        this.dustMesh.material = this.dustMaterial; 
        this.dustMesh.isVisible = false;
    }

    planetMesh: PearlMesh;
    planetMaterial: PBRMaterial;
    addPlanetMesh() {
        this.planetMesh = new PearlMesh("planet", this.scene);
        this.planetMesh.alwaysSelectAsActiveMesh = true;
        this.planetMesh.doNotSyncBoundingInfo = true;
        this.planetMaterial = new PBRMaterial("planetMaterial", this.scene);
        // this.planetMaterial.roughness = 1;
        // this.meshMaterial.emissiveColor = color;
        this.planetMesh.material = this.planetMaterial;
        this.planetMesh.isVisible = false;
    }

    /**
    * Tell if system currently rendering scene
    */
    rendering = false;

    /**
    * Tell if scene needs to be render
    */
    started = false;

    /**
     * @ignore
     */
    setVisible(canvasVisible: boolean) {
        // If overflow style = hidden, there is no scrollingElement on document
        if (canvasVisible && !this.rendering) this.startRender();
        else if (!canvasVisible && this.rendering) this.pauseRender();
    }

    /**
     * Allow to launch scene rendering (when everything is loaded for instance)
     */
    launchRender() {
        this.started = true;
        this.startRender();
    }

    /**
     * Stop scene rendering
     */
    stopRender() {
        this.started = false;
        this.pauseRender();
    }

    /**
     * @ignore
     */
    pauseRender() {
        this.rendering = false;
        this.engine.stopRenderLoop();
    }

    /**
     * @ignore
     */
    frameTest = false;
    startRender() {
        this.rendering = true;
        this.engine.stopRenderLoop();
        this.engine.runRenderLoop(() => {
            this.animationManager.runAnimations(this.engine.getFps());
            this.scene.render();
            // if (this.frameTest) this.scene.render();
            // this.frameTest = !this.frameTest;
        });
    }

    /**
     * Optimize scene to make rendering faster
     * https://doc.babylonjs.com/how_to/optimizing_your_scene#reducing-shaders-overhead
     */
    optimize() {
        // this.scene.blockMaterialDirtyMechanism = true;
        this.scene.autoClear = false; // Color buffer
        this.scene.autoClearDepthAndStencil = false; // Depth and stencil, obviously

        // let activeTest = 0;
        // this.scene.registerBeforeRender(() => {
        //     activeTest++;
        //     this.scene.freezeActiveMeshes();
        //     if (activeTest > 30) {
        //         activeTest = 0;
        //         this.scene.unfreezeActiveMeshes();
        //     }
        // });
    }

    /**
     * UnOptimize scene rendering
     * https://doc.babylonjs.com/how_to/optimizing_your_scene#reducing-shaders-overhead
     */
    unOptimize() {
        this.scene.blockMaterialDirtyMechanism = false;
        this.scene.autoClear = true; // Color buffer
        this.scene.autoClearDepthAndStencil = true; // Depth and stencil, obviously
    }

    /**
     * Optimize scene to make rendering faster
     * https://doc.babylonjs.com/how_to/optimizing_your_scene#reducing-shaders-overhead
     */
    optimizeHard() {
        this.optimize();
        this.scene.freezeActiveMeshes();
        this.scene.blockMaterialDirtyMechanism = true;
        // this.scene.setRenderingAutoClearDepthStencil(renderingGroupIdx, autoClear, depth, stencil);
    }

    /**
     * UnOptimize scene rendering
     * https://doc.babylonjs.com/how_to/optimizing_your_scene#reducing-shaders-overhead
     */
    unOptimizeHard() {
        this.unOptimize();
        this.scene.unfreezeActiveMeshes();
        this.scene.blockMaterialDirtyMechanism = false;
        // this.scene.setRenderingAutoClearDepthStencil(renderingGroupIdx, autoClear, depth, stencil);
    }
}