import { MeshSystem } from '../System/meshSystem';
import { Star, StarInterface } from './star';
import { Animation } from '../System/animation';

import { Vector2, Vector3, Matrix, Color4 } from '@babylonjs/core/Maths/math';
import { EasingFunction, CubicEase } from '@babylonjs/core/Animations/easing';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem';
import { MovingEntity } from './movingEntity';
import { BlackHoleDepth } from './blackHole';

export class StarFighter extends Star {

    diveAnimation: Animation;
    particleCurve: EasingFunction;
    target: StarFighter;
    absorber: MovingEntity;
    isDead = false;

    constructor(system: MeshSystem, starInterface: StarInterface) {
        super(system, starInterface);

        this.particleCurve = new CubicEase();
        this.diveAnimation = new Animation(system.animationManager);
        this.createParticle();
    }

    decrease() {
        this.changeSize(-0.001);
    }

    increase() {
        this.changeSize(0.0001);
        this.shine();
    }

    changeSize(change: number) {
        // if (this.isDead) return;
        let newSize = this.size + change;
        this.setSize(newSize);
    }

    particle: ParticleSystem;
    createParticle() {
        this.particle = new ParticleSystem("particle", 50, this.system.scene);
        this.particle.emitRate = 50;

        this.particle.emitter = this.movingMesh.position;
        this.particle.gravity = new Vector3(0, -0.5, 0);
        this.particle.minEmitBox = new Vector3(0, 0, 0); // Starting all from
        this.particle.maxEmitBox = new Vector3(0, 0, 0);
        this.particle.minLifeTime = 1;
        this.particle.maxLifeTime = 1;
        this.particle.minSize = 1;
        this.particle.maxSize = 1;

        this.particle.limitVelocityDamping = 0.9;

        // Start rotation
        this.particle.minInitialRotation = -Math.PI / 2;
        this.particle.maxInitialRotation = Math.PI / 2;
        this.particle.particleTexture = this.system.sparkleTexture;
        this.particle.blendMode = ParticleSystem.BLENDMODE_MULTIPLYADD;

        this.particle.renderingGroupId = 2;

        this.system.scene.registerBeforeRender(() => {
            this.particle.animate();
            if (this.system.limitFPS) this.particle.animate();
        });
    }

    setAbsobUpdateFunction() {
        // Use direction to initialize random value
        this.particle.emitRate = 50;
        this.particle.minSize = 0.5;
        this.particle.maxSize = 0.5;
        this.particle.color1.a = 0;
        this.particle.color2.a = 0;
        this.particle.particleTexture = this.system.circleTexture;
        // this.particle.manualEmitCount = null;
        // Must keep that because we need function word on particle
        let that = this;
        this.particle.startDirectionFunction = (worldMatrix: Matrix, directionToUpdate: Vector3) => {
            Vector3.TransformNormalFromFloatsToRef(Math.random(), Math.random(), Math.random(), worldMatrix, directionToUpdate);
        }
        this.particle.updateFunction = function(particles) {
            let changeposition: Vector2 = that.position.subtract(that.target.position);
            let changecolor: Color4 = that.color.subtract(that.target.color);
            
            for (var index = 0; index < particles.length; index++) {
                var particle = particles[index];
                particle.age += this._scaledUpdateSpeed * that.system.fpsRatio;
                
                if (particle.age >= particle.lifeTime) { // Recycle
                    particles.splice(index, 1);
                    this._stockParticles.push(particle);
                    particle.color.a = 0;
                    index--;
                    continue;
                } else {
                    let progresscolor: Color4 = changecolor.multiply(new Color4(particle.age / 1.5, particle.age / 1.5, particle.age / 1.5, 1.0));
                    particle.color = progresscolor.add(that.target.color);
                    let progressGradient = Math.min(particle.age, Math.pow(1 - particle.age, 1 / 2));
                    particle.color.a = progressGradient * 2;
                    
                    particle.scale.x = progressGradient * 5;
                    particle.scale.y = progressGradient * 5;

                    let progressPos = that.particleCurve.ease(particle.age + particle.direction.y/100);
                    let progressposition: Vector2 = changeposition.multiply(new Vector2(progressPos, progressPos));
                    let pos: Vector2 = that.target.position.add(progressposition);

                    particle.position.x = pos.x + (particle.direction.x - 0.5) * (1 - progressPos) * that.size;
                    particle.position.z = pos.y + (particle.direction.z - 0.5) * (1 - progressPos) * that.size;
                }
            } 
        }
        
        if (this.isStarVisible) this.particle.start();
    }

    setGetAbsobByBlackHoleFunction() {
        // Use direction to initialize random value
        this.particle.emitRate = 50;
        this.particle.minSize = 0.5;
        this.particle.maxSize = 0.5;
        this.particle.particleTexture = this.system.circleTexture;
        // this.particle.manualEmitCount = null;
        this.particle.startDirectionFunction = (worldMatrix: Matrix, directionToUpdate: Vector3) => {
            Vector3.TransformNormalFromFloatsToRef(Math.random(), 0, Math.random(), worldMatrix, directionToUpdate);
        }
        // Must keep that because we need function word on particle
        let that = this;
        this.particle.updateFunction = function (particles) {
            let changeposition: Vector2 = that.absorber.position.subtract(that.position);

            for (var index = 0; index < particles.length; index++) {
                var particle = particles[index];
                particle.age += this._scaledUpdateSpeed * that.system.fpsRatio;

                if (particle.age >= particle.lifeTime) { // Recycle
                    particles.splice(index, 1);
                    this._stockParticles.push(particle);
                    index--;
                    continue;
                } else {
                    particle.color = new Color4(that.color.r, that.color.g, that.color.b, 1);
                    particle.color.a = Math.min(particle.age, Math.pow(1 - particle.age, 1 / 2)) * 50;

                    let progressposition: Vector2 = changeposition.multiply(new Vector2(particle.age, particle.age));
                    let pos: Vector2 = that.position.add(progressposition);

                    particle.position.x = pos.x + 2 * (particle.direction.x - 0.5) * (1 - particle.age);
                    particle.position.z = pos.y + 2 * (particle.direction.z - 0.5) * (1 - particle.age);
                    particle.position.y = -that.particleCurve.ease(particle.age/1.1) * BlackHoleDepth;
                }
            }
        }

        if (this.isStarVisible) this.particle.start();
    }

    setExplodeUpdateFunction() {
        // Use direction to initialize random value
        this.particle.emitRate = null;
        this.particle.manualEmitCount = 100;
        this.particle.minSize = 2;
        this.particle.maxSize = 2;
        this.particle.color1 = this.color;
        this.particle.color2 = this.color;
        this.particle.particleTexture = this.system.sparkleTexture;
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
                particle.age += this._scaledUpdateSpeed * that.system.fpsRatio;

                if (particle.age >= particle.lifeTime) { // Recycle
                    particles.splice(index, 1);
                    this._stockParticles.push(particle);
                    index--;
                    continue;
                } else {
                    // particle.color = new Color4(that.color.r, that.color.g, that.color.b, 1 - Math.pow(particle.age, 1/2));
                    let progressGradient = 1 - Math.pow(particle.age, 1 / 2);
                    particle.color.a = progressGradient;

                    particle.scale.x = progressGradient;
                    particle.scale.y = progressGradient;

                    particle.position.x = that.position.x + Math.cos(particle.direction.x) * particle.age * 20;
                    particle.position.z = that.position.y + Math.sin(particle.direction.x) * particle.age * 20;
                    particle.position.y = 0.1;
                }
            }
        }

        if (this.isStarVisible) this.particle.start();
    }

    explode(callback?: Function) {
        this._explode(callback);
    }
    _explode(callback?: Function) {
        this.system.checkMaterials();
        this.updateSize(10, 80, () => {
            this.setReflectionLevel(1);
            this.updateSize(0.01, 30, () => {
                setTimeout(() => {
                    // Wait for the particle effect to end
                    if (callback) callback();
                }, 2000);
                this.setExplodeUpdateFunction();
                this.system.checkActiveMeshes();
            });
        });
    }

    _disposeStarFighter() {
        this._disposeStar();
        this.particle.stop();
        this.system.scene.unregisterBeforeRender(() => {
            this.particle.animate();
        });
        this.diveAnimation.stop();
        // this.particle.dispose();
    }

    diveAnimationLength = 50;
    dive(position: Vector2, callback?: Function) {
        let changeposition: Vector2 = position.subtract(this.position);
        this.diveAnimation.simple(this.diveAnimationLength, (count, perc) => {
            let easePerc = this.particleCurve.ease(perc);
            let progressposition: Vector2 = changeposition.multiply(new Vector2(perc, perc));
            let pos: Vector2 = this.position.add(progressposition);

            this.movingMesh.position.x = pos.x;
            this.movingMesh.position.z = pos.y;
            this.movingMesh.position.y = - easePerc * BlackHoleDepth;
        }, () => {
            this.hide();
            if (callback) callback();
        });
    }
}