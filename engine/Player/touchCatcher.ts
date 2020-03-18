import { Vector2 } from '@babylonjs/core/Maths/math';

/**
 * Detect scroll action of the user
 */

export class TouchCatcher {

    /**
     * @ignore
     */
    _container: HTMLElement;

    /**
     * Distance left to be reached by scroll animation
     */
    scrollGap = 0;

    /**
     * Scrollable height (Used to simulate real scroll in Intale)
     */
    scrollHeight = 1000;

    /**
     * Use to animate the catching
     * @param system System of the 3D scene
     * @param responsive If there is responsive changes, we may have to adapt scroll height
     */
    constructor(container: HTMLElement) {
        this._container = container;

        this._setTouchEvent();
    }

    /**
     * The position of drag start when on smartphone
     */
    touchStart = null;

    /**
     * The gap of drag between start and current touch when on smartphone
     */
    touchGap = Vector2.Zero();

    /**
     * On smartphone, we use the touch events to simulate scroll
     * @ignore
     */
    touchRatio = 0.01;
    _setTouchEvent() {
        let count = 0;
        this._container.addEventListener("touchstart", (evt) => {
            // We prevent second touch to allow click acceleration
            if (this.touchStart) return;
            this.touchStart = Vector2.Zero();
            this.touchStart.x = evt.changedTouches[0].clientX;
            this.touchStart.y = evt.changedTouches[0].clientY;
            count = 0;
        });
        // Need test
        this._container.addEventListener("touchend", (evt) => {
            // We prevent second touch to allow click acceleration
            if (evt.changedTouches.length > 1) return;
            this.touchStart = null;
            this.touchGap = Vector2.Zero();
            this.sendToListener(this.touchGap, evt);
        });
        this._container.addEventListener("touchmove", (evt) => {
            // We prevent second touch to allow click acceleration
            count++;
            if (this.touchStart && count > 2) {
                let x = evt.changedTouches[0].clientX;
                let y = evt.changedTouches[0].clientY;
                this.touchGap.y = (x - this.touchStart.x) * this.touchRatio;
                this.touchGap.x = (y - this.touchStart.y) * this.touchRatio;
                // if (count == 50) {
                //     this.touchStart.x = x;
                //     this.touchStart.y = y;
                //     count = 0;
                // }
                this.sendToListener(this.touchGap, evt);
            }
        });
    }

    listeners: Array<Function> = []

    /**
     * Allow to add a listener on special events
     * @param what the event: start or stop and mouseWheel for now
     * @param funct the function to be called at the event
     */
    addListener(funct: Function) {
        this.listeners.push(funct);
    }

    /**
    * Catch the percentage of the scrollHeight
    * @param perc What is the top position to be catched
    */
    sendToListener(change: Vector2, evt: Event) {
        for (let i = 0; i < this.listeners.length; i++) {
            this.listeners[i](change, evt);
            
        }
    }
}
