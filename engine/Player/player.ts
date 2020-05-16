import { MeshSystem } from '../System/meshSystem';
import { GravityGrid } from '../System/GravityGrid';
import { Animation } from '../System/animation';
import { Planet } from '../Objects/planet';
import { StarFighter } from '../Objects/starFighter';
import { StarCategory, StarInterface } from '../Objects/star';

import { Vector2 } from '@babylonjs/core/Maths/math';
import { EasingFunction, CubicEase } from '@babylonjs/core/Animations/easing';
import { BlackHole } from '../Objects/blackHole';
import { MovingEntity } from '../Entity/movingEntity';
import { Sound } from '@babylonjs/core/Audio/sound';
import { PlanetMap } from '../Map/planetMap';

export interface PlayerInterface {
    key: string;
    size: number;
    position: any;
    destination: any;
    maxPlanet: number; 
    gravityField: number;
    velocity: number;
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

    accelerateAnimation: Animation;
    absorbAnimation: Animation;
    particleCurve: EasingFunction;
    ia = false;
    realPlayer = false;
    dustField = true;
    target: Player;

    constructor(system: MeshSystem, gravityGrid: GravityGrid, planetMap: PlanetMap, playerInterface: StarInterface) {
        super(system, planetMap, playerInterface);
        this.gravityGrid = gravityGrid;

        this.key = 'player' +Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.accelerateAnimation = new Animation(this.system.animationManager);
        this.absorbAnimation = new Animation(this.system.animationManager);

        this.particleCurve = new CubicEase();
    }

    category: StarCategory;
    setCategory(category: StarCategory, withPlanets: boolean) {
        if (this.category == category) return;
        this.category = category;
        this.updateCategory(category, withPlanets);
    }

    updateCategory(category: StarCategory, withPlanets: boolean) {
        this.setVelocity(category.velocity);
        this.setTemperature(category.temperature);
        this.setMaxPlanet(category.planets)
        this.setGravity(category.gravity);
        this.updateGravityGrid();
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

    updateGravityGrid() {
        this.gravityGrid.setStarPoint(this.key, this.position, this.gravityField);
    }
    
    setRealVelocity(realVelocity: number) {
        this.realVelocity = realVelocity;
    }

    distanceAbsorbRatio = 0.005;
    starAbsorbRatio = 3;
    distanceWithTarget: number;
    currentSound: Sound;
    absorbTarget(target: Player, distanceWithTarget: number) {
        this.distanceWithTarget = distanceWithTarget;
        this.particle.emitRate = 500 / distanceWithTarget;
        this.cycleAbsorb = 1 + 50 / distanceWithTarget;
        // Check target to make sure we always absorb closest target
        if (this.absorbing && target == this.target) return;
        if (!this.currentSound) {
            // this.currentSound = this.system.soundManager.play('absorb');
            this.currentSound = this.system.soundManager.playMesh('absorb', this.transformMesh);
        }

        this.absorbStop();
        this.startReflect();
        this.absorbing = target.key;
        this.target = target;
        this.setAbsobUpdateFunction();
        this.system.checkActiveMeshes();
        let lastCount = 0;
        this.absorbAnimation.infinite((count) => {
            let change = count - lastCount;
            lastCount = count;
            let sizeSpeed = this.target.size * this.starAbsorbRatio;
            let distanceSpeed = this.distanceAbsorbRatio / this.distanceWithTarget;
            let up = change * distanceSpeed / sizeSpeed;
            this.changeSize(up);
            let down = -change * distanceSpeed * sizeSpeed;
            this.target.changeSize(down);
            if (this.target.isDead) this.absorbStop();
        });
    }

    blackHoleAbsorbRatio = 3;
    blackHoleAbsorber: BlackHole;
    absorbByBlackHole(absorber: BlackHole, distanceWithTarget: number) {
        this.distanceWithTarget = distanceWithTarget;
        this.particle.emitRate = 1000 / distanceWithTarget;

        if (this.blackHoleAbsorber) return;
        this.absorbStop();
        this.blackHoleAbsorber = absorber;
        this.absorbing = absorber.key;
        this.setGetAbsobByBlackHoleFunction();

        let lastCount = 0;
        this.absorbAnimation.infinite((count) => {
            let change = count - lastCount;
            lastCount = count;
            let sizeSpeed = this.absorber.size * this.blackHoleAbsorbRatio;
            let distanceSpeed = this.distanceAbsorbRatio / this.distanceWithTarget;
            let up = change * distanceSpeed / sizeSpeed;
            this.absorber.changeSize(up);
            let down = -change * distanceSpeed * sizeSpeed;
            this.changeSize(down);
            // if (this.absorber.isDead) this.absorbStop();
        });
    }

    setAbsorber(absorber: MovingEntity, proximity: number) {
        this.absorber = absorber;
        let newVelocity = Math.pow(proximity, 2)
        this.setRealVelocity(newVelocity);
    }

    absorbStop() {
        if (!this.absorbing) return;
        if (this.currentSound) {
            this.system.soundManager.stop('absorb', this.currentSound);
            this.currentSound = null;
        }
        this.endReflect();
        this.particle.stop();
        this.absorbAnimation.stop();
        this.absorbing = null;
        this.blackHoleAbsorber = null;
        this.setRealVelocity(1);
    }

    direction: Vector2 = Vector2.Zero();
    starVelocity: 0.03;
    move(step: Vector2) {
        if (step.y == 0) step.y = 0.001;
        let max = this.velocity * this.realVelocity / (Math.sqrt(this.size) * 5);
        let ratio = Math.abs(step.x / step.y);
        let maxX = Math.sqrt((Math.pow(max, 2) * ratio) / (ratio + 1));
        let maxY = Math.sqrt(Math.pow(max, 2) / (ratio + 1));
        let x = Math.sign(step.x) * maxX;
        let y = Math.sign(step.y) * maxY;
        this.direction = new Vector2(x, y);
        let pos = this.position.add(this.direction);
        this.setPosition(pos);
    }

    setPosition(pos: Vector2) {
        this._setPosition(pos);
        this.transformMesh.position.x = this.position.x;
        this.transformMesh.position.z = this.position.y;
        this.updateGravityGrid();
    }

    addPlanet(planet?: Planet) {
        let planetNumber = this.satellites.length;
        let radius = 2 + planetNumber;
        let velocity = 1 / (1 + planetNumber / 2) + Math.random() / 2;
        if (!planet) {
            planet = new Planet(this.system);
            planet.setGeostationnaryMovement(radius, velocity);
            planet.show();
        } else {
            this.grabSatellite(planet, radius, velocity);
            if (this.realPlayer) this.system.soundManager.play('catchPlanet');
        }
        this.fixeSatellite(planet);
    }

    addDust() {
        if (this.realPlayer) this.system.soundManager.play('catchDust');
        this.changeSize(0.005 / (Math.pow(this.size, 3)));
        this.shine();
    }
    
    launchAnimationLength = 80;
    accelerate(callback?: Function): boolean {
        if (!this.moving || this.accelerating || !this.isStarVisible) return false;
        let planet = this.satellites.pop();
        if (!planet) return false;

        // this.system.soundManager.playMesh('accelerate', this.transformMesh);
        if (this.realPlayer) this.system.soundManager.play('accelerate');

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
            this.setHeartScale(scale * size);
        }, () => {
            this.accelerating = false;
            this.planetMap.storagePlanet(planet);
            this.setHeartScale(size);
            this.realVelocity = 1;
            if (callback) callback();
        });

        return true
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
        this.absorbStop();
        this.setMoving(false);
        this.isDead = true;
        if (this.onDied) this.onDied();
    }
    
    dispose() {
        this._disposePlayer();
    }
    
    _disposePlayer() {
        this.isDead = true;
        this.moveCatcher.stop();
        this.accelerateAnimation.stop();
        this.removeAllPlanets();
        this._disposeStarFighter();
        this.absorbStop();
        this.gravityGrid.eraseMass(this.key);
    }

    // For IA
    goToPlayer(player: Player) {
        this.moveCatcher.catch(player.position.subtract(this.position));
    }
}