// Create SVG element and viewbox
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('viewBox', '0 0 32 32');

// Create symbol element
const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
symbol.setAttribute('id', 'mindmap-symbol');
symbol.setAttribute('viewBox', '0 0 300 300');

// Define styles for nodes and lines
const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
style.textContent = `
  .node {
    fill: #FFFFFF;
    stroke: #000000;
    stroke-width: 2;
  }
  .line {
    stroke: #000000;
    stroke-width: 2;
  }
`;

// Create nodes and lines
const node1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
node1.setAttribute('class', 'node');
node1.setAttribute('cx', '100');
node1.setAttribute('cy', '100');
node1.setAttribute('r', '50');

const node2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
node2.setAttribute('class', 'node');
node2.setAttribute('cx', '200');
node2.setAttribute('cy', '100');
node2.setAttribute('r', '50');

const node3 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
node3.setAttribute('class', 'node');
node3.setAttribute('cx', '150');
node3.setAttribute('cy', '200');
node3.setAttribute('r', '50');

const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
line1.setAttribute('class', 'line');
line1.setAttribute('x1', '100');
line1.setAttribute('y1', '100');
line1.setAttribute('x2', '200');
line1.setAttribute('y2', '100');

const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
line2.setAttribute('class', 'line');
line2.setAttribute('x1', '200');
line2.setAttribute('y1', '100');
line2.setAttribute('x2', '150');
line2.setAttribute('y2', '200');

const line3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
line3.setAttribute('class', 'line');
line3.setAttribute('x1', '150');
line3.setAttribute('y1', '200');
line3.setAttribute('x2', '100');
line3.setAttribute('y2', '100');

// Append nodes, lines and styles to the symbol element
symbol.appendChild(style);
symbol.appendChild(node1);
symbol.appendChild(node2);
symbol.appendChild(node3);
symbol.appendChild(line1);
symbol.appendChild(line2);
symbol.appendChild(line3);

// Use the symbol and scale it to fit in a 32x32 box with 4px padding
const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
use.setAttribute('href', '#mindmap-symbol');
use.setAttribute('transform', 'scale(0.08)');
use.setAttribute('x', '4');
use.setAttribute('y', '4');

// Append the symbol and use to the SVG element
svg.appendChild(symbol);
svg.appendChild(use);

// Add the SVG element to the HTML document
document.body.appendChild(svg);
