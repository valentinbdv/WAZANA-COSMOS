import { System } from '../System/system';
import { MouseCatcher } from './mouseCatcher';
import { GravityField } from '../System/gravityField';
import { Player } from './player';

import { Vector2 } from '@babylonjs/core/Maths/math';

export class RealPlayer extends Player {

    mouseCatcher: MouseCatcher;

    constructor(system: System, gravityField: GravityField) {
        super(system, gravityField);
        this.addMouseEvent();
        this.system.camera.parent = this.star.pivot;
    }

    followMouse = true;
    addMouseEvent() {
        this.mouseCatcher = new MouseCatcher(this.system.animationManager);
        this.mouseCatcher.addListener((mousepos: Vector2, step: Vector2) => {
            step = step.multiplyInPlace(new Vector2(5, 5));
            if (this.followMouse) this.move(step);
        });

        // setTimeout(() => {
        //     this.followMouse = false;
        // }, 2000);

        // setInterval(() => {
        //     this.gravityField.setCenterMap(this.position);
        // }, 500);

        this.mouseCatcher.start();
    }
}