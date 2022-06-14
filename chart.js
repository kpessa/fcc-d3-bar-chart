// let { svg, width, height, margin, innerWidth, innerHeight } = setUpChart();

getData().then(data => {
	addTitle('United States GDP');
	addYAxisTitle('Gross Domestic Product');

	let [dates, values] = getDatesAndValues(data);
	let [xScaleTime, xScaleBand, yScale] = createScales(dates, values);
	appendAxes(xScaleTime, yScale);
	addBars(dates, values, xScaleBand, yScale);
});
