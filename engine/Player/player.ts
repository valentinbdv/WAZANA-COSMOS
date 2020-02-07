import { System } from '../System/system';
import { GravityGrid } from '../System/GravityGrid';
import { Star } from '../Entity/star';
import { Animation } from '../System/animation';
import { Planet, PlanetInterface } from '../Entity/planet';

import { Vector2, Vector3, Matrix, Color4 } from '@babylonjs/core/Maths/math';
import { IEasingFunction, CubicEase, EasingFunction } from '@babylonjs/core/Animations/easing';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem';
import { BlackHole } from '../Entity/blackHole';
import { StarDust } from '../Entity/starDust';

export let minSize = 0.2; 

export interface PlayerInterface {
    key: string;
    size: number;
    position: any;
    destination: any;
    maxPlanet: number; 
    gravityField: number;
    velocity: number;
    planets: Array< PlanetInterface >;
    absorbing: string;
    absorbed: string;
    realVelocity: number;
    accelerating: boolean;
}

export interface PlayerCategory {
    name: string;
    temperature: number;
    planets: number;
    gravity: number;
    velocity: number;
}

export let StarCategories: Array< PlayerCategory > = [
    {
        name: 'Red Dwarf',
        temperature: 3000,
        planets: 3,
        gravity: 1.2,
        velocity: 1
    },
    {
        name: 'Yellow Dwarf',
        temperature: 5000,
        planets: 4,
        gravity: 1.1,
        velocity: 1.1
    },
    {
        name: 'White Dwarf',
        temperature: 12000,
        planets: 5,
        gravity: 1,
        velocity: 0.9
    },
    {
        name: 'Blue Dwarf',
        temperature: 30000,
        planets: 6,
        gravity: 0.6,
        velocity: 1.3
    },
];

export class Player extends Star {

    key: string;
    size: number;
    position: any;
    destination: any;
    maxPlanet: number;
    gravityField: number;
    velocity: number;
    planets: Array< Planet > = [];
    absorbing: string;
    absorbed: string;
    realVelocity: number = 1;
    accelerating: boolean;

    gravityGrid: GravityGrid;
    fixeAnimation: Animation;
    accelerateAnimation: Animation;
    fixeCurve: IEasingFunction;
    particleCurve: IEasingFunction;
    ia = false;
    categories = [];

    constructor(system: System, gravityGrid: GravityGrid) {
        super(system, { temperature: 5000, size: 0.5, position: { x: 0, y: 0, z: 0 }, maxPlanet: 5 });
        this.gravityGrid = gravityGrid;
        this.secondLight.excludedMeshes.push(this.gravityGrid.ribbon);
        this.key = 'player' +Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.fixeAnimation = new Animation(this.system.animationManager);
        this.accelerateAnimation = new Animation(this.system.animationManager);

        this.fixeCurve = new CubicEase();
        this.fixeCurve.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

        this.particleCurve = new CubicEase();
        this.createParticle();
    }

    setCategory(category: PlayerCategory) {
        this.setVelocity(category.velocity);
        this.setTemperature(category.temperature);
        this.setMaxPlanet(category.planets)
        this.setGravity(category.gravity);
        this.gravityGrid.setStarPoint(this.key, this.position, this.gravityField);
        this.removeAllPlanets();
        for (let i = 0; i < category.planets + 1; i++) {
            this.addPlanet();
        }
    }

    setVelocity(velocity: number) {
        this.velocity = velocity;
    }
    
    setRealVelocity(realVelocity: number) {
        this.realVelocity = realVelocity;
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
        if (step.y == 0) return;
        // step = Vector2.Maximize(step.multiplyInPlace(new Vector2(5, 5)), new Vector2(0.0001, 0.0001));
        let max = this.velocity * this.realVelocity / Math.sqrt(this.size * 30);
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
        } else {
            this.animatePlanetToStar(planet, radius, velocity);
        }
        this.fixePlanet(planet);
    }

    fixePlanet(planet: Planet) {
        planet.setParent(this.movingMesh);
        this.planets.push(planet);
    }

    removeAllPlanets() {
        for (let i = 0; i < this.planets.length; i++) {
            const planet = this.planets[i];
            planet.mesh.dispose();
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

    launchAnimationLength = 50;
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
            planet.mesh.dispose();
            this.heart.scaling = new Vector3(size, size, size);
            this.realVelocity = 1;
        });
    }

    particle: ParticleSystem;
    createParticle() {
        this.particle = new ParticleSystem("particle", 50, this.system.scene);
        this.particle.emitRate = 50;

        // this.particle.particleTexture = meshesTextures.stream;
        this.particle.emitter = this.movingMesh;
        this.particle.gravity = new Vector3(0, -0.5, 0);
        this.particle.minEmitBox = new Vector3(0, 0, 0); // Starting all from
        this.particle.maxEmitBox = new Vector3(0, 0, 0);
        this.particle.minLifeTime = 1;
        this.particle.maxLifeTime = 1;
        this.particle.minSize = 0.5;
        this.particle.maxSize = 0.5;

        this.particle.limitVelocityDamping = 0.9;

        // Start rotation
        this.particle.minInitialRotation = -Math.PI / 2;
        this.particle.maxInitialRotation = Math.PI / 2;
        this.particle.particleTexture = this.system.dustTexture;
        this.particle.blendMode = ParticleSystem.BLENDMODE_MULTIPLYADD;

        this.particle.renderingGroupId = 2;
    }

    setAbsobUpdateFunction() {
        // Use direction to initialize random value
        this.particle.emitRate = 50;
        // this.particle.manualEmitCount = null;
        this.particle.startDirectionFunction = (worldMatrix: Matrix, directionToUpdate: Vector3) => {
            Vector3.TransformNormalFromFloatsToRef(Math.random(), 0, Math.random(), worldMatrix, directionToUpdate);
        }
        // Must keep that because we need function word on particle
        let that = this;
        this.particle.updateFunction = function(particles) {
            let changeposition: Vector2 = that.position.subtract(that.target.position);
            let changecolor: Color4 = that.color.subtract(that.target.color);

            for (var index = 0; index < particles.length; index++) {
                var particle = particles[index];
                particle.age += this._scaledUpdateSpeed;

                if (particle.age >= particle.lifeTime) { // Recycle
                    particles.splice(index, 1);
                    this._stockParticles.push(particle);
                    index--;
                    continue;
                } else {
                    let progresscolor: Color4 = changecolor.multiply(new Color4(particle.age, particle.age, particle.age, 1.0));
                    particle.color = progresscolor.add(that.target.color);

                    let posprogress = that.particleCurve.ease(particle.age);
                    let progressposition: Vector2 = changeposition.multiply(new Vector2(posprogress, posprogress));
                    let pos: Vector2 = that.target.position.add(progressposition);

                    particle.position.x = pos.x + 2 * (particle.direction.x - 0.5) * (1 - posprogress);
                    particle.position.z = pos.y + 2 * (particle.direction.z - 0.5) * (1 - posprogress);
                }
            } 
        }
    }

    setGetAbsobUpdateFunction() {
        // Use direction to initialize random value
        this.particle.emitRate = 50;
        // this.particle.manualEmitCount = null;
        this.particle.startDirectionFunction = (worldMatrix: Matrix, directionToUpdate: Vector3) => {
            Vector3.TransformNormalFromFloatsToRef(Math.random(), 0, Math.random(), worldMatrix, directionToUpdate);
        }
        // Must keep that because we need function word on particle
        let that = this;
        this.particle.updateFunction = function (particles) {
            let changeposition: Vector2 = that.aborber.position.subtract(that.position);

            for (var index = 0; index < particles.length; index++) {
                var particle = particles[index];
                particle.age += this._scaledUpdateSpeed;

                if (particle.age >= particle.lifeTime) { // Recycle
                    particles.splice(index, 1);
                    this._stockParticles.push(particle);
                    index--;
                    continue;
                } else {
                    particle.color = new Color4(that.color.r, that.color.g, that.color.b, 1 - particle.age);

                    let progressposition: Vector2 = changeposition.multiply(new Vector2(particle.age, particle.age));
                    let pos: Vector2 = that.position.add(progressposition);

                    particle.position.x = pos.x + 2 * (particle.direction.x - 0.5) * (1 - particle.age);
                    particle.position.z = pos.y + 2 * (particle.direction.z - 0.5) * (1 - particle.age);
                    particle.position.y = 1 - that.particleCurve.ease(particle.age) * 50;
                }
            }
        }
    }

    setExplodeUpdateFunction() {
        // Use direction to initialize random value
        this.particle.emitRate = null;
        this.particle.manualEmitCount = 100;
        this.particle.startPositionFunction = (worldMatrix: Matrix, startPosition: Vector3) => {
            Vector3.TransformNormalFromFloatsToRef(0, 0, 0, worldMatrix, startPosition);
        }

        this.particle.startDirectionFunction = (worldMatrix: Matrix, directionToUpdate: Vector3) => {
            Vector3.TransformNormalFromFloatsToRef(Math.random() * Math.PI * 2, 0, 0, worldMatrix, directionToUpdate);
        }
        // Must keep that because we need function word on particle
        let that = this;
        this.particle.updateFunction = function (particles) {
            for (var index = 0; index < particles.length; index++) {
                var particle = particles[index];
                particle.age += this._scaledUpdateSpeed;

                if (particle.age >= particle.lifeTime) { // Recycle
                    particles.splice(index, 1);
                    this._stockParticles.push(particle);
                    index--;
                    continue;
                } else {
                    particle.color = new Color4(that.color.r, that.color.g, that.color.b, 1 - particle.age);

                    particle.position.x = that.position.x + Math.cos(particle.direction.x) * particle.age * 20;
                    particle.position.z = that.position.y + Math.sin(particle.direction.x) * particle.age * 20;
                    particle.position.y = 0.1;
                }
            }
        }
    }

    target: Player;
    aborber: BlackHole;
    absorbingInt;
    absorbTarget(target: Player) {
        if (this.absorbing) return;
        this.absorbStop();
        this.absorbing = target.key;
        this.target = target;
        this.setAbsobUpdateFunction();
        this.particle.start();
        this.absorbingInt = setInterval(() => {
            this.target.decrease();
            this.increase();
        }, 500);
    }

    getAbsorbByTarget(aborber: BlackHole) {
        if (this.absorbing || !this.target) return;
        this.absorbStop();
        this.aborber = aborber;
        this.setGetAbsobUpdateFunction();
        this.particle.start();
        this.absorbingInt = setInterval(() => {
            this.changeSize(-0.1);
        }, 500);
    }

    absorbStop() {
        if (!this.absorbing || !this.target) return;
        this.target.setRealVelocity(1);
        this.particle.stop();
        clearInterval(this.absorbingInt);
        this.absorbing = null;
    }

    addDust(dust: StarDust) {
        dust.goToEntity(this, () => {
            this.changeSize(dust.size/5);
        });
    }

    decrease() {
        this.changeSize(-0.02);
    }

    increase() {
        this.changeSize(0.005);
    }

    changeSize(change: number) {
        if (this.died) return;
        let newSize = Math.pow(this.size, 2) + change;
        this.setSize(newSize);
    }

    explode(callback?: Function) {
        this._explode(callback);
    }
    _explode(callback?: Function) {
        this.absorbStop();
        this.die();
        this.updateSize(40, 80, () => {
            this.updateSize(0.1, 30, () => {
                setTimeout(() => {
                    // Wait for the particle effect to end
                    this.dispose();
                    // Need to keep movingMesh in case this is a blackHole
                    // this.particle.dispose();
                }, 2000);
                this.setExplodeUpdateFunction();
                this.particle.start();
                if (callback) callback();
                if (this.onDied) this.onDied();
            });
        });
    }

    dive() {
        this.die();
        this.particle.stop();
        let changeposition: Vector2 = this.aborber.position.subtract(this.position);
        
        this.fixeAnimation.simple(this.fixeAnimationLength, (count, perc) => {
            let progressposition: Vector2 = changeposition.multiply(new Vector2(perc, perc));
            let pos: Vector2 = this.position.add(progressposition);

            this.movingMesh.position.x = pos.x;
            this.movingMesh.position.z = pos.y;
            this.movingMesh.position.y = 1 - this.particleCurve.ease(perc) * 50;
        }, () => {
            this.dispose();
            this.removeAllPlanets();
        });
    }
    
    died = false;
    onDied: Function;
    die() {
        this.moving = false;
        this.gravityGrid.eraseStar(this.key);
        this.died = true;
    }

    // For IA
    goToPlayer(player: Player) {
        this.moveCatcher.catch(player.position.subtract(this.position));
    }
}