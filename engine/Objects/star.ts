import { MeshSystem, StarTemperatures } from '../System/meshSystem';
import { Animation } from '../System/animation';
import { MovingEntity, MovingEntityInterface } from '../Entity/movingEntity';
import { Planet } from './planet';
import { PlanetMap } from '../Map/planetMap';

import { Vector3, Color4 } from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/Mesh';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { EasingFunction, BezierCurveEase } from '@babylonjs/core/Animations/easing';
import { CubeTexture } from '@babylonjs/core/Materials/Textures/cubeTexture';

// https://www.youtube.com/watch?v=i4RtO_qIQHk

export let starMapDistance = 150;
export let minSize = 0.6;
export let maxSize = 3;
export let startSize = 1;


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
        planets: 2,
        gravity: 1.2,
        velocity: 1
    },
    {
        name: 'Yellow Dwarf',
        temperature: StarTemperatures[1],
        planets: 3,
        gravity: 1.1,
        velocity: 1.1
    },
    {
        name: 'White Dwarf',
        temperature: StarTemperatures[2],
        planets: 4,
        gravity: 1,
        velocity: 0.9
    },
    {
        name: 'Blue Dwarf',
        temperature: StarTemperatures[3],
        planets: 5,
        gravity: 0.7,
        velocity: 1.2
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
    curve: EasingFunction;

    texture: string;
    number: number;
    color: Color4;
    life: number;
    power: number;

    // rotateProgress = 0;
    cycleSize = 0;
    planetMap: PlanetMap;
    planets: Array<Planet> = [];
    accelerating = false;

    constructor(system: MeshSystem, planetMap: PlanetMap, options: StarInterface) {
        super('star', system, options);
        this.planetMap = planetMap;

        this.shineAnimation = new Animation(this.system.animationManager);

        let p = options.position;
        this.transformMesh.position = new Vector3(p.x, 0, p.y);
        this.setSize(options.size);
        this.setTemperature(options.temperature);
     
        this.curve = new BezierCurveEase(.76, .01, .51, 1.33);
        // this.curve.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    }
    
    cycleAbsorb = 1;
    starCycle() {
        for (let i = 0; i < this.planets.length; i++) {
            const planet = this.planets[i];
            planet.mesh.position.x = ((this.size * 1.5) + planet.radius) * Math.cos((planet.velocity * planet.cycle) / 100 + planet.offset);
            planet.mesh.position.z = ((this.size * 1.5) + planet.radius) * Math.sin((planet.velocity * planet.cycle) / 100 + planet.offset);
            planet.mesh.rotation.y = planet.velocity * ( this.cycleSize / 100 );
            planet.cycle += this.cycleSize * this.system.fpsRatio;
        }
        this.surface.rotation.y += this.cycleSize * this.cycleAbsorb * this.system.fpsRatio / 200;
    }

    createStar() {
        if (this.heart && this.heart.isVisible) return;
        this.addHeart();
        this.addSurface();
        this.addLight();
        this.setSize(this.size);
        this.setTemperature(this.temperature);
        this.setReflectionLevel(0);
        this.system.checkActiveMeshes();
    }

    maxPlanet: number;
    setMaxPlanet(maxPlanet: number) {
        this.maxPlanet = maxPlanet;
    }

    temperature: number;
    setTemperature(temperature: number) {
        this.temperature = temperature;
        let color = this.system.getColorFromTemperature(temperature);
        this.color = color.toColor4();
        if (!this.isStarVisible) return;
        this.heart.material.emissiveColor = color.scale(2);
        // this.heart.material.diffuseColor = Color3.White();
        this.surface.material.reflectivityColor = color;
        this.surface.material.albedoColor = color;
        this.light.diffuse = color.scale(2);
    }

    heart: Mesh;
    addHeart() {
        this.heart = this.system.heart.clone(this.key + "heart");
        this.heart.material = this.system.heart.material.clone(this.key + "heartMaterial");
        // Not always active as we check if star in frustrum for opti
        this.heart.alwaysSelectAsActiveMesh = true;
        this.heart.doNotSyncBoundingInfo = true;
        this.heart.isVisible = true;
        this.heart.parent = this.transformMesh;
    }

    surface: Mesh;
    addSurface() {
        this.surface = this.system.surface.clone(this.key+"surface");
        // Not always active as we check if star in frustrum for opti
        this.surface.material = this.system.surface.material.clone(this.key + "surfaceMaterial");
        this.surface.alwaysSelectAsActiveMesh = true;
        this.surface.doNotSyncBoundingInfo = true;
        this.surface.isVisible = true;
        this.surface.parent = this.transformMesh;
        if (this.system.sceneTexture) this.setTexture(this.system.sceneTexture);
    }

    setTexture(texture: CubeTexture) {
        this.surface.material.refractionTexture = texture.clone();
        this.surface.material.reflectionTexture = texture.clone();
    }

    light: PointLight
    addLight() {
        this.light = new PointLight('light', new Vector3(0, 0, 0), this.system.scene);
        this.light.radius = 0.1;
        this.light.shadowEnabled = false;
        this.light.parent = this.transformMesh;
        this.light.includedOnlyMeshes.push(this.surface);	
        // console.log(this.light);
    }

    shine() {
        if (!this.isStarVisible) return;
        if (this.shineAnimation.running || this.accelerating || this.cycleAbsorb != 1) return;
        this.startReflect(() => {
            this.endReflect();
        })
    }

    startReflect(callback?: Function) {
        this.shineAnimation.simple(20, (count, perc) => {
            let y = Math.pow(perc, 2);
            this.cycleAbsorb = 1 + y;
            this.setReflectionLevel(y);
            this.setHeartScale(this.size + y / 10);
        }, () => {
            if (callback) callback();
        });
    }

    endReflect(callback?: Function) {
        let cycleChange = this.cycleAbsorb - 1;
        this.shineAnimation.simple(20, (count, perc) => {
            let y = 1 - Math.pow(perc, 2);
            this.setReflectionLevel(y);
            this.cycleAbsorb = 1 + y * cycleChange;
            this.setHeartScale(this.size + y / 10);
        }, () => {
            this.cycleAbsorb = 1;
            this.setReflectionLevel(0);
            if (callback) callback();
        });
    }

    setReflectionLevel(level: number) {
        this.surface.material.reflectionTexture.level = level;
        this.surface.material.refractionTexture.level = level;
    }

    setSize(size: number) {
        size = Math.min(size, maxSize);
        this.setSizeWithoutLimit(size);

    }

    setSizeWithoutLimit(size: number) {
        this._setSize(size);
        if (!this.isStarVisible) return;
        this.setSurfaceScale(size)
        this.light.intensity = 1000 * size;
        this.cycleSize = 1 / Math.sqrt(this.size);
        if (!this.shineAnimation.running) this.setHeartScale(size);
    }

    setSurfaceScale(scale: number) {
        this.surface.scaling.x = scale;
        this.surface.scaling.y = scale;
        this.surface.scaling.z = scale;
    }

    setHeartScale(scale: number) {
        this.heart.scaling.x = scale;
        this.heart.scaling.y = scale;
        this.heart.scaling.z = scale;
    }

    updateSize(size: number, time?:number, callback?: Function) {
        if (!this.isStarVisible) return;
        let currentsize = this.size;
        let change = size - currentsize;
        let animTime = (time)? time : 20;
        
        this.shineAnimation.simple(animTime, (count, perc) => {
            this.setReflectionLevel(perc);
            this.setOpacity(1 - perc);
            this.light.intensity = perc * 1000;
            let newsize = currentsize + this.curve.ease(perc) * change;
            this.setSizeWithoutLimit(newsize);
        }, () => {
            this.setSizeWithoutLimit(size);
            this.setReflectionLevel(0);
            if (callback) callback();
        });
    }
    
    _disposeStar() {
        if (!this.heart) return;
        this.heart.isVisible = false;
        this.surface.isVisible = false;
        this.heart.dispose();
        this.heart.material.dispose();
        this.surface.dispose();
        this.surface.material.dispose();
        this.light.isEnabled(false);
        this.light.dispose();
        this.system.checkActiveMeshes();
    }

    setOpacity(opacity: number) {
        this.heart.visibility = opacity;
        this.surface.visibility = opacity;
    }

    visibleDistance = 70; // ia Maximum Distance
    isStarOnScreen(): boolean {
        let vd = this.visibleDistance;
        let p = this.position;
        let c = this.system.center;
        return (p.x < c.x + vd && p.x > c.x - vd && p.y < c.y + vd && p.y > c.y - vd);
    }

    mapDistance = starMapDistance; // ia Maximum Distance
    isStarOnMap(): boolean {
        let vd = this.mapDistance;
        let p = this.position;
        let c = this.system.center;
        return (p.x < c.x + vd && p.x > c.x - vd && p.y < c.y + vd && p.y > c.y - vd);
    }

    isStarVisible = false;
    show() {
        if (this.isStarVisible) return;
        this.isStarVisible = true;
        
        this.createStar();
        this.system.addSkyChangeListener((texture) => {
            this.setTexture(texture);
            this.setReflectionLevel(0.1);
        });
    }

    hide() {
        if (!this.isStarVisible) return;
        this.isStarVisible = false;
        this.removeAllPlanets();
        this._disposeStar();
        this.system.removeSkyChangeListener((texture) => {
            this.setTexture(texture);
            this.setReflectionLevel(0.1);
        });
    }

    removeAllPlanets() {
        for (let i = 0; i < this.planets.length; i++) {
            const planet = this.planets[i];
            planet.hide();
            this.planetMap.storagePlanet(planet);
        }
        this.planets = [];
    }
}