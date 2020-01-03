
import { SystemUI } from './System/systemUI'
import { Animation } from './System/animation'
import { GravityField } from './System/gravityField';
import { PlanetField } from './System/planetField';
import { IAPlayer } from './Player/iaPlayer';
import { RealPlayer } from './Player/realPlayer';
import { BlackHole } from './Entity/blackHole';
import { ui_group, ui_panel, ui_control } from './Ui/group';
import { Vector2 } from '@babylonjs/core/Maths/math';


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
        this.addIntro();
        this.addDesignChoice();
        this.showIntro();

        this.realPlayer.onDied = () =>{
            this.showIntro();
        };
    }

    introUi: ui_group;
    addIntro() {
        this.introUi = new ui_control(this.system, {x: 0, y: 0}, { width: 300, height: 300 }, { zIndex: 100 });
        let text = this.introUi.addText('Select your Sun', { x: 0, y: -100 }, { fontSize: 25, color: '#FF2266' });
        let arrow1 = this.introUi.addArrow({ x: 100, y: 0 }, { orientation: 'right' });
        let arrow2 = this.introUi.addArrow({ x: -100, y: 0 }, { orientation: 'left' });
        arrow1.setColor('#FF2266');
        arrow2.setColor('#FF2266');

        arrow1.on('click', () => {
            this.realPlayer.setTemperature(this.realPlayer.temperature + 1000);
        });

        arrow2.on('click', () => {
            this.realPlayer.setTemperature(this.realPlayer.temperature - 1000);
        });

        let button = this.introUi.addButton({ ui: 'text', text: 'Start' }, { x: 0, y: 100 }, { width: 200, height: 40 }, { color: '#000', background: '#FF2266', fontSize: 20 });
        button.on('click', () => {
            this.startGame();
        });
    }

    colorUi: ui_group;
    addDesignChoice() {
        this.colorUi = new ui_control(this.system, {x: 0, y: -200}, {width: 300, height: 300});
        // this.colorUi.setScreenPosition({ left: 0, bottom: 0 });
        let text = this.colorUi.addText('Choose Nebula', { x: 0, y: -100 }, { fontSize: 25, color: '#FF2266' });
        let arrow1 = this.colorUi.addArrow({ x: 100, y: 0 }, { orientation: 'right' });
        let arrow2 = this.colorUi.addArrow({ x: -100, y: 0 }, { orientation: 'left' });
        arrow1.setColor('#FF2266');
        arrow2.setColor('#FF2266');

        let skyNumber = 1;
        arrow1.on('click', () => {
            if (skyNumber < 6) skyNumber++;
            this.system.setSky(skyNumber);
        });

        arrow2.on('click', () => {
            if (skyNumber > 1) skyNumber--;
            this.system.setSky(skyNumber);
        });
    }

    showIntro() {
        this.introUi.showAll();
        this.realPlayer.setSize(1);
        this.realPlayer.setPosition(new Vector2(0, 0));
    }

    hideIntro() {
        this.introUi.hideAll();
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
