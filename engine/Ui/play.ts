import { SystemUI } from '../System/systemUI'
import { Animation } from '../System/animation'
import { StarCategories, minSize } from '../Player/player';
import { RealPlayer } from '../Player/realPlayer';
import { ui_group, ui_control, ui_panel } from './group';
import { ui_text } from './node';
import { colormain } from './color';

export class PlayUI {

    system: SystemUI;
    animation: Animation;
    realPlayer: RealPlayer;
    fontSize = 18;

    constructor(system: SystemUI, realPlayer: RealPlayer) {
        this.system = system;
        this.realPlayer = realPlayer;

        this.addPlayerStat();
        this.addPlayerList();
        // this.addStarCategory();
        this.hide();
    }


    statUI: ui_panel;
    sizeText: ui_text;
    rankText: ui_text;
    addPlayerStat() {
        this.statUI = new ui_panel(this.system, { left: 10, bottom: 10 }, { width: 200, height: 50 });
        this.sizeText = this.statUI.addText('Your size: 2', { x: 0, y: 0 }, { fontSize: this.fontSize, color: colormain, float: 'left' });
        this.rankText = this.statUI.addText('Rank: 5/100', { x: 0, y: 30 }, { fontSize: this.fontSize, color: colormain, float: 'left' });
    }

    setSizeText(size: number) {
        let playerSize = Math.round(Math.pow(size - minSize, 2) * 10);
        this.sizeText.setText('Your size: ' + playerSize.toString());
    }

    listUI: ui_group;
    starText: ui_text;
    addPlayerList() {
        this.listUI = new ui_panel(this.system, {top: 10, right: 10}, { width: 200, height: 200 });
        let title = this.listUI.addText('Winners', { x: 0, y: -100 }, { fontSize: this.fontSize, color: colormain });
        this.starText = this.listUI.addText(StarCategories[0].name, { x: 0, y: 60 }, { fontSize: this.fontSize, color: colormain });
    }

    starCategory: ui_group;
    planetText: ui_text;
    velocityText: ui_text;
    addStarCategory() {
        this.starCategory = new ui_control(this.system, { x: 0, y: 120 }, { width: 300, height: 100 });
        this.planetText = this.starCategory.addText('', { x: 0, y: -15 }, { fontSize: this.fontSize, color: colormain });
        this.velocityText = this.starCategory.addText('', { x: 0, y: 15 }, { fontSize: this.fontSize, color: colormain });
    }

    checkInterval;
    show() {
        this.listUI.show();
        this.statUI.show();
        // this.starCategory.show();
        this.checkInterval = setInterval(() => {
            this.setSizeText(this.realPlayer.size);
        }, 200);
    }

    hide() {
        if (this.checkInterval) clearInterval(this.checkInterval);
        this.listUI.hide();
        this.statUI.hide();
        // this.starCategory.hide();
    }
}
