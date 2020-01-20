
import { Animation, AnimationManager } from '../System/animation';
import { MoveCatcher } from './moveCatcher';

import { Vector2, Quaternion } from '@babylonjs/core/Maths/math';
import { Tools } from '@babylonjs/core/Misc/Tools';

export class MouseCatcher extends MoveCatcher {

    mousecatch = new Vector2(0, 0);
    catching = true;
    animation: Animation;

    constructor(animationManager: AnimationManager) {
        super(animationManager);
        window.addEventListener("mousemove", (evt) => { this.mouseOrientation(evt) });
        window.addEventListener("deviceorientation", (evt) => { this.deviceOrientation(evt) });
        window.addEventListener("orientationchange", () => { this.orientationChanged() });
        this.orientationChanged();

        // Ask for device motion permission now mandatory on iphone since Safari 13 update
        // https://medium.com/@leemartin/three-things-im-excited-about-in-safari-13-994107ac6295
        if (window.DeviceMotionEvent && window.DeviceMotionEvent.requestPermission) {
            window.DeviceMotionEvent.requestPermission()
                .then(response => {
                    if (response == 'granted') {
                        // permission granted
                    } else {
                        // permission not granted
                    }
                });
        }
    }

    // Code copied from babylon: https://github.com/BabylonJS/Babylon.js/blob/master/src/Cameras/Inputs/freeCameraDeviceOrientationInput.ts
    screenQuaternion: Quaternion = new Quaternion();
    constantTranform = new Quaternion(- Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
    orientationChanged() {
        let screenOrientationAngle = (<any>window.orientation !== undefined ? +<any>window.orientation : ((<any>window.screen).orientation && ((<any>window.screen).orientation)['angle'] ? ((<any>window.screen).orientation).angle : 0));
        screenOrientationAngle = -Tools.ToRadians(screenOrientationAngle / 2);
        this.screenQuaternion.copyFromFloats(0, Math.sin(screenOrientationAngle), 0, Math.cos(screenOrientationAngle));
    }

    divideVector = new Vector2(Math.PI / 8, Math.PI / 8);
    deviceMaxVector = new Vector2(Math.PI / 4, Math.PI / 4);
    deviceMinVector = new Vector2(-Math.PI / 4, -Math.PI / 4);
    deviceOrientation(evt: DeviceOrientationEvent) {
        if (this.catching) {
            let gamma = evt.gamma !== null ? evt.gamma : 0;
            let beta = evt.beta !== null ? evt.beta : 0;
            let alpha = evt.alpha !== null ? evt.alpha : 0;
            if (evt.gamma !== null) {
                let quaternion = Quaternion.RotationYawPitchRoll(Tools.ToRadians(alpha), Tools.ToRadians(beta), -Tools.ToRadians(gamma));
                quaternion.multiplyInPlace(this.screenQuaternion);
                quaternion.multiplyInPlace(this.constantTranform);
                quaternion.z *= -1;
                quaternion.w *= -1;
                let angles = quaternion.toEulerAngles();

                let pos = new Vector2(angles.y, angles.x);

                pos.divideInPlace(this.divideVector);
                let posMax = Vector2.Minimize(pos, this.deviceMaxVector);
                let posMin = Vector2.Maximize(posMax, this.deviceMinVector);
                this.catch(posMin);
            }
        }
    }

    mouseOrientation(evt: MouseEvent) {
        if (this.catching) {
            let pos = Vector2.Zero();
            let w = window.innerWidth;
            let h = window.innerHeight;
            pos.x = 4 * (evt.y - h / 2) / h;
            pos.y = 4 * (evt.x - w / 2) / w;
            this.catch(pos);
        }
    }
}
