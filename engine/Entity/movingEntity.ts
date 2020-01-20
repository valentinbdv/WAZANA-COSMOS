import { System } from '../System/system';
import { PositionEntity, PositionEntityInterface } from './positionEntity';
import { MoveCatcher } from '../Player/moveCatcher';

import { Vector3, Vector2 } from '@babylonjs/core/Maths/math';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';

export interface MovingEntityInterface extends PositionEntityInterface {
    velocity ? : number,
}

export class MovingEntity extends PositionEntity {

    movingMesh: AbstractMesh;
    moveCatcher: MoveCatcher;
    moving = true;

    constructor(type:string, system: System, options: MovingEntityInterface) {
        super(type, system, options);
        
        this.addMovingMesh();
    }

    setMoving(moving: boolean) {
        this.moving = moving;
    }
    
    addCactcher(moveCatcher: MoveCatcher) {
        this.moveCatcher = moveCatcher;
        
        this.moveCatcher.addListener((pos: Vector2, step: Vector2) => {
            if (this.moving) {
                step = step.multiplyInPlace(new Vector2(5, 5));
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

    addMovingMesh() {
        this.movingMesh = new AbstractMesh(this.key, this.system.scene);
    }

    setSize(size: number) {
        this._setSize(size);
        let newsize = Math.sqrt(size / 2);
        let sizeVector = new Vector3(newsize, newsize, newsize);
        this.movingMesh.scaling = sizeVector;
    }

    setPosition(pos: Vector2) {
        this._setPosition(pos);
        this.movingMesh.position.x = pos.x;
        this.movingMesh.position.z = pos.y;
        this.movingMesh.position.y = 1;
    }

    _dispose() {
        this.movingMesh.dispose();
    }

}