import { SystemUI } from '../System/systemUI'
import { Animation } from '../System/animation'
import { StarCategories } from '../Entity/star';
import { minSize, Player } from '../Player/player';
import { RealPlayer } from '../Player/realPlayer';
import { ui_group, ui_control, ui_panel } from './group';
import { ui_text } from './node';
import { colormain } from './color';
import { TileMap } from '../Map/tileMap';

import orderBy from 'lodash/orderBy';

export class PlayUI {

    system: SystemUI;
    animation: Animation;
    realPlayer: RealPlayer;
    tileMap: TileMap;
    fontSize = 18;

    constructor(system: SystemUI, realPlayer: RealPlayer, tileMap: TileMap) {
        this.system = system;
        this.realPlayer = realPlayer;
        this.tileMap = tileMap;

        this.addPlayerStat();
        this.addPlayerList();
        // this.addPlayerLayout();
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

    listUI: ui_group;
    player1: ui_text;
    player2: ui_text;
    player3: ui_text;
    player4: ui_text;
    player5: ui_text;
    addPlayerList() {
        this.listUI = new ui_panel(this.system, {top: 10, right: 10}, { width: 200, height: 200 });
        let title = this.listUI.addText('Winners', { x: 0, y: -100 }, { fontSize: this.fontSize, color: colormain });
        this.player1 = this.listUI.addText('', { x: 0, y: 60 }, { fontSize: this.fontSize, color: colormain, float: 'left' });
        this.player2 = this.listUI.addText('', { x: 0, y: 80 }, { fontSize: this.fontSize, color: colormain, float: 'left' });
        this.player3 = this.listUI.addText('', { x: 0, y: 100 }, { fontSize: this.fontSize, color: colormain, float: 'left' });
        this.player4 = this.listUI.addText('', { x: 0, y: 120 }, { fontSize: this.fontSize, color: colormain, float: 'left' });
        this.player5 = this.listUI.addText('', { x: 0, y: 140 }, { fontSize: this.fontSize, color: colormain, float:'left' });
    }

    playerLayout: ui_group;
    planetText: ui_text;
    velocityText: ui_text;
    addPlayerLayout() {
        this.playerLayout = new ui_control(this.system, { x: 0, y: 120 }, { width: 300, height: 100 });
        this.planetText = this.playerLayout.addText('', { x: 0, y: -15 }, { fontSize: this.fontSize, color: colormain });
        this.velocityText = this.playerLayout.addText('', { x: 0, y: 15 }, { fontSize: this.fontSize, color: colormain });
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

    checkRanks() {
        let ranks = this.getRanks();
        let playerIndex = ranks.indexOf(this.realPlayer) + 1;
        this.rankText.setText('Your rank :' + playerIndex + '/' + ranks.length);
        let playerSize = Math.round(Math.pow(this.realPlayer.size - minSize, 2) * 10);
        this.sizeText.setText('Your size: ' + playerSize.toString());
        this.player1.setText('#1  ' + ranks[0].key);
        if (ranks[1]) this.player2.setText('#2 ' + ranks[1].key);
        if (ranks[2]) this.player3.setText('#3 ' + ranks[2].key);
        if (ranks[3]) this.player4.setText('#4 ' + ranks[3].key);
        if (ranks[4]) this.player5.setText('#5 ' + ranks[4].key);
    }

    checkInterval;
    show() {
        this.listUI.show();
        this.statUI.show();
        // this.playerLayout.show();
        this.checkInterval = setInterval(() => {
            this.checkRanks();
        }, 200);
    }

    hide() {
        if (this.checkInterval) clearInterval(this.checkInterval);
        this.listUI.hide();
        this.statUI.hide();
        // this.playerLayout.hide();
    }
}
