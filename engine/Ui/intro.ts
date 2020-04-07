import { UiSystem } from '../System/uiSystem'
import { Animation } from '../System/animation'
import { ui_group, ui_control } from './group';
import { colormain } from './color';

import { EasingFunction, CircleEase } from '@babylonjs/core/Animations/easing';

export class IntroUI {

    system: UiSystem;
    showAnimation: Animation;
    curve: EasingFunction;

    constructor(system: UiSystem) {
        this.system = system;
        this.showAnimation = new Animation(system.animationManager);
        this.curve = new CircleEase();
        this.curve.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);

        this.addLayout();
        this.show();
    }

    layout: ui_control;
    iconSize = 35;
    addLayout() {
        this.layout = new ui_control(this.system, { x: 0, y: 0 }, { width: 100, height: 100 }, { zIndex: 1000, background: '#151034' });
        this.layout.setFullScreen();
        let lgo = this.layout.addImage('https://asset.wazana.io/logos/Cosmos.png', { x: 0, y: 0 }, { width: '50%', height: '50%' });
    }

    showAnim(callback?: Function) {
        this.showAnimation.simple(100, (count, perc) => {
            this.setLayerChangeAnim(1 - perc);
        }, () => {
            if (callback) callback();
            this.setLayerChangeAnim(0);
        });
        this.layout.showAll();
    }

    show() {
        this.setLayerChangeAnim(0);
        this.layout.showAll();
        this.system.advancedTexture.addControl(this.layout.container);
    }

    hideAnim(callback?: Function) {
        this.showAnimation.simple(100, (count, perc) => {
            this.setLayerChangeAnim(perc);
        }, () => {
            this.hide();
            if (callback) callback();
        });
    }

    hide() {
        this.setLayerChangeAnim(1);
        this.layout.hideAll();
        this.system.advancedTexture.removeControl(this.layout.container);
    }

    setLayerChangeAnim(perc) {
        let easePerc = this.curve.ease(1 - perc);
        this.layout.setOpacity(easePerc);
    }
}
