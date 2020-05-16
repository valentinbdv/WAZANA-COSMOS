import { MeshSystem } from '../System/meshSystem';
import { point2D } from '../System/interface';

import { Vector2, Vector3 } from '@babylonjs/core/Maths/math';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';

export interface PositionEntityInterface {
    key?: string,
    position ? : point2D,
    size?: number,
}

export class PositionEntity {

    key: string;
    system: MeshSystem;
    
    constructor(type:string, system: MeshSystem, options?: PositionEntityInterface) {
        this.system = system;
        
        if (options && options.key) this.key = options.key;
        else this.key = type + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        if (options && options.position) {
            let pos = new Vector2(options.position.x, options.position.y);
            this._setPosition(pos);
        }
        if (options && options.size) this._setSize(options.size);
        this.addTransformMesh();
    }

    transformMesh: TransformNode;
    addTransformMesh() {
        this.transformMesh = new TransformNode(this.key, this.system.scene);
    }
    
    position: Vector2;
    _setPosition(pos: Vector2) {
        this.position = pos;
    }
    
    size: number;
    _setSize(size: number) {
        this.size = size;
    }

    setSize(size: number) {
        this._setSize(size);
        this.setTransformMeshSize(size);
    }

    setTransformMeshSize(size: number) {
        this.transformMesh.scaling.x = size;
        this.transformMesh.scaling.y = size;
        this.transformMesh.scaling.z = size;
    }

    setPosition(pos: Vector2) {
        this._setPosition(pos);
        this.transformMesh.position.x = pos.x;
        this.transformMesh.position.z = pos.y;
        this.transformMesh.position.y = 1;
    }
}