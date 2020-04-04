import '@babylonjs/core/Audio/audioSceneComponent';
import '@babylonjs/core/Audio/audioEngine';
import { Sound } from '@babylonjs/core/Audio/sound';
import { Vector3 } from '@babylonjs/core/Maths/math';
import { Scene } from '@babylonjs/core/scene';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import find from 'lodash/find';
import remove from 'lodash/remove';

import { Animation } from './Animation';

let soundUrl = 'https://cosmos.wazana.io/sounds/';

interface SoundInterface {
    name: 
    'sunChange' | 
    'nebulaChange' | 
    'play' |
    'dead' |
    'catchPlanet' |
    'catchDust' |
    'absorb' |
    'explodeStart' |
    'explodeEnd' |
    'levelUp' |
    'levelDown' |
    'accelerate'
    ;
    volume: number;
    needClone: boolean;
    duration: number;
    loop: boolean;
    spatial: boolean;
}

let soundList: Array<SoundInterface> = [
    { name: 'nebulaChange', volume: 1, needClone: false, duration: 1, loop: false, spatial: false },
    { name: 'sunChange', volume: 1, needClone: false, duration: 1, loop: false, spatial: false },
    { name: 'play', volume: 1, needClone: false, duration: 2, loop: false, spatial: false },
    { name: 'dead', volume: 1, needClone: false, duration: 3, loop: false, spatial: false },
    { name: 'catchPlanet', volume: 1, needClone: true, duration: 1, loop: false, spatial: false },
    { name: 'catchDust', volume: 0.2, needClone: true, duration: 0.5, loop: false, spatial: false },
    { name: 'absorb', volume: 0.2, needClone: true, duration: 1, loop: true, spatial: true },
    { name: 'explodeStart', volume: 1, needClone: true, duration: 1, loop: false, spatial: true },
    { name: 'explodeEnd', volume: 0.5, needClone: true, duration: 3, loop: false, spatial: true },
    { name: 'levelDown', volume: 0.3, needClone: false, duration: 1, loop: false, spatial: false },
    { name: 'levelUp', volume: 0.3, needClone: false, duration: 1, loop: false, spatial: false },
    { name: 'accelerate', volume: 1, needClone: true, duration: 2, loop: false, spatial: true },
];

export class SoundManager {

    Sounds: any = {};
    mainsound: any;
    on = true;

    scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;

        window.addEventListener('blur', () => {
            this.stopAllSounds();
        });
    }
    
    load() {
        // this.mainsound = new Sound('mainsound', asseturl + "sound/wazana.mp3", scene);
        for (let i = 0; i < soundList.length; i++) {
            const sound = soundList[i];
            let n = sound.name;
            this.Sounds[n] = new Sound(n, soundUrl + n + ".mp3", this.scene, null, {
                loop: sound.loop,
                // spatialSound: sound.spatial,
            });
        }
    }

    setOn() {
        this.on = true;
    }

    setOff() {
        this.on = false;
        this.stopAllSounds();
    }

    play(sound: SoundInterface['name']): Sound {
        if (!this.on) return;
        let volume = this.checkVolume(sound);
        if (volume == 0) return;
        return this.start(sound, volume);
    }

    playMesh(sound: SoundInterface['name'], mesh: TransformNode, volume ? : number): Sound {
        if (!this.on) return;
        // volume = (volume) ? volume : 1;
        // volume = this.checkVolume(sound) * volume;
        // console.log(volume);
        
        // if (volume == 0) return;
        let soundO = this.start(sound, 1, mesh);
        if (mesh) {
            if (mesh.position) {
                let pos = mesh.position;
                if (this.checkFinitePosition(pos)) {
                    soundO.attachToMesh(mesh);
                }
            }
        }
        return soundO;
    }

    currentSound: any = {};
    maxSound = 10;
    checkVolume(sound: SoundInterface['name']): number {
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

    soundsPlaying:Array<Sound> = [];
    start(sound: SoundInterface['name'], volume: number, mesh?: TransformNode): Sound {
        if (!this.checkFinitePosition(this.scene.activeCamera.position)) return;
        let soundParam = find(soundList, (s) => { return s.name == sound });
        
        let soundO;
        if (soundParam.needClone) soundO = this.Sounds[sound].clone();
        else soundO = this.Sounds[sound];
        
        soundO.setVolume(volume * soundParam.volume);
        soundO.play();
        this.soundsPlaying.push(soundO);
        if (!soundParam.loop) {
            setTimeout(() => {
                this.stop(sound, soundO);
            }, soundParam.duration * 1000);
        }

        return soundO;
    }

    stop(sound: SoundInterface['name'], soundO: Sound) {
        this.currentSound[sound]--;
        soundO.stop();
        remove(this.soundsPlaying, (s) => { return s == soundO });
        let soundParam = find(soundList, (s) => { return s.name == sound });
        if (soundParam.needClone) {
            soundO.dispose();
        }
    }

    stopAllSounds() {
        for (let i = 0; i < this.soundsPlaying.length; i++) {
            const soundO = this.soundsPlaying[i];
            soundO.stop();
        }
        this.soundsPlaying = [];
    }

    checkFinitePosition(position: Vector3) {
        if (isFinite(position.x) && isFinite(position.z) && isFinite(position.y)) return true;
        return false;
    }

}
