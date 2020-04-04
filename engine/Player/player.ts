import { MeshSystem } from '../System/meshSystem';
import { GravityGrid } from '../System/GravityGrid';
import { Animation } from '../System/animation';
import { Planet, PlanetInterface } from '../Entity/planet';
import { StarFighter } from '../Entity/starFighter';
import { StarCategory, StarInterface } from '../Entity/star';

import { Vector2, Vector3 } from '@babylonjs/core/Maths/math';
import { EasingFunction, CubicEase } from '@babylonjs/core/Animations/easing';
import { BlackHole } from '../Entity/blackHole';
import { MovingEntity } from '../Entity/movingEntity';
import { Sound } from '@babylonjs/core/Audio/sound';

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
    absorbAnimation: Animation;
    fixeCurve: EasingFunction;
    particleCurve: EasingFunction;
    ia = false;
    realPlayer = false;
    dustField = true;
    target: Player;

    constructor(system: MeshSystem, gravityGrid: GravityGrid, playerInterface: StarInterface) {
        super(system, playerInterface);
        this.gravityGrid = gravityGrid;
        this.key = 'player' +Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.fixeAnimation = new Animation(this.system.animationManager);
        this.accelerateAnimation = new Animation(this.system.animationManager);
        this.absorbAnimation = new Animation(this.system.animationManager);

        this.fixeCurve = new CubicEase();
        this.fixeCurve.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

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

    updateGravityGrid() {
        this.gravityGrid.setStarPoint(this.key, this.position, this.gravityField);
    }

    setVelocity(velocity: number) {
        this.velocity = velocity;
    }
    
    setRealVelocity(realVelocity: number) {
        this.realVelocity = realVelocity;
    }

    absorbRatio = 0.0005;
    sizeAbsorbRatio = 3;
    currentSound: Sound;
    absorbTarget(target: Player) {
        // Check target to make sure we always absorb closest target
        if (this.absorbing && target == this.target) return;
        if (!this.currentSound) {
            // this.currentSound = this.system.soundManager.play('absorb');
            this.currentSound = this.system.soundManager.playMesh('absorb', this.movingMesh);
        }

        this.absorbStop();
        this.absorbing = target.key;
        this.target = target;
        this.setAbsobUpdateFunction();
        this.system.checkActiveMeshes();
        let lastCount = 0;
        this.absorbAnimation.infinite((count) => {
            let change = count - lastCount;
            lastCount = count;
            let up = change * this.absorbRatio / (this.target.size * this.sizeAbsorbRatio);
            this.changeSize(up);
            let down = -change * this.absorbRatio * (this.target.size * this.sizeAbsorbRatio);
            this.target.changeSize(down);
            if (this.target.isDead) this.absorbStop();
        });
    }

    setAbsorber(absorber: MovingEntity, proximity: number) {
        this.absorber = absorber;
        let newVelocity = Math.pow(proximity, 2)
        this.setRealVelocity(newVelocity);
    }

    blackHoleAbsorber: BlackHole;
    absorbByBlackHole(absorber: BlackHole, proximity: number) {
        if (this.blackHoleAbsorber) return;
        this.absorbStop();
        this.blackHoleAbsorber = absorber;
        this.absorbing = absorber.key;
        this.setAbsorber(absorber, proximity);
        this.setGetAbsobByBlackHoleFunction();
        this.system.checkActiveMeshes();

        let lastCount = 0;
        this.absorbAnimation.infinite((count) => {
            let change = count - lastCount;
            lastCount = count;
            this.changeSize(-change * this.absorbRatio * 2 * this.size);
        });
    }

    absorbStop() {
        if (!this.absorbing && !this.target) return;
        if (this.currentSound) {
            this.system.soundManager.stop('absorb', this.currentSound);
            this.currentSound = null;
        }
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
        let max = this.velocity * this.realVelocity / (this.size * 5);
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
        this.movingMesh.position.x = this.position.x;
        this.movingMesh.position.z = this.position.y;
        this.updateGravityGrid();
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
        if (this.realPlayer) this.system.soundManager.play('catchPlanet');
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

    addDust() {
        if (this.realPlayer) this.system.soundManager.play('catchDust');
        this.changeSize(0.005 / (Math.pow(this.size, 3)));
        this.shine();
    }

    launchAnimationLength = 80;
    accelerate(callback?: Function): boolean {
        if (!this.moving || this.accelerating || !this.isStarVisible) return false;
        let planet = this.planets.pop();
        if (!planet) return false;

        // this.system.soundManager.playMesh('accelerate', this.movingMesh);
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
            planet.attachedToStar = false;
            planet.setParent(null);
            planet.hide();
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
        this.fixeAnimation.stop();
        this.gravityGrid.eraseMass(this.key);
    }

    // For IA
    goToPlayer(player: Player) {
        this.moveCatcher.catch(player.position.subtract(this.position));
    }
}