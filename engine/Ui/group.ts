import { Control } from '@babylonjs/gui/2D/controls/control';
import { StackPanel } from '@babylonjs/gui/2D/controls/stackPanel';

import { ui, ui_node, ui_text, ui_icon, ui_image, ui_back, ui_line, ui_bar, position, style, size, screenposition, backstyle, linestyle } from './node';
import { ui_anim, ui_border, ui_button, content, buttonstyle, ui_arrow, arrowstyle } from './effect';
import { SystemUI } from '../System/systemUI';

export class ui_group extends ui {
    nodes: Array<ui_node> = [];
    textnodes: Array<ui_text> = [];
    stylenodes: Array < ui_anim > = [];

    constructor(system: SystemUI, container?: Control) {
        super(system);
        if (container) {
            this.texture = system.advancedTexture;
            this.container = container;
            this.texture.addControl(this.container);
        } else {
            this.createContainer(system.advancedTexture);
        }
    }

    addText(text: string, pos: position, style: style) {
        let textNode = new ui_text(this.system, this.container, text, pos, style);
        this.textnodes.push(textNode)
        return textNode;
    }

    addIcon(icon: string, pos: position, style: style) {
        let iconNode = new ui_icon(this.system, this.container, icon, pos, style);
        this.textnodes.push(iconNode)
        return iconNode;
    }

    addImage(image: string, pos: position, style: style) {
        let imageNode = new ui_image(this.system, this.container, image, pos, style);
        this.nodes.push(imageNode)
        return imageNode;
    }

    addBack(pos: position, style: backstyle) {
        let back = new ui_back(this.system, this.container, pos, style);
        this.nodes.push(back)
        return back;
    }

    addLine(pos: position, style: linestyle) {
        let line = new ui_line(this.system, this.container, pos, style);
        this.nodes.push(line)
        return line;
    }

    addArrow(pos: position, style?: arrowstyle) {
        let arrow = new ui_arrow(this.system, this.container, pos, style);
        this.stylenodes.push(arrow);
        return arrow;
    }

    addBorder(pos: position, style: linestyle) {
        let line = new ui_border(this.system, this.container, pos, style);
        this.stylenodes.push(line);
        return line;
    }

    addBar(pos: position, style: style) {
        let bar = new ui_bar(this.system, this.container, pos, style);
        this.nodes.push(bar);
        return bar;
    }

    addButton(content: content, pos: position, size: size, style: buttonstyle) {
        let button = new ui_button(this.system, this.container, content, pos, size, style);
        this.stylenodes.push(button);
        return button;
    }

    hideAll() {
        for (let i = 0; i < this.textnodes.length; i++) {
            this.textnodes[i].hide();
        }
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].hide();
        }
        for (let i = 0; i < this.stylenodes.length; i++) {
            this.stylenodes[i].hideAnim();
        }
        return this;
    }

    showAll() {
        for (let i = 0; i < this.textnodes.length; i++) {
            this.textnodes[i].show();
        }
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].show();
        }
        for (let i = 0; i < this.stylenodes.length; i++) {
            this.stylenodes[i].showAnim();
        }
        return this;
    }

    initAll() {
        for (let i = 0; i < this.textnodes.length; i++) {
            this.textnodes[i].setText('').hide();
        }
        return this;
    }

    stopAll() {
        for (let i = 0; i < this.textnodes.length; i++) {
            this.textnodes[i].anim.stop();
        }
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].anim.stop();
        }
        for (let i = 0; i < this.stylenodes.length; i++) {
            this.stylenodes[i].anim.stop();
        }
        return this;
    }

    removeAll() {
        for (let i = 0; i < this.textnodes.length; i++) {
            this.textnodes[i].remove();
        }
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].remove();
        }
        for (let i = 0; i < this.stylenodes.length; i++) {
            this.stylenodes[i].remove();
        }
        return this;
    }

    setColorAll(color: string) {
        for (let i = 0; i < this.textnodes.length; i++) {
            this.textnodes[i].setColor(color);
        }
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].setColor(color);
        }
        for (let i = 0; i < this.stylenodes.length; i++) {
            this.stylenodes[i].setColor(color);
        }
        return this;
    }

    setBlurAll(color: string) {
        for (let i = 0; i < this.textnodes.length; i++) {
            this.textnodes[i].setBlur(color);
        }
        return this;
    }

    writeAll() {
        for (let i = 0; i < this.textnodes.length; i++) {
            this.textnodes[i].writeText();
        }
        return this;
    }

    setStyle(style: any) {
        if (!this.style) this.style = {};
        for (let key in style) {
            this.style[key] = style[key];
            this.container[key] = style[key];
        }
        return this;
    }

    screenposition: screenposition;
    setScreenPosition(scpos: screenposition) {
        if (scpos.top != undefined) {
            this.container.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            this.container.top = scpos.top + "px";
        } else if (scpos.bottom != undefined) {
            this.container.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
            this.container.top = '-' + scpos.bottom + "px";
        }

        if (scpos.left != undefined) {
            this.container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            this.container.left = scpos.left + "px";
        } else if (scpos.right != undefined) {
            this.container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
            this.container.left = '-' + scpos.right + "px";
        }
        this.screenposition = scpos;
        return this;
    }

    showAnimate() {
        let h = this.height;
        this.hideAll();
        this.anim.simple(20, (count, perc) => {
            this.setBackgroundOpacity(1 - 0.5 * perc);
            this.setHeight(perc * h);
        }, () => {
            this.setBackgroundOpacity(0.5);
            this.setHeight(h);
            this.showNodesByStep();
        });
        return this;
    }

    showNodesByStep() {
        let speed = 10;
        let formercount = 0;
        let l = (this.textnodes.length) * speed;
        this.anim.simple(l, (count, perc) => {
            let newcount = Math.round(count / speed);
            for (let i = formercount; i < newcount; i++) {
                this.textnodes[i].show();
                this.textnodes[i].writeText();
            }
            formercount = newcount;
        });
        return this;
    }
}

export class ui_panel extends ui_group {

    constructor(system: SystemUI, scpos: screenposition, size: size, container?: Control) {
        super(system, container);
        if (!container) this.container = new StackPanel('');
        system.advancedTexture.addControl(this.container);
        this.setScreenPosition(scpos);

        this.setSize(size);
        this.setStyle({ zIndex: -10 });
    }
}

export class ui_control extends ui_group {

    constructor(system: SystemUI, scpos: position, size: size, style?: style, container?: Control) {
        super(system, container);
        this.createContainer(system.advancedTexture);
        // this.container = new Rectangle("");
        // advancedTexture.addControl(this.container);
        this.setPosition(scpos);
        this.setSize(size);

        this.setStyle({ thickness: 0 });
        if (style) this.setStyle(style);
    }
}

export interface containerstyle {
    background ? : string;
    border ? : number;
    side ? : number;
    bordertop ? : number;
    borderright ? : number;
    borderbottom ? : number;
    borderleft ? : number;
    bordercolor ? : string;
}

export class ui_container extends ui_group {

    background: ui_back;
    bordertop: ui_border;
    borderright: ui_border;
    borderbottom: ui_border;
    borderleft: ui_border;
    width: number;
    height: number;
    style: containerstyle;
    borders: Array < ui_border > ;

    constructor(system: SystemUI, texture: Control, position: position, size: size, style: containerstyle) {
        super(system);
        this.createContainer(texture);
        this.setPosition(position);
        this.setSize(size);
        this.width = size.width;
        this.height = size.height;
        this.style = style;
        this.createElements(style);
        this.hide();
        return this;
    }

    createElements(style: containerstyle) {
        if (style.border) {
            this.bordertop = new ui_border(this.system, this.container, { x: 0, y: -this.height / 2 }, { width: this.width, border: style.border });
            this.borderright = new ui_border(this.system, this.container, { x: this.width / 2, y: 0 }, { width: this.height, angle: Math.PI / 2, border: style.border });
            this.borderbottom = new ui_border(this.system, this.container, { x: 0, y: this.height / 2 }, { width: this.width, border: style.border });
            this.borderleft = new ui_border(this.system, this.container, { x: -this.width / 2, y: 0 }, { width: this.height, angle: Math.PI / 2, border: style.border });
        } else {
            if (style.bordertop) this.bordertop = new ui_border(this.system, this.container, { x: 0, y: -this.height / 2 }, { width: this.width, border: style.bordertop });
            if (style.borderright) this.borderright = new ui_border(this.system, this.container, { x: this.width / 2, y: 0 }, { width: this.height, angle: Math.PI / 2, border: style.borderright });
            if (style.borderbottom) this.borderbottom = new ui_border(this.system, this.container, { x: 0, y: this.height / 2 }, { width: this.width, border: style.borderbottom });
            if (style.borderleft) this.borderleft = new ui_border(this.system, this.container, { x: -this.width / 2, y: 0 }, { width: this.height, angle: Math.PI / 2, border: style.borderleft });
        }
        this.background = new ui_back(this.system, this.container, { x: 0, y: 0 }, { width: this.width, height: 0, opacity: 1 });
        if (style.background) this.background._setStyle({ background: style.background });
        if (style.bordercolor) this.setBorderColor(style.bordercolor);
        if (style.side) this.setBorderSide(style.side);
    }

    fullopacity = 0.7;
    showAnim() {
        if (this.bordertop) this.bordertop.showAnim();
        if (this.borderright) this.borderright.showAnim();
        if (this.borderbottom) this.borderbottom.showAnim();
        if (this.borderleft) this.borderleft.showAnim();
        this.background.setHeight(0);
        this.background.setBackgroundOpacity(1);
        this.show();
        this.anim.simple(20, (cout, perc) => {
            this.background.setHeight(perc * this.height);
            this.background.setBackgroundOpacity(1 - (1 - this.fullopacity) * perc);
        }, () => {
            this.background.setHeight(this.height);
            this.background.setBackgroundOpacity(this.fullopacity);
        });
        return this;
    }

    hideAnim() {
        if (this.bordertop) this.bordertop.hideAnim();
        if (this.borderright) this.borderright.hideAnim();
        if (this.borderbottom) this.borderbottom.hideAnim();
        if (this.borderleft) this.borderleft.hideAnim();
        this.background.setHeight(this.height);
        this.background.setBackgroundOpacity(this.fullopacity);
        this.anim.simple(20, (cout, perc) => {
            let percinv = 1 - perc;
            this.background.setHeight(percinv * this.height);
            this.background.setBackgroundOpacity(this.fullopacity + (1 - this.fullopacity) * perc);
        }, () => {
            this.hide();
        });
        return this;
    }

    setColors(bordercolor: string, backgroundcolor: string) {
        this.setBorderColor(bordercolor);
        this.setBackgroundColor(backgroundcolor);
    }

    setBorderColor(bordercolor: string) {
        if (this.bordertop) this.bordertop.setColor(bordercolor);
        if (this.borderright) this.borderright.setColor(bordercolor);
        if (this.borderbottom) this.borderbottom.setColor(bordercolor);
        if (this.borderleft) this.borderleft.setColor(bordercolor);
    }

    setBorderSide(borderside: number) {
        if (this.bordertop) this.bordertop.setBorderSide(borderside);
        if (this.borderright) this.borderright.setBorderSide(borderside);
        if (this.borderbottom) this.borderbottom.setBorderSide(borderside);
        if (this.borderleft) this.borderleft.setBorderSide(borderside);
    }

    setBackgroundColor(backgroundcolor: string) {
        this.background._setStyle({ background: backgroundcolor });
    }

}