import { SystemUI } from '../System/systemUI'
import { Animation } from '../System/animation'
import { StarCategories, StarCategory } from '../Entity/star';
import { RealPlayer } from '../Player/realPlayer';
import { ui_group, ui_control } from './group';
import { Vector2 } from '@babylonjs/core/Maths/math';
import { ui_arrow, ui_button } from './effect';
import { ui_text, ui_back } from './node';
import { colormain } from './color';
import { MinimapUI } from './minimap';

import { IEasingFunction, EasingFunction, CircleEase } from '@babylonjs/core/Animations/easing';

export class IntroUI {
    
    system: SystemUI;
    showAnimation: Animation;
    categoryAnimation: Animation;
    realPlayer: RealPlayer;
    minimap: MinimapUI;
    curve: IEasingFunction;

    constructor(system: SystemUI, realPlayer: RealPlayer, minimap: MinimapUI) {
        this.system = system;
        this.realPlayer = realPlayer;
        this.minimap = minimap;
        this.showAnimation = new Animation(system.animationManager);
        this.categoryAnimation = new Animation(system.animationManager);
        this.curve = new CircleEase();

        this.addNebulaChoice();
        this.addStarChoice();
        this.addPlayerLayout();
        this.addStartButton();

        this.hide();
        setTimeout(() => {
            this.showAnim();
        }, 2000);
    }

    starLayout: ui_group;
    starNumber = 0;
    starText: ui_text;
    starTitle: ui_text;
    starArrowLeft: ui_arrow;
    starArrowRight: ui_arrow;
    addStarChoice() {
        this.starLayout = new ui_control(this.system, {x: 0, y: 0}, { width: 300, height: 200 }, { zIndex: 100 });
        this.starTitle = this.starLayout.addText('Select your Sun', { x: 0, y: -60 }, { fontSize: 25, color: colormain });
        this.starText = this.starLayout.addText(StarCategories[0].name, { x: 0, y: 60 }, { fontSize: 25, color: colormain });
        this.starArrowRight = this.starLayout.addArrow({ x: 100, y: 0 }, { orientation: 'right' });
        this.starArrowLeft = this.starLayout.addArrow({ x: -100, y: 0 }, { orientation: 'left' });
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
        this.realPlayer.setCategory(starCategory, true);
        this.starArrowLeft.show();
        this.starArrowRight.show();
        if (this.starNumber == 0) this.starArrowLeft.hide();
        if (this.starNumber == StarCategories.length - 1) this.starArrowRight.hide();
        this.animateChange(starCategory);
    }

    animAccuracy = 100;
    animateChange(starCategory: StarCategory) {
        this.categoryAnimation.simple(30, (count, perc) => {
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
    playerTop = 130;
    planetText: ui_text;
    planetBar: ui_back;
    velocityText: ui_text;
    velocityBar: ui_back;
    gravityText: ui_text;
    gravityBar: ui_back;
    addPlayerLayout() {
        this.playerLayout = new ui_control(this.system, { x: 0, y: this.playerTop }, { width: 300, height: 100 }, { zIndex: 100 });
        this.planetText = this.playerLayout.addText('', { x: 0, y: -30 }, { fontSize: 20, color: colormain, float: 'left' });
        this.planetBar = this.playerLayout.addBack({ x: 0, y: -30 }, { height: 15, width: 20, color: colormain, float: 'right' });
        this.velocityText = this.playerLayout.addText('', { x: 0, y: 0 }, { fontSize: 20, color: colormain, float: 'left' });
        this.velocityBar = this.playerLayout.addBack({ x: 0, y: 0 }, { height: 15, width: 20, color: colormain, float: 'right' });
        this.gravityText = this.playerLayout.addText('', { x: 0, y: 30 }, { fontSize: 20, color: colormain, float: 'left' });
        this.gravityBar = this.playerLayout.addBack({ x: 0, y: 30 }, { height: 15, width: 20, color: colormain, float: 'right' });
    }

    nebulaLayout: ui_group;
    nebulaNames = {3:'Orion', 1:'Eagle', 2:'Dumbbell', 4:'Trifid', 5:'Helix', 6:'Tarantula'};
    nebulaText: ui_text;
    nebulaNumber = 0;
    nebulaArrowLeft: ui_arrow;
    nebulaArrowRight: ui_arrow;
    nebulaTop = -150;
    addNebulaChoice() {
        this.nebulaLayout = new ui_control(this.system, { x: 0, y: this.nebulaTop }, { width: 300, height: 200 }, { zIndex: 100 });
        // this.nebulaLayout.setScreenPosition({ left: 0, bottom: 0 });
        let title = this.nebulaLayout.addText('Select Nebula', { x: 0, y: -60 }, { fontSize: 25, color: colormain });
        this.nebulaText = this.nebulaLayout.addText('Eagle', { x: 0, y: 0 }, { fontSize: 25, color: colormain });
        this.nebulaArrowRight = this.nebulaLayout.addArrow({ x: 100, y: 0 }, { orientation: 'right' });
        this.nebulaArrowLeft = this.nebulaLayout.addArrow({ x: -100, y: 0 }, { orientation: 'left' });
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
        this.system.setSky(this.nebulaNumber);
        this.minimap.setBackGroundColor(this.system.skyColor);
        this.nebulaText.writeText(this.nebulaNames[this.system.skyDesign], 20);
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

    showAnim(callback?: Function) {
        this.showAnimation.simple(50, (count, perc) => {
            this.setLayerChangeAnim(1 - perc);
        }, () => {
            if (callback) callback();
            this.setLayerChangeAnim(0);
        });
        this.starLayout.showAll();
        this.nebulaLayout.showAll();
        this.playerLayout.showAll();
        this.startOnline.hide();
        this.startLocal.show();
        this.realPlayer.setSize(1);
        this.realPlayer.setPosition(new Vector2(0, 0));
        this.checkNebulaArrows();
        this.checkStarArrows();
    }

    show() {
        this.setLayerChangeAnim(0);
        this.starLayout.showAll();
        this.nebulaLayout.showAll();
        this.playerLayout.showAll();
        this.startOnline.hide();
        this.startLocal.show();
        this.realPlayer.setSize(1);
        this.realPlayer.setPosition(new Vector2(0, 0));
        this.checkStarArrows();
        this.checkNebulaArrows();
    }

    hideAnim(callback?: Function) {
        this.starTitle.hide();
        this.startLocal.hide();
        this.showAnimation.simple(50, (count, perc) => {
            this.setLayerChangeAnim(perc);
        }, () => {
            this.setLayerChangeAnim(1);
            this.starLayout.hideAll();
            this.nebulaLayout.hideAll();
            this.playerLayout.hideAll();
            this.startOnline.hide();
            this.startLocal.hide();
            if (callback) callback();
        });
    }

    hide() {
        this.starTitle.hide();
        this.startLocal.hide();
        this.setLayerChangeAnim(1);
        this.starLayout.hideAll();
        this.nebulaLayout.hideAll();
        this.playerLayout.hideAll();
        this.startOnline.hide();
        this.startLocal.hide();
    }

    setLayerChangeAnim(perc) {
        let opacity = 1 - perc;
        
        let easePerc = this.curve.ease(perc);
        this.starLayout.setOpacity(opacity);
        this.starLayout.setPosition({ x: 0, y: easePerc * 50 });

        this.nebulaLayout.setOpacity(opacity);
        this.nebulaLayout.setPosition({ x: 0, y: this.nebulaTop - easePerc * 50 });

        this.playerLayout.setOpacity(opacity);
        this.playerLayout.setPosition({ x: 0, y: this.playerTop + easePerc * 50 });
        this.startLocal.setOpacity(opacity);
    }
}
