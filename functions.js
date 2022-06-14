let { select, csv, scaleLinear, max, scaleBand, scaleTime, axisLeft, axisBottom, mouse } = d3;

let { svg, g, width, height, margin, innerWidth, innerHeight } = setUpChart();

function setUpChart() {
	const svg = select('svg');

	const width = +svg.attr('width');
	const height = +svg.attr('height');
	const margin = { top: 60, right: 30, bottom: 70, left: 60 };
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;
	const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

	return { svg, g, width, height, margin, innerWidth, innerHeight };
}

async function getData(dataPoints = 'all') {
	const response = await fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json');
	const data = await response.json();
	if (dataPoints === 'all') {
		return data.data;
	} else {
		return data.data.slice(0, dataPoints);
	}
}

function getDatesAndValues(data) {
	var parseDate = d3.timeParse('%Y-%m-%d');

	let dates = data.map(([date, value]) => parseDate(date));
	let values = data.map(([date, value]) => value);

	return [dates, values];
}

function createScales(dates, values) {
	const yScale = scaleLinear()
		.domain([0, d3.max(values)])
		.range([innerHeight, 0]);

	const xScaleTime = scaleTime().domain(d3.extent(dates)).range([0, innerWidth]);

	const xScaleBand = scaleBand().domain(dates).range([0, innerWidth]).padding(0.1);

	return [xScaleTime, xScaleBand, yScale];
}

function appendAxes(xScale, yScale) {
	g.append('g').call(axisLeft(yScale)).attr('id', 'y-axis');

	g.append('g')
		.call(axisBottom(xScale).tickFormat(d3.timeFormat('%Y')))
		.attr('transform', `translate(0, ${innerHeight})`)
		.attr('id', 'x-axis');
}

function addBars(dates, values, xScaleBand, yScale) {
	var tooltip = d3.select('body').append('div').attr('id', 'tooltip').style('opacity', 0);

	let data = Array(dates.length)
		.fill()
		.map((_, i) => ({
			date: dates[i],
			gdp: values[i],
		}));

	select('g')
		.selectAll('rect')
		.data(data)
		.enter()
		.append('rect')
		.attr('x', (d, i) => xScaleBand(d.date))
		.attr('y', d => yScale(d.gdp))
		.attr('width', xScaleBand.bandwidth())
		.attr('height', d => innerHeight - yScale(d.gdp))
		.attr('class', 'bar')
		.attr('data-date', d => d.date.toISOString().split('T')[0])
		.attr('data-gdp', d => d.gdp)
		.on('mouseover', function (d) {
			tooltip.style('opacity', 1).attr('data-date', d.date.toISOString().split('T')[0]);

			let formatter = new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
				minimumFractionDigits: 0,
				maximumFractionDigits: 0,
			});

			tooltip.insert('h1').text(formatter.format(d.gdp));
			tooltip.insert('p').text('billion USD');
			tooltip.insert('pre').text(`${d.date.getFullYear()} Q${getQuarter(d.date)}`);

			tooltip.style('left', d3.event.pageX + 'px').style('top', d3.event.pageY - 28 + 'px');
		})
		.on('mouseout', function (d) {
			tooltip.style('opacity', 0);
			tooltip.text('');
		});
}

function addYAxisTitle(str = 'Gross Domestic Product') {
	svg
		.select('g')
		.append('text')
		.attr('id', 'y-axis-title')
		.attr('x', margin.left - 40)
		.attr('y', margin.top - 10)
		.text(str)
		.style('transform-origin', '10% 20%')
		.style('transform', 'rotate(-90deg)');
}

function addTitle(str = 'United States GDP') {
	g.append('text')
		.attr('id', 'title')
		.attr('x', innerWidth / 2)
		.attr('y', 20)
		.attr('text-anchor', 'middle')
		.text(str)
		.style('font-size', '2.5rem');
}
