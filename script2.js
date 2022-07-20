;(function () {
    const margin = { top: 20, right: 50, bottom: 50, left: 50 }

    const width = 900 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    let cpiLine; // create a variable in the outermost scope where we can store the lines we draw
    // let label;

    const svg = d3
        .select("#chart-month")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .style('fill', 'white')

    // const colorScale = d3.scaleOrdinal().range(d3.schemeDark2)
   
    const yPositionScale = d3.scaleLinear().range([height, 0])
    const xPositionScale = d3.scaleTime().range([0, width])
    const parseDate = d3.timeParse("%d-%m-%y")
    var formatPercent = d3.format(".0%");


    const line = d3
        .line()
        .x(d => xPositionScale(d.month))
        .y(d => yPositionScale(d.cpi))


    d3.csv("data/cpi2.csv")
        .then(ready)
        .catch(function (error) {
            console.log("Failed with", error)
        })

    function ready(datapoints) {
        datapoints.forEach(function (d) {
            // console.log(d.month)
            d.month = parseDate(d.month)
            d.cpi = +d["cpi"]
        })


        // Update the scales
        const extentCPI = d3.extent(datapoints, d => d.cpi)
        yPositionScale.domain(extentCPI).nice()
        xPositionScale.domain(d3.extent(datapoints, d => d.month))

        
        cpiLine = svg.append("path")
            .datum(datapoints) 
            .attr("stroke", "white")
            .attr("fill", "none")
            .attr("d", line)
            .style('stroke-dasharray', 3000) // hiding the lines sneakily
            .style('stroke-dashoffset', 3000);
            // .style("stroke", d3.color("red") );


        const yAxis = d3.axisLeft(yPositionScale).tickFormat(formatPercent);
        svg.append("g")
            .attr("class", "axis y-axis")
            .call(yAxis)

        const xAxis = d3.axisBottom(xPositionScale).tickFormat(d=> d3.timeFormat("%b-%Y")(d));
        svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)


    // console.log(cpiLine)

    // do stuff to the chart here
    // depending on what step you are at
    const updateChart = (step_index, direction)=>{

        console.log('we are at step', step_index);

        if(step_index === 0){
            //animating my lines into view
            if(direction==='forward'){
                // d3.select('.month-container').select(cip)
                cpiLine
                .transition()
                .duration(1800)
                .attr("class")
                .style('stroke-dashoffset', 0)
                // .style('stroke-dasharray', 0);
                
            } else{
                cpiLine
                .style('opacity', 1).style('stroke-width', 1)
                .transition()
                .duration(1800)
                .style('stroke-dashoffset', 1500);
            }
            
        }



    };

    //select the steps
    let steps = d3.select('.month-container').selectAll('.step');

    enterView({
        selector: steps.nodes(), // which elements to pay attention to
        offset: 0.2, // the offset says when on the page should the trigger happen. 0.5 == when the top of the element reaches the middle of the page
        enter: el => { // when it enters, do this
            const index = +d3.select(el).attr('data-index'); //get the "data-index" attribute
            updateChart(index, 'forward'); // run the updateChart function, pass it the 'data-index"
        },
        exit: el => { // when it leaves view (aka scrolling backwards), do this
            let index = +d3.select(el).attr('data-index'); // get the index
            index = Math.max(0, index - 1); // subtract one but don't go lower than 0
            updateChart(index, 'back'); // update with the new index
        }
    });
    }
})()
