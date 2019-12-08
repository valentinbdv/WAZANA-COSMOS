
import { SystemUI } from './System/systemUI'
import { Animation } from './System/animation'
import { GravityField } from './System/gravityField';
import { Player } from './Player/player';
import { Star } from './Entity/polystar'

export interface GameInterface {
    canvas?: HTMLCanvasElement,
}

export class GameEngine {

    system: SystemUI;
    animation: Animation;
    gravityField: GravityField;

    constructor(starOptions: GameInterface) {
        this.system = new SystemUI(starOptions.canvas);
        this.gravityField = new GravityField(this.system);
        let player = new Player(this.system, this.gravityField);

        let star1 = new Star(this.system, { temperature: 5000, size: 0.5, position: { x: 0, y: 0, z: -5 } });
        let star2 = new Star(this.system, { temperature: 5000, size: 0.5, position: { x: 0, y: 0, z: 5 } });

        // this.animation = new Animation(this.system.animationManager);
        // this.animation.infinite(() => {
        // });

        this.system.addSlider(3000, 30000, (value) => {
            player.star.setTemperature(value);
        });

        this.system.addSlider(0.2, 1, (value) => {
            player.star.setSize(value);
        });


        this.system.launchRender();
    }
}

new GameEngine({canvas: document.getElementById('gameCanvas')});
