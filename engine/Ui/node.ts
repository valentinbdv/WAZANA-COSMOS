import { Animation } from '../System/animation';
import { SystemUI } from '../System/systemUI';

import { AdvancedDynamicTexture } from '@babylonjs/gui/2D/advancedDynamicTexture';
import { Image } from '@babylonjs/gui/2D/controls/image';
import { Rectangle } from '@babylonjs/gui/2D/controls/rectangle';
import { Control } from '@babylonjs/gui/2D/controls/control';
import { TextBlock } from '@babylonjs/gui/2D/controls/textBlock';

export interface position {
    x: number,
    y: number,
}

export interface screenposition {
    top ? : number,
    right ? : number,
    bottom ? : number,
    left ? : number,
}

export interface size {
    width: number,
    height: number,
}

export interface style {
    left ? : number,
    top ? : number,
    width ? : any,
    height ? : any,
    float ? : string, // Replace textHorizontalAlignment
    alpha ? : number,
    color ? : string,
    fontFamily ? : string,
    fontSize ? : number,
    cornerRadius ? : number
    thickness ? : number,
    background ? : string,
    shadowBlur ? : number;
    shadowColor ? : string;
    zIndex ? : number;
    blur ? : string;
    rotation ? : number;
    paddingTop ? : number;
    paddingBottom ? : number;
    paddingLeft ? : number;
    paddingRight ? : number;
}

// OTHER STYLES NOT USED YET:
// textVerticalAlignment
// lineSpacing
// textWrapping
// resizeToFit
// focusedBackground
// autoStretchWidth
// maxWidth
// margin

export class ui {

    style: style = {};
    container: any;
    texture: any;
    size: size;
    position: position;
    anim: Animation;
    system: SystemUI;

    constructor(system: SystemUI) {
        this.system = system;
        this.anim = new Animation(system.animationManager);
        return this;
    }

    createContainer(texture: Control | AdvancedDynamicTexture) {
        this.texture = texture;
        this.container = new Rectangle("");
        this.texture.addControl(this.container);
        this.container.thickness = 0;
        this.container.isPointerBlocker = false;
    }

    hide() {
        this.container.isVisible = false;
        return this;
    }

    show() {
        this.container.isVisible = true;
        return this;
    }

    _setStyle(style: any, el ? : any) {
        let rel = (el) ? el : this.container;
        for (let key in style) {
            this.style[key] = style[key];
            rel[key] = style[key];
        }
        return this;
    }

    _deleteEvent() {
        // FIXME
        if (this.container) {
            this.container.isHitTestVisible = false;
            this.container.isFocusInvisible = true;
        }
    }

    _setColor(color: string) {
        this.container.color = color;
        this.style.color = color;
        return this;
    }

    setOpacity(op: number) {
        this.container.alpha = op;
        this.style.alpha = op;
        return this;
    }

    backgroundrgb: any;
    setBackgroundOpacity(op: number) {
        if (this.style.background == undefined) return;
        this.backgroundrgb = this.hexToRgb(this.style.background);
        let bgop = 'rgba(' + this.backgroundrgb.r + ', ' + this.backgroundrgb.g + ', ' + this.backgroundrgb.b + ', ' + op + ')';
        this.container.background = bgop;
        return this;
    }

    hexToRgb(hex: string) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    addOpacity(op: number) {
        this.container.alpha += op;
        this.style.alpha += op;
        if (this.container.alpha > 1) this.setOpacity(1);
        if (this.container.alpha < 0) this.setOpacity(0);
        return this;
    }

    height: number;
    width: number;
    setHeight(height: number) {
        this.height = height;
        this.container.height = (height + 4) + 'px';
        return this;
    }

    setWidth(width: number) {
        this.width = width;
        this.container.width = width + 'px';
        return this;
    }

    setSize(size: size) {
        this.height = size.height;
        this.width = size.width;
        this.container.height = size.height + 'px';
        this.container.width = size.width + 'px';
        return this;
    }

    setPosition(pos: position) {
        this.position = pos;
        this.container.left = pos.x + 'px';
        this.container.top = pos.y + 'px';
        return this;
    }

    setRelativePosition(pos: position) {
        this.position = pos;
        if (this.angle) {
            this.container.left = (pos.x - this.texture._texture.baseWidth / 2 + Math.cos(this.angle) * this.width / 2 + Math.sin(this.angle) * this.height / 2).toString() + 'px';
            this.container.top = (pos.y - this.texture._texture.baseHeight / 2 + Math.sin(this.angle) * this.width / 2 + Math.cos(this.angle) * this.height / 2).toString() + 'px';
        } else {
            this.container.left = (pos.x - this.texture._texture.baseWidth / 2 + this.width / 2).toString() + 'px';
            this.container.top = (pos.y - this.texture._texture.baseHeight / 2 + this.height / 2).toString() + 'px';
        }
        return this;
    }

    angle: number;
    setRotation(angle: number) {
        this.container.rotation = angle;
        this.angle = this.container.rotation;
        return this;
    }

    addRotation(angle: number) {
        this.container.rotation += angle;
        this.angle = this.container.rotation;
        return this;
    }

    remove() {
        this.texture.removeControl(this.container);
        return this;
    }

    renameEvent = {
        click: 'onPointerUpObservable',
        mousedown: 'onPointerDownObservable',
        enter: 'onPointerEnterObservable',
        leave: 'onPointerOutObservable',
    }
    on(event: 'click' | 'mousedown' | 'enter' | 'leave', funct: Function) {
        let nodeevent = this.renameEvent[event];
        this.container.isPointerBlocker = true;
        this.container.isHitTestVisible = true;
        this.container.hoverCursor = 'pointer';
        this.container[nodeevent].add(() => {
            funct();
        });
        return this;
    }
}

export class ui_node extends ui {
    node: Control;
    text: string;

    setNode(text: string, style: style) {
        this.node = new Control();
        this.text = text;
    }

    setStyle(style: any, el ? : any) {
        this._setStyle(style, el);
        return this;
    }

    setColor(color: string) {
        this._setColor(color);
        return this;
    }

    blow() {
        if (!this.node || !this.style.color) return;
        this._setStyle({
            background: this.style.color
        });
        this.anim.alternate(18, 3, (count, perc) => {
            this.setBackgroundOpacity(perc);
        }, (count, perc) => {
            this.setBackgroundOpacity(1 - perc);
        }, () => {
            this.setBackgroundOpacity(0);
        });
        return this;
    }

    shine() {
        if (!this.node || !this.style.color) return;
        this._setStyle({
            background: this.style.color
        });
        this.anim.alternate(100, 50, (count, perc) => {
            this.setBackgroundOpacity(perc);
            this.node.shadowBlur = perc * 10;
        }, (count, perc) => {
            this.setBackgroundOpacity(1 - perc);
            this.node.shadowBlur = (1 - perc) * 10;
        }, () => {
            this.node.shadowBlur = 5;
            this.setBackgroundOpacity(0);
        });
        return this;
    }

    setTextStyle(style: any, el ? : any) {
        for (let key in style) {
            this.node[key] = style[key];
        }
        return this;
    }

    centerText() {
        this.setTextStyle({
            textHorizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
            textVerticalAlignment: Control.VERTICAL_ALIGNMENT_CENTER
        });
        return this;
    }

    setWidthPosition() {
        if (!this.position) return;
        this.width = this.style.width;
        this.container.width = this.width + 'px';
        let width = this.texture.widthInPixels;
        this.container.left = (this.position.x + (this.width - width) / 2) + 'px';
        this.centerText();
        return this;
    }

    deleteEvent() {
        if (this.node) {
            this.node.isHitTestVisible = false;
            this.node.isFocusInvisible = true;
        }
        this._deleteEvent();
        return this;
    }
}

export class ui_text extends ui_node {
    node: TextBlock;

    constructor(system: SystemUI, texture: Control, text: string, pos: position, style: style, event ? : boolean) {
        super(system);
        style.fontFamily = "'Aldrich', sans-serif";
        this.setNode(text, style);
        this.createContainer(texture);
        this.setStyle(style);
        this.container.zIndex = 2;
        this.setPosition(pos);
        if (style.width == undefined) this.container.width = '100%';
        else this.setWidth(style.width);
        this.setHeight(style.fontSize);
        this.container.addControl(this.node);
        if (!event) this.deleteEvent();
    }

    setNode(text: string, style: style) {
        this.node = new TextBlock();
        this.text = text;
        this.node.text = text;

        if (style.width != undefined) this.node.width = style.width;
        if (style.float == 'right') this.node.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        else if (style.float == 'left') this.node.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    }

    setText(text: string) {
        text = text.toString();
        this.node.text = text;
        this.node.color = this.style.color;
        this.text = text;
        this.show();
        return this;
    }

    setBlur(color: string) {
        if (this.node) {
            this.node.outlineWidth = 1;
            this.node.outlineColor = color;
            this.node.shadowBlur = 2;
            this.node.shadowColor = color;
        }
        return this;
    }

    setStyle(style: any, el?: any) {
        this._setStyle(style, el);
        if (style.color && this.text) this.setText(this.text);
        if (style.blur) this.setBlur(style.blur);
        return this;
    }

    setColor(color: string) {
        this._setColor(color);
        if (this.text) this.setText(this.text);
        return this;
    }

    writeText(text?: string, speed?: number, callback?: Function) {
        let newtext = (text) ? text.toString() : this.text;
        let l = (speed) ? speed : newtext.length / 2;
        this.anim.simple(l, (count, perc) => {
            let nbchar = Math.round(perc * newtext.length);
            let writetext = newtext.substring(0, nbchar);
            this.setText(writetext);
            if (callback) callback();
        });
    }

    showAnimate(text?: string) {
        let h = this.height;
        let newtext = (text) ? text : this.text;
        this.setText('');
        this.anim.simple(10, (count, perc) => {
            this.setBackgroundOpacity(1 - 0.5 * perc);
            this.setHeight(perc * h);
        }, () => {
            this.setBackgroundOpacity(0.5);
            this.setHeight(h);
            this.writeText(newtext);
        });
    }
}

export class ui_image extends ui_node {

    node: Image;
    image: string;

    constructor(system: SystemUI, texture: Control, image: string, pos: position, style: style, event ? : boolean) {
        super(system);
        this.setNode(image, style);
        this.createContainer(texture);
        this.setStyle(style);
        this.container.zIndex = 2;
        this.setPosition(pos);
        this.container.addControl(this.node);
        if (!event) this.deleteEvent();
    }

    setNode(image: string, style: style) {
        this.node = new Image("", image);
        this.image = image;
        this.node.stretch = 2;

        if (style.width != undefined) this.node.width = style.width;
    }
}

export class ui_icon extends ui_text {

    icon = true;

    constructor(system: SystemUI, texture: Control, icon: string, pos: position, style: style, event ? : boolean) {
        super(system, texture, icon, pos, style, event);
        style.fontFamily = 'wznicon';
        let text = (icon != '') ? this.icontochar[icon] : '';
        if (text == undefined) return console.log(icon);
        this.setText(text);
    }

    icontochar = {
        wazanaLogo: 'a',
        close: 'z',
        cure: 'e',
        health: 'e',
        fastbuilt: 'r',
        fastmove: 't',
        fasttime: 'y',
        hole: 'u',
        invisible: 'i',
        shield: 'o',
        slowtime: 'p',
        strong: 'q',
        teleport: 's',
        damage: 'Y',
        energy: 'f',
        entity: 'g',
        matter: 'h',
        progress: 'x',
        rate: 'c',
        scope: 'v',
        speed: 'R',
        slice1: 'b',
        slice2: 'A',
        slicebis1: 'Z',
        slicebis2: 'E',
        // arrowbottomleft:'j',
        // arrowbottomright:'k',
        // arrowtopleft:'l',
        // arrowtopright:'m',
        grade1: '1',
        grade2: '2',
        grade3: '3',
        grade4: '4',
        grade5: '5',
        grade6: '6',
        grade7: '7',
        grade8: '8',
        grade9: '9',
        grade10: '0',
        map: 'd',
        mousecursor: 'j',
        mousemove: 'k',
        mousepointer: 'l',
        mouseselect: 'm',
        mousetarget: 'w',
        mouseteleport: 'U',
        wall: 'T',
    };

    setIcon(icon: string) {
        let text = this.icontochar[icon];
        if (text == undefined) return console.log(icon);
        this.setText(text);
        return this;
    }

    setText(text: string) {
        text = text.toString();
        this.node.text = text;
        this.node.color = this.style.color;
        this.text = text;
        this.show();
        return this;
    }
}


export interface backstyle {
    width: number;
    height: number;
    float: string;
    color: string;
    opacity ?: number;
}

export class ui_back extends ui_node {
    constructor(system: SystemUI, texture: Control, pos: position, style: backstyle) {
        super(system);
        this.createContainer(texture);
        this._setStyle({
            background: style.color
        });
        // this.container.zIndex = 0;
        this.setSize({
            width: style.width,
            height: style.height
        });
        this.setPosition(pos);
        if (style.opacity) this.setBackgroundOpacity(style.opacity);
        if (style.float == 'right') this.container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        else if (style.float == 'left') this.container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        if (!event) this._deleteEvent();
        return this;
    }
}

export interface linestyle {
    width: number;
    border: number;
    color ? : string;
    angle ? : number;
    opacity ? : number;
    side ? : number;
}

export class ui_line extends ui_node {

    angle: number;
    constructor(system: SystemUI, texture: Control, pos: position, style: linestyle) {
        super(system);
        this.angle = (style.angle) ? style.angle : 0;
        this.createContainer(texture);
        this.container.zIndex = 1;
        this.setWidth(style.width);
        if (style.color) this._setStyle({
            background: style.color
        });
        if (style.opacity) this.setOpacity(style.opacity);
        if (style.angle) this.setRotation(style.angle);
        this.setHeight(style.border);
        this.setPosition(pos);
        return this;
    }

    setColor(color: string) {
        this._setStyle({
            background: color
        });
        return this;
    }
}

export class ui_bar extends ui_node {
    bar: any = {};

    constructor(system: SystemUI, texture: Control, pos: position, style: style) {
        super(system);
        this.createContainer(texture);
        this.setStyle(style);
        this.container.zIndex = 2;
        this.setPosition(pos);
        return this;
    }

    createBar(name: string, style: style) {
        let bar = new Rectangle("");
        this.bar[name] = bar;
        this.bar[name].thickness = 0;
        if (style.float == 'left') this.bar[name].left = '-50%';
        else if (style.float == 'right') this.bar[name].left = '50%';
        this.container.addControl(bar);
        this.setStyle(style, bar);
        return this;
    }

    setBarValue(name: string, value: number) {
        this.bar[name].width = (value * 2) + '%';
        return this;
    }

    setBarOpacity(name: string, op: number) {
        this.bar[name].opacity = op;
        return this;
    }
}