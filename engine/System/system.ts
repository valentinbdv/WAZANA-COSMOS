
import { AnimationManager } from './animation';

import '@babylonjs/core/Animations/animatable';

import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Color3, Color4, Vector3 } from '@babylonjs/core/Maths/math';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { CubeTexture } from '@babylonjs/core/Materials/Textures/cubetexture';
import '@babylonjs/core/Misc/dds';
import '@babylonjs/core/Materials/Textures/Loaders/ddsTextureLoader';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { GlowLayer } from '@babylonjs/core/Layers/glowLayer';

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
     * BabylonJS GlowLayer
     */
    glowLayer: GlowLayer;

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
        this.buildScene();
        this.addSky();
        // this.addLight();
        // this.addControl();
        this.addGlow();
    }

    addControl() {
        this.camera.attachControl(this.canvas);
    }

    addGlow() {
        this.glowLayer = new GlowLayer("glow", this.scene);
        this.glowLayer.intensity = 100;
        this.glowLayer.blurKernelSize = 32;
        // console.log(this.glowLayer);
        let int = 0;
        this.scene.registerBeforeRender(() => {
            this.glowLayer.intensity = 100 + Math.cos(int / 20) * 10;
            int++;
        });
    }

    size = 300;
    buildScene() {
        this.scene = new Scene(this.engine);
        // this.scene.shadowsEnabled = false;
        this.scene.ambientColor = new Color3(0.0, 0.0, 0.0);
        // this.scene.clearColor = new Color4(0.0, 0.0, 0.0, 0.0);

        this.camera = new ArcRotateCamera('camera', 0, Math.PI/4, 40, Vector3.Zero(), this.scene);
        this.camera.setTarget(Vector3.Zero());
    }

    addSky() {
        this.skybox = MeshBuilder.CreateSphere("sbsphere", { diameter: 32 }, this.scene);
        this.skybox.scaling = new Vector3(this.size + 20, this.size + 20, this.size + 20);
        this.skyboxMaterial = new PBRMaterial("this.skyBox", this.scene);
        this.skyboxMaterial.backFaceCulling = false;
        this.skybox.material = this.skyboxMaterial;

        let asseturl = 'https://asset.wazana.io/';
        let mapcolor = 'mapcolor2';

        var hdrTexture = CubeTexture.CreateFromPrefilteredData(asseturl + 'dds/' + mapcolor + '.dds', this.scene);
        hdrTexture.gammaSpace = false;
        // this.scene.environmentTexture = hdrTexture;
        this.skyboxMaterial.roughness = 0.2;
        this.skyboxMaterial.reflectionTexture = hdrTexture;
        this.skyboxMaterial.reflectionTexture.level = 0.2;
        this.skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    }

    light: PointLight
    addLight() {
        this.light = new PointLight('light', new Vector3(0, 2, 0), this.scene);
        this.light.diffuse = new Color3(0, 0, 1);
        this.light.intensity = 2;
        console.log(this.light);
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
    startRender() {
        this.rendering = true;
        this.engine.stopRenderLoop();
        this.engine.runRenderLoop(() => {
            this.animationManager.runAnimations(this.engine.getFps());
            this.scene.render();
        });
    }

    /**
     * Optimize scene to make rendering faster
     * https://doc.babylonjs.com/how_to/optimizing_your_scene#reducing-shaders-overhead
     */
    optimize() {
        this.scene.blockMaterialDirtyMechanism = true;
        this.scene.autoClear = false; // Color buffer
        this.scene.autoClearDepthAndStencil = false; // Depth and stencil, obviously
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