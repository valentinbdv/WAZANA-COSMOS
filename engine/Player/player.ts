import { SystemAsset } from '../System/systemAsset';
import { GravityGrid } from '../System/GravityGrid';
import { Animation } from '../System/animation';
import { Planet, PlanetInterface } from '../Entity/planet';
import { StarFighter } from '../Entity/starFighter';
import { StarCategory, StarInterface } from '../Entity/star';

import { Vector2, Vector3 } from '@babylonjs/core/Maths/math';
import { EasingFunction, CubicEase } from '@babylonjs/core/Animations/easing';
import { BlackHole } from '../Entity/blackHole';
import { MovingEntity } from '../Entity/movingEntity';

export let minSize = 0.5; 
export let startSize = 1;


export interface PlayerInterface {
    key: string;
    size: number;
    position: any;
    destination: any;
    maxPlanet: number; 
    gravityField: number;
    velocity: number;
    planets: Array< string >;
    absorbing: string;
    absorbed: string;
    realVelocity: number;
    accelerating: boolean;
}

export class Player extends StarFighter {

    key: string;
    size: number;
    position: any;
    destination: any;
    maxPlanet: number;
    gravityField: number;
    velocity: number;
    absorbing: string;
    absorbed: string;
    realVelocity: number = 1;

    gravityGrid: GravityGrid;
    fixeAnimation: Animation;
    accelerateAnimation: Animation;
    fixeCurve: EasingFunction;
    particleCurve: EasingFunction;
    ia = false;
    dustField = true;
    target: Player;

    constructor(system: SystemAsset, gravityGrid: GravityGrid, playerInterface: StarInterface) {
        super(system, playerInterface);
        this.gravityGrid = gravityGrid;
        // this.secondLight.excludedMeshes.push(this.gravityGrid.ribbon);
        this.key = 'player' +Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.fixeAnimation = new Animation(this.system.animationManager);
        this.accelerateAnimation = new Animation(this.system.animationManager);

        this.fixeCurve = new CubicEase();
        this.fixeCurve.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

        this.particleCurve = new CubicEase();
        this.createParticle();
    }

    category: StarCategory;
    setCategory(category: StarCategory, withPlanets: boolean) {
        if (this.category == category) return;
        this.category = category;
        this.setVelocity(category.velocity);
        this.setTemperature(category.temperature);
        this.setMaxPlanet(category.planets)
        this.setGravity(category.gravity);
        this.gravityGrid.setStarPoint(this.key, this.position, this.gravityField);
        this.removeAllPlanets();
        if (withPlanets) {
            for (let i = 0; i < category.planets; i++) {
                this.addPlanet();
            }
        }
        this.system.checkActiveMeshes();
    }

    setVelocity(velocity: number) {
        this.velocity = velocity;
    }
    
    setRealVelocity(realVelocity: number) {
        this.realVelocity = realVelocity;
    }

    absorbingInt;
    absorbTarget(target: Player) {
        if (this.absorbing) return;
        this.absorbStop();
        this.absorbing = target.key;
        this.target = target;
        this.setAbsobUpdateFunction();
        this.particle.start();
        this.system.checkActiveMeshes();
        this.absorbingInt = setInterval(() => {
            this.target.decrease();
            this.increase();
            if (this.target.isDead) this.absorbStop();
        }, 100);
    }

    setAbsorber(absorber: MovingEntity) {
        this.absorber = absorber;
        let dist = Vector2.Distance(this.position, absorber.position);
        let velocity = Math.pow((dist / (absorber.gravityField * 20)), 1);
        this.setRealVelocity(velocity);
    }

    blackHoleAbsorber: BlackHole;
    absorbByBlackHole(absorber: BlackHole) {
        if (this.blackHoleAbsorber) return;
        this.absorbStop();
        this.blackHoleAbsorber = absorber;
        this.absorbing = absorber.key;
        this.setAbsorber(absorber);
        this.setGetAbsobByBlackHoleFunction();
        this.particle.start();
        this.system.checkActiveMeshes();
        this.absorbingInt = setInterval(() => {
            this.changeSize(-0.02);
        }, 100);
    }

    absorbStop() {
        if (!this.absorbing && !this.target) return;
        this.particle.stop();
        clearInterval(this.absorbingInt);
        this.absorbing = null;
        this.blackHoleAbsorber = null;
        this.setRealVelocity(1);
    }

    direction: Vector2 = Vector2.Zero();
    // move(mousepos: Vector2) {
    //     let x = Math.sign(mousepos.x) * Math.min(Math.abs(mousepos.x) * this.velocity, this.velocity / (this.size * 20));
    //     let y = Math.sign(mousepos.y) * Math.min(Math.abs(mousepos.y) * this.velocity, this.velocity / (this.size * 20));
    //     this.direction = new Vector2(x, y);
    //     let pos = this.position.add(this.direction);
    //     this.setPosition(pos);
    // }
    starVelocity: 0.03;
    move(step: Vector2) {
        if (step.y == 0) step.y = 0.001;
        // step = Vector2.Maximize(step.multiplyInPlace(new Vector2(5, 5)), new Vector2(0.0001, 0.0001));
        let max = this.velocity * this.realVelocity / Math.sqrt(this.size * 50);
        let ratio = Math.abs(step.x / step.y);
        let maxX = Math.sqrt((Math.pow(max, 2) * ratio) / (ratio + 1));
        let maxY = Math.sqrt(Math.pow(max, 2) / (ratio + 1));
        let x = Math.sign(step.x) * Math.min(Math.abs(step.x) * this.velocity, maxX);
        let y = Math.sign(step.y) * Math.min(Math.abs(step.y) * this.velocity, maxY);
        this.direction = new Vector2(x, y);
        let pos = this.position.add(this.direction);
        this.setPosition(pos);
    }

    setPosition(pos: Vector2) {
        this._setPosition(pos);
        this.movingMesh.position.x = this.position.x;
        this.movingMesh.position.z = this.position.y;
        
        this.gravityGrid.setStarPoint(this.key, this.position, this.gravityField);
    }

    addPlanet(planet?: Planet) {
        let planetNumber = this.planets.length;
        let radius = 2 + planetNumber;
        let velocity = 5 / (1 + planetNumber / 2) + Math.random() / 2;
        if (!planet) {
            let planetInterface: PlanetInterface = { radius: radius, size: 1, velocity: velocity };
            planet = new Planet(this.system, planetInterface);
            planet.show();
        } else {
            this.animatePlanetToStar(planet, radius, velocity);
        }
        this.secondLight.includedOnlyMeshes.push(planet.mesh);
        this.fixePlanet(planet);
    }

    fixePlanet(planet: Planet) {
        planet.setParent(this.movingMesh);
        this.planets.push(planet);
    }

    removeAllPlanets() {
        for (let i = 0; i < this.planets.length; i++) {
            const planet = this.planets[i];
            planet.hide();
        }
        this.planets = [];
    }
    
    fixeAnimationLength = 50;
    animatePlanetToStar(planet: Planet, radius: number, velocity: number) {
        let dist = Vector2.Distance(planet.position, this.position);
        let xgap = this.position.x - planet.position.x;
        let ygap = this.position.y - planet.position.y;
        let offset = (xgap > 0) ? Math.atan(ygap / xgap) + Math.PI : Math.atan(ygap / xgap);
        planet.setOffset(offset);
            
        let radiusTemp = dist - this.size;
        let radiusChange = radiusTemp - radius;
        planet.setGeostationnaryMovement(radius +  radiusChange, 0);
        this.fixeAnimation.simple(this.fixeAnimationLength, (count, perc) => {
            let progress = this.fixeCurve.ease(perc);
            planet.setGeostationnaryMovement(radius + (1 - progress) * radiusChange, progress * velocity);
        }, () => {
            planet.setGeostationnaryMovement(radius, velocity);
        });
    }

    launchAnimationLength = 80;
    accelerate() {
        let planet = this.planets.pop();
        if (!planet || !this.moving) return;
        this.accelerating = true;
        let size = this.size;
        this.accelerateAnimation.simple(this.launchAnimationLength, (count, perc) => {
            planet.mesh.position.x = planet.mesh.position.x / 1.1;
            planet.mesh.position.z = planet.mesh.position.z / 1.1;
            planet.mesh.position.y = 1 - perc;
            // if (perc < 0.5) this.realVelocity = 1 + 4 * perc;
            // else this.realVelocity = 1 + 4 * Math.max(1 - perc, 0);
            this.realVelocity = 1 + 2 * Math.sin(perc * Math.PI);
            let scale = (count < this.launchAnimationLength - 10) ? 1 + count % 10 / 20 : 1 + (10 - count % 10) / 20;
            this.heart.scaling = new Vector3(scale * size, scale * size, scale * size);
        }, () => {
            this.accelerating = false;
            planet.attachedToStar = false;
            planet.setParent(null);
            planet.hide();
            this.heart.scaling = new Vector3(size, size, size);
            this.realVelocity = 1;
        });
    }
    
    onDied: Function;
    die(callback?: Function) {
        this.removeAllPlanets();
        if (this.absorber && this.absorber instanceof BlackHole) {
            this.dive(this.absorber.position, () => {
                this.dispose();
                if (callback) callback();
            });
        } else {
            this.explode(() => {
                this.dispose();
                if (callback) callback();
            });
        }
        if (this.onDied) this.onDied();
        this.absorbStop();
        this.setMoving(false);
        this.isDead = true;
        // this.secondLight.excludedMeshes = [];
        // this.secondLight.includedOnlyMeshes = [this.gravityGrid.ribbon];
    }
    
    dispose() {
        this._disposePlayer();
    }
    
    _disposePlayer() {
        this.removeAllPlanets();
        this._disposeStarFighter();
        this.accelerateAnimation.stop();
        this.fixeAnimation.stop();
        this.secondLight.excludedMeshes = [];
        // this.secondLight.includedOnlyMeshes = [];
        this.gravityGrid.eraseMass(this.key);
    }

    // For IA
    goToPlayer(player: Player) {
        this.moveCatcher.catch(player.position.subtract(this.position));
    }
}