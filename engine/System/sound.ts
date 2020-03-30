import '@babylonjs/core/Audio/audioSceneComponent';
import '@babylonjs/core/Audio/audioEngine';
import { Sound } from '@babylonjs/core/Audio/sound';
import { Vector3 } from '@babylonjs/core/Maths/math';
import { Scene } from '@babylonjs/core/scene';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import find from 'lodash/find';

import { Animation } from './Animation';

let soundUrl = 'https://cosmos.wazana.io/sounds/';

interface SoundInterface {
    name: 
    'sunChange' | 
    'nebulaChange' | 
    'play' |
    'catchPlanet' |
    'catchDust' |
    'absorb' |
    'explode' |
    'levelUp' |
    'levelDown' |
    'accelerate'
    ;
    volume: number;
    needClone: boolean;
}

let soundList: Array<SoundInterface> = [
    { name: 'nebulaChange', volume: 1, needClone: false },
    { name: 'sunChange', volume: 1, needClone: false },
    { name: 'play', volume: 1, needClone: false },
    { name: 'catchPlanet', volume: 1, needClone: true },
    { name: 'catchDust', volume: 0.3, needClone: true },
    { name: 'absorb', volume: 1, needClone: true },
    { name: 'explode', volume: 0.3, needClone: true },
    { name: 'levelDown', volume: 0.3, needClone: false },
    { name: 'levelUp', volume: 0.3, needClone: false },
    { name: 'accelerate', volume: 1, needClone: true },
];

export class SoundManager {

    Sounds: any = {};
    mainsound: any;
    on = true;

    scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }
    
    load() {
        // this.mainsound = new Sound('mainsound', asseturl + "sound/wazana.mp3", scene);
        for (let i = 0; i < soundList.length; i++) {
            const sound = soundList[i];
            let n = sound.name;
            this.Sounds[n] = new Sound(n, soundUrl + n + ".wav", this.scene);
        }
    }

    setOn() {
        this.on = true;
    }

    setOff() {
        this.on = false;
        for (const key in this.Sounds) {
            const sound = this.Sounds[key];
            sound.stop();
        }
    }

    play(sound: SoundInterface['name']) {
        if (this.on) this.start(sound, 1);
    }

    playMesh(sound: SoundInterface['name'], mesh: TransformNode, volume ? : number) {
        if (!this.on) return;
        volume = this.checkVolume(sound) * volume;
        if (volume == 0) return;
        this.start(sound, volume, mesh);
    }

    currentSound: any = {};
    maxSound = 10;
    checkVolume(sound: SoundInterface['name']) {
        if (this.currentSound[sound] == undefined) return this.currentSound[sound] = 1;
        else this.currentSound[sound]++;
        // FIXME Shouldn't have to reset currentSound value
        if (this.currentSound[sound] > this.maxSound || this.currentSound[sound] < 0) this.currentSound[sound] = 0;
        // if ( this.currentSound[sound] > this.maxSound ) this.currentSound[sound] = 0;
        // if (this.currentSound[sound] > this.maxSound) return 0;
        if (this.currentSound[sound] > 1) return (this.maxSound - this.currentSound[sound]) / this.maxSound;
        return 1;
    }

    fade(sound: SoundInterface['name'], time ? : number) {
        if (this.Sounds[sound] == undefined) return;
        if (time == undefined) time = 2000;
        let howmany = time / 100;
        let fadesound = this.Sounds[sound];
        // let anim = new Animation(this.system.animationManager);
        // anim.simple(howmany, (count) => {
        //     let ratio = (howmany - count) / howmany;
        //     fadesound.setVolume(ratio * soundList[sound].volume);
        // }, () => {
        //     if (fadesound.isPlaying) fadesound.stop();
        // });
    }

    start(sound: SoundInterface['name'], volume: number, mesh?: TransformNode) {
        if (!this.checkFinitePosition(this.scene.activeCamera.position)) return;
        let soundParam = find(soundList, (s) => { return s.name == sound });
        
        let soundO;
        if (soundParam.needClone) soundO = this.Sounds[sound].clone();
        else soundO = this.Sounds[sound];
        
        volume = (volume) ? volume : 1;
        soundO.setVolume(volume * soundParam.volume);
        if (mesh) {
            if (mesh.position) {
                let pos = mesh.position;
                if (this.checkFinitePosition(pos)) {
                    soundO.attachToMesh(mesh);
                }
            }
        }

        soundO.play();
        if (soundParam.needClone) {
            setTimeout(() => {
                this.currentSound[sound]--;
                soundO.stop();
                soundO.dispose();
            }, 5000);
        }
    }

    checkFinitePosition(position: Vector3) {
        if (isFinite(position.x) && isFinite(position.z) && isFinite(position.y)) return true;
        return false;
    }

}
