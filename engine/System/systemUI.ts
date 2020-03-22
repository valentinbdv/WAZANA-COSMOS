
import { MeshSystem } from './meshSystem';
import { AdvancedDynamicTexture } from '@babylonjs/gui/2D/AdvancedDynamicTexture';
import { StackPanel } from '@babylonjs/gui/2D/controls/stackPanel';

/**
 * Manage all the essential assets needed to build a 3D scene (Engine, Scene Cameras, etc)
 *
 * The system is really important as it is often sent in every other class created to manage core assets
 */

export class SystemUI extends MeshSystem {

    advancedTexture: AdvancedDynamicTexture;
    panel: StackPanel;
    scalingLevel = 1;

    /**
     * Creates a new System
     * @param canvas Element where the scene will be drawn
     */

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene);
        this.scene.hoverCursor = "pointer";
        // this.engine.setHardwareScalingLevel(0.5);
        // this.scalingLevel = 0.5;

        this.checkScreenSize();
        window.onresize = () => {
            this.checkScreenSize();
        }

        window
    }
    
    checkScreenSize() {
        let width = window.innerWidth;
        let height = window.innerHeight;
        let scale = this.scalingLevel / (width / 2000 + height / 2000);
        this.advancedTexture.scale(scale);
    }

    checkMobile() {
        if (this.checkPlatform()) this.goFullScreen();
    }

    isOnMobile = false;
    checkPlatform() {
        let isMobile = navigator.userAgent.toLowerCase().match(/mobile/i),
            isTablet = navigator.userAgent.toLowerCase().match(/tablet/i),
            isAndroid = navigator.userAgent.toLowerCase().match(/android/i),
            isiPhone = navigator.userAgent.toLowerCase().match(/iphone/i),
            isiPad = navigator.userAgent.toLowerCase().match(/ipad/i);
        if (isMobile || isTablet || isAndroid || isiPhone || isiPad) this.isOnMobile = true;
        else this.isOnMobile = false;
        return this.isOnMobile;
    }

    goFullScreen() {
        // if supported
        if (document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullscreenEnabled || document.msFullscreenEnabled) {
            if (this.canvas.requestFullscreen) this.canvas.requestFullscreen();
            else if (this.canvas.mozRequestFullScreen) this.canvas.mozRequestFullScreen();
            else if (this.canvas.webkitRequestFullscreen) this.canvas.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            else if (this.canvas.msRequestFullscreen) this.canvas.msRequestFullscreen();
        }
    }
}