class Graph
{
    constructor(parentDom, config){
        this.parentDom = parentDom;
        this.config = config;
        this.init();
    }

    init(){
        this.config.cellsCount.y = this.#getAdjustedYValue(this.config.cellsCount.y);
        this.DOMcvs = this.create();
        this.#setSize();
        this.ctx = this.DOMcvs.getContext('2d');
        if(this.config.cells) this.#drawCells();
        if(this.config.border) this.#drawBorder();
        this.#drawGraphLayout();
    }

    create(){
        const cvs = document.createElement('canvas');
        this.parentDom.appendChild(cvs);
        return cvs;
    }

    #setSize(){
        /**SET WIDTH */
        const width = this.parentDom.offsetWidth;
        this.DOMcvs.style.width = width + 'px';
        this.DOMcvs.width = width;
        this.width = width;

        /**SET CELLSIZE */
        const cellSize = this.width / ((this.config.cellsCount.x / this.config.stepX) + 1);
        this.config.cellSize = cellSize;

        /**SET HEIGHT */
        while(true){
            const height = Math.ceil(Math.max((((this.config.cellsCount.y / this.config.stepY) + 1) * cellSize), Math.floor(this.width / this.config.height.min)));
            if(height <= this.width / this.config.height.max && this.config.cellsCount.y % this.config.stepY == 0){
                this.DOMcvs.style.height = height + 'px';
                this.DOMcvs.height = height;
                this.height = height;
                break;
            }
            this.config.stepY++;
        }
    }

    #drawCells(){
        this.setStrokeStyle(this.config.styles.cellsLine)
    
        const linesCount = {
            x: this.config.cellsCount.x / this.config.stepX,
            y: this.config.cellsCount.y / this.config.stepY,
        };
        for(let x = 1; x <= linesCount.x; x++){
            this.#drawLine(
                {x: x * this.config.cellSize, y: 0},
                {x: x * this.config.cellSize, y: this.height}
            );
        }
        for (let y = 1; y <= linesCount.y; y++){
            this.#drawLine(
                {x: 0, y: y * this.config.cellSize}, 
                {x: this.width, y: y * this.config.cellSize}
            );  
        }
    }
    

    #drawText(text, x, y){
        this.ctx.fillText(text, x, y);
    }

    #drawBorder() {
        const points = [
            { x: 0, y: 0 },
            { x: 0, y: this.height },
            { x: this.width, y: this.height },
            { x: this.width, y: 0 }
        ];
        for (let i = 0; i < points.length; i++) {
            const nextIndex = (i + 1) % points.length;
            this.#drawLine(points[i], points[nextIndex]);
        }
    }

    #drawLine(posOne, posTwo){
        this.ctx.beginPath();
        this.ctx.moveTo(posOne.x, posOne.y);
        this.ctx.lineTo(posTwo.x, posTwo.y);
        this.ctx.stroke();
    }

    #drawGraphLayout() {
        this.setStrokeStyle(this.config.styles.dash);
        this.setTextFillStyle(this.config.styles.text);

        for(let x = 0; x <= this.config.cellsCount.x / this.config.stepX; x++){
            const xPosition = (x + 1) * this.config.cellSize;
            const yPosition = this.height - this.config.cellSize / 2;
            this.#drawLine(
                { x: xPosition, y: (this.height - this.config.cellSize / this.config.styles.dash.length) - this.config.cellSize * this.config.styles.dash.shift }, 
                { x: xPosition, y: (this.height - this.config.cellSize) - this.config.cellSize * this.config.styles.dash.shift}
            );
            this.#drawText(x * this.config.stepX, x * this.config.cellSize + this.config.cellSize / 2, yPosition);
        }

        for(let y = 0; y <= this.config.cellsCount.y / this.config.stepY; y++){
            const xPosition = this.config.cellSize / 2;
            const yPosition = this.height - (y + 1) * this.config.cellSize;
            this.#drawLine(
                { x: (this.config.cellSize / this.config.styles.dash.length) + this.config.cellSize * this.config.styles.dash.shift, y: yPosition }, 
                { x: this.config.cellSize + this.config.cellSize * this.config.styles.dash.shift, y: yPosition }
            );
            this.#drawText(y * this.config.stepY, xPosition, yPosition + this.config.cellSize / 2);
        }
    }

    /**
     * 
     * @param {Array} points 
     * @param {string} lineType straight|bezier 
     */
    drawGrahikLine(points, lineType){
        this.setStrokeStyle(this.config.styles.line);
        
        switch(lineType){
            case 'bezier':
                this.drawBezierLine(points);
                break;
            case 'straight':
                this.drawStraightLine(points);
                break;
            default:
                console.error('unthought line type');
        }
    }    

    drawBezierLine(points){
        this.ctx.beginPath();
        let startX = this.config.cellSize + (this.config.cellSize / this.config.stepX);
        let startY = this.height - (points[0] * this.config.cellSize / this.config.stepY) - this.config.cellSize;
        this.ctx.moveTo(startX, startY);
    
        for (let i = this.config.stepX; i < points.length; i += this.config.stepX) {
            const maxmin = {
                max: points[i],
                min: points[i],
            };
    
            for (let j = i; j < i + this.config.stepX && j < points.length; j++) {
                if (points[j] > maxmin.max) maxmin.max = points[j];
                else if (points[j] < maxmin.min) maxmin.min = points[j];
            }
    
            let avgY;
            if (this.height - (maxmin.min * this.config.cellSize / this.config.stepY) - this.config.cellSize > startY) 
                avgY = maxmin.min 
            else 
                avgY = maxmin.max;
            const nextX = ((this.config.cellSize * (i + 1)) / this.config.stepX) + this.config.cellSize;
            const nextY = this.height - (avgY * this.config.cellSize / this.config.stepY) - this.config.cellSize;
    
            const cp1x = startX + (nextX - startX) / 3;
            const cp2x = startX + 2 * (nextX - startX) / 3;
    
            this.ctx.bezierCurveTo(cp1x, startY, cp2x, nextY, nextX, nextY);
    
            startX = nextX;
            startY = nextY;
        }
    
        if ((points.length - 1) % this.config.stepX !== 0) {
            const lastPointIndex = points.length - 1;
            const nextX = ((this.config.cellSize * (lastPointIndex + 1)) / this.config.stepX) + this.config.cellSize;
            const nextY = this.height - (points[lastPointIndex] * this.config.cellSize / this.config.stepY) - this.config.cellSize;
            
            const cp1x = startX + (nextX - startX) / 3;
            const cp2x = startX + 2 * (nextX - startX) / 3;
            
            this.ctx.bezierCurveTo(cp1x, startY, cp2x, nextY, nextX, nextY);
        }
    
        this.ctx.stroke();
    }

    drawStraightLine(points){
        this.ctx.beginPath();
        let startX = this.config.cellSize + (this.config.cellSize / this.config.stepX);
        let startY = this.height - (points[0] * this.config.cellSize / this.config.stepY) - this.config.cellSize;
        this.ctx.moveTo(startX, startY);
    
        for(let i = 1; i < points.length; i++) {
            const nextX = this.config.cellSize + ((this.config.cellSize * (i + 1)) / this.config.stepX);
            const nextY = this.height - (points[i] * this.config.cellSize / this.config.stepY) - this.config.cellSize;
            this.ctx.lineTo(nextX, nextY);
        }    
        this.ctx.stroke();
    }
    
    setStrokeStyle(styles){
        if(styles.color)
            this.ctx.strokeStyle = styles.color;
        if(styles.width)
            this.ctx.lineWidth = styles.width;
        if(styles.opacity)
            this.ctx.globalAlpha = styles.opacity;
        if(styles.dash)
            this.ctx.setLineDash(styles.dash);    
        if(styles.lineJoin)
            this.ctx.lineJoin = styles.lineJoin;    
        if(styles.lineCap)
            this.ctx.lineCap = styles.lineCap;    
    }

    setTextFillStyle(styles) {
        if (styles.font)
            this.ctx.font = styles.font;
        if (styles.color)
            this.ctx.fillStyle = styles.color;
        if (styles.textBaseline)
            this.ctx.textBaseline = styles.textBaseline;
        if (styles.textAlign)
            this.ctx.textAlign = styles.textAlign;
    }

    #getAdjustedYValue(number) {
        return Math.ceil(number / 10) * 10;
    }
}

export default Graph