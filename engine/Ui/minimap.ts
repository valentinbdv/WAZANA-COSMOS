import { UiSystem } from '../System/uiSystem'
import { Animation } from '../System/animation'
import { Player } from '../Player/player';
import { RealPlayer } from '../Player/realPlayer';
import { ui_panel } from './group';
import { ui_text, ui_node } from './node';
import { colormain } from './color';
import { TileMap } from '../Map/tileMap';
import { starMapDistance } from '../Entity/star';

import { Ellipse } from '@babylonjs/gui/2D/controls/ellipse';
import { Line } from '@babylonjs/gui/2D/controls/line';
import { Color4 } from '@babylonjs/core/Maths/math';

export class MinimapUI {

    system: UiSystem;
    animation: Animation;
    realPlayer: RealPlayer;
    tileMap: TileMap;
    screenMargin = 10;

    constructor(system: UiSystem, realPlayer: RealPlayer, tileMap: TileMap) {
        this.system = system;
        this.realPlayer = realPlayer;
        this.tileMap = tileMap;

        this.addContainer();
        // this.addGridLines();
        this.createAllIcons();
        this.addRealPlayerIcon();
    }

    iconNumber = starMapDistance/2;
    storageIcons: Array<ui_node> = []
    createAllIcons() {
        for (let i = 0; i < this.iconNumber; i++) {
            let icon = new ui_node(this.system);
            icon.container = this.createPlayerIcon(this.otherPlayerColor);
            this.hideIcon(icon);
        }
    }

    iconSize = 5;
    createPlayerIcon(color: Color4): Ellipse {
        let plIcon = new Ellipse();
        plIcon.width = this.iconSize + 'px';
        plIcon.height = this.iconSize + 'px';
        plIcon.thickness = 0;
        // plIcon.background = 'white';
        plIcon.background = 'rgb(' + color.r * 255 + ', ' + color.g * 255 + ', ' + color.b * 255 + ')';
        return plIcon;
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

    mR = 1;
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

    getFreeIcon() {
        let newIcon = this.storageIcons.pop();
        if (newIcon) {
            this.limit.addControl(newIcon.container);
            return newIcon;
        }
    }

    hideIcon(icon:ui_node) {
        this.limit.removeControl(icon.container);
        this.storageIcons.push(icon);
    }

    playersIcons = {};
    otherPlayerColor = new Color4(0.7, 0.7, 0.7, 1);
    checkMap() {
        for (const key in this.tileMap.players) {
            if (this.tileMap.players.hasOwnProperty(key)) {
                const player = this.tileMap.players[key];
                if (!this.playersIcons[key]) this.playersIcons[key] = this.getFreeIcon();
                if (key != this.realPlayer.key) {
                    let pos = this.getIconPosition(player);
                    this.playersIcons[key].setPosition(pos);
                    // let size = Math.pow(player.size * 2, 2);
                    // this.playersIcons[key].setSize({ width: size, height: size}); 
                }
            }
        }
        for (const key in this.playersIcons) {
            if (this.playersIcons.hasOwnProperty(key)) {
                const icon = this.playersIcons[key];
                if (!this.tileMap.players.hasOwnProperty(key)) {
                    this.hideIcon(icon);
                    delete this.playersIcons[key];
                }
            }
        }

        // let pl = this.realPlayer;
        // let size = Math.pow(pl.size * 2, 2);
        // this.playersIcons[pl.key].setSize({ width: size, height: size }); 
    }

    hideAllIcon() {
        for (const key in this.playersIcons) {
            if (this.playersIcons.hasOwnProperty(key)) {
                const icon = this.playersIcons[key];
                this.hideIcon(icon);
                delete this.playersIcons[key];
            }
        }
    }

    setRealPlayerColor() {
        let c = this.realPlayer.color;
        console.log(this.realPlayerIcon.container);
        
        this.realPlayerIcon.container.background = 'rgb(' + c.r * 255 + ', ' + c.g * 255 + ', ' + c.b * 255 + ')';
    }

    realPlayerIcon: ui_node;
    addRealPlayerIcon() {
        let pl = this.realPlayer;
        this.realPlayerIcon = new ui_node(this.system);
        this.realPlayerIcon.container = this.createPlayerIcon(pl.color);
        this.realPlayerIcon.container.width = (this.iconSize + 3) + 'px';
        this.realPlayerIcon.container.height = (this.iconSize + 3) + 'px';
        this.realPlayerIcon.container.zIndex = 10;
        this.limit.addControl(this.realPlayerIcon.container);
    }
}
