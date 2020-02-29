import { SystemUI } from './System/systemUI'
import { Animation } from './System/animation'
import { GravityGrid } from './System/GravityGrid';
import { StarCategories } from './Entity/star';
import { RealPlayer } from './Player/realPlayer';
import { Vector2 } from '@babylonjs/core/Maths/math';
import { IntroUI } from './Ui/intro';
import { PlayUI } from './Ui/play';
import { Player } from "./player/player";
import { onlineMap } from './Map/onlineMap';
import { LocalMap } from './Map/localMap';
import { TileMap } from './Map/tileMap';

// Pouvoir utiliser les flèches plutôt que la souris
// Minimap

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
    tileMap: TileMap;
    localMap: LocalMap;
    realPlayer: RealPlayer;
    introUI: IntroUI;
    playUI: PlayUI;
    onlineMap: onlineMap;

    constructor(gameOptions: GameInterface) {
        this.system = new SystemUI(gameOptions.canvas);
        this.system.optimize();

        this.gravityGrid = new GravityGrid(this.system);
        this.tileMap = new TileMap(this.system, this.gravityGrid);
        this.localMap = new LocalMap(this.system, this.gravityGrid, this.tileMap);
        this.onlineMap = new onlineMap(this.tileMap);
        this.onlineMap.onLeave = () => {
            this.stopGame();
        }

        this.realPlayer = new RealPlayer(this.system, this.gravityGrid, this.onlineMap);
        this.realPlayer.setMoving(false);
        this.realPlayer.setCategory(StarCategories[0]);
        this.realPlayer.onDied = () => {
            this.stopGame();
        };

        this.tileMap.setPlayerToFollow(this.realPlayer);
        
        this.system.setSky(1);
        this.system.launchRender();

        this.introUI = new IntroUI(this.system, this.realPlayer);
        this.introUI.onStart = (mode: 'local' | 'online') => {
            if (mode == 'online') this.joinGameServer();
            else this.joinGameLocal();
        };

        this.system.scene.freezeActiveMeshes();
        
        this.playUI = new PlayUI(this.system, this.realPlayer);
    }

    stopGame() {
        this.introUI.show();
        this.playUI.hide();
        this.tileMap.checkPlayerAndRessources(false);
        this.localMap.eraseAllIas();
        this.tileMap.eraseAllEntity();
        this.realPlayer.dispose();
    }

    startGame() {
        this.system.checkActiveMeshes();
        this.introUI.hide();
        this.playUI.show();

        this.realPlayer.setMoving(true);
        this.realPlayer.removeAllPlanets();

        // In order to test reset games
        // setTimeout(() => {
        //     this.stopGame();
        // }, 3000);
    }
    
    joinGameLocal() {
        this.startGame();
        this.tileMap.checkPlayerAndRessources(true);
        this.tileMap.addPlayer(this.realPlayer);
    }
    
    joinGameServer() {
        this.onlineMap.join((newRoom) => {
            this.startGame();
            this.tileMap.checkPlayerAndRessources(true);
            this.realPlayer.key = this.onlineMap.sessionId;
            this.tileMap.addPlayer(this.realPlayer);
        });
    }
}

new GameEngine({canvas: document.getElementById('gameCanvas')});
