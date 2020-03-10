import { SystemUI } from './System/systemUI'
import { Animation } from './System/animation'
import { GravityGrid } from './System/GravityGrid';
import { StarCategories } from './Entity/star';
import { RealPlayer } from './Player/realPlayer';
import { IntroUI } from './Ui/intro';
import { PlayUI } from './Ui/play';
import { Player } from "./player/player";
import { onlineMap } from './Map/onlineMap';
import { LocalMap } from './Map/localMap';
import { TileMap } from './Map/tileMap';
import { Vector2 } from '@babylonjs/core/Maths/math';

// Fade in et clignote dust / planet
// Gravité impacte autre étoile et de plus en plus de particle
// Replace dds by env
// Improve dive function to reproduce planet attraction effect

interface State {
    players: Array<Player>;
    blackHoles: Array<Player>;
    planets: Array<Player>;
}

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
        this.animation = new Animation(this.system.animationManager);

        this.gravityGrid = new GravityGrid(this.system);
        this.tileMap = new TileMap(this.system, this.gravityGrid);
        this.localMap = new LocalMap(this.system, this.gravityGrid, this.tileMap);
        this.onlineMap = new onlineMap(this.tileMap);
        this.onlineMap.onLeave = () => {
            this.gameOver();
        }

        this.realPlayer = new RealPlayer(this.system, this.gravityGrid, this.onlineMap);
        this.realPlayer.setMoving(false);
        this.realPlayer.hide();
        this.realPlayer.onDied = () => {
            this.gameOver();
        };
        
        this.tileMap.setPlayerToFollow(this.realPlayer);
        
        
        this.playUI = new PlayUI(this.system, this.realPlayer, this.tileMap);
        this.introUI = new IntroUI(this.system, this.realPlayer, this.playUI);
        this.introUI.onStart = (mode: 'local' | 'online') => {
            if (mode == 'online') this.joinGameServer();
            else this.joinGameLocal();
        };
        
        this.system.scene.freezeActiveMeshes();
        
        this.system.launchRender();
        this.system.setSky(0, () => {
            this.realPlayer.setCategory(StarCategories[0], true);
            this.realPlayer.show();
            this.gameStartAnim(() => {
                this.introUI.showAnim();
            });
        });
    }
    
    gameOver() {
        this.realPlayer.fixeCamera(false);
        this.playUI.hideAnim();
        this.gameOverAnim(() => {
            this.localMap.eraseAllIas();
            this.tileMap.eraseAllEntity();
            this.realPlayer.restart();
            this.gameStartAnim(() => {
                this.introUI.showAnim();
            });
        });
        this.tileMap.checkPlayerAndRessources(false);
    }

    gameAnimLength = 100;
    gameOverAnim(callback: Function) {
        this.system.unfreezeMaterials();
        this.animation.simple(this.gameAnimLength, (count, perc) => {
            this.system.ribbonMaterial.reflectionTexture.level = 0.1 * (1 - perc);
            this.system.sceneTexture.level = (1 - perc);
        }, () => {
            this.system.freezeMaterials();
            callback();
        })
    }

    gameStart() {
        this.system.checkActiveMeshes();
        this.introUI.hideAnim(() => {
            this.playUI.showAnim();
        });

        this.realPlayer.setMoving(true);
        this.realPlayer.removeAllPlanets();

        // In order to test
        setTimeout(() => {
            // this.gameOver();
            // let blackHole = this.tileMap.createBlackHole(Vector2.Zero());
        }, 5000);
    }

    gameStartAnim(callback: Function) {
        this.system.unfreezeMaterials();
        this.animation.simple(this.gameAnimLength, (count, perc) => {
            this.system.ribbonMaterial.reflectionTexture.level = 0.1 * (perc);
            this.system.sceneTexture.level = (perc);
        }, () => {
            this.system.freezeMaterials();
            callback();
        })
    }
    
    joinGameLocal() {
        this.gameStart();
        this.tileMap.checkPlayerAndRessources(true);
        this.tileMap.addPlayer(this.realPlayer);
    }
    
    joinGameServer() {
        this.onlineMap.join((newRoom) => {
            this.gameStart();
            this.tileMap.checkPlayerAndRessources(true);
            this.realPlayer.key = this.onlineMap.sessionId;
            this.tileMap.addPlayer(this.realPlayer);
        });
    }
}

new GameEngine({canvas: document.getElementById('gameCanvas')});
