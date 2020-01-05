
import { SystemUI } from './System/systemUI'
import { Animation } from './System/animation'
import { GravityField } from './System/gravityField';
import { PlanetField } from './System/planetField';
import { IAPlayer } from './Player/iaPlayer';
import { StarCategories } from './Player/player';
import { RealPlayer } from './Player/realPlayer';
import { BlackHole } from './Entity/blackHole';
import { Vector2 } from '@babylonjs/core/Maths/math';
import { IntroUI } from './Ui/intro';
import { PlayUI } from './Ui/play';


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
    introUI: IntroUI;
    playUI: PlayUI;

    constructor(gameOptions: GameInterface) {
        this.system = new SystemUI(gameOptions.canvas);
        this.system.optimize();
        this.gravityField = new GravityField(this.system);
        this.planetField = new PlanetField(this.system, this.gravityField);

        this.realPlayer = new RealPlayer(this.system, this.gravityField);
        this.realPlayer.setMoving(false);
        this.realPlayer.setCategory(StarCategories[0]);
        this.realPlayer.onDied = () => {
            this.introUI.show();
        };
        this.planetField.addPlayer(this.realPlayer);
        this.planetField.setPlayerToFollow(this.realPlayer);
        
        this.system.setSky(1);
        this.system.launchRender();

        this.introUI = new IntroUI(this.system, this.realPlayer);
        this.introUI.onStart = () => {
            this.startGame();
        };

        this.playUI = new PlayUI(this.system, this.realPlayer);
    }

    stopGame() {
        this.introUI.show();
        this.playUI.hide();
        this.realPlayer.setMoving(false);
        this.planetField.checkPlayerAndRessources(false);
    }

    startGame() {
        this.introUI.hide();
        this.playUI.show();
        this.realPlayer.setMoving(true);
        this.planetField.checkPlayerAndRessources(true);
        // let ia1 = new IAPlayer(this.system, this.gravityField);
        // this.planetField.addPlayer(ia1);
        // ia1.setSize(1);
        // ia1.setPosition(new Vector2(50, 50));
        // ia1.setTemperature(25000);
    }
}

new GameEngine({canvas: document.getElementById('gameCanvas')});
