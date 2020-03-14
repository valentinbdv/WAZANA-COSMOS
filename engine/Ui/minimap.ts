import { SystemUI } from '../System/systemUI'
import { Animation } from '../System/animation'
import { Player } from '../Player/player';
import { RealPlayer } from '../Player/realPlayer';
import { ui_panel } from './group';
import { ui_text, ui_node } from './node';
import { colormain } from './color';
import { TileMap } from '../Map/tileMap';

import { Ellipse } from '@babylonjs/gui/2D/controls/ellipse';
import { Line } from '@babylonjs/gui/2D/controls/line';
import { Color4 } from '@babylonjs/core/Maths/math';

export class MinimapUI {

    system: SystemUI;
    animation: Animation;
    realPlayer: RealPlayer;
    tileMap: TileMap;
    screenMargin = 10;

    constructor(system: SystemUI, realPlayer: RealPlayer, tileMap: TileMap) {
        this.system = system;
        this.realPlayer = realPlayer;
        this.tileMap = tileMap;

        this.addContainer();
        // this.addGridLines();
    }

    minimapLayout: ui_panel;
    limit: Ellipse;
    sizeText: ui_text;
    rankText: ui_text;
    limitSize = 100;
    addContainer() {
        this.limit = new Ellipse();
        this.limit.width = (2 * this.limitSize) + 'px';
        this.limit.height = (2 * this.limitSize) + 'px';
        this.limit.color = colormain;
        this.limit.thickness = 1;
        this.minimapLayout = new ui_panel(this.system, { right: this.screenMargin, bottom: this.screenMargin }, { width: 200, height: 200 }, this.limit);
    }

    hLines: Array<Line> = [];
    vLines: Array<Line> = [];
    addGridLines() {
        for (let i = 0; i < 1; i++) {
            let line = this.getLine();
            console.log(line);
            this.hLines.push(line);
        }
    }
    
    getLine(): Line {
        let line = new Line();
        line.lineWidth = 5;
        line.x1 = -10;
        line.y1 = 10;
        line.x2 = 10;
        line.y2 = -10;
        line.color = 'rgba(255, 255, 255, 1)';
        this.limit.addControl(line);
        return line;
    }

    setBackGroundColor(color: Color4) {
        this.limit.background = 'rgb(' + color.r * 255 + ', ' + color.g * 255 + ', ' + color.b * 255 + ')';
    }

    iconSize = 5;
    createPlayerIcon(color: Color4): Ellipse {
        let plIcon = new Ellipse();
        plIcon.width = this.iconSize+'px';
        plIcon.height = this.iconSize+'px';
        plIcon.thickness = 0;
        plIcon.background = 'rgb('+color.r * 255+', '+color.g * 255+', '+color.b * 255+')';
        this.limit.addControl(plIcon);
        return plIcon;
    }

    mR = 0.4;
    getIconPosition(player: Player) {
        let rP = this.realPlayer.position;
        let pos = { y: (player.position.x - rP.x) * this.mR, x: (player.position.y - rP.y) * this.mR };
        let ratio = Math.abs(pos.x / pos.y);
        let maxX = Math.sqrt((Math.pow(this.limitSize - 2, 2) * ratio) / (ratio + 1));
        let maxY = Math.sqrt(Math.pow(this.limitSize - 2, 2) / (ratio + 1));
        let x = Math.sign(pos.x) * Math.min(Math.abs(pos.x), maxX);
        let y = Math.sign(pos.y) * Math.min(Math.abs(pos.y), maxY);
        return {x: x, y: y};
    }

    playersIcons = {};
    checkMap() {
        for (const key in this.tileMap.players) {
            if (this.tileMap.players.hasOwnProperty(key)) {
                const player = this.tileMap.players[key];
                if (!this.playersIcons[key]) {
                    this.playersIcons[key] = new ui_node(this.system);
                    this.playersIcons[key].container = this.createPlayerIcon(player.color);
                }
                if (key != this.realPlayer.key) {
                    let pos = this.getIconPosition(player);
                    this.playersIcons[key].setPosition(pos);
                }
            }
        }
        for (const key in this.playersIcons) {
            if (this.playersIcons.hasOwnProperty(key)) {
                const pl = this.playersIcons[key];
                if (!this.tileMap.players.hasOwnProperty(key)) this.limit.removeControl(pl.container);
            }
        }
    }

    setRealPlayerIcon() {
        let pl = this.realPlayer;
        this.playersIcons[pl.key] = new ui_node(this.system);
        this.playersIcons[pl.key].container = this.createPlayerIcon(pl.color);
        this.playersIcons[pl.key].container.width = (this.iconSize + 3) + 'px';
        this.playersIcons[pl.key].container.height = (this.iconSize + 3) + 'px';
    }
}
