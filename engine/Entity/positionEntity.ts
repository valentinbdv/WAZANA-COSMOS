import { System } from '../System/system';
import { point3D } from '../System/interface';

import { Vector2 } from '@babylonjs/core/Maths/math';

export interface PositionEntityInterface {
    key?: string,
    position ? : point3D,
    size?: number,
}

export class PositionEntity {

    key: string;
    system: System;

    velocity?: number;
    
    constructor(type:string, system: System, options: PositionEntityInterface) {
        this.system = system;
        if (options.key) this.key = options.key;
        else this.key = type + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        if (options.position) {
            let pos = new Vector2(options.position.x, options.position.y);
            this._setPosition(pos);
        }
        if (options.size) this._setSize(options.size);
    }
    
    position: Vector2;
    _setPosition(pos: Vector2) {
        this.position = pos;
    }
    
    size: number;
    _setSize(size: number) {
        this.size = size;
    }

}