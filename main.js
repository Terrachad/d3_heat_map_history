let url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'
let req = new XMLHttpRequest()

let baseTemp
let variances = [];

let xScale
let yScale

let width = 1200;
let height = 500;
let margin = 60;
let minYear;
let maxYear;

let months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

let colors = ['#4575b4','#74add1','#abd9e9','#e0f3f8','#ffffbf','#fee090','#fdae61','#f46d43','#d73027']

let colorTicks = [2.8,3.9,5.0,6.1,7.2,8.3,9.5,10.6,11.7,12.8]

console.log({colorTicks})
let monthTicks = [];//[0.5,1.5,2.5,3.5,4.5,5.5,6.5,7.5,8.5];
for(let i=0.5; i < 12; i++)monthTicks.push(i)



let canvas = d3.select('#canvas')
canvas.attr('width',width).attr('height',height)




let calcScales = () =>{
    maxYear = d3.max(variances, function(d){
        return d['year']
    }) 
    minYear = d3.min(variances, function(d){
        return d['year']
    }) 
    
    xScale = d3.scaleLinear()
               .domain([minYear, maxYear+1])
               .range([margin, width - margin])

    
    yScale = d3.scaleLinear()
               .domain([0,12])
               .range([margin, height - margin])

    legendScale = d3.scaleLinear()
                    .domain([1.5,14.1])
                    .range([0, width*0.35 - margin])
}

let makeLegend = () =>{
}

let makeHeading = () =>{
    let heading = d3.select('body').append('heading');

  heading
    .append('h1')
    .attr('id', 'title')
    .text('Monthly Global Land-Surface Temperature');
  heading
    .append('h3')
    .attr('id', 'description')
    .html(`
      ${minYear}
        ${maxYear} 
        ${baseTemp} 
        '&#8451;
    `);
}



let drawCells = () => {

    const tooltip = d3.select('#tooltip')

    console.log({minYear, maxYear})
   
    canvas
    .selectAll('rect')
    .data(variances)
    .enter()
    .append('rect')
    .attr('class','cell')
    .style('fill',(item) => {
        let temp = (item['variance'] + baseTemp).toFixed(1)
        console.log(temp)
        if (temp >= colorTicks[8] ){return colors[8]}
        else if (temp >= colorTicks[7]){return colors[7]}
        else if (temp >= colorTicks[6]){return colors[6]}
        else if (temp >= colorTicks[5]){return colors[5]}
        else if (temp >= colorTicks[4]){return colors[4]}
        else if (temp >= colorTicks[3]){return colors[3]}
        else if (temp >= colorTicks[2]){return colors[2]}
        else if (temp >= colorTicks[1]){return colors[1]}
        else {return colors[0]}

            
    })
    .attr('data-year', (item) => {
        return item['year']
    })
    .attr('data-month', (item) => {
        return item['month']-1
    })
    .attr('data-temp', (item) => {
        return baseTemp + item['variance']
    })
    .attr('height',(height - margin*2)/12)
    .attr('y', (item) =>{
        return yScale(item['month'] - 1)
    })
    .attr('width',(item)=>{
        let Years = maxYear - minYear
        return (width-margin*2) / Years
    })
    .attr('x',(item) => {
        return xScale(item['year'])
    })
    .on('mouseover',(event,item,index) => {

        let temp = (item['variance'] + baseTemp).toFixed(1)
        tooltip
        .html(`${item['year']} <br> ${temp}°C <br> ${item['variance'].toFixed(1)}°C`)
        .attr('data-year',item['year'])
        .style('left',(event.pageX) + "px")
        .style('top',(event.pageY) + "px")
        .style('color','black')
        .transition()
        .style('opacity','1')
        .attr('id','tooltip')
        
    })
    .on('mouseout', (item)=>{
        tooltip
        .transition()
        .style('opacity','0')
    })
    
    let rectheight = 30;
    canvas
    .append('g')
    .attr('id','legend')
    .selectAll('rect')
    .data(colors)
    .enter()
    .append('rect')
    .style('stroke','black')
    .attr('height',rectheight)
    .attr('width', (item,index) =>{
        if(index > 7)
            return  (width*0.35 - margin) / 11.5

        return (width*0.35 - margin) / colorTicks.length 
    })
    .attr('y', (item) =>{
        return height + margin/2 - rectheight
    })
    .attr('x', (item,index) =>{
        return legendScale(colorTicks[index]) + margin
    })
    .attr('fill',(item, index) =>{
            return colors[index]
    })



}

let drawAxes = () =>{
    let xAxis = d3.axisBottom(xScale)
                  .tickFormat(d3.format('d'))

    canvas
    .append('g')
    .call(xAxis)
    .attr('id','x-axis')
    .attr('transform', `translate(0,${height - margin})`)
    

    let yAxis = d3.axisLeft(yScale)
    .tickValues(monthTicks)
    .tickFormat(function(d,i){ return months[i] })



    canvas
    .append('g')
    .call(yAxis)
    .attr('id','y-axis')
    .attr('transform', `translate(${margin},0)`)
    .select(".domain").remove();

    let legendAxis = d3.axisBottom(legendScale)
    .tickValues(colorTicks)
    .tickFormat(function(d,i){ return colorTicks[i] })


    console.log(colorTicks)
    canvas
    .append('g')
    .call(legendAxis)
    .attr('id','legend-axis')
    .attr('transform', `translate(${margin},${height+margin/2})`)

      
}


req.open('GET',url,true)
req.onload = () => {
    let object = JSON.parse(req.responseText)
    baseTemp = object['baseTemperature']
    variances = object['monthlyVariance']
    console.log({baseTemp, variances})
    calcScales();
    drawCells();
    drawAxes();
    makeHeading();

}
req.send()



