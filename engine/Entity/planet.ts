import { System } from '../System/system';
import { PearlMesh } from './pearlMesh';

import { Vector3, Color3, Vector2 } from '@babylonjs/core/Maths/math';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { PositionEntity, PositionEntityInterface } from './positionEntity';

export interface PlanetInterface extends PositionEntityInterface {
    color ? : Array < number >,
    radius ? : number,
    velocity ? : number,
}

export class Planet extends PositionEntity {

    mesh: PearlMesh;
    color?: Array<number>;
    radius?: number;
    velocity?: number;

    offset = 0; // Used to determine beginning position around star
    cycle = 0; // Around its star % Math.PI

    constructor(system: System, options: PlanetInterface) {
        super('planet', system, options);

        let color = Color3.FromInts(5 + options.color[0] / 20, 5 + options.color[1] / 20, 5 + options.color[2] / 20);
        this.addMesh(color);

        if (options.radius && options.velocity) this.setGeostationnaryMovement(options.radius, options.velocity);
        if (options.size) this.setSize(options.size);
    }

    setGeostationnaryMovement(radius: number, velocity: number) {
        this.radius = radius;
        this.velocity = velocity;
    }

    meshMaterial: PBRMaterial;
    addMesh(color: Color3) {
        // this.mesh = MeshBuilder.CreateIcoSphere(this.key + "star", { radius: 1, flat: true, subdivisions: 2 }, this.system.scene);
        this.mesh = new PearlMesh(this.key + "planet", this.system.scene);
        
        this.meshMaterial = new PBRMaterial(this.key + "material", this.system.scene);
        // this.meshMaterial.roughness = 1;
        this.meshMaterial.emissiveColor = color;
        // console.log(this.meshMaterial);
        this.mesh.material = this.meshMaterial;
    }

    setParent(parent: AbstractMesh) {
        this.mesh.parent = parent;
    }

    setOffset(offset: number) {
        this.offset = offset;
    }

    setSize(size: number) {
        this._setSize(size);
        let newsize = Math.sqrt(size / 2);
        let sizeVector = new Vector3(newsize, newsize, newsize);
        this.mesh.scaling = sizeVector;
    }

    position: Vector2;
    setPosition(pos: Vector2) {
        this._setPosition(pos);
        this.mesh.position.x = pos.x;
        this.mesh.position.z = pos.y;
        this.mesh.position.y = 1;
    }

}