/*
 *                                                               _
 *   _____  _                           ____  _                 |_|
 *  |  _  |/ \   ____  ____ __ ___     / ___\/ \   __   _  ____  _
 *  | |_| || |  / __ \/ __ \\ '_  \ _ / /    | |___\ \ | |/ __ \| |
 *  |  _  || |__. ___/. ___/| | | ||_|\ \___ |  _  | |_| |. ___/| |
 *  |_/ \_|\___/\____|\____||_| |_|    \____/|_| |_|_____|\____||_|
 *
 *  ===============================================================
 *             More than a coder, More than a designer
 *  ===============================================================
 *
 *  - Document: index.js
 *  - Author: aleen42
 *  - Description: main entry of the watermark component
 *  - Create Time: Apr 24th, 2019
 *  - Update Time: Nov 9th, 2020
 *
 */

/**
 * @param target - which target you want to append watermarks upon
 * @param params - defined as following thumbnail
 * @param {object} scrollableElement - x: axis-x scrollable element
 *                                   - y: axis-y scrollable element
 *  -----------------------------------------
 * |   |ox: 300(px)|    |                   |   DEBUG_MODE  : debug canvas drawing calculation
 * |   |___________|      align: left       |   contents    : an array of text contents for drawing watermarks
 * |  /           /     | alpha: 0.2        |   ox          : different value at axis-x between each watermark region
 * |  -----       ----    font-size: 30     |   oy          : different value at axis-y between each watermark region
 * | ||||||\_    ||||||   font-rotate: -45° |   ow          : the width of each watermark region
 * | ||||||  |   |||||| | line-height: 1.5x |   oh          : the height of each watermark region
 * | ----- \_|oh -----                      |   font-size   : the font size of watermarks
 * | \    \      \______|                   |   font-rotate : the rotate degree of watermarks
 * | |_ow_|          |      - - - - - - - - |   line-height : line height of each content
 * |       -----     |                      |   alpha       : the opacity of contents
 * |      |||||||    |                      |   align       : the align style of contents
 * |      |||||||    | oy: 300(px)          |
 * |      ------     |                      |
 * |             \___|___                   |
 * -----------------------------------------
 * @constructor
 */
const Watermarks = window.Watermarks = window.Watermarks || function (target, params, {x: scrollX, y: scrollY} = {}) {
    // todo: can I calculate scrollable parents from the target element
    const SCROLLABLE_MAX_WIDTH = target.scrollWidth;
    const SCROLLABLE_MAX_HEIGHT = target.scrollHeight;

    let CANVAS_DEFAULT_WIDTH = SCROLLABLE_MAX_WIDTH;
    let CANVAS_DEFAULT_HEIGHT = SCROLLABLE_MAX_HEIGHT;
    if (scrollX || scrollY) {
        const wW = window.innerWidth, wH = window.innerHeight, sW = scrollX.scrollWidth, sH = scrollY.scrollHeight;
        CANVAS_DEFAULT_WIDTH = sW > wW ? wW : sW;
        CANVAS_DEFAULT_HEIGHT = sH > wH ? wH : sH;
    }

    let canvas = target.querySelector('.j-watermark');

    // create a new Canvas element
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.className = 'j-watermark';
        canvas.setAttribute('style', 'position: absolute; top: 0; left: 0; z-index: 1; pointer-events: none');
        target.appendChild(canvas);
    }

    this.canvas = canvas;
    target.style.position = 'relative';

    // initiate default params
    params = Object.assign({
        DEBUG_MODE: false,
        watermarks: {
            region: {
                x: 300, // ox, 300 by default
                y: 300, // oy, 300 by default
                width: 150, // ow, 150 by default
                height: 150, // oh, 150 by default
            },
            align: 'left', // text-align, left by default
            alpha: 0.2, // font-alpha, 0.2 by default
            fontSize: 16, // font-size, 16 by default
            fontRotate: Math.PI / 4, // font-rotate, -45° by default
            lineHeightRatio: 1.5, // line-height, 1.5x by default
            reservedRatio: 9, // the times for extending reserved region, which can be increased
        },
    }, params);

    const watermarks = params.watermarks;
    const region = watermarks.region;

    const _init = () => {
        /**
         * extend: Do not use following optimization when not passing scrollableElement
         *
         * optimization: in order to render in a smaller canvas, rather than creating a huge, there
         *               are two proposals.
         * proposal 1 (✗): re-render once scrolling, which only needs a scrollable element's size of canvas
         * proposal 2 (✓): re-render once scrolling outside whole scrollable element, which needs more than
         *                 `2ox * 2oy` size of canvas at least to act as a reserved region for re-rendering
         */
        const reservedRatio = watermarks.reservedRatio;
        const [rw, rh] = [
            SCROLLABLE_MAX_WIDTH > CANVAS_DEFAULT_WIDTH ? reservedRatio * region.x : 0,
            SCROLLABLE_MAX_HEIGHT > CANVAS_DEFAULT_HEIGHT ? reservedRatio * region.y : 0,
        ];

        // set the size of the canvas
        canvas.width = CANVAS_DEFAULT_WIDTH + rw;
        canvas.height = CANVAS_DEFAULT_HEIGHT + rh;

        // register scroll events
        const previous = {};
        const axisConditions = {
            x: SCROLLABLE_MAX_WIDTH > CANVAS_DEFAULT_WIDTH,
            y: SCROLLABLE_MAX_HEIGHT > CANVAS_DEFAULT_HEIGHT,
        };

        if (axisConditions.x || axisConditions.y) {
            // set position of the canvas
            const checkPos = specificAxis => {
                Object.entries({
                    x: ['left', rw, SCROLLABLE_MAX_WIDTH - canvas.width, 'scrollLeft'],
                    y: ['top', rh, SCROLLABLE_MAX_HEIGHT - canvas.height, 'scrollTop'],
                }).forEach(([axis, [property, reserved, limit, key]]) => {
                    if (!axisConditions[axis] || (specificAxis && axis !== specificAxis)) return;

                    // ensure that moving even distances of ox or oy
                    let numbers = Math.floor(Math.floor((axis === 'x' ? scrollX : scrollY)[key] / reserved) * reserved / region[axis]);
                    numbers -= numbers % 2;

                    // guarantee that rendering inside the scrollable area
                    let val = numbers * region[axis];
                    val = val >= limit ? limit : val;

                    if (previous[axis] !== val) {
                        // reset positions when scrolling to specific places
                        previous[axis] = val;
                        canvas.style[property] = `${val}px`;
                    }
                });
            };

            checkPos();

            if (scrollX || scrollY) {
                if (scrollX === scrollY) {
                    scrollX && scrollX.addEventListener('scroll', checkPos.bind(0, ''));
                } else {
                    scrollX && scrollX.addEventListener('scroll', checkPos.bind(0, 'x'));
                    scrollY && scrollY.addEventListener('scroll', checkPos.bind(0, 'y'));
                }
            } else {
                target.addEventListener('scroll', checkPos.bind(0, ''));
            }
        }

        // filter empty string
        params.contents = params.contents.filter(content => content.length);
    };

    const _draw = () => {
        const context = canvas.getContext('2d');

        // clear at first
        context.clearRect(0, 0, canvas.width, canvas.height);

        for (let x = 0; x < canvas.width; x += region.x) {
            for (let y = 0; y < canvas.height; y += region.y) {
                context.save();

                context.globalAlpha = watermarks.alpha;
                context.font = `${watermarks.fontSize}px '微软雅黑'`;

                // translate pivot when it is an odd row to avoid reduplication
                context.translate(x + (y / region.y + 1) % 2 * region.width, y);

                params.DEBUG_MODE && context.fillRect(0, 0, params.watermarks.region.width, params.watermarks.region.height);

                // todo: need to consider degrees out of the range between 0 and 90 degrees
                const sita = watermarks.fontRotate;
                context.rotate(-sita);
                context.textAlign = watermarks.align;

                /**
                 * calculate the center position of each content responding to the rectangle
                 * https://codepen.io/aleen42/pen/KRPPVW
                 *
                 *                   x                 fw: textWidth
                 *                 x        |  fw  |   fs: fontSize
                 *               x         /      /__  fh: fontSize + lineHeight * rows
                 *          x  x           xxx
                 *        x  x             xxxxxxx __ fh
                 *      x--x----------
                 *      |x    ow     x
                 *      | ---------x               dx = ow/2-fw/2+ow/2*(1-cos)/cos-(oh/2+ow/2)*sin
                 *      | |      x|                   = ow/2*(1-sin*cos)/cos-fw/2-oh/2*sin
                 *      | | x  x  |  oh
                 *      | x  x    |
                 *      x -x-------                dy = (oh/2+ow/2)*sin-fh/2+fs*cos
                 *
                 * Note: axis-y need a value of fs * cos to align (https://codepen.io/aleen42/pen/RMXXqv)
                 */
                const fontSize = watermarks.fontSize;
                const lineHeight = watermarks.lineHeightRatio * fontSize;
                const [sin, cos, fw, fs, fh] = [
                    Math.sin(sita), Math.cos(sita),
                    Math.max(...params.contents.map(content => context.measureText(content).width)),
                    fontSize,
                    fontSize + lineHeight * (params.contents.length - 1),
                ];

                const [dx, dy] = [
                    region.width / 2 * (1 - sin * cos) / cos - fw / 2 - region.height / 2 * sin, // display axis-x value
                    (region.height / 2 + region.width / 2) * sin - fh / 2 + fs * cos, // display axis-y value
                ];

                [
                    [['fillStyle', 'black'], 'fillText'], // background rendering
                    [['strokeStyle', 'white'], 'strokeText'], // border rendering, in order to avoid color reduplication
                ].forEach(([[style, color], draw]) => {
                    context[style] = color;
                    params.contents.forEach((content, index) => context[draw](content, dx, dy + lineHeight * index));
                });

                params.DEBUG_MODE && (context.strokeStyle = '#a10000');
                params.DEBUG_MODE && context.strokeRect(dx, dy - fontSize * cos, fw, lineHeight + fontSize);

                context.restore();
            }
        }
    };

    // some browsers will need to fill or stroke after canvas has been rendered
    setTimeout(() => {
        _init();
        _draw();
    }, 0);
};

// noinspection JSUnusedGlobalSymbols
Object.assign(Watermarks.prototype, {
    reset() {
        this.canvas.width = this.canvas.height = 0;
    },
});

module.exports = Watermarks;
