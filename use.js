import Graph from "./graph.js";

const testArr = [
    ...Array.from({ length: 30 }, () => Math.floor(Math.random() * 1234)),
];
console.log(testArr);

const CVS = new Graph(document.querySelector('#canvas'), {
    cellsCount: { x: testArr.length, y: Math.max(...testArr) },
    stepX: 2,
    stepY: 1,
    styles: {
        line: { color: 'green', width: 3, lineJoin: 'round', lineCap: 'round' },
        cellsLine: {color: 'black'},
        dash: {color: 'blue', width: 3, length: 1.5, shift: 0.05, lineCap: 'bat'},
        text: {textAlign: 'center', textBaseline: 'middle', font: 'bold 12px sans-serif', letterSpacing: 10, color: 'black'},
    },
    border: false,
    cells: true,
    height:{
        max: 1.5, 
        min: 3,
    },//Relative to width (width / config.height)
});

CVS.drawGrahikLine(testArr, 'bezier');