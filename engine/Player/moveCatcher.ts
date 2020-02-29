
import { Animation, AnimationManager } from '../System/animation';

import remove from 'lodash/remove';
import { Vector2 } from '@babylonjs/core/Maths/math';

export class MoveCatcher {

    catching = true;
    animation: Animation;

    constructor(animationManager: AnimationManager) {
        this.animation = new Animation(animationManager, 10);
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
        this.positionReal = position;
        this.animation.infinite(() => {
            // let gapposition = this.positionReal.subtract(this.positionCatch);
            let gapposition = this.positionReal;
            this.step = gapposition.clone();
            this.step.multiplyInPlace(this.speedVector);
            this.positionCatch.addInPlace(this.step);
            if (Math.abs(gapposition.x) < this.accuracy && Math.abs(gapposition.y) < this.accuracy) this.animation.running = false;
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
