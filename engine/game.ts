
import { SystemUI } from './System/systemUI'
import { Animation } from './System/animation'
import { GravityField } from './System/gravityField';
import { PlanetField } from './System/planetField';
import { IAPlayer } from './Player/iaPlayer';
import { RealPlayer } from './Player/realPlayer';
import { Vector2 } from '@babylonjs/core/Maths/math';

export interface GameInterface {
    canvas?: HTMLCanvasElement,
}

export class GameEngine {

    system: SystemUI;
    animation: Animation;
    gravityField: GravityField;
    planetField: PlanetField;

    constructor(starOptions: GameInterface) {
        this.system = new SystemUI(starOptions.canvas);
        this.gravityField = new GravityField(this.system);
        this.planetField = new PlanetField(this.system);
        let player = new RealPlayer(this.system, this.gravityField);
        this.planetField.addPlayer(player);
        let ia1 = new IAPlayer(this.system, this.gravityField);
        this.planetField.addPlayer(ia1);
        ia1.setPosition(new Vector2(10, 10));
        ia1.setTemperature(25000);
        // new IAPlayer(this.system, this.gravityField);

        this.system.addSlider(3000, 30000, (value) => {
            player.setTemperature(value);
        });

        this.system.addSlider(0.2, 1, (value) => {
            player.setSize(value);
        });


        this.system.launchRender();
    }
}

new GameEngine({canvas: document.getElementById('gameCanvas')});
