import { SystemUI } from './System/systemUI'
import { Animation } from './System/animation'
import { GravityGrid } from './System/GravityGrid';
import { IAPlayer } from './Player/iaPlayer';
import { StarCategories } from './Entity/star';
import { RealPlayer } from './Player/realPlayer';
import { BlackHole } from './Entity/blackHole';
import { Vector2 } from '@babylonjs/core/Maths/math';
import { IntroUI } from './Ui/intro';
import { PlayUI } from './Ui/play';
import { Player } from "./player/player";
import { ServerMap } from './Map/serverMap';
import { LocalMap } from './Map/localMap';

interface State {
    players: Array<Player>;
    blackHoles: Array<Player>;
    planets: Array<Player>;
}
// Fade in et clignote dust / planet
// Gravité impacte autre étoile et de plus en plus de particle
export interface GameInterface {
    canvas?: HTMLCanvasElement,
}

export class GameEngine {

    system: SystemUI;
    animation: Animation;

    gravityGrid: GravityGrid;
    localMap: LocalMap;
    realPlayer: RealPlayer;
    introUI: IntroUI;
    playUI: PlayUI;
    serverMap: ServerMap;

    constructor(gameOptions: GameInterface) {
        this.system = new SystemUI(gameOptions.canvas);
        this.system.optimize();

        this.gravityGrid = new GravityGrid(this.system);
        this.localMap = new LocalMap(this.system, this.gravityGrid);
        this.serverMap = new ServerMap(this.system, this.gravityGrid);
        this.serverMap.onLeave = () => {
            this.stopGame();
        }

        this.realPlayer = new RealPlayer(this.system, this.gravityGrid, this.serverMap);
        this.realPlayer.setMoving(false);
        this.realPlayer.setCategory(StarCategories[0]);
        this.realPlayer.onDied = () => {
            this.introUI.show();
        };

        this.serverMap.setPlayerToFollow(this.realPlayer);
        this.localMap.setPlayerToFollow(this.realPlayer);
        
        this.system.setSky(1);
        this.system.launchRender();

        this.introUI = new IntroUI(this.system, this.realPlayer);
        this.introUI.onStart = () => {
            this.joinGameServer();
            // this.joinGameLocal();
        };

        this.playUI = new PlayUI(this.system, this.realPlayer);
    }

    stopGame() {
        this.introUI.show();
        this.playUI.hide();
        this.realPlayer.setMoving(false);
        this.serverMap.checkPlayerAndRessources(false);
        this.localMap.checkPlayerAndRessources(false);
        this.serverMap.leave();
    }

    startGame() {
        this.introUI.hide();
        this.playUI.show();

        this.realPlayer.setMoving(true);
        this.realPlayer.removeAllPlanets();
    }
    
    joinGameLocal() {
        // this.startGame();
        // this.localMap.checkPlayerAndRessources(true);
        // this.localMap.addPlayer(this.realPlayer);
        // let ia1 = new IAPlayer(this.system, this.gravityGrid);
        // this.localMap.addPlayer(ia1);
        // ia1.setSize(1);
        // ia1.setPosition(new Vector2(50, 50));
        // ia1.setTemperature(25000);
    }
    
    joinGameServer() {
        this.serverMap.join((newRoom) => {
            this.startGame();
            this.serverMap.checkPlayerAndRessources(true);
            this.realPlayer.key = this.serverMap.sessionId;
            this.serverMap.addPlayer(this.realPlayer);
        });
    }
}

new GameEngine({canvas: document.getElementById('gameCanvas')});
