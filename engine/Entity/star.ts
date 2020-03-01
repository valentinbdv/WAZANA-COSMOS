import { SystemAsset, StarTemperatures } from '../System/systemAsset';
import { Animation } from '../System/animation';
import { MovingEntity, MovingEntityInterface } from './movingEntity';

import { Vector3, Color3, Color4 } from '@babylonjs/core/Maths/math';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { MeshBuilder } from '@babylonjs/core/Meshes/MeshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/Mesh';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { IEasingFunction, BezierCurveEase } from '@babylonjs/core/Animations/easing';
import { CubeTexture } from '@babylonjs/core/Materials/Textures/cubeTexture';
import { Planet } from './planet';

// https://www.youtube.com/watch?v=i4RtO_qIQHk


export interface StarCategory {
    name: string;
    temperature: number;
    planets: number;
    gravity: number;
    velocity: number;
}

export let StarCategories: Array<StarCategory> = [
    {
        name: 'Red Dwarf',
        temperature: StarTemperatures[0],
        planets: 3,
        gravity: 1.2,
        velocity: 1
    },
    {
        name: 'Yellow Dwarf',
        temperature: StarTemperatures[1],
        planets: 4,
        gravity: 1.1,
        velocity: 1.1
    },
    {
        name: 'White Dwarf',
        temperature: StarTemperatures[2],
        planets: 5,
        gravity: 1,
        velocity: 0.9
    },
    {
        name: 'Blue Dwarf',
        temperature: StarTemperatures[3],
        planets: 6,
        gravity: 0.6,
        velocity: 1.3
    },
];

export interface StarInterface extends MovingEntityInterface {
    temperature: number,
    maxPlanet: number,
    texture?: string,
    number?: number,
    life?: number,
    power?: number,
}

export class Star extends MovingEntity {

    shineAnimation: Animation;
    curve: IEasingFunction;

    texture: string;
    number: number;
    color: Color4;
    life: number;
    power: number;

    // rotateProgress = 0;
    cycleProgress = 0;
    planets: Array< Planet > = [];

    constructor(system: SystemAsset, options: StarInterface) {
        super('star', system, options);

        this.shineAnimation = new Animation(this.system.animationManager);
        this.addHeart();
        this.addSurface();
        this.addLight();
        this.addSecondLight();

        let p = options.position;
        this.movingMesh.position = new Vector3(p.x, 0, p.y);
        this.setSize(options.size);
        this.setTemperature(options.temperature);

        this.system.scene.registerBeforeRender(() => {
            for (let i = 0; i < this.planets.length; i++) {
                const planet = this.planets[i];
                planet.mesh.position.x = (this.size + planet.radius) * Math.cos((planet.velocity * planet.cycle) / 100 + planet.offset);
                planet.mesh.position.z = (this.size + planet.radius) * Math.sin((planet.velocity * planet.cycle) / 100 + planet.offset);
                planet.mesh.rotation.y = planet.velocity * ( this.cycleProgress / 100 );
                planet.cycle += this.cycleProgress;
            }
            this.surface.rotation.y += this.cycleProgress / 200;
        });

        this.curve = new BezierCurveEase(.76, .01, .51, 1.33);
        // this.curve.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    }

    maxPlanet: number;
    setMaxPlanet(maxPlanet: number) {
        this.maxPlanet = maxPlanet;
    }

    temperature: number;
    setTemperature(temperature: number) {
        temperature = Math.max(3000, temperature);
        temperature = Math.min(30000, temperature);
        this.temperature = temperature;
        let color = this.system.getColorFromTemperature(temperature);
        this.color = color.toColor4();
        this.heartMaterial.emissiveColor = color;
        this.heartMaterial.diffuseColor = Color3.White();
        this.surfaceMaterial.reflectivityColor = color;
        // this.surfaceMaterial.albedoColor = color;
        this.secondLight.diffuse = color;
        this.light.diffuse = color;
    }


    heart: Mesh;
    heartMaterial: StandardMaterial;
    addHeart() {
        // this.heart = MeshBuilder.CreateIcoSphere(this.key + "star", { radius: 1, flat: true, subdivisions: 2 }, this.system.scene);
        this.heart = MeshBuilder.CreateSphere(this.key + "star", { diameter: 2.8 }, this.system.scene);
        this.heart.alwaysSelectAsActiveMesh = true;
        // this.heart.doNotSyncBoundingInfo = true;
        this.heartMaterial = new StandardMaterial(this.key + "material", this.system.scene);
        this.heartMaterial.backFaceCulling = false;
        this.heartMaterial.maxSimultaneousLights = 0;
        // console.log(this.heartMaterial);
        // this.system.starGlowLayer.addIncludedOnlyMesh(this.heart);
        this.heart.material = this.heartMaterial;
        this.heart.isBlocker = false;
        this.heart.parent = this.movingMesh;
        // this.heart.isVisible = false;
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

        this.surface = MeshBuilder.CreatePolyhedron("h", { custom: heptagonalPrism, size: 2, sideOrientation: Mesh.DOUBLESIDE }, this.system.scene);
        this.surface.alwaysSelectAsActiveMesh = true;
        // this.surface.doNotSyncBoundingInfo = true;
        // this.surface.renderingGroupId = 1;

        // Cool Poly 2, 3, 
        // this.surface = MeshBuilder.CreatePolyhedron("p", { type: 7, size: 4 }, this.system.scene);

        this.surface.convertToFlatShadedMesh();
        this.surfaceMaterial = new PBRMaterial(this.key + "material", this.system.scene);
        this.surfaceMaterial.backFaceCulling = false;
        // this.surfaceMaterial.roughness = 0.5;
        // this.surfaceMaterial.metallic = 1;
        this.surfaceMaterial.alpha = 0.5;

        // this.surfaceMaterial.linkRefractionWithTransparency = true;
        this.surfaceMaterial.indexOfRefraction = 0;
        // this.surfaceMaterial.alpha = 0;
        this.surfaceMaterial.microSurface = 0.8;
        
        this.surface.material = this.surfaceMaterial;
        this.surface.parent = this.movingMesh;
        this.surface.isBlocker = false;

        if (this.system.sceneTexture) this.setTexture(this.system.sceneTexture);
        // console.log(this.surfaceMaterial);
        this.system.addSkyChangeListener((texture) => {
            this.setTexture(texture);
            this.setReflectionLevel(0.1);
        });
    }

    setTexture(texture: CubeTexture) {
        this.surfaceMaterial.refractionTexture = texture.clone();
        this.surfaceMaterial.reflectionTexture = texture.clone();
    }

    light: PointLight
    addLight() {
        this.light = new PointLight('light', new Vector3(0, 0, 0), this.system.scene);
        this.light.radius = 0.1;
        this.light.shadowEnabled = false;
        this.light.parent = this.movingMesh;
        this.light.includedOnlyMeshes.push(this.surface);	
        // console.log(this.light);
    }

    secondLight: PointLight
    addSecondLight() {
        this.secondLight = new PointLight('secondLight', new Vector3(0, 0, 0), this.system.scene);
        this.secondLight.radius = 1;
        this.secondLight.shadowEnabled = false;
        this.secondLight.parent = this.movingMesh;
        // this.secondLight.excludedMeshes.push(this.surface);
        // this.secondLight.excludedMeshes.push(this.heart);
        this.secondLight.excludedMeshes = [];
        // console.log(this.secondLight);
    }

    shine() {
        if (this.shineAnimation.running) return;
        this.shineAnimation.simple(20, (count, perc) => {
            let y = 1 - 4 * Math.pow(perc - 0.5, 2);
            this.setReflectionLevel(y/2);
            let sizeVector = new Vector3(this.size + y/10, this.size + y/10, this.size + y/10);
            this.heart.scaling = sizeVector;
        }, () => {
            this.setReflectionLevel(0);
        });
    }

    setReflectionLevel(level: number) {
        this.surfaceMaterial.reflectionTexture.level = level;
        this.surfaceMaterial.refractionTexture.level = level;
    }

    setSize(size: number) {
        let newsize = Math.max(0.1, size);
        newsize = Math.sqrt(newsize);
        this._setSize(newsize);
        let sizeVector = new Vector3(newsize, newsize, newsize);
        // this.heart.scaling = sizeVector;
        this.surface.scaling = sizeVector;
        this.light.intensity = 1000 * size;
        this.secondLight.intensity = 1000 * size;
        this.cycleProgress = 1 / Math.sqrt(this.size);
    }

    updateSize(size: number, time?:number, callback?: Function) {
        this.shineAnimation.stop();
        let currentsize = Math.pow(this.size, 2);
        let change = size - currentsize;
        let animTime = (time)? time : 20;
        
        this.shineAnimation.simple(animTime, (count, perc) => {
            this.setReflectionLevel(perc);
            this.setOpacity(1 - perc);
            this.light.intensity = perc * 1000;
            let newsize = currentsize + this.curve.ease(perc) * change;
            this.setSize(newsize);
        }, () => {
            this.setSize(size);
            this.setReflectionLevel(0);
            if (callback) callback();
        });
    }
    
    _disposeStar() {
        this.heart.isVisible = false;
        this.surface.isVisible = false;
        // this.heart.dispose();
        this.heartMaterial.dispose();
        // this.surface.dispose();
        this.surfaceMaterial.dispose();
        this.light.isEnabled(false);
        this.light.dispose();
        this.secondLight.isEnabled(false);
        this.secondLight.dispose();
        this.system.checkActiveMeshes();
        this.moveCatcher.stop();
        this.shineAnimation.stop();
    }

    setOpacity(opacity: number) {
        this.heart.visibility = opacity;
        this.surface.visibility = opacity;
    }

    show() {
        this.heart.isVisible = true;
        this.surface.isVisible = true;
        this.setOpacity(1);
        this.light.intensity = 1000;
    }

    hide() {
        this.heart.isVisible = false;
        this.surface.isVisible = false;
        this.light.intensity = 0;
    }
}