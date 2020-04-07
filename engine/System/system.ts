import { AnimationManager, Animation } from './animation';

import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Color3, Color4, Vector3, Vector2 } from '@babylonjs/core/Maths/math';
import { MotionBlurPostProcess } from '@babylonjs/core/PostProcesses/motionBlurPostProcess';
import { Camera } from '@babylonjs/core/Cameras/camera';

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

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    size = 300;
    buildScene() {
        this.scene = new Scene(this.engine);
        this.scene.ambientColor = new Color3(0.0, 0.0, 0.0);
        this.scene.clearColor = new Color4(0.0, 0.0, 0.0, 0.0);
        this.scene.autoClear = false; // Color buffer
        this.scene.autoClearDepthAndStencil = false; // Depth and stencil, obviously
        this.scene.blockfreeActiveMeshesAndRenderingGroups = true;
        this.scene.shadowsEnabled = false;
        this.scene.fogEnabled = false;
        // Can't freeze because of particles
        // Can't blockMaterialDirtyMechanism because of PBR
        // this.scene.blockMaterialDirtyMechanism = true;
        // this.scene.setRenderingAutoClearDepthStencil(renderingGroupIdx, autoClear, depth, stencil);
        this.setCamera();
        
        this.setLimitFPS(true);
        // setInterval(() => {
        //     let fps = this.engine.getFps();
        //     if (fps < 50) this.setLimitFPS(true);
        //     else this.setLimitFPS(false);
        // }, 1000);
    }
    
    shakeAnim: Animation;
    motionBlur: MotionBlurPostProcess;
    setCamera() {
        this.camera = new ArcRotateCamera('camera', 0, Math.PI/6, 10, Vector3.Zero(), this.scene);
        this.camera.minZ = 0;
        this.camera.setTarget(Vector3.Zero());
        // this.camera.attachControl(this.canvas);
        
        this.shakeAnim = new Animation(this.animationManager);
        // this.motionBlur.motionStrength = 10;
        // this.motionBlur.isEnabled = fasle;
        
        // this.camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
        // let aspect = this.scene.getEngine().getAspectRatio(this.camera);
        // let ortho = 25;
        // this.camera.orthoTop = ortho;
        // this.camera.orthoBottom = -ortho;
        // this.camera.orthoLeft = -ortho * aspect;
        // this.camera.orthoRight = ortho * aspect;
    }

    addMotionBLur() {
        this.motionBlur = new MotionBlurPostProcess('mb', this.scene, 1.0, this.camera);
        this.motionBlur.motionStrength = 0.1;
    }

    removeMotionBlur() {
        if (this.motionBlur) this.motionBlur.dispose();
    }

    shacking = false;
    cameraShake() {
        this.shacking = true;
        this.shakeAnim.alternate(30, 3, (count, perc) => {
            this.camera.alpha = perc / 70;
        }, (count, perc) => {
            this.camera.alpha = -perc / 70;
        }, () => {
            this.shacking = false;
            // this.cameraposition = camPosition;
            this.camera.alpha = 0;
        });
    }

    center = Vector2.Zero();
    setCenter(center: Vector2) {
        this.center = center;
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
    
    limitSwitch = true;
    startRender() {
        this.rendering = true;
        this.engine.stopRenderLoop();
        if (this.limitFPS) {
            this.engine.runRenderLoop(() => {
                this.animationManager.runAnimations(this.engine.getFps());
                if (this.limitSwitch) this.scene.render();
                this.limitSwitch = !this.limitSwitch;
            });
        } else {
            this.engine.runRenderLoop(() => {
                this.animationManager.runAnimations(this.engine.getFps());
                this.scene.render();
            });
        }
    }

    limitFPS = false;
    fps = 60;
    fpsRatio = 1;
    // Keep first value as true so that render function is called straight away
    // Otherwise you could have a flash 
    setLimitFPS(limitFPS: boolean) {
        if (limitFPS == this.limitFPS) return;
        this.limitFPS = limitFPS;
        if (this.limitFPS) this.fps = 30;
        else this.fps = 60;
        this.fpsRatio = 60 / this.fps;
        if (this.rendering) this.startRender();
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

    checkActiveMeshes() {
        this.scene.unfreezeActiveMeshes();
        this.scene.freezeActiveMeshes();
    }
}