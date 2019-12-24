import { System } from '../System/system';
import { GravityField } from '../System/gravityField';
import { Star } from '../Entity/star'
import { Animation } from '../System/animation';
import { Planet, PlanetInterface } from '../Entity/planet';

import { Vector2, Vector3, Matrix, Color4 } from '@babylonjs/core/Maths/math';
import { IEasingFunction, CubicEase, EasingFunction } from '@babylonjs/core/Animations/easing';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import dustTexture from '../../asset/circle_05.png';

export class Player extends Star {

    gravityField: GravityField;
    key: string;
    fixeAnimation: Animation;
    fixeCurve: IEasingFunction;

    constructor(system: System, gravityField: GravityField) {
        super(system, { temperature: 5000, size: 0.5, position: { x: 0, y: 0, z: 0 } });
        this.gravityField = gravityField;
        this.secondLight.excludedMeshes.push(this.gravityField.ribbon);
        this.key = 'player' +Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.fixeAnimation = new Animation(this.system.animationManager);

        this.fixeCurve = new CubicEase();
        this.fixeCurve.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
        this.createParticle();
        this.setUpdateFunction();
    }

    position: Vector2 = Vector2.Zero();
    direction: Vector2 = Vector2.Zero();
    velocity = 1;
    move(mousepos: Vector2) {
        this.direction = new Vector2(mousepos.y * this.velocity, mousepos.x * this.velocity);
        let pos = this.position.add(this.direction);
        this.setPosition(pos);
    }

    setPosition(pos: Vector2) {
        this.position = pos;
        this.pivot.position.x = this.position.x;
        this.pivot.position.z = this.position.y;
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

    addDust() {
        let newSize = this.size + 0.02;
        this.updateSize(newSize);
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
        this.particle.emitter = this.pivot;
        this.particle.gravity = new Vector3(0, -0.5, 0);
        this.particle.minEmitBox = new Vector3(0, 0, 0); // Starting all from
        this.particle.maxEmitBox = new Vector3(0, 0, 0);
        this.particle.minLifeTime = 1;
        this.particle.maxLifeTime = 1;

        this.particle.minSize = 1.0;
        this.particle.maxSize = 1.0;

        this.particle.limitVelocityDamping = 0.9;

        // Start rotation
        this.particle.minInitialRotation = -Math.PI / 2;
        this.particle.maxInitialRotation = Math.PI / 2;

        this.particle.particleTexture = new Texture(dustTexture, this.system.scene);
        this.particle.blendMode = ParticleSystem.BLENDMODE_MULTIPLYADD;

        this.particle.renderingGroupId = 2;
    }

    setUpdateFunction() {
        // Use direction to initialize random value
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
                }
                else {
                    let progresscolor: Color4 = changecolor.multiply(new Color4(particle.age, particle.age, particle.age, 1.0));
                    particle.color = progresscolor.add(that.target.color);

                    let progressposition: Vector2 = changeposition.multiply(new Vector2(particle.age, particle.age));
                    let pos: Vector2 = that.target.position.add(progressposition);

                    particle.position.x = pos.x + 2 * (particle.direction.x - 0.5) * (1 - particle.age);
                    particle.position.z = pos.y + 2 * (particle.direction.z - 0.5) * (1 - particle.age);
                }
            } 
        }
    }

    target: Player;
    absorbing = false;
    absorbTarget(target: Player) {
        if (this.absorbing) return;
        this.absorbing = true;
        this.target = target;
        this.particle.start();
    }

    absorbStop() {
        if (!this.absorbing) return;
        this.absorbing = false;
        this.particle.stop();
    }
}