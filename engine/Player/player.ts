import { System } from '../System/system';
import { GravityField } from '../System/gravityField';
import { Star } from '../Entity/polystar'

import { Vector2, Vector3 } from '@babylonjs/core/Maths/math';

export class Player {

    system: System;
    gravityField: GravityField;
    key: string;

    constructor(system: System, gravityField: GravityField) {
        this.system = system;
        this.gravityField = gravityField;
        this.addStar();
        this.key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    star: Star;
    addStar() {
        this.star = new Star(this.system, { temperature: 5000, size: 0.5, position: { x: 0, y: 0, z: 0 } });
        // let star2 = new Star(this.system, { color: [0, 255, 0], size: 1, position: { x: 0, y: 0, z: 0 } });
        // let star3 = new Star(this.system, { color: [0, 0, 255], size: 2, position: { x: 0, y: 0, z: 5 } });

        this.star.addPlanet();
        this.star.addPlanet();
        this.star.addPlanet();
        this.star.secondLight.excludedMeshes.push(this.gravityField.ribbon);
    }

    position: Vector2 = Vector2.Zero();
    move(mousepos: Vector2) {
        this.position = this.position.add(new Vector2(mousepos.y, mousepos.x));
        this.star.pivot.position.x = this.position.x;
        this.star.pivot.position.z = this.position.y;
        this.gravityField.setStarPoint(this.key, this.position, this.star.size);
    }
}