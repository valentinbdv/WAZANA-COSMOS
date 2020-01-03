
import { SystemUI } from './System/systemUI'
import { Animation } from './System/animation'
import { GravityField } from './System/gravityField';
import { PlanetField } from './System/planetField';
import { IAPlayer } from './Player/iaPlayer';
import { StarCategories } from './Player/player';
import { RealPlayer } from './Player/realPlayer';
import { BlackHole } from './Entity/blackHole';
import { ui_group, ui_panel, ui_control } from './Ui/group';
import { Vector2 } from '@babylonjs/core/Maths/math';
import { ui_arrow, ui_button } from './Ui/effect';
import { ui_text } from './Ui/node';


// Fade in et clignote dust / planet
// Gravité impacte autre étoile et de plus en plus de particle
export interface GameInterface {
    canvas?: HTMLCanvasElement,
}

export class GameEngine {

    system: SystemUI;
    animation: Animation;
    gravityField: GravityField;
    planetField: PlanetField;
    realPlayer: RealPlayer;

    constructor(starOptions: GameInterface) {
        this.system = new SystemUI(starOptions.canvas);
        this.system.optimize();
        this.gravityField = new GravityField(this.system);
        this.planetField = new PlanetField(this.system, this.gravityField);
        this.planetField.checkPlayerAndRessources(false);
        this.realPlayer = new RealPlayer(this.system, this.gravityField);
        this.realPlayer.setMoving(false);
        this.realPlayer.setCategory(StarCategories[0]);
        this.planetField.addPlayer(this.realPlayer);
        this.planetField.setPlayerToFollow(this.realPlayer);
        
        this.system.setSky(1);
        // Keep that for test purpose
        // let black = new BlackHole(this.system, this.gravityField, { position: { x: 0, z: 0, y: 0 }, size: 1 });
        // this.planetField.addBlackHole(black)

        // this.system.addSlider(3000, 30000, (value) => {
        //     player.setTemperature(value);
        // });

        // this.system.addSlider(0.2, 1, (value) => {
        //     player.setSize(value);
        // });

        this.system.launchRender();
        this.addNebulaChoice();
        this.addStarChoice();
        this.addStarCategory();
        this.addStartButton();
        this.checkStarArrows();
        this.checkNebulaArrows();
        
        this.showIntro();
        this.realPlayer.onDied = () =>{
            this.showIntro();
        };
    }

    starUI: ui_group;
    starNumber = 0;
    starText: ui_text;
    starArrowLeft: ui_arrow;
    starArrowRight: ui_arrow;
    addStarChoice() {
        this.starUI = new ui_control(this.system, {x: 0, y: 0}, { width: 300, height: 200 }, { zIndex: 100 });
        let title = this.starUI.addText('Select your Sun', { x: 0, y: -60 }, { fontSize: 25, color: '#FF2266' });
        this.starText = this.starUI.addText(StarCategories[0].name, { x: 0, y: 60 }, { fontSize: 25, color: '#FF2266' });
        this.starArrowRight = this.starUI.addArrow({ x: 100, y: 0 }, { orientation: 'right' });
        this.starArrowLeft = this.starUI.addArrow({ x: -100, y: 0 }, { orientation: 'left' });
        this.starArrowRight.setColor('#FF2266');
        this.starArrowLeft.setColor('#FF2266');

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
    }

    starCategory: ui_group;
    planetText: ui_text;
    velocityText: ui_text;
    addStarCategory() {
        this.starCategory = new ui_control(this.system, { x: 0, y: 120 }, { width: 300, height: 100 }, { zIndex: 100 });
        this.planetText = this.starCategory.addText('', { x: 0, y: -15 }, { fontSize: 20, color: '#FF2266' });
        this.velocityText = this.starCategory.addText('', { x: 0, y: 15 }, { fontSize: 20, color: '#FF2266' });
    }

    nebulaUI: ui_group;
    nebulaNames = ['Eagle', 'Dumbbell', 'Orion', 'Trifid', 'Helix', 'Tarantula'];
    nebulaText: ui_text;
    nebulaNumber = 1;
    nebulaArrowLeft: ui_arrow;
    nebulaArrowRight: ui_arrow;
    addNebulaChoice() {
        this.nebulaUI = new ui_control(this.system, { x: 0, y: -200 }, { width: 300, height: 200 }, { zIndex: 100 });
        // this.nebulaUI.setScreenPosition({ left: 0, bottom: 0 });
        let title = this.nebulaUI.addText('Choose Nebula', { x: 0, y: -60 }, { fontSize: 25, color: '#FF2266' });
        this.nebulaText = this.nebulaUI.addText('Eagle', { x: 0, y: 0 }, { fontSize: 25, color: '#FF2266' });
        this.nebulaArrowRight = this.nebulaUI.addArrow({ x: 100, y: 0 }, { orientation: 'right' });
        this.nebulaArrowLeft = this.nebulaUI.addArrow({ x: -100, y: 0 }, { orientation: 'left' });
        this.nebulaArrowRight.setColor('#FF2266');
        this.nebulaArrowLeft.setColor('#FF2266');

        this.nebulaArrowRight.on('click', () => {
            if (this.nebulaNumber == 6) return;
            this.nebulaNumber++;
            this.checkNebulaArrows();
        });

        this.nebulaArrowLeft.on('click', () => {
            if (this.nebulaNumber == 1) return;
            this.nebulaNumber--;
            this.checkNebulaArrows();
        });
    }

    checkNebulaArrows() {
        this.system.setSky(this.nebulaNumber);
        this.nebulaText.writeText(this.nebulaNames[this.nebulaNumber - 1], 20);
        this.nebulaArrowLeft.show();
        this.nebulaArrowRight.show();
        if (this.nebulaNumber == 1) this.nebulaArrowLeft.hide();
        if (this.nebulaNumber == 6) this.nebulaArrowRight.hide();
    }

    addStartButton() {
        let button = new ui_button(this.system, this.system.advancedTexture, { ui: 'text', text: 'Start' }, { x: 0, y: 250 }, { width: 200, height: 40 }, { color: '#000', background: '#FF2266', fontSize: 20 });
        button.on('click', () => {
            this.startGame();
        });
    }

    showIntro() {
        this.starUI.showAll();
        this.nebulaUI.showAll();
        this.realPlayer.setSize(1);
        this.realPlayer.setPosition(new Vector2(0, 0));
    }

    hideIntro() {
        this.starUI.hideAll();
        this.nebulaUI.hideAll();
    }

    stopGame() {
        this.showIntro();
        this.realPlayer.setMoving(false);
        this.planetField.checkPlayerAndRessources(false);
    }

    startGame() {
        this.hideIntro();
        this.realPlayer.setMoving(true);
        this.planetField.checkPlayerAndRessources(true);
        let ia1 = new IAPlayer(this.system, this.gravityField);
        this.planetField.addPlayer(ia1);
        ia1.setSize(2);
        ia1.setPosition(new Vector2(10, 10));
        ia1.setTemperature(25000);
    }
}

new GameEngine({canvas: document.getElementById('gameCanvas')});
