import { SystemUI } from '../System/systemUI'
import { Animation } from '../System/animation'
import { StarCategories, StarCategory } from '../Entity/star';
import { RealPlayer } from '../Player/realPlayer';
import { ui_group, ui_control } from './group';
import { Vector2 } from '@babylonjs/core/Maths/math';
import { ui_arrow, ui_button } from './effect';
import { ui_text, ui_back } from './node';
import { colormain } from './color';

import { IEasingFunction, EasingFunction, CircleEase } from '@babylonjs/core/Animations/easing';

export class IntroUI {
    
    system: SystemUI;
    animation: Animation;
    realPlayer: RealPlayer;
    curve: IEasingFunction;

    constructor(system: SystemUI, realPlayer: RealPlayer) {
        this.system = system;
        this.realPlayer = realPlayer;
        this.animation = new Animation(system.animationManager);
        this.curve = new CircleEase();
        this.curve.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);

        this.addNebulaChoice();
        this.addStarChoice();
        this.addPlayerLayout();
        this.addStartButton();
        this.show();
    }

    starUI: ui_group;
    starNumber = 0;
    starText: ui_text;
    starArrowLeft: ui_arrow;
    starArrowRight: ui_arrow;
    addStarChoice() {
        this.starUI = new ui_control(this.system, {x: 0, y: 0}, { width: 300, height: 200 }, { zIndex: 100 });
        let title = this.starUI.addText('Select your Sun', { x: 0, y: -60 }, { fontSize: 25, color: colormain });
        this.starText = this.starUI.addText(StarCategories[0].name, { x: 0, y: 60 }, { fontSize: 25, color: colormain });
        this.starArrowRight = this.starUI.addArrow({ x: 100, y: 0 }, { orientation: 'right' });
        this.starArrowLeft = this.starUI.addArrow({ x: -100, y: 0 }, { orientation: 'left' });
        this.starArrowRight.setColor(colormain);
        this.starArrowLeft.setColor(colormain);

        this.starArrowRight.on('click', () => {
            if (this.starNumber == StarCategories.length - 1) return;
            this.starNumber++;
            this.checkStarArrows();
        });

        this.starArrowLeft.on('click', () => {
            if (this.starNumber == 0) return;
            this.starNumber--;
            this.checkStarArrows();
        });
    }

    checkStarArrows() {
        let starCategory = StarCategories[this.starNumber];
        this.starText.writeText(starCategory.name)
        this.realPlayer.setCategory(starCategory);
        this.starArrowLeft.show();
        this.starArrowRight.show();
        if (this.starNumber == 0) this.starArrowLeft.hide();
        if (this.starNumber == StarCategories.length - 1) this.starArrowRight.hide();
        this.animateChange(starCategory);
    }

    animAccuracy = 100;
    animateChange(starCategory: StarCategory) {
        this.animation.simple(30, (count, perc) => {
            let easePerc = this.curve.ease(perc);
            let planetPerc = Math.round(starCategory.planets * easePerc * this.animAccuracy) / this.animAccuracy;
            let velocityPerc = Math.round(starCategory.velocity * easePerc * this.animAccuracy) / this.animAccuracy;
            let gravityPerc = Math.round(starCategory.gravity * easePerc * this.animAccuracy) / this.animAccuracy;
            this.planetText.setText('Planets: ' + planetPerc);
            this.planetBar.setWidth(planetPerc * 20);
            this.velocityText.setText('Velocity: ' + velocityPerc);
            this.velocityBar.setWidth(velocityPerc * 50);
            this.gravityText.setText('Gravity: ' + gravityPerc);
            this.gravityBar.setWidth(gravityPerc * 50);
        });
    }

    playerLayout: ui_group;
    planetText: ui_text;
    planetBar: ui_back;
    velocityText: ui_text;
    velocityBar: ui_back;
    gravityText: ui_text;
    gravityBar: ui_back;
    addPlayerLayout() {
        this.playerLayout = new ui_control(this.system, { x: 0, y: 130 }, { width: 300, height: 100 }, { zIndex: 100 });
        this.planetText = this.playerLayout.addText('', { x: 0, y: -30 }, { fontSize: 20, color: colormain, float: 'left' });
        this.planetBar = this.playerLayout.addBack({ x: 0, y: -30 }, { height: 15, width: 20, color: colormain, float: 'right' });
        this.velocityText = this.playerLayout.addText('', { x: 0, y: 0 }, { fontSize: 20, color: colormain, float: 'left' });
        this.velocityBar = this.playerLayout.addBack({ x: 0, y: 0 }, { height: 15, width: 20, color: colormain, float: 'right' });
        this.gravityText = this.playerLayout.addText('', { x: 0, y: 30 }, { fontSize: 20, color: colormain, float: 'left' });
        this.gravityBar = this.playerLayout.addBack({ x: 0, y: 30 }, { height: 15, width: 20, color: colormain, float: 'right' });
    }

    nebulaUI: ui_group;
    nebulaNames = ['Eagle', 'Dumbbell', 'Orion', 'Trifid', 'Helix', 'Tarantula'];
    nebulaText: ui_text;
    nebulaNumber = 0;
    nebulaArrowLeft: ui_arrow;
    nebulaArrowRight: ui_arrow;
    addNebulaChoice() {
        this.nebulaUI = new ui_control(this.system, { x: 0, y: -150 }, { width: 300, height: 200 }, { zIndex: 100 });
        // this.nebulaUI.setScreenPosition({ left: 0, bottom: 0 });
        let title = this.nebulaUI.addText('Choose Nebula', { x: 0, y: -60 }, { fontSize: 25, color: colormain });
        this.nebulaText = this.nebulaUI.addText('Eagle', { x: 0, y: 0 }, { fontSize: 25, color: colormain });
        this.nebulaArrowRight = this.nebulaUI.addArrow({ x: 100, y: 0 }, { orientation: 'right' });
        this.nebulaArrowLeft = this.nebulaUI.addArrow({ x: -100, y: 0 }, { orientation: 'left' });
        this.nebulaArrowRight.setColor(colormain);
        this.nebulaArrowLeft.setColor(colormain);

        this.nebulaArrowRight.on('click', () => {
            if (this.nebulaNumber == 5) return;
            this.nebulaNumber++;
            this.checkNebulaArrows();
        });

        this.nebulaArrowLeft.on('click', () => {
            if (this.nebulaNumber == 0) return;
            this.nebulaNumber--;
            this.checkNebulaArrows();
        });
    }

    checkNebulaArrows() {
        this.system.setSky(this.nebulaNumber + 1);
        this.nebulaText.writeText(this.nebulaNames[this.nebulaNumber], 20);
        this.nebulaArrowLeft.show();
        this.nebulaArrowRight.show();
        if (this.nebulaNumber == 0) this.nebulaArrowLeft.hide();
        if (this.nebulaNumber == 5) this.nebulaArrowRight.hide();
    }

    startOnline: ui_button;
    startLocal: ui_button;
    onStart: Function;
    addStartButton() {
        this.startOnline = new ui_button(this.system, this.system.advancedTexture, { ui: 'text', text: 'Play online' }, { x: -110, y: 250 }, { width: 180, height: 40 }, { color: '#000', background: colormain, fontSize: 20 });
        this.startOnline.on('click', () => {
            this.onStart('online');
        });
        this.startOnline._setStyle({ zIndex: 100 });

        this.startLocal = new ui_button(this.system, this.system.advancedTexture, { ui: 'text', text: 'Play against AI' }, { x: 0, y: 250 }, { width: 180, height: 40 }, { color: '#000', background: colormain, fontSize: 20 });
        this.startLocal.on('click', () => {
            this.onStart('local');
        });
        this.startLocal._setStyle({ zIndex: 100 });
    }

    show() {
        this.starUI.showAll();
        this.nebulaUI.showAll();
        this.playerLayout.showAll();
        this.startOnline.hide();
        this.startLocal.show();
        this.realPlayer.setSize(1);
        this.realPlayer.setPosition(new Vector2(0, 0));
        this.checkStarArrows();
        this.checkNebulaArrows();
    }

    hide() {
        this.starUI.hideAll();
        this.nebulaUI.hideAll();
        this.playerLayout.hideAll();
        this.startOnline.hide();
        this.startLocal.hide();
    }
}
