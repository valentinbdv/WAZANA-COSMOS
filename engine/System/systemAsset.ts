
import { Animation } from './animation';

import '@babylonjs/core/Animations/animatable';

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
import { System } from './system';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export class SystemAsset extends System {

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

    dustTexture: Texture;

    /**
     * Creates a new System
     * @param canvas Element where the scene will be drawn
     */
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        // Glow layer takes too much performance
        // this.addGlow();
        // this.addSky();
        this.addDustMesh();
        this.addPlanetMesh();
        this.addRibbonMaterial();
        // this.addLight();
        this.dustTexture = new Texture(dustTexture, this.scene);
        this.loadCheck = new Animation(this.animationManager);
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
                this.ribbonMaterial.reflectionTexture = this.sceneTexture.clone();
                this.ribbonMaterial.reflectionTexture.level = 0.2;
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
        this.unFreezeMaterials();
        setTimeout(() => {
            this.freezeMaterials();
        }, 100);
    }

    unFreezeMaterials() {
        // for (let i = 0; i < this.scene.materials.length; i++) {
        //     const material = this.scene.materials[i];
        //     material.unfreeze();
        // }
        // this.dustMaterial.unfreeze();
        // this.planetMaterial.unfreeze();
        // this.ribbonMaterial.unfreeze();
    }

    freezeMaterials() {
        // for (let i = 0; i < this.scene.materials.length; i++) {
        //     const material = this.scene.materials[i];
        //     material.freeze();
        // }
        // this.dustMaterial.freeze();
        // this.planetMaterial.freeze();
        // this.ribbonMaterial.freeze();
    }

    light: DirectionalLight
    addLight() {
        this.light = new DirectionalLight('light', new Vector3(1, -1, 0), this.scene);
        this.light.diffuse = new Color3(1, 1, 1);
        this.light.intensity = 0.5;
    }

    dustMesh: Mesh;
    dustMesh1: Mesh;
    dustMesh2: Mesh;
    dustMesh3: Mesh;
    dustMesh4: Mesh;
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

    ribbonMaterial: PBRMaterial;
    addRibbonMaterial() {
        this.ribbonMaterial = new PBRMaterial("ribbonMaterial", this.scene);
        this.ribbonMaterial.roughness = 0.5;
        this.ribbonMaterial.metallic = 1;
        this.ribbonMaterial.alpha = 1;
    }

    // Follow this map color http://cdn.eso.org/images/screen/eso0728c.jpg
    getColorFromTemperature(temperature: number): Color3 {
        if (temperature < 8000) {
            let perc = (8000 - temperature) / 5000;
            let g = Math.min(1, 2 - perc * 2);
            let b = Math.max(0, 1 - perc * 2);
            return new Color3(1, g, b);
        } else {
            let perc = 1 - Math.pow(((temperature - 8000) / 22000), 2);
            return new Color3(perc, perc, 0.8);
        }
    }
}