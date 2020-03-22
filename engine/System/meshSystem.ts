import '@babylonjs/core/Materials/standardMaterial';

import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Color3, Vector3 } from '@babylonjs/core/Maths/math';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';

import { PearlMesh } from '../Entity/pearlMesh';
import { EnvironmentSystem } from './environmentSystem';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export let StarTemperatures: Array<number> = [
    3000,
    5000,
    12000,
    30000,
];

export class MeshSystem extends EnvironmentSystem {

   
    /**
     * Creates a new System
     * @param canvas Element where the scene will be drawn
     */
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        this.addStarMesh();
        this.addDustMesh();
        this.addUpperDustMesh();
        this.addPlanetMesh();
    }

    dustMesh: Mesh;
    dustMesh1: Mesh;
    dustMesh2: Mesh;
    dustMesh3: Mesh;
    dustMesh4: Mesh;
    addDustMesh() {
        this.dustMaterial = this.getNewDustMaterial();
        this.dustMaterial.emissiveColor = new Color3(1, 1, 0);
        this.dustMesh = this.getNewDust();
        this.dustMesh.material = this.dustMaterial; 
    }

    upperDustMesh: Mesh;
    upperDustMaterial: StandardMaterial;
    addUpperDustMesh() {
        this.upperDustMaterial = this.getNewDustMaterial();
        this.upperDustMaterial.emissiveColor = new Color3(1, 1, 1);
        this.upperDustMesh = this.getNewDust();
        this.upperDustMesh.material = this.upperDustMaterial;
        this.upperDustMesh.scaling = new Vector3(0.06, 0.06, 0.06);
    }
    
    getNewDust(): Mesh {
        // this.mesh = MeshBuilder.CreateIcoSphere(this.key + "star", { radius: 1, flat: true, subdivisions: 2 }, this.system.scene);
        // this.mesh.isBlocker = false;
        let dustMesh = MeshBuilder.CreateSphere("dust", { diameter: 1 }, this.scene);
        dustMesh.alwaysSelectAsActiveMesh = true;
        dustMesh.doNotSyncBoundingInfo = true;
        dustMesh.isVisible = false;
        return dustMesh;
    }
    
    dustMaterial: StandardMaterial;
    getNewDustMaterial(): StandardMaterial {
        let dustMaterial = new StandardMaterial("dustMaterial1", this.scene);
        dustMaterial.maxSimultaneousLights = 0;
        dustMaterial.diffuseColor = Color3.Black();
        dustMaterial.specularColor = Color3.Black();
        return dustMaterial;
    }

    addStarMesh() {
        this.addStar1();
        this.addStar2();
        this.addStar3();
        this.addStar4();
    }

    addStar1() {
        let dustMaterial = this.getNewDustMaterial();
        dustMaterial.emissiveColor = this.getColorFromTemperature(StarTemperatures[0]);
        this.dustMesh1 = this.getNewDust();
        this.dustMesh1.material = dustMaterial; 
    }

    addStar2() {
        let dustMaterial = this.getNewDustMaterial();
        dustMaterial.emissiveColor = this.getColorFromTemperature(StarTemperatures[1]);
        this.dustMesh2 = this.getNewDust();
        this.dustMesh2.material = dustMaterial;
    }

    addStar3() {
        let dustMaterial = this.getNewDustMaterial();
        dustMaterial.emissiveColor = this.getColorFromTemperature(StarTemperatures[2]);
        this.dustMesh3 = this.getNewDust();
        this.dustMesh3.material = dustMaterial;
    }

    addStar4() {
        let dustMaterial = this.getNewDustMaterial();
        dustMaterial.emissiveColor = this.getColorFromTemperature(StarTemperatures[3]);
        this.dustMesh4 = this.getNewDust();
        this.dustMesh4.material = dustMaterial;
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
    unfreezeMaterials() {
        // for (let i = 0; i < this.scene.materials.length; i++) {
        //     const material = this.scene.materials[i];
        //     material.unfreeze();
        // }
        this.dustMaterial.unfreeze();
        this.planetMaterial.unfreeze();
        this.ribbonMaterial.unfreeze();
    }

    freezeMaterials() {
        // for (let i = 0; i < this.scene.materials.length; i++) {
        //     const material = this.scene.materials[i];
        //     material.freeze();
        // }
        this.dustMaterial.freeze();
        this.planetMaterial.freeze();
        this.ribbonMaterial.freeze();
    }

    checkMaterials() {
        // Freeze all material to have better performance
        this.unfreezeMaterials();
        this.freezeMaterials();
        // setTimeout(() => {
        //     this.freezeMaterials();
        // }, 100);
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