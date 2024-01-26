async function plotCirclesWithLayout(viewType) {
    try {
        const classColorMapping = {
            "Eudicot": "#09c",
            "Ginkgoopsida": "#2cb",
            "Monocot": "#4d8",
            "Lycopodiopsida": "#9d5",
            "Pinopsida": "#c66",
        };

        function getColorForClass(className) {
            return classColorMapping[className] || "#000"; 
        }


           const response = await fetch('Arnarb_sample.csv');
           const csvData = await response.text();
           const parsedData = d3.csvParse(csvData);
   
           const svg = d3.select("#visualization");
           svg.selectAll("*").remove();  
           const svgWidth = svg.node().clientWidth;
           const svgHeight = svg.node().clientHeight;
           const centerX = svgWidth / 2;
           const centerY = svgHeight / 2;
   

           const baseRadius = 20;
           const ringThickness = 0.5;
           const ringSpacing = 1;
           const reducedRingThickness = ringThickness * 0.05;
           const reducedRingSpacing = ringSpacing * 1;
           const reducedBaseRadius = baseRadius * 0.4;
   
           const g = svg.append("g");
   
           const zoom = d3.zoom()
               .scaleExtent([0.01, 10])
               .on("zoom", (event) => {
                   g.attr("transform", event.transform);
               });
   
           svg.call(zoom);
           const initialScale = 0.005;
           
           svg.call(zoom.transform, d3.zoomIdentity.translate(centerX, centerY).scale(initialScale));
   
        let xColumn, yColumn;
        if (viewType === 'UMAP') {
            xColumn = 'UMAP_1';
            yColumn = 'UMAP_2';
        } else if (viewType === 'Geo') {
            xColumn = 'geo_1';
            yColumn = 'geo_2';
        } else if (viewType === 'Rad') {
            xColumn = 'Scaled_Rad_1';
            yColumn = 'Scaled_Rad_2';
        }
   
const xValues = parsedData.map(row => parseFloat(row[xColumn])).filter(val => !isNaN(val));
const yValues = parsedData.map(row => parseFloat(row[yColumn])).filter(val => !isNaN(val));

const xMax = Math.max(...xValues);
const xMin = Math.min(...xValues);
const yMax = Math.max(...yValues);
const yMin = Math.min(...yValues);

const xRange = xMax - xMin;
const yRange = yMax - yMin;
const svgAspectRatio = svgWidth / svgHeight;
const dataAspectRatio = xRange / yRange;

let scalingFactor;
if (dataAspectRatio > svgAspectRatio) {
    scalingFactor = svgWidth / xRange;
} else {
    scalingFactor = svgHeight / yRange;
}

let nodes = [];

parsedData.forEach(row => {
    const x = parseFloat(row[xColumn]);
    const y = parseFloat(row[yColumn]);
    const maxAge = parseInt(row['MaxAge']);
    const className = row['Class']; 

    if (!isNaN(x) && !isNaN(y) && !isNaN(maxAge)) {
        nodes.push({
            x: centerX + (x - xMin) * scalingFactor, 
            y: centerY + (y - yMin) * scalingFactor,
            radius: baseRadius, 
            rings: maxAge,
            color: getColorForClass(className) 
        });
    }
});
   
           const simulation = d3.forceSimulation(nodes)
               .force("center", d3.forceCenter(centerX, centerY).strength(0.05))
               .force("collide", d3.forceCollide(d => {
                   const totalRingSpace = (ringThickness + ringSpacing) * (d.rings - 1) + ringThickness;
                   return d.radius + totalRingSpace;
               }).strength(1))
               .force("anchor", d3.forceX(d => centerX + (d.x - centerX) * scalingFactor).strength(0.1))
               .force("anchorY", d3.forceY(d => centerY + (d.y - centerY) * scalingFactor).strength(0.1))
               .on("tick", ticked);
   
           function ticked() {
               nodeGroups.attr("transform", d => `translate(${d.x}, ${d.y})`);
           }
   
           const nodeGroups = g.selectAll("g.node")
               .data(nodes)
               .enter()
               .append("g")
               .attr("class", "node")
               .attr("transform", d => `translate(${d.x}, ${d.y})`);
   
           nodeGroups.each(function(d) {
               d3.select(this).selectAll("circle")
                   .data(d3.range(1, d.rings + 1))
                   .enter()
                   .append("circle")
                   .attr("r", (i) => reducedBaseRadius + i * (reducedRingThickness + reducedRingSpacing) - reducedRingSpacing)
                   .attr("fill", "none")
                   .attr("stroke", d.color)
                   .attr("stroke-width", reducedRingThickness);
           });
   
       } catch (error) {
           console.error('Error fetching data:', error);
       }
   }
   
   document.getElementById('umapButton').addEventListener('click', function() {
       plotCirclesWithLayout('UMAP');
   });
   
   document.getElementById('geoButton').addEventListener('click', function() {
       plotCirclesWithLayout('Geo');
   });

   document.getElementById('radButton').addEventListener('click', function() {
    plotCirclesWithLayout('Rad');
});
   
   plotCirclesWithLayout('Geo');

