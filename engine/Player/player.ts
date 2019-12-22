import { System } from '../System/system';
import { GravityField } from '../System/gravityField';
import { Star } from '../Entity/star'
import { Animation } from '../System/animation';
import { Planet, PlanetInterface } from '../Entity/planet';
import { StarDust, StarDustInterface } from '../Entity/starDust';

import { Vector2 } from '@babylonjs/core/Maths/math';
import { IEasingFunction, CubicEase, EasingFunction } from '@babylonjs/core/Animations/easing';

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
    }

    position: Vector2 = Vector2.Zero();
    direction: Vector2 = Vector2.Zero();
    velocity = 1;
    move(mousepos: Vector2) {
        this.direction = new Vector2(mousepos.y * this.velocity, mousepos.x * this.velocity);
        this.position = this.position.add(this.direction);
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
}