import '@babylonjs/core/Animations/animatable';
import '@babylonjs/core/Materials/Textures/Loaders/envTextureLoader';

import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Color3, Vector3 } from '@babylonjs/core/Maths/math';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { CubeTexture } from '@babylonjs/core/Materials/Textures/cubetexture';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { GlowLayer } from '@babylonjs/core/Layers/glowLayer';

import sparkleTexture from '../../docs/assets/images/star_08.png';
import smokeTexture from '../../docs/assets/images/smoke_04.png';
import circleTexture from '../../docs/assets/images/circle_05.png';

import remove from 'lodash/remove';

import { System } from './system';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export class EnvironmentSystem extends System {

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

    sparkleTexture: Texture;
    smokeTexture: Texture;
    circleTexture: Texture;

    /**
     * Creates a new System
     * @param canvas Element where the scene will be drawn
     */
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        // Glow layer takes too much performance
        // this.addGlow();
        // this.addSky();
        this.addRibbonMaterial();
        // this.addLight();
        this.sparkleTexture = new Texture(sparkleTexture, this.scene);
        this.smokeTexture = new Texture(smokeTexture, this.scene);
        this.circleTexture = new Texture(circleTexture, this.scene);
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

    sceneTexture: CubeTexture;
    skyDesignOrder = [5, 3, 1, 2, 4, 6];
    skyColor: Color3;
    skyColors = {
        5: new Color3(21 / 255, 16 / 255, 52 / 255), 
        3: new Color3(22 / 255, 18 / 255, 31 / 255), 
        1: new Color3(8 / 255, 30 / 255, 30 / 255), 
        2: new Color3(27 / 255, 35 / 255, 24 / 255), 
        4: new Color3(47 / 255, 37 / 255, 18 / 255), 
        6: new Color3(39 / 255, 28 / 255, 41 / 255)
    };
    skyDesign = this.skyDesignOrder[0];
    setSky(design: number, callback?: Function) {
        this.skyDesign = this.skyDesignOrder[design];
        this.skyColor = this.skyColors[this.skyDesign];
        
        let asseturl = 'https://valentinbdv.github.io/WAZANA-COSMOS/assets/env/';
        let mapcolor = 'mapcolor' + this.skyDesign.toString();
        let envUrl = asseturl + mapcolor + '.env';
        // let envUrl = offlineEnvTexture;
        
        this.sceneTexture = new CubeTexture(envUrl, this.scene, null, false, null, () => {
            // this.sceneTexture.gammaSpace = false;
            this.scene.environmentTexture = this.sceneTexture;
            // this.skyboxMaterial.reflectionTexture = this.sceneTexture.clone();
            // this.skyboxMaterial.reflectionTexture.level = 0.1;
            // this.skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
            this.ribbonMaterial.reflectionTexture = this.sceneTexture.clone();
            this.ribbonMaterial.reflectionTexture.level = 0.1;
            this.sendToSkyChangeListeners();
            if (callback) callback();
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
    }

    light: DirectionalLight
    addLight() {
        this.light = new DirectionalLight('light', new Vector3(1, -1, 0), this.scene);
        this.light.diffuse = new Color3(1, 1, 1);
        this.light.intensity = 0.5;
    }

    ribbonMaterial: PBRMaterial;
    addRibbonMaterial() {
        this.ribbonMaterial = new PBRMaterial("ribbonMaterial", this.scene);
        this.ribbonMaterial.roughness = 0.3;
        this.ribbonMaterial.metallic = 1;
        this.ribbonMaterial.alpha = 1;
    }
}