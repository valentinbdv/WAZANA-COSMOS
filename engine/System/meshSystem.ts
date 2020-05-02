import '@babylonjs/core/Materials/standardMaterial';

import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Color3, Vector3 } from '@babylonjs/core/Maths/math';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';

import { PearlMesh } from '../Entity/pearlMesh';
import { EnvironmentSystem } from './environmentSystem';
import { SoundManager } from './sound';

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

    soundManager: SoundManager;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        this.addStarMesh();
        this.addDustMesh();
        this.addUpperDustMesh();
        this.addPlanetMesh();

        this.soundManager = new SoundManager(this.scene);
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
        this.addHeart();
        this.addSurface();
    }

    heart: Mesh;
    heartMaterial: StandardMaterial;
    addHeart() {
        // this.heart = MeshBuilder.CreateIcoSphere(this.key + "star", { radius: 1, flat: true, subdivisions: 2 }, this.system.scene);
        this.heart = MeshBuilder.CreateSphere("heart", { diameter: 2.8 }, this.scene);
        // Not always active as we check if heart in frustrum for opti
        this.heart.alwaysSelectAsActiveMesh = true;
        this.heart.doNotSyncBoundingInfo = true;
        this.heartMaterial = new StandardMaterial("heartMaterial", this.scene);
        this.heartMaterial.backFaceCulling = false;
        this.heartMaterial.maxSimultaneousLights = 0;
        // console.log(this.heartMaterial);
        // this.system.starGlowLayer.addIncludedOnlyMesh(this.heart);
        this.heart.material = this.heartMaterial;
        this.heart.isBlocker = false;
        this.heart.isVisible = false;
    }

    surface: Mesh;
    surfaceMaterial: PBRMaterial;
    addSurface() {
        // this.surface = MeshBuilder.CreateIcoSphere(this.key + "star", { radius: 4, flat: true, subdivisions: 2 }, this.system.scene);
        var heptagonalPrism = {
            "name": "Trigyrate Rhombicosidodecahedron (J75)",
            "category": ["Johnson Solid"],
            "vertex": [[-0.980376, -0.197048, -0.005857], [-0.946332, 0.150802, -0.285858], [-0.935804, 0.079716, 0.34339], [-0.901759, 0.427566, 0.063389], [-0.812124, -0.53251, 0.23851], [-0.8048, -0.555655, -0.20867], [-0.767552, -0.255746, 0.587757], [-0.759203, 0.553784, -0.341957], [-0.749715, 0.007177, -0.661721], [-0.688108, 0.168923, 0.705672], [-0.662244, -0.429437, -0.614016], [-0.633023, 0.731755, 0.252621], [-0.562586, 0.41016, -0.71782], [-0.500979, 0.571905, 0.649573], [-0.490467, 0.857973, -0.152725], [-0.483464, -0.835984, 0.259599], [-0.47614, -0.859129, -0.18758], [-0.411344, -0.388171, 0.824694], [-0.387011, 0.051553, -0.920632], [-0.333584, -0.732911, -0.592926], [-0.331901, 0.036498, 0.942608], [-0.299539, -0.385062, -0.872928], [-0.245677, 0.868112, 0.431306], [-0.235768, -0.746778, 0.621881], [-0.172335, 0.625585, -0.760884], [-0.144772, 0.43948, 0.88651], [-0.127762, 0.902348, -0.411637], [-0.119933, -0.991554, 0.049356], [-0.103121, 0.994331, 0.02596], [-0.003241, -0.266976, 0.963698], [0.003241, 0.266978, -0.963697], [0.11053, 0.735688, 0.668243], [0.110728, -0.787329, -0.606508], [0.127763, -0.902347, 0.411638], [0.144773, -0.439479, -0.886509], [0.172335, -0.625583, 0.760885], [0.242772, -0.947178, -0.209555], [0.271977, 0.571167, -0.774465], [0.29954, 0.385063, 0.872928], [0.31655, 0.847931, -0.425218], [0.331901, -0.036497, -0.942608], [0.341191, 0.939913, 0.012379], [0.387011, -0.051552, 0.920633], [0.473235, 0.780063, 0.409331], [0.490467, -0.857972, 0.152726], [0.528066, -0.712229, -0.462467], [0.562111, -0.364379, -0.742468], [0.562587, -0.410159, 0.717821], [0.600637, 0.267692, -0.753376], [0.662244, 0.429438, 0.614017], [0.672757, 0.715506, -0.188282], [0.749716, -0.007176, 0.661722], [0.759203, -0.553783, 0.341958], [0.775762, -0.623022, -0.100185], [0.804801, 0.555656, 0.208671], [0.830847, -0.06019, -0.553237], [0.848333, 0.356899, -0.391094], [0.946332, -0.1508, 0.285859], [0.96289, -0.22004, -0.156284], [0.980377, 0.197049, 0.005858]],
            "face": [[30, 24, 37], [14, 28, 26], [11, 13, 22], [25, 38, 31], [48, 56, 55], [59, 57, 58], [39, 41, 50], [43, 49, 54], [40, 46, 34], [45, 36, 32], [53, 52, 44], [51, 42, 47], [21, 19, 10], [27, 15, 16], [33, 35, 23], [29, 20, 17], [18, 8, 12], [1, 3, 7], [5, 4, 0], [6, 9, 2], [18, 12, 24, 30], [24, 26, 39, 37], [26, 28, 41, 39], [11, 22, 28, 14], [13, 25, 31, 22], [31, 38, 49, 43], [30, 37, 48, 40], [56, 59, 58, 55], [58, 57, 52, 53], [50, 54, 59, 56], [41, 43, 54, 50], [49, 38, 42, 51], [48, 55, 46, 40], [46, 45, 32, 34], [36, 44, 33, 27], [53, 44, 36, 45], [57, 51, 47, 52], [47, 42, 29, 35], [34, 32, 19, 21], [19, 16, 5, 10], [16, 15, 4, 5], [33, 23, 15, 27], [35, 29, 17, 23], [17, 20, 9, 6], [21, 10, 8, 18], [8, 1, 7, 12], [7, 3, 11, 14], [0, 2, 3, 1], [4, 6, 2, 0], [9, 20, 25, 13], [12, 7, 14, 26, 24], [22, 31, 43, 41, 28], [37, 39, 50, 56, 48], [54, 49, 51, 57, 59], [55, 58, 53, 45, 46], [52, 47, 35, 33, 44], [32, 36, 27, 16, 19], [23, 17, 6, 4, 15], [10, 5, 0, 1, 8], [2, 9, 13, 11, 3], [18, 30, 40, 34, 21], [20, 29, 42, 38, 25]]
        };

        this.surface = MeshBuilder.CreatePolyhedron("surface", { custom: heptagonalPrism, size: 2, sideOrientation: Mesh.DOUBLESIDE }, this.scene);
        // Not always active as we check if star in frustrum for opti
        this.surface.alwaysSelectAsActiveMesh = true;
        this.surface.doNotSyncBoundingInfo = true;
        // this.surface.renderingGroupId = 1;

        // Cool Poly 2, 3, 
        // this.surface = MeshBuilder.CreatePolyhedron("p", { type: 7, size: 4 }, this.system.scene);

        // this.surface.convertToUnIndexedMesh();
        this.surfaceMaterial = new PBRMaterial("surfaceMaterial", this.scene);
        this.surfaceMaterial.backFaceCulling = false;
        this.surfaceMaterial.backFaceCulling = false;
        // this.surfaceMaterial.roughness = 0.5;
        // this.surfaceMaterial.metallic = 1;
        this.surfaceMaterial.alpha = 0.5;

        // this.surfaceMaterial.linkRefractionWithTransparency = true;
        this.surfaceMaterial.indexOfRefraction = 0;
        // this.surfaceMaterial.alpha = 0;
        this.surfaceMaterial.microSurface = 0.85;

        this.surface.material = this.surfaceMaterial;
        this.surface.isBlocker = false;
        this.surface.isVisible = false;

        // console.log(this.surfaceMaterial);
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
            let perc = 1 - Math.pow(((temperature - 10000) / 22000), 2);
            return new Color3(perc, perc, 1);
        }
    }
}