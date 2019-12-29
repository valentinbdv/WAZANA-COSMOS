import { System } from '../System/system';
import { GravityField } from '../System/gravityField';
import { Star } from '../Entity/star'
import { Animation } from '../System/animation';
import { Planet, PlanetInterface } from '../Entity/planet';

import { Vector2, Vector3, Matrix, Color4 } from '@babylonjs/core/Maths/math';
import { IEasingFunction, CubicEase, EasingFunction } from '@babylonjs/core/Animations/easing';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem';
import { BlackHole } from '../Entity/blackHole';

export class Player extends Star {

    gravityField: GravityField;
    key: string;
    fixeAnimation: Animation;
    fixeCurve: IEasingFunction;
    particleCurve: IEasingFunction;

    constructor(system: System, gravityField: GravityField) {
        super(system, { temperature: 5000, size: 0.5, position: { x: 0, y: 0, z: 0 }, maxPlanet: 5 });
        this.gravityField = gravityField;
        this.secondLight.excludedMeshes.push(this.gravityField.ribbon);
        this.key = 'player' +Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.fixeAnimation = new Animation(this.system.animationManager);

        this.fixeCurve = new CubicEase();
        this.fixeCurve.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

        this.particleCurve = new CubicEase();
        this.createParticle();
    }

    velocity = 1;
    setVelocity(velocity: number) {
        this.velocity = velocity;
    }
    
    position: Vector2 = Vector2.Zero();
    direction: Vector2 = Vector2.Zero();
    move(mousepos: Vector2) {
        this.direction = new Vector2(mousepos.y * this.velocity, mousepos.x * this.velocity);
        let pos = this.position.add(this.direction);
        this.setPosition(pos);
    }

    setPosition(pos: Vector2) {
        this.position = pos;
        this.movingMesh.position.x = this.position.x;
        this.movingMesh.position.z = this.position.y;
        this.gravityField.setStarPoint(this.key, this.position, this.size);
    }

    addPlanet(planet?: Planet) {
        let planetNumber = this.planets.length;
        let radius = 2 + planetNumber;
        let velocity = 5 / (1 + planetNumber / 2) + Math.random() / 2;
        if (!planet) {
            let planetInterface: PlanetInterface = { color: [0, 0, 0], radius: radius, size: 1, velocity: velocity };
            planet = new Planet(this.system, planetInterface);
        } else {
            this.animatePlanetToStar(planet, radius, velocity);
        }
        this.fixePlanet(planet);
    }
    
    fixeAnimationLength = 50;
    animatePlanetToStar(planet: Planet, radius: number, velocity: number) {
        let dist = Vector2.Distance(planet.position, this.position);
        let xgap = this.position.x - planet.position.x;
        let ygap = this.position.y - planet.position.y;
        let offset = (xgap > 0) ? Math.atan(ygap / xgap) + Math.PI : Math.atan(ygap / xgap);
        planet.setOffset(offset);
            
        let radiusTemp = dist - this.size;
        let radiusCange = radiusTemp - radius;
        planet.setGeostationnaryMovement(radius +  radiusCange, 0);

        this.fixeAnimation.simple(this.fixeAnimationLength, (count, perc) => {
            let progress = this.fixeCurve.ease(perc);
            planet.setGeostationnaryMovement(radius + (1 - progress) * radiusCange, progress * velocity);
        }, () => {
            planet.setGeostationnaryMovement(radius, velocity);
        });
    }

    launchAnimationLength = 30;
    launchPlanet() {
        let planet = this.planets.pop();
        if (!planet) return;
        let reverseDirection = this.direction.negate();
        this.fixeAnimation.simple(this.launchAnimationLength, (count, perc) => {
            planet.mesh.position.x += reverseDirection.x * 10;
            planet.mesh.position.z += reverseDirection.y * 10;
            if (perc < 0.5) this.velocity = 1 + Math.sqrt(perc);
            else this.velocity = 1 + Math.sqrt(Math.max(1 - perc, 0));
        }, () => {
            planet.mesh.dispose();
            this.velocity = 1;
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
    absorbing = false;
    absorbingInt;
    absorbTarget(target: Player) {
        if (this.absorbing) return;
        this.absorbStop();
        this.absorbing = true;
        this.target = target;
        this.setAbsobUpdateFunction();
        this.particle.start();
        this.absorbingInt = setInterval(() => {
            this.target.decrease();
            this.increase();
        }, 500);
    }

    getAbsorbByTarget(aborber: BlackHole) {
        if (this.absorbing) return;
        this.absorbStop();
        this.absorbing = true;
        this.aborber = aborber;
        this.setGetAbsobUpdateFunction();
        this.particle.start();
        this.absorbingInt = setInterval(() => {
            this.changeSize(-0.1);
        }, 500);
    }

    absorbStop() {
        if (!this.absorbing) return;
        this.setVelocity(1);
        this.particle.stop();
        clearInterval(this.absorbingInt);
        this.absorbing = false;
    }

    addDust(size:number) {
        this.changeSize(size/5);
    }

    decrease() {
        this.changeSize(-0.02);
    }

    increase() {
        this.changeSize(0.005);
    }

    changeSize(change: number) {
        if (this.died) return;
        let newSize = this.size + change;
        this.updateSize(newSize);
    }

    explode(callback: Function) {
        this._explode(callback);
    }
    _explode(callback: Function) {
        this.absorbStop();
        this.die();
        this.updateSize(40, 80, () => {
            this.updateSize(0, 30, () => {
                setTimeout(() => {
                    // Wait for the particle effect to end
                    this.dispose();
                    // Need to keep movingMesh in case this is a blackHole
                    // this.particle.dispose();
                }, 2000);
                this.setExplodeUpdateFunction();
                this.particle.start();
                if (callback) callback();
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
        });
    }
    
    died = false;
    die() {
        this.moving = false;
        this.gravityField.eraseStar(this.key);
        this.died = true;
    }
}