import { UiSystem } from './System/uiSystem'
import { Animation } from './System/animation'
import { GravityGrid } from './System/GravityGrid';
import { StarCategories } from './Entity/star';
import { RealPlayer } from './Player/realPlayer';
import { PauseUI } from './Ui/pause';
import { PlayUI } from './Ui/play';
import { Player } from "./player/player";
import { startSize } from './Entity/star';
import { onlineMap } from './Map/onlineMap';
import { LocalMap } from './Map/localMap';
import { TileMap } from './Map/tileMap';
import { Vector2 } from '@babylonjs/core/Maths/math';

// import 'https://cosmos.wazana.io/font/style.css';
// import '../asset/icons/style.css';
import { IntroUI } from './Ui/intro';
// import '../asset/meshWriter.js';

// Improve dive function to reproduce planet attraction effect
// Faire étoile filante plutôt que point blanc
// Tableau de récap à la fin
// Create particle in show/hide to avoid creating 100 particleSystem
// Use Saved Star and avoid checkactivemeshes
// Add fog in order to not see white in side
// Add star style to custom and make people pay for it
// Se faire aspirer plus rapidement quand on est au centre
// Garder un peu plus de visttesse quand on est gros.
// Tu deviens une supernova et un trou noir quand tu est trop gros comme ça ça donne un objectif pour continuer à grossir
// Il n'y a plus de planet à un moment donné

interface State {
    players: Array<Player>;
    blackHoles: Array<Player>;
    planets: Array<Player>;
}

export interface GameInterface {
    canvas?: HTMLCanvasElement,
}

export class GameEngine {

    system: UiSystem;
    animation: Animation;

    gravityGrid: GravityGrid;
    tileMap: TileMap;
    localMap: LocalMap;
    realPlayer: RealPlayer;
    pauseUI: PauseUI;
    playUI: PlayUI;
    onlineMap: onlineMap;

    constructor(gameOptions: GameInterface) {
        this.system = new UiSystem(gameOptions.canvas);
        this.system.optimize();
        this.animation = new Animation(this.system.animationManager);

        let test = new IntroUI(this.system);
        test.hideAnim();

        this.gravityGrid = new GravityGrid(this.system);
        this.tileMap = new TileMap(this.system, this.gravityGrid);
        this.localMap = new LocalMap(this.system, this.gravityGrid, this.tileMap);
        this.onlineMap = new onlineMap(this.tileMap);
        this.onlineMap.onLeave = () => {
            this.gameOver();
        }

        this.realPlayer = new RealPlayer(this.system, this.gravityGrid, this.onlineMap);
        this.realPlayer.setMoving(false);
        this.realPlayer.onDied = () => {
            this.gameOver();
        };
        
        this.tileMap.setPlayerToFollow(this.realPlayer);
        this.tileMap.addPlayer(this.realPlayer);

        
        this.playUI = new PlayUI(this.system, this.realPlayer, this.tileMap);
        this.pauseUI = new PauseUI(this.system, this.realPlayer, this.playUI);
        this.pauseUI.onStart = (mode: 'local' | 'online') => {
            if (mode == 'online') this.joinGameServer();
            else this.joinGameLocal();
        };
        
        this.system.scene.freezeActiveMeshes();
        
        this.system.launchRender();
        this.system.setSky(0, () => {
            this.realPlayer.createStar();
            this.realPlayer.setSize(startSize);
            this.realPlayer.show();
            this.realPlayer.setCategory(StarCategories[0], true);
            this.gameStartAnim(() => {
                this.pauseUI.showAnim();
            });
            this.system.soundManager.load();
        });
    }
    
    gameOver() {
        this.playUI.hideAnim();
        this.tileMap.checkPlayerAndRessources(false);
        setTimeout(() => {
            this.gameOverAnim(() => {
                this.system.soundManager.play('dead');
                this.localMap.eraseAllIas();
                this.tileMap.eraseAllEntity();
                this.realPlayer.restart();
                this.gameStartAnim(() => {
                    this.pauseUI.showAnim();
                });
            });
        }, 2000);
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
        this.system.soundManager.play('play');
        this.system.checkMobile();
        this.system.checkActiveMeshes();
        this.pauseUI.hideAnim(() => {
            this.playUI.showAnim();
        });

        this.realPlayer.setMoving(true);
        this.realPlayer.removeAllPlanets();

        // In order to test
        // setTimeout(() => {
        //     this.gameOver();
        //     // let blackHole = this.tileMap.createBlackHole(Vector2.Zero());
        // }, 10000);
    }

    gameStartAnim(callback: Function) {
        this.system.unfreezeMaterials();
        this.animation.simple(this.gameAnimLength, (count, perc) => {
            this.system.ribbonMaterial.reflectionTexture.level = 0.1 * perc;
            this.system.sceneTexture.level = perc;
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
