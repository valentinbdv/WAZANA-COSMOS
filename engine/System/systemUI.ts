
import { System } from './system';
import { AdvancedDynamicTexture } from '@babylonjs/gui/2D/AdvancedDynamicTexture';
import { Control } from '@babylonjs/gui/2D/controls/control';
import { StackPanel } from '@babylonjs/gui/2D/controls/stackPanel';
import { TextBlock } from '@babylonjs/gui/2D/controls/textBlock';
import { Slider } from '@babylonjs/gui/2D/controls/sliders/slider';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export class SystemUI extends System {

    advancedTexture: AdvancedDynamicTexture;
    panel: StackPanel;

    /**
     * Creates a new System
     * @param canvas Element where the scene will be drawn
     */

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene);

        // this.panel = new StackPanel();
        // this.panel.width = "220px";
        // this.panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        // this.panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        // this.advancedTexture.addControl(this.panel);
    }

    // addSlider(min: number, max: number, callback:Function) {
    //     var header = new TextBlock();
    //     header.text = "Y-rotation: 0 deg";
    //     header.height = "30px";
    //     header.color = "white";
    //     this.panel.addControl(header);

    //     var slider = new Slider();
    //     slider.minimum = min;
    //     slider.maximum = max;
    //     slider.value = 0;
    //     slider.height = "20px";
    //     slider.width = "200px";
    //     slider.onValueChangedObservable.add(function (value) {
    //         header.text = "temperature: " + Math.round(value) + "  Celsius";
    //         callback(value);
    //     });
    //     this.panel.addControl(slider);    
    // }
}