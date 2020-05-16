import { MeshSystem } from '../System/meshSystem';

import { Vector2 } from '@babylonjs/core/Maths/math';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';

export class PositionEntity {

    key: string;
    system: MeshSystem;
    
    constructor(type:string, system: MeshSystem) {
        this.system = system;
        
        this.key = type + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.addTransformMesh();
    }

    transformMesh: TransformNode;
    addTransformMesh() {
        this.transformMesh = new TransformNode(this.key, this.system.scene);
    }
    
    position = Vector2.Zero();
    _setPosition(pos: Vector2) {
        this.position = pos;
    }
    
    size = 1;
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