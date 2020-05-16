import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { PositionEntity, PositionEntityInterface } from './positionEntity';

export interface GeostationaryEntityInterface extends PositionEntityInterface {
    velocity ? : number,
}

export let gravityRatio = 10;

export class GeostationaryEntity extends PositionEntity {

    // constructor(type: string, system: MeshSystem, options: GeostationaryEntityInterface) {
    //     super(type, system, options);
    // }

    radius = 1;
    setGeostationnaryMovement(radius: number, velocity: number) {
        this.radius = radius;
        this.velocity = Math.max(velocity, 2);
    }
    
    setParent(parent: TransformNode) {
        this.transformMesh.parent = parent;
    }

    offset = 0;
    setOffset(offset: number) {
        this.offset = offset;
    }
}