import { MeshSystem } from '../System/meshSystem';
import { MoveCatcher } from '../Player/moveCatcher';
import { GravityEntity } from './gravityEntity';

import { Vector2 } from '@babylonjs/core/Maths/math';

export class MovingEntity extends GravityEntity {

    moveCatcher: MoveCatcher;
    moving = true;

    constructor(type:string, system: MeshSystem) {
        super(type, system);

        this.addCactcher();
    }

    setMoving(moving: boolean) {
        this.moving = moving;
    }
    
    addCactcher() {
        this.moveCatcher = new MoveCatcher(this.system.animationManager);
        
        this.moveCatcher.addListener((pos: Vector2, step: Vector2) => {
            if (this.moving) {
                let adaptVelocityWithFps = this.system.animationManager.fpsratio;
                step = step.multiplyInPlace(new Vector2(5 * adaptVelocityWithFps, 5 * adaptVelocityWithFps));
                // step = step.multiplyInPlace(new Vector2(5, 5));
                this.move(step);
            }
        });

        this.moveCatcher.start();
    }

    position: Vector2 = Vector2.Zero();
    direction: Vector2 = Vector2.Zero();
    velocity = 1;
    move(mousepos: Vector2) {
        this.direction = new Vector2(mousepos.y * this.velocity, mousepos.x * this.velocity);
        let pos = this.position.add(this.direction);
        this.setPosition(pos);
    }

    changeSize(change: number) {
        let newSize = this.size + change;
        this.setSize(newSize);
    }

    show() {}

    hide() {}
}