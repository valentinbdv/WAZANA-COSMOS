import { point3D } from '../System/interface';
import { System } from '../System/system';
import StarJson from './star.json';

import { Vector3, Color4, Color3 } from '@babylonjs/core/Maths/math';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { ParticleSystemSet } from "@babylonjs/core/Particles/particleSystemSet";

export interface starInterface {
    texture?: string,
    number ? : number,
    colorStart ? : Array < number > ,
    colorEnd ? : Array < number > ,
    sizeStart ? : number,
    sizeEnd ? : number,
    life ? : number,
    direction1 ? : point3D,
    direction2 ? : point3D,
    power ? : number,
    position: point3D,
    // reaction?:'continuously'|'move',
    // emitter?:'point'|'box'|'sphere'|'hemispheric'|'cylinder'|'cone',
    // delay?:number,
    // rotation?:number,
    // velocityStart?:number,
    // velocityEnd?:number,
}

export class Star {

    particlekey: string;
    particle: ParticleSystem;
    system: System;

    texture: string;
    number: number;
    colorStart: Array<number>;
    colorEnd: Array<number>;
    sizeStart: number;
    sizeEnd: number;
    life: number;
    direction1: point3D = {x: 0, y: 0, z: 0};
    direction2: point3D = {x: 0, y: 0, z: 0};
    power: number;

    set: ParticleSystemSet;

    constructor(system: System, options: starInterface) {
        this.system = system;

        this.particlekey = "naker";
        // this.initDirectionVectors();

        // let json = cloneDeep(StarJson);

        // console.log(surface);
        this.set = ParticleSystemSet.Parse(StarJson, this.system.scene, false);
        this.set.emitterNode.position = new Vector3(options.position.x, options.position.y, options.position.z)
        this.set.start();
        let color = Color3.FromInts(options.colorStart[0], options.colorStart[1], options.colorStart[2]);
        this.setSurfaceColor(new Color3(0, 0, 0));
        this.setFireColor(color);
        this.setFlareColor(color);
        this.setGlareColor(color);
        
        // this.setParticle();
        // this.setOptions(options);

        // this.particle.start();
    }

    setSurfaceColor(color: Color3) {
        this.set.emitterNode.material.emissiveColor = color;
    }

    setFireColor(color: Color3) {
        let surface = this.set.systems[0]._colorGradients;
        for (let i = 0; i < surface.length; i++) {
            surface[i].color1.r = color.r;
            surface[i].color1.g = color.g;
            surface[i].color1.b = color.b;
        }
    }

    setFlareColor(color: Color3) {
        let surface = this.set.systems[1]._colorGradients;
        for (let i = 0; i < surface.length; i++) {
            surface[i].color1.r = color.r;
            surface[i].color1.g = color.g;
            surface[i].color1.b = color.b;
        }
    }

    setGlareColor(color: Color3) {
        let surface = this.set.systems[2]._colorGradients;
        for (let i = 0; i < surface.length; i++) {
            surface[i].color1.r = color.r;
            surface[i].color1.g = color.g;
            surface[i].color1.b = color.b;
        }
    }

    setParticle(capacity?: number) {


        this.particle = particle;
    }

    initDirectionVectors() {
        this.direction1Vector = Vector3.Zero();
        this.direction2Vector = Vector3.Zero();
    }

    setOptions(options: starInterface) {
        this._setOptions(options);
        this.checkParticlePower(options.power);
    }

    _setOptions(options: starInterface) {
        // Keep life at first as it can reset the system
        if (options.life !== undefined) this.setLife(options.life);
        if (options.power !== undefined) this.setPower(options.power);
        if (options.texture !== undefined) this.setTexture(options.texture);
        if (options.number !== undefined) this.setNumber(options.number);
        if (options.colorStart !== undefined) this.setColorStart(options.colorStart);
        if (options.colorEnd !== undefined) this.setColorEnd(options.colorEnd);
        if (options.sizeStart !== undefined) this.setSizeStart(options.sizeStart);
        if (options.sizeEnd !== undefined) this.setSizeEnd(options.sizeEnd);
        if (options.direction1 !== undefined) this.setDirection1(options.direction1);
        if (options.direction2 !== undefined) this.setDirection2(options.direction2);
        // if (options.reaction !== undefined) this.setReaction(options.reaction);
        // if (options.emitter !== undefined) this.setEmitter(options.emitter);
        // if (options.delay !== undefined) this.setDelay(options.delay);
        // if (options.rotation !== undefined) this.setRotation(options.rotation);
        // if (options.velocityStart !== undefined) this.setVelocityStart(options.velocityStart);
        // if (options.velocityEnd !== undefined) this.setVelocityEnd(options.velocityEnd);
    }


    getOptions(): starInterface {
        let options: starInterface = {
            life: this.life,
            power: this.power,
            texture: this.texture,
            number: this.number,
            colorStart: this.colorStart,
            colorEnd: this.colorEnd,
            sizeStart: this.sizeStart,
            sizeEnd: this.sizeEnd,
            direction1: this.direction1,
            direction2: this.direction2,
        };
        return options;
    }

    setTexture(url: string) {
        this.texture = url;
        if (!url) {
            if (this.particle.particleTexture) this.particle.particleTexture.dispose();
            return;
        }
        let texture = new Texture(url, this.system.scene, true, false, Texture.NEAREST_SAMPLINGMODE, () => {
            this.particle.particleTexture = texture;
        }, (error) => {
            console.log(error);
        });
    }

    // setReaction (reaction:starInterface['reaction']) {
    //   this.reaction = reaction;
    //   this.particle.stop();
    //   if (reaction == 'continuously') {
    //     this.particle.manualEmitCount = -1;
    //     this.particle.emitRate = this.number;
    //   } else if (reaction == 'move') {
    //     this.particle.manualEmitCount = this.number;
    //     this.particle.emitRate = -1;
    //   }
    //   this.particle.start();
    // }
    //
    //
    // emitter:PointParticleEmitter|HemisphericParticleEmitter;
    // setEmitter (emitter:starInterface['emitter']) {
    //   this.emitter = emitter;
    //   if (emitter == 'point') {
    //     this.emitter = this.particle.createPointEmitter(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
    //   } else if (emitter == 'box') {
    //     this.emitter = this.particle.createBoxEmitter(new Vector3(0, 0, 0), new Vector3(0, 0, 0), new Vector3(-1, 0, 0), new Vector3(1, 0, 0));
    //   } else if (emitter == 'sphere') {
    //     this.emitter = this.particle.createDirectedSphereEmitter(50);
    //   } else if (emitter == 'hemispheric') {
    //     this.emitter = this.particle.createHemisphericEmitter(10);
    //   } else if (emitter == 'cylinder') {
    //     this.emitter = this.particle.createCylinderEmitter(10,5,0,0);
    //   } else if (emitter == 'cone') {
    //     this.emitter = this.particle.createConeEmitter(2, Math.PI / 3);
    //   }
    //   this.particle.particleEmitterType = this.emitter;
    // }

    setNumber(number: number) {
        number = Math.min(number, this.maximumParticle);
        this.number = number;
        this.particle.emitRate = this.number;
        // this.setReaction(this.reaction);
    }

    setColorStart(color: Array < number > ) {
        this.colorStart = color;
        this.setColors();
    }

    setColorEnd(color: Array < number > ) {
        this.colorEnd = color;
        this.setColors();
    }

    setColors() {
        let c1 = this.colorStart;
        let c2 = this.colorEnd;
        if (!c1 || !c2) return;
        let colorStart = Color3.FromInts(c1[0], c1[1], c1[2]);
        let colorEnd = Color3.FromInts(c2[0], c2[1], c2[2]);

        this.particle.removeRampGradient(0.0);
        this.particle.removeRampGradient(1.0);

        this.particle.addRampGradient(0.0, colorStart);
        this.particle.addRampGradient(1.0, colorEnd);

        this.particle.removeColorGradient(0.0);
        this.particle.removeColorGradient(0.9);
        this.particle.removeColorGradient(1.0);

        this.particle.addColorGradient(0.0, new Color4(1, 1, 1, c1[3]));
        this.particle.addColorGradient(0.9, new Color4(1, 1, 1, c2[3]));
        this.particle.addColorGradient(1.0, new Color4(1, 1, 1, 0));
    }

    setSizeStart(sizeStart: number) {
        this.sizeStart = sizeStart;
        this.setSizes();
    }

    setSizeEnd(sizeEnd: number) {
        this.sizeEnd = sizeEnd;
        this.setSizes();
    }

    setSizes() {
        let s1 = this.sizeStart;
        let s2 = this.sizeEnd;
        if (!s1 || !s2) return;
        this.particle.removeSizeGradient(0.0);
        this.particle.removeSizeGradient(1.0);

        this.particle.addSizeGradient(0, s1);
        this.particle.addSizeGradient(1.0, s2);
    }

    // setVelocityStart (velocityStart:number) {
    //   this.velocityStart = velocityStart;
    //   this.setVelocitys();
    // }
    //
    // setVelocityEnd (velocityEnd:number) {
    //   this.velocityEnd = velocityEnd;
    //   this.setVelocitys();
    // }
    //
    // setVelocitys () {
    //   let v1 = this.velocityStart;
    //   let v2 = this.velocityEnd;
    //   if (!v1 || !v2) return;
    //
    //   this.particle.removeVelocityGradient(0.0);
    //   this.particle.removeVelocityGradient(1.0);
    //
    //   this.particle.addVelocityGradient(0, v1);
    //   this.particle.addVelocityGradient(1.0, v2);
    // }
    //
    // setRotation (rotation:number) {
    //   this.rotation = rotation;
    //   this.particle.removeAngularSpeedGradient(0.0);
    //   this.particle.removeAngularSpeedGradient(1.0);
    //
    //   this.particle.addAngularSpeedGradient(0, 0);
    //   this.particle.addAngularSpeedGradient(1.0, rotation);
    // }

    setPower(power: number) {
        this.power = power;
        this.particle.minEmitPower = power;
        this.particle.maxEmitPower = power * 2;
    }

    setLife(life: number) {
        this.life = life;
        if (life >= 10) life = 100000000000000000000000000000;
        this.particle.minLifeTime = life;
        this.particle.maxLifeTime = life * 3;
    }

    resetSystem(capacity?: number) {
        this.particle.dispose();
        this.setParticle(capacity);
        this._setOptions(this);
        this.particle.start();
    }

    direction1Vector: Vector3;
    setDirection1(direction1: point3D) {
        for (let key in direction1) {
            this.direction1[key] = direction1[key];
            this.direction1Vector[key] = direction1[key];
        }
        this.particle.direction1 = this.direction1Vector;
        this.checkPower();
    }

    direction2Vector: Vector3;
    setDirection2(direction2: point3D) {
        for (let key in direction2) {
            this.direction2[key] = direction2[key];
            this.direction2Vector[key] = direction2[key];
        }
        this.particle.direction2 = this.direction2Vector;
        this.checkPower();
    }

    checkParticlePower(value: number) {
        if (value == 0) {
            this.setLife(10000000);
        } else if (value != 0 && this.power == 0) {
            this.setLife(5);
        }
        this.resetSystem(this.number);
    }

    checkPower() {
        let d1 = this.particle.direction1;
        let d2 = this.particle.direction2;
        if (d1.x != 0 || d1.y != 0 || d1.z != 0 || d2.x != 0 || d2.y != 0 || d2.z != 0) {
            this.setPower(this.power)
        } else {
            this.particle.minEmitPower = 0;
            this.particle.maxEmitPower = 0;
        }
    }

    destroy() {
        this.particle.dispose();
    }

}