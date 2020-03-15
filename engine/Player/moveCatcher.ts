
import { Animation, AnimationManager } from '../System/animation';

import remove from 'lodash/remove';
import { Vector2 } from '@babylonjs/core/Maths/math';
import { EasingFunction, CircleEase } from '@babylonjs/core/Animations/easing';

export class MoveCatcher {

    catching = true;
    animation: Animation;
    curve: EasingFunction;

    constructor(animationManager: AnimationManager) {
        this.animation = new Animation(animationManager, 10);
        this.curve = new CircleEase();
        this.curve.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
    }

    start() {
        this.catching = true;
    }

    stop() {
        this.catching = false;
        this.animation.stop();
    }

    /**
    * Spped of the progress used when positionwheel or drag on phone
    */
    speed = 0.05;
    speedVector = new Vector2(0.05, 0.05);
    /**
    * Set the speed of the progressCatcher
    * @param speed The new speed
    */
    setSpeed(speed: number) {
        this.speed = speed;
        this.speedVector = new Vector2(speed, speed);
    }

    /**
    * Spped of the progress used when positionwheel or drag on phone
    */
    accuracy = 0.0002;
    /**
    * Set the speed of the progressCatcher
    * @param speed The new speed
    */
    setAccuracy(accuracy: number) {
        this.accuracy = accuracy;
    }

    step = new Vector2(0, 0);
    positionReal = new Vector2(0, 0);
    positionCatch = new Vector2(0, 0);
    catch(position: Vector2) {
        if (position.x == 0 && position.y == 0) return this.inertiaStop();
        this.positionReal = position.clone();
        this.animation.infinite(() => {
            this.step = this.positionReal.clone();
            this.step.multiplyInPlace(this.speedVector);
            this.positionCatch.addInPlace(this.step);
            for (let i = 0; i < this.listeners.length; i++) {
                // Clone to make sure there is not something which can alter real positionCatch
                this.listeners[i](this.positionCatch.clone(), this.step.clone());
            }
        });
    }

    inertiaStop() {
        this.animation.simple(40, (count, perc) => {
            this.step = this.positionReal.clone();
            let easePerc = (1 - this.curve.ease(perc)) / 10;
            let vectorPerc = new Vector2(easePerc, easePerc)
            this.step.multiplyInPlace(this.speedVector).multiplyInPlace(vectorPerc);
            this.positionCatch.addInPlace(this.step).multiplyInPlace(vectorPerc);
            for (let i = 0; i < this.listeners.length; i++) {
                // Clone to make sure there is not something which can alter real positionCatch
                this.listeners[i](this.positionCatch.clone(), this.step.clone());
            }
        });
    }

    listeners: Array<Function> = [];
    addListener(callback: Function) {
        this.listeners.push(callback);
    }

    removeListener(callback: Function) {
        remove(this.listeners, (c) => { c == callback });
    }
}
