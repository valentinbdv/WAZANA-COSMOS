import { point3D } from '../System/interface';
import { System } from '../System/system';

import { Vector2, Vector3, Color3 } from '@babylonjs/core/Maths/math';
import { MeshBuilder } from '@babylonjs/core/Meshes/MeshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/Mesh';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';

// https://www.youtube.com/watch?v=i4RtO_qIQHk

export interface StarDustInterface {
    temperature: number,
    size: number,
    position?: point3D,
}

export class StarDust {

    key: string;
    system: System;
    
    constructor(system: System, options: StarDustInterface) {
        this.system = system;

        this.key = 'stardust'+Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.addDust();
        this.setSize(options.size);
        this.setTemperature(options.temperature);

    }

    setTemperature(temperature: number) {
        let color = this.getColorFromTemperature(temperature);
        this.meshMaterial.emissiveColor = color;
    }

    // Follow this map color http://cdn.eso.org/images/screen/eso0728c.jpg
    getColorFromTemperature(temperature: number): Color3 {
        temperature = Math.max(3000, temperature);
        temperature = Math.min(30000, temperature);
        if (temperature < 8000) {
            let perc = (8000 - temperature) / 5000;
            let g = Math.min(1, 2 - perc * 2);
            let b = Math.max(0, 1 - perc * 2);
            return new Color3(1, g, b);
        } else {
            let perc = 1 - Math.pow(((temperature - 8000) / 22000), 2);
            return new Color3(perc, perc, 0.8);
        }
    }

    mesh: Mesh;
    meshMaterial: StandardMaterial;
    addDust() {
        // this.mesh = MeshBuilder.CreateIcoSphere(this.key + "star", { radius: 1, flat: true, subdivisions: 2 }, this.system.scene);
        this.mesh = MeshBuilder.CreateSphere(this.key + "star", { diameter: 1 }, this.system.scene);
        this.meshMaterial = new StandardMaterial(this.key + "material", this.system.scene);
        // this.meshMaterial.roughness = 1;
        // this.meshMaterial.emissiveColor = Color3.Black();
        // console.log(this.meshMaterial);
        // this.system.glowLayer.addIncludedOnlyMesh(this.mesh);
        this.mesh.material = this.meshMaterial;
        // this.mesh.isBlocker = false;
    }

    size: number;
    setSize(size: number) {
        this.size = size;
        let newsize = Math.sqrt(size);
        let sizeVector = new Vector3(newsize, newsize, newsize);
        this.mesh.scaling = sizeVector;
    }

    position: Vector2;
    setPosition(pos: Vector2) {
        this.position = pos;
        this.mesh.position.x = pos.x;
        this.mesh.position.z = pos.y;
        this.mesh.position.y = 1;
    }
}