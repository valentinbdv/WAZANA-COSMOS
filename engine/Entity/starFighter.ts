import { System } from '../System/system';
import { Star, StarInterface } from './star';
import { Animation } from '../System/animation';

import { Vector2, Vector3, Matrix, Color4 } from '@babylonjs/core/Maths/math';
import { IEasingFunction, CubicEase } from '@babylonjs/core/Animations/easing';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem';
import { BlackHole } from './blackHole';
import { StarDust } from './starDust';

export class StarFighter extends Star {

    diveAnimation: Animation;
    particleCurve: IEasingFunction;

    constructor(system: System, starInterface: StarInterface) {
        super(system, starInterface);

        this.particleCurve = new CubicEase();
        this.diveAnimation = new Animation(system.animationManager);
        this.createParticle();
    }

    target: StarFighter;
    aborber: BlackHole;
    absorbing: string;
    absorbingInt;
    absorbTarget(target: StarFighter) {
        if (this.absorbing) return;
        this.absorbStop();
        this.absorbing = target.key;
        this.target = target;
        this.setAbsobUpdateFunction();
        this.particle.start();
        this.absorbingInt = setInterval(() => {
            this.target.decrease();
            this.increase();
        }, 100);
    }

    getAbsorbByTarget(aborber: BlackHole) {
        if (this.absorbing || !this.target) return;
        this.absorbStop();
        this.aborber = aborber;
        this.setGetAbsobUpdateFunction();
        this.particle.start();
        this.absorbingInt = setInterval(() => {
            this.changeSize(-0.2);
        }, 500);
    }

    absorbStop() {
        if (!this.absorbing || !this.target) return;
        this.particle.stop();
        clearInterval(this.absorbingInt);
        this.absorbing = null;
    }

    addDust(dust: StarDust) {
        dust.goToEntity(this, () => {
            this.changeSize(dust.size / (this.size * 20));
            this.shine();
        });
    }

    decrease() {
        this.changeSize(-0.01);
    }

    increase() {
        this.changeSize(0.001);
        this.shine();
    }

    changeSize(change: number) {
        // if (this.died) return;
        let newSize = Math.pow(this.size, 2) + change;
        this.setSize(newSize);
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

    explode(callback?: Function) {
        this._explode(callback);
    }
    _explode(callback?: Function) {
        this.system.unFreezeMaterials();
        this.updateSize(50 * this.size, 80, () => {
            this.setReflectionLevel(1);
            this.updateSize(0.01, 30, () => {
                this.system.freezeMaterials();
                this.hide();
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

    diveAnimationLength = 50;
    dive(position: Vector2, callback?: Function) {
        this.particle.stop();
        let changeposition: Vector2 = position.subtract(this.position);
        
        this.diveAnimation.simple(this.diveAnimationLength, (count, perc) => {
            let progressposition: Vector2 = changeposition.multiply(new Vector2(perc, perc));
            let pos: Vector2 = this.position.add(progressposition);

            this.movingMesh.position.x = pos.x;
            this.movingMesh.position.z = pos.y;
            this.movingMesh.position.y = 1 - this.particleCurve.ease(perc) * 50;
        }, () => {
            if (callback) callback();
        });
    }
}