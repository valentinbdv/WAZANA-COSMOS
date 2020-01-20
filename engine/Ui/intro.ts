import { SystemUI } from '../System/systemUI'
import { Animation } from '../System/animation'
import { StarCategories } from '../Player/player';
import { RealPlayer } from '../Player/realPlayer';
import { ui_group, ui_control } from './group';
import { Vector2 } from '@babylonjs/core/Maths/math';
import { ui_arrow, ui_button } from './effect';
import { ui_text } from './node';
import { colormain } from './color';

export class IntroUI {

    system: SystemUI;
    animation: Animation;
    realPlayer: RealPlayer;

    constructor(system: SystemUI, realPlayer: RealPlayer) {
        this.system = system;
        this.realPlayer = realPlayer;

        this.addNebulaChoice();
        this.addStarChoice();
        this.addStarCategory();
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
        this.starText.writeText(StarCategories[this.starNumber].name)
        this.realPlayer.setCategory(StarCategories[this.starNumber]);
        this.starArrowLeft.show();
        this.starArrowRight.show();
        if (this.starNumber == 0) this.starArrowLeft.hide();
        if (this.starNumber == StarCategories.length - 1) this.starArrowRight.hide();
        this.planetText.setText('Planets: ' + StarCategories[this.starNumber].planets);
        this.velocityText.setText('Velocity: ' + StarCategories[this.starNumber].velocity);
        this.gravityText.setText('Gravity Field: ' + StarCategories[this.starNumber].gravity);
    }

    starCategory: ui_group;
    planetText: ui_text;
    velocityText: ui_text;
    gravityText: ui_text;
    addStarCategory() {
        this.starCategory = new ui_control(this.system, { x: 0, y: 130 }, { width: 300, height: 100 }, { zIndex: 100 });
        this.planetText = this.starCategory.addText('', { x: 0, y: -30 }, { fontSize: 20, color: colormain });
        this.velocityText = this.starCategory.addText('', { x: 0, y: 0 }, { fontSize: 20, color: colormain });
        this.gravityText = this.starCategory.addText('', { x: 0, y: 30 }, { fontSize: 20, color: colormain });
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

    startButton: ui_button;
    onStart: Function;
    addStartButton() {
        this.startButton = new ui_button(this.system, this.system.advancedTexture, { ui: 'text', text: 'Start' }, { x: 0, y: 250 }, { width: 200, height: 40 }, { color: '#000', background: colormain, fontSize: 20 });
        this.startButton.on('click', () => {
            this.onStart();
        });
        this.startButton._setStyle({ zIndex: 100 });
    }

    show() {
        this.starUI.showAll();
        this.nebulaUI.showAll();
        this.starCategory.showAll();
        this.startButton.show();
        this.realPlayer.setSize(1);
        this.realPlayer.setPosition(new Vector2(0, 0));
        this.checkStarArrows();
        this.checkNebulaArrows();
    }

    hide() {
        this.starUI.hideAll();
        this.nebulaUI.hideAll();
        this.starCategory.hideAll();
        this.startButton.hide();
    }
}
