import { System } from '../System/system';
import { MouseCatcher } from './mouseCatcher';
import { GravityField } from '../System/gravityField';
import { Star } from '../Entity/polystar'

import { Vector2, Vector3 } from '@babylonjs/core/Maths/math';

export class Player {

    system: System;
    gravityField: GravityField;
    mouseCatcher: MouseCatcher;

    constructor(system: System, gravityField: GravityField) {
        this.system = system;
        this.gravityField = gravityField;

        this.addMouseEvent();
        this.addStar();

        this.system.camera.parent = this.star.pivot;
    }

    followMouse = true;
    position: Vector3 = Vector3.Zero();
    currentMousePosition: Vector2 = Vector2.Zero();
    addMouseEvent() {
        this.mouseCatcher = new MouseCatcher(this.system.animationManager);
        this.mouseCatcher.addListener((mousepos: Vector2) => {
            let navigationMousepos = mousepos.divideInPlace(new Vector2(5, 5));
            this.currentMousePosition = navigationMousepos;
            // this.currentMousePosition = mousepos;
            if (this.followMouse) this.move(navigationMousepos);
        });

        this.mouseCatcher.start();
    }

    star: Star;
    addStar() {
        this.star = new Star(this.system, { temperature: 5000, size: 0.5, position: { x: 0, y: 0, z: 0 } });
        // let star2 = new Star(this.system, { color: [0, 255, 0], size: 1, position: { x: 0, y: 0, z: 0 } });
        // let star3 = new Star(this.system, { color: [0, 0, 255], size: 2, position: { x: 0, y: 0, z: 5 } });

        this.star.addPlanet();
        this.star.addPlanet();
        this.star.addPlanet();

        setTimeout(() => {
            this.star.shine();
        }, 2000);

        this.star.secondLight.excludedMeshes.push(this.gravityField.ribbon);
    }

    gravityPoint: Array< Vector3 > = [];
    move(mousepos: Vector2) {
        this.eraseGravity();
        this.position = this.position.add(new Vector3(mousepos.y, 0, mousepos.x));
        this.star.pivot.position = this.position;
        this.gravityPoint = this.gravityField.setStarPoint(new Vector2(this.position.x, this.position.z), this.star.size);
    }

    eraseGravity() {
        for (let i = 0; i < this.gravityPoint.length; i++) {
            this.gravityPoint[i].y = 0;
        }
    }
}