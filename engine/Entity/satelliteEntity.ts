import { PositionEntity, PositionEntityInterface } from './positionEntity';
import { MeshSystem } from '../System/meshSystem';
import { Animation } from '../System/animation';

import { TransformNode } from '@babylonjs/core/Meshes/transformNode';

export interface SatelliteEntityInterface extends PositionEntityInterface {
    velocity ? : number,
}

export class SatelliteEntity extends PositionEntity {

    satelliteAnimation: Animation;
    constructor(type: string, system: MeshSystem, options: SatelliteEntityInterface) {
        super(type, system, options);
        this.satelliteAnimation = new Animation(system.animationManager);
    }

    offset = 0; // Used to determine beginning position around gravityEntity
    cycle = 0; // Around its gravityEntity % Math.PI
    stationaryRadius = 1;
    stationaryVelocity = 1;

    setGeostationnaryMovement(stationaryRadius: number, stationaryVelocity: number) {
        this.stationaryRadius = stationaryRadius;
        this.stationaryVelocity = Math.max(stationaryVelocity, 2);
    }

    setStationaryVelocity(stationaryVelocity: number) {
        this.stationaryVelocity = stationaryVelocity;
    }

    setStationaryRadius(stationaryRadius: number) {
        this.stationaryRadius = stationaryRadius;
    }
    
    setParent(parent: TransformNode) {
        this.transformMesh.parent = parent;
    }

    setOffset(offset: number) {
        this.offset = offset;
    }
}