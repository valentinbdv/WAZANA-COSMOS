
import { SystemUI } from './System/systemUI'
import { Star } from './Entity/polystar'
import { Animation } from './System/animation'

// export let start = (starOptions: starInterface) => {
// return new GameEngine(starOptions);
// }

export interface GameInterface {
    canvas?: HTMLCanvasElement,
}

export class GameEngine {

    system: SystemUI;
    animation: Animation;
    star: Star;

    constructor(starOptions: GameInterface) {
        this.system = new SystemUI(starOptions.canvas);
        let star1 = new Star(this.system, { temperature: 5000, size: 0.5, position: { x: 0, y: 0, z: -5 } });
        // let star2 = new Star(this.system, { color: [0, 255, 0], size: 1, position: { x: 0, y: 0, z: 0 } });
        // let star3 = new Star(this.system, { color: [0, 0, 255], size: 2, position: { x: 0, y: 0, z: 5 } });
        
        star1.addPlanet();
        star1.addPlanet();
        star1.addPlanet();

        setTimeout(() => {
            star1.shine();
        }, 2000);
        // this.animation = new Animation(this.system.animationManager);
        // this.animation.infinite(() => {
        // });

        this.system.addSlider(3000, 30000, (value) => {
            star1.setTemperature(value);
        });

        this.system.addSlider(0.2, 1, (value) => {
            star1.setSize(value);
        });


        this.system.launchRender();
        }
}

new GameEngine({canvas: document.getElementById('gameCanvas')});
