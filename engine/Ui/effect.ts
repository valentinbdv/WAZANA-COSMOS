import { Control } from '@babylonjs/gui/2D/controls/control';

import { ui, ui_node, ui_text, ui_icon, ui_image, ui_back, ui_line, position, style, size, linestyle } from './node';
import { Animation } from '../System/animation';
import { UiSystem } from '../System/uiSystem';

export class ui_anim extends ui_node {

    showAnim() {
        this.show();
    }

    hideAnim() {
        this.hide();
    }

    hoverOpacity = 0.7;
    setHoverAnimation() {
        this.on('enter', () => {
            this.enterAnim();
        });
        this.on('leave', () => {
            this.leaveAnim();
        });
        this.setOpacity(this.hoverOpacity);
    }

    animTime = 5;
    enterAnim() {
        this.anim.simple(this.animTime, (count, perc) => {
            this.setOpacity(this.hoverOpacity + perc * (1 - this.hoverOpacity));
        }, () => {
            this.setOpacity(1);
        });
    }

    leaveAnim() {
        this.anim.simple(this.animTime, (count, perc) => {
            this.setOpacity(1 - perc * (1 - this.hoverOpacity));
        }, () => {
            this.setOpacity(this.hoverOpacity);
        });
    }
}

export interface effectstyle {
    color: string;
    color2: string;
    scale ? : number;
}

export class congrats extends ui_anim {

    leftlist = [];
    rightlist = [];
    layernumber = 6;
    anim: Animation;
    style = { width: 0.02, height: 0.3, opacity: 1, color: '' };
    constructor(system: UiSystem, pos: position, style: effectstyle) {
        super(system);
        let angle = 0;
        if (style.scale) {
            this.style.height *= style.scale;
            this.style.width *= style.scale;
        }
        this.style.color = style.color;
        for (let i = 0; i < this.layernumber; i++) {
            let back1 = new ui_back(system, system.advancedTexture, pos, this.style);
            let back2 = new ui_back(system, system.advancedTexture, pos, this.style);
            back1.setRotation(angle);
            back2.setRotation(angle);
            this.leftlist.push(back1);
            this.rightlist.push(back2);
            angle += 2 * Math.PI / this.layernumber;
        }
        this.animate();
    }

    setColor(color1: string, color2 ? : string) {
        for (let i = 0; i < this.layernumber; i++) {
            this.leftlist[i].setStyle({ background: color1 });
            this.rightlist[i].setStyle({ background: color1 });
        }
        return this;
    }

    animate() {
        let lastcount = 0;
        this.anim.infinite((count, perc) => {
            let addangle = (count - lastcount) / 100;
            for (let i = 0; i < this.layernumber; i++) {
                this.leftlist[i].addRotation(-addangle);
                this.rightlist[i].addRotation(addangle);
            }
            lastcount = count;
        });
    }

    show() {
        for (let i = 0; i < this.layernumber; i++) {
            this.leftlist[i].show();
            this.rightlist[i].show();
        }
        this.animate();
        return this;
    }

    hide() {
        for (let i = 0; i < this.layernumber; i++) {
            this.leftlist[i].hide();
            this.rightlist[i].hide();
        }
        this.anim.stop();
        return this;
    }

    remove() {
        for (let i = 0; i < this.layernumber; i++) {
            this.leftlist[i].remove();
            this.rightlist[i].remove();
        }
        this.anim.stop();
        return this;
    }

}


export interface content {
    ui: 'text' | 'icon' | 'image';
    text: string;
}

export interface buttonstyle {
    color: string;
    background: string;
    fontSize: number;
    blur ? : string;
}

export class ui_button extends ui_anim {
    particles: any;
    ui: ui_node;
    content: content;
    style: buttonstyle;
    position: position;
    anim: Animation;
    float: string;
    container: any;

    constructor(system: UiSystem, texture: Control, content: content, pos: position, size: size, style: buttonstyle) {
        super(system);
        this.content = content;
        this.style = style;
        this.createContainer(texture);
        this.setPosition(pos);
        this.setSize(size);
        this.setContent(content, style);
        this.setStyle(style);
        this.setHoverAnimation();
    }

    setContent(content: content, style: buttonstyle) {
        if (content.ui == 'text') this.ui = new ui_text(this.system, this.container, content.text, { x: 0, y: 0 }, { color: style.color, fontSize: style.fontSize });
        else if (content.ui == 'icon') this.ui = new ui_icon(this.system, this.container, content.text, { x: 0, y: 0 }, { color: style.color, fontSize: style.fontSize });
        else if (content.ui == 'image') this.ui = new ui_image(this.system, this.container, content.text, { x: 0, y: 0 }, { color: style.color, fontSize: style.fontSize });
    }

    setStyle(style: buttonstyle) {
        this.ui._setStyle({ color: style.color, fontSize: style.fontSize });
        this._setStyle({ background: style.background });
        return this;
    }

    setColors(text: string, background: string, blur: string) {
        this.ui.setColor(text);
        this._setStyle({ background: background });
    }

    setText(text: string) {
        this.ui.setText(text);
    }
}

export class ui_border extends ui_anim {

    angle: number;
    mainline: ui_line;
    line1: ui_line;
    line2: ui_line;
    style: linestyle;
    side = 50;
    width: number;

    constructor(system: UiSystem, texture: Control, pos: position, style: linestyle) {
        super(system);
        this.style = style;
        this.width = style.width;
        if (style.side) this.side = style.side;
        this.createContainer(texture);
        this.setPosition(pos);
        this.container.zIndex = 1;
        this.setWidth(style.width);
        if (style.angle) this.setRotation(style.angle);
        this.setHeight(this.side);
        this.setContent(style);
        this.endShow();
        return this;
    }

    mainlineopacity = 0.4;
    setContent(style: linestyle) {
        this.mainline = new ui_line(this.system, this.container, { x: 0, y: 0 }, { border: style.border, width: style.width, opacity: this.mainlineopacity });
        this.line1 = new ui_line(this.system, this.container, { x: (-style.width + this.side) / 2, y: 0 }, { border: style.border, width: this.side, opacity: 1 });
        this.line2 = new ui_line(this.system, this.container, { x: (style.width - this.side) / 2, y: 0 }, { border: style.border, width: this.side, opacity: 1 });
        if (style.color) this.setColor(style.color);
    }

    showAnim() {
        this.mainline.setWidth(0);
        this.show();
        this.anim.simple(10, (cout, perc) => {
            this.mainline.setWidth(perc * this.width);
            this.mainline.setOpacity(1 - perc * (1 - this.mainlineopacity));
            this.line1.setWidth(perc * this.side);
            // this.line1.setRotation((1 - perc)*Math.PI/2);
            this.line2.setWidth(perc * this.side);
            // this.line2.setRotation((1 - perc)*Math.PI/2);
        }, () => {
            this.endShow();
        });
        return this;
    }

    endShow() {
        this.mainline.setWidth(this.width);
        this.mainline.setOpacity(this.mainlineopacity);
        this.line1.setWidth(this.side);
        // this.line1.setRotation(0);
        this.line2.setWidth(this.side);
        // this.line2.setRotation(0);
    }

    hideAnim() {
        this.mainline.setWidth(this.width);
        this.anim.simple(10, (cout, perc) => {
            let percinv = 1 - perc;
            this.mainline.setWidth(percinv * this.width);
            this.mainline.setOpacity(this.mainlineopacity + perc * (1 - this.mainlineopacity));
            this.line1.setWidth(percinv * this.height);
            // this.line1.setRotation(perc*Math.PI/2);
            this.line2.setWidth(percinv * this.height);
            // this.line2.setRotation(perc*Math.PI/2);
        }, () => {
            this.hide();
        });
        return this;
    }

    setColor(color: string) {
        this.mainline._setStyle({ background: color });
        this.line1._setStyle({ background: color });
        this.line2._setStyle({ background: color });
        return this;
    }

    setBorderSide(borderside: number) {
        this.side = borderside;
        this.line1.setWidth(this.side);
        this.line2.setWidth(this.side);
        this.line1.setPosition({ x: (-this.width + this.side) / 2, y: 0 });
        this.line2.setPosition({ x: (this.width - this.side) / 2, y: 0 });
    }
}

export class ui_title extends ui_anim {

    style: style;
    title: string;
    iconwidth: number;
    iconheight: number;

    constructor(system: UiSystem, texture: Control, title: string, pos: position, style: style) {
        super(system);
        this.style = style;
        this.title = title;
        this.createContainer(texture);
        this.container.zIndex = 3;
        this.setPosition(pos);
        this.setHeight(Math.round(style.fontSize + style.fontSize / 4));
        this.container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.setWidth(style.width);
        this.iconwidth = Math.round(this.width / 2 - style.fontSize / 2);
        this.iconheight = Math.round(style.fontSize / 8);
        if (style.background) this._setStyle({ background: style.background });
        this.setContent(title, style);
        return this;
    }

    textNode: ui_text;
    lefticon: ui_icon;
    righticon: ui_icon;
    setContent(text: string, style: style) {
        this.textNode = new ui_text(this.system, this.container, text, { x: style.fontSize, y: 0 }, { fontSize: style.fontSize });
        this.lefticon = new ui_icon(this.system, this.container, 'slice1', { x: 0, y: 0 }, { float: 'center', fontSize: style.fontSize });
        this.righticon = new ui_icon(this.system, this.container, 'slice2', { x: 0, y: 0 }, { float: 'center', fontSize: style.fontSize });
        return this;
    }

    setText(title: string) {
        this.title = title;
        this.showAnim();
        return this;
    }

    fullopacity = 0.8;
    showAnim() {
        this.show();
        this.textNode.setText('');
        this.anim.simple(10, (cout, perc) => {
            this.lefticon.setPosition({ x: -perc * this.iconwidth, y: this.iconheight });
            this.righticon.setPosition({ x: perc * this.iconwidth, y: this.iconheight });
            this.setBackgroundOpacity(perc * this.fullopacity);
        }, () => {
            this.textNode.writeText(this.title, 10);
            this.lefticon.setPosition({ x: -this.iconwidth, y: this.iconheight });
            this.righticon.setPosition({ x: this.iconwidth, y: this.iconheight });
            this.setBackgroundOpacity(this.fullopacity);
        });
        return this;
    }

    hideAnim() {
        this.anim.simple(10, (cout, perc) => {
            this.lefticon.setPosition({ x: (perc - 1) * this.iconwidth, y: this.iconheight });
            this.righticon.setPosition({ x: (1 - perc) * this.iconwidth, y: this.iconheight });
            this.setBackgroundOpacity((1 - perc) * this.fullopacity);
        }, () => {
            this.hide();
        });
        return this;
    }

    setColors(text: string, background: string, blur: string) {
        this.setTextColor(text);
        this.setBackgroundColor(background);
        this.textNode.setBlur(blur);
    }

    setTextColor(textcolor: string) {
        this.lefticon.setColor(textcolor);
        this.righticon.setColor(textcolor);
        this.textNode.setColor(textcolor);
        return this;
    }

    setBackgroundColor(backgroundcolor: string) {
        this._setStyle({ background: backgroundcolor });
        return this;
    }
}

export interface arrowstyle {
    orientation: 'right' | 'left';
}

export class ui_arrow extends ui_anim {

    constructor(system: UiSystem, texture: Control, pos: position, style?: arrowstyle) {
        super(system);
        this.createContainer(texture);
        this.setPosition(pos);
        this.setContent(style);
        this.showAnim();
        this.setWidth(this.fullWidth);
        this.setHeight(this.fullWidth);
        this.setHoverAnimation();
        return this;
    }

    line1: ui_line;
    line2: ui_line;
    setContent(style?: arrowstyle) {
        let angle = (style.orientation == 'right')? -Math.PI/4 : Math.PI/4;
        this.line1 = new ui_line(this.system, this.container, { x: 0, y: 8 }, { width: this.fullWidth, border: 4, angle: angle });
        this.line2 = new ui_line(this.system, this.container, { x: 0, y: -8 }, { width: this.fullWidth, border: 4, angle: -angle });
        return this;
    }

    fullOpacity = 1;
    fullWidth = 30;
    showAnim() {
        this.show();
        this.anim.simple(10, (cout, perc) => {
            this.line1.setWidth(perc * this.fullWidth);
            this.line2.setWidth(perc * this.fullWidth);
        }, () => {
            this.line1.setWidth(this.fullWidth);
            this.line2.setWidth(this.fullWidth);
        });
        return this;
    }

    hideAnim() {
        this.anim.simple(10, (cout, perc) => {
            this.line1.setWidth((1 - perc) * this.fullWidth);
            this.line2.setWidth((1 - perc) * this.fullWidth);
        }, () => {
            this.hide();
        });
        return this;
    }

    setColor(linecolor: string) {
        this.line1.setColor(linecolor);
        this.line2.setColor(linecolor);
        return this;
    }
}