
import { SystemAsset } from './systemAsset';
import { AdvancedDynamicTexture } from '@babylonjs/gui/2D/AdvancedDynamicTexture';
import { StackPanel } from '@babylonjs/gui/2D/controls/stackPanel';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export class SystemUI extends SystemAsset {

    advancedTexture: AdvancedDynamicTexture;
    panel: StackPanel;

    /**
     * Creates a new System
     * @param canvas Element where the scene will be drawn
     */

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene);
        this.scene.hoverCursor = "pointer";
    }
}