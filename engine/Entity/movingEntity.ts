import { MeshSystem } from '../System/meshSystem';
import { PositionEntity, PositionEntityInterface } from './positionEntity';
import { MoveCatcher } from '../Player/moveCatcher';

import { Vector2 } from '@babylonjs/core/Maths/math';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';

export interface MovingEntityInterface extends PositionEntityInterface {
    velocity ? : number,
}

export let gravityRatio = 10;

export class MovingEntity extends PositionEntity {

    movingMesh: TransformNode;
    moveCatcher: MoveCatcher;
    moving = true;

    constructor(type:string, system: MeshSystem, options: MovingEntityInterface) {
        super(type, system, options);

        this.addCactcher();
        this.addMovingMesh();
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

    addMovingMesh() {
        this.movingMesh = new TransformNode(this.key, this.system.scene);
    }

    gravity = 1;
    gravityField = 1;
    setGravity(gravity: number) {
        this.gravity = gravity;
        this.updateGravityFiesld();
    }

    setSize(size: number) {
        this._setSize(size);
        this.setMovingMeshSize(size);
    }

    setMovingMeshSize(size: number) {
        this.movingMesh.scaling.x = size;
        this.movingMesh.scaling.y = size;
        this.movingMesh.scaling.z = size;
    }
    
    size: number;
    _setSize(size: number) {
        this.size = size;
        this.updateGravityFiesld();
    }
    
    updateGravityFiesld() {
        this.gravityField = Math.sqrt(this.size * this.gravity) * gravityRatio;
    }

    setPosition(pos: Vector2) {
        this._setPosition(pos);
        this.movingMesh.position.x = pos.x;
        this.movingMesh.position.z = pos.y;
        this.movingMesh.position.y = 1;
    }

    show() {}

    hide() {}
}