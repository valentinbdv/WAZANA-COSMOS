import { UiSystem } from '../System/uiSystem'
import { Animation } from '../System/animation'
import { Player } from '../Player/player';
import { minSize, maxSize } from '../Entity/star';
import { RealPlayer } from '../Player/realPlayer';
import { ui_group, ui_panel, ui_control } from './group';
import { ui_text, ui_bar, ui_back } from './node';
import { colormain } from './color';
import { TileMap } from '../Map/tileMap';
import { MinimapUI } from './minimap';

import orderBy from 'lodash/orderBy';
import { EasingFunction, CircleEase } from '@babylonjs/core/Animations/easing';

export class PlayUI extends MinimapUI {

    system: UiSystem;
    animation: Animation;
    realPlayer: RealPlayer;
    tileMap: TileMap;
    fontSize = 20;
    showAnimation: Animation;
    shineAnimation: Animation;
    checkAnimation: Animation;
    curve: EasingFunction;

    constructor(system: UiSystem, realPlayer: RealPlayer, tileMap: TileMap) {
        super(system, realPlayer, tileMap);
        this.system = system;
        this.realPlayer = realPlayer;
        this.tileMap = tileMap;
        this.showAnimation = new Animation(system.animationManager);
        this.shineAnimation = new Animation(system.animationManager);
        this.checkAnimation = new Animation(system.animationManager);
        this.curve = new CircleEase();

        this.addPlayerStat();
        // this.addPlayerList();
        this.hide();
    }

    statLayout: ui_control;
    sizeText: ui_text;
    rankText: ui_text;
    sizePorgress: ui_back;
    width = 200;
    addPlayerStat() {
        this.statLayout = new ui_control(this.system, { x: 0, y: 0 }, { width: this.width, height: 80 });
        this.statLayout.setScreenPosition({ left: this.screenMargin, bottom: this.screenMargin })
        this.statLayout.addBack({ x: 0, y: 30 }, { color: colormain, width: this.width, height: 20, float: 'left', opacity: 0.3 });
        this.sizePorgress = this.statLayout.addBack({ x: 0, y: 30 }, { color: colormain, width: this.width, height: 20, float: 'left' });
        this.sizeText = this.statLayout.addText('Your size: 2', { x: 0, y: 0 }, { fontSize: this.fontSize, color: colormain, background: colormain, float: 'left' });
        this.sizeText.setBackgroundOpacity(0);
        this.rankText = this.statLayout.addText('Rank: 5/100', { x: 0, y: -30 }, { fontSize: this.fontSize, color: colormain, float: 'left' });
    }

    listLayout: ui_group;
    player1: ui_text;
    player2: ui_text;
    player3: ui_text;
    player4: ui_text;
    player5: ui_text;
    addPlayerList() {
        this.listLayout = new ui_panel(this.system, {top: this.screenMargin, right: this.screenMargin}, { width: 250, height: 200 });
        this.listLayout.addText('Winners', { x: 0, y: -100 }, { fontSize: this.fontSize, color: colormain });
        this.player1 = this.listLayout.addText('', { x: 0, y: 60 }, { fontSize: this.fontSize, color: colormain, float: 'left' });
        this.player2 = this.listLayout.addText('', { x: 0, y: 80 }, { fontSize: this.fontSize, color: colormain, float: 'left' });
        this.player3 = this.listLayout.addText('', { x: 0, y: 100 }, { fontSize: this.fontSize, color: colormain, float: 'left' });
        this.player4 = this.listLayout.addText('', { x: 0, y: 120 }, { fontSize: this.fontSize, color: colormain, float: 'left' });
        this.player5 = this.listLayout.addText('', { x: 0, y: 140 }, { fontSize: this.fontSize, color: colormain, float:'left' });
    }

    getRanks(): Array<Player> {
        let playerArray = [];
        for (const key in this.tileMap.players) {
            if (this.tileMap.players.hasOwnProperty(key)) {
                const player = this.tileMap.players[key];
                playerArray.push(player);
            }
        }
        let ranks = orderBy(playerArray, ['size'], ['desc'] );
        return ranks;
    }

    totalPlayers = 500;
    checkRanks() {
        // let ranks = this.getRanks();
        // let playerIndex = ranks.indexOf(this.realPlayer) + 1;
        // let perc = playerIndex/ranks.length;
        // let fakePlayerIndex = Math.round(perc * this.totalPlayers)
        let perc = (this.realPlayer.size - minSize) / (maxSize - minSize);
        
        // perc = Math.pow(perc, 0.8);
        let fakePlayerIndex = Math.round((1 - perc) * this.totalPlayers);
        this.rankText.setText('Your rank :' + fakePlayerIndex + '/' + this.totalPlayers);
        // this.player1.setText('#1  ' + ranks[0].key);
        // if (ranks[1]) this.player2.setText('#2 ' + ranks[1].key);
        // if (ranks[2]) this.player3.setText('#3 ' + ranks[2].key);
        // if (ranks[3]) this.player4.setText('#4 ' + ranks[3].key);
        // if (ranks[4]) this.player5.setText('#5 ' + ranks[4].key);
    }

    currentWidth = 0;
    currentSize = 0;
    checkPlayerSize() {
        let plSize = this.realPlayer.size;
        let sizeAdjusted = Math.max((plSize - minSize) * 10, 0);
        let playerSize = Math.floor(sizeAdjusted);
        this.sizeText.setText('Your size: ' + (playerSize + 1).toString());
        let width = Math.round((sizeAdjusted - playerSize) * this.width);
        if (width != this.currentWidth) { 
            this.sizePorgress.setWidth(width);
            this.currentWidth = width;
        }
        if (playerSize != this.currentSize) {
            this.shinePlayerSize();
            if (playerSize > this.currentSize) this.system.soundManager.play('levelUp');
            else this.system.soundManager.play('levelDown');
            this.sizePorgress.setWidth(width);
            this.currentSize = playerSize;
        }
    }

    shinePlayerSize() {
        this.shineAnimation.simple(50, (count, perc) => {
            let easePerc = this.curve.ease(perc);
            let opacity = Math.min(easePerc, 1 - easePerc) * 2;
            this.sizeText.setBackgroundOpacity(opacity);
        }, () => {
            this.sizeText.setBackgroundOpacity(0);
        });
    }

    show() {
        // this.listLayout.show();
        this.statLayout.show();
        this.minimapLayout.show();
        this.setRealPlayerIcon();
        this.totalPlayers = Math.round(Math.random() * 50 + 450);

        this.checkAnimation.infinite((count, perc) => {
            this.checkRanks();
            this.checkPlayerSize();
            this.checkMap();
        });
    }

    hideAnim(callback?: Function) {
        this.checkAnimation.stop();
        this.setLayerChangeAnim(0);
        this.showAnimation.simple(50, (count, perc) => {
            this.setLayerChangeAnim(perc);
        }, () => {
            this.setLayerChangeAnim(1);
            this.minimapLayout.hideAll();
            this.statLayout.hideAll();
            // this.listLayout.hideAll();
            this.hide();
            if (callback) callback();
        });
    }

    hide() {
        this.checkAnimation.stop();
        // this.listLayout.hide();
        this.statLayout.hide();
        this.minimapLayout.hide();
    }

    showAnim(callback?: Function) {
        this.setLayerChangeAnim(1);
        this.show();
        this.showAnimation.simple(50, (count, perc) => {
            this.setLayerChangeAnim(1 - perc);
        }, () => {
            if (callback) callback();
            this.setLayerChangeAnim(0);
        });
        this.minimapLayout.showAll();
        this.statLayout.showAll();
        // this.listLayout.showAll();
    }

    setLayerChangeAnim(perc) {
        let opacity = 1 - perc;
        let easePerc = this.curve.ease(perc);
        this.minimapLayout.setOpacity(opacity);
        this.minimapLayout.setScreenPosition({ right: easePerc * 100 + this.screenMargin, bottom: this.screenMargin });

        this.statLayout.setOpacity(opacity);
        this.statLayout.setScreenPosition({ left: easePerc * 100 + this.screenMargin, bottom: this.screenMargin });

        // this.listLayout.setOpacity(opacity);
        // this.listLayout.setScreenPosition({ right: easePerc * 100 + this.screenMargin, top: this.screenMargin });
    }

}
