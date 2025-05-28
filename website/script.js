// Data and configuration
const DATA_CONFIG = {
    religion: {
        file: 'data/countries.json',
        key: 'religionMajority',
        colors: {
            'Christian': '#2E86AB',
            'Muslim': '#A23B72',
            'Nothing in particular': '#F18F01',
            'Atheist': '#C73E1D',
            'Other': '#8B8B8B'
        }
    },
    economic: {
        file: 'data/countries.json',
        key: 'economicMajority',
        colors: {
            'Very good': '#2D5016',
            'Somewhat good': '#61A25C',
            'Somewhat bad': '#FFB563',
            'Very bad': '#D2001C'
        }
    },
    marriage: {
        file: 'data/countries.json',
        key: 'marriageMajority',
        colors: {
            'Married': '#2E86AB',
            'Never been married': '#A23B72',
            'Divorced': '#F18F01',
            'Widowed': '#8B4A6B',
            'Living with a partner': '#61A25C',
            'In a civil partnership': '#C73E1D',
            'Separated': '#FF6B6B'
        }
    },
    abortion: {
        file: 'data/countries.json',
        key: 'abortionMajority',
        colors: {
            'Legal in all cases': '#2D5016',
            'Legal in most cases': '#61A25C',
            'Illegal in most cases': '#FFB563',
            'Illegal in all cases': '#D2001C'
        }
    },
    sameSex: {
        file: 'data/countries.json',
        key: 'sameSexMajority',
        colors: {
            'Strongly favor': '#2D5016',
            'Favor': '#61A25C',
            'Oppose': '#FFB563',
            'Strongly oppose': '#D2001C'
        }
    },
    age: {
        file: 'data/countries.json',
        key: 'medianAge',
        type: 'continuous',
        colors: d3.scaleSequential(d3.interpolateViridis).domain([30, 60])
    }
};

// Global state
let currentView = 'religion';
let compareMode = false;
let selectedCountries = [];
let countriesData = [];
let topoData = null;

// Initialize the visualization
async function init() {
    try {
        // Load data
        const [countries, topology] = await Promise.all([
            d3.json('data/countries.json'),
            d3.json('data/europe-topo.json')
        ]);

        countriesData = countries;
        topoData = topology;

        // Set up the map
        setupMap();
        setupControls();
        updateVisualization();

    } catch (error) {
        console.error('Error loading data:', error);
        document.querySelector('.map-container').innerHTML = 
            '<div class="no-data">Error loading data. Please check that all data files are available.</div>';
    }
}

function setupMap() {
    const svg = d3.select('#map');
    const width = 800;
    const height = 600;
    
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Set up projection
    const projection = d3.geoNaturalEarth1()
        .scale(1000)
        .center([20, 55])
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Convert topojson to geojson
    const countries = topojson.feature(topoData, topoData.objects.europe);

    // Draw countries
    svg.selectAll('.country')
        .data(countries.features)
        .enter()
        .append('path')
        .attr('class', 'country-path')
        .attr('d', path)
        .on('click', handleCountryClick)
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut);

    // Add zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', (event) => {
            svg.selectAll('.country-path')
                .attr('transform', event.transform);
        });

    svg.call(zoom);
}

function setupControls() {
    // View selector
    d3.selectAll('input[name="view"]').on('change', function() {
        currentView = this.value;
        updateVisualization();
        hideTooltip();
    });

    // Compare button
    d3.select('#compare-btn').on('click', function() {
        toggleCompareMode();
    });
}

function toggleCompareMode() {
    compareMode = !compareMode;
    selectedCountries = [];
    
    const btn = d3.select('#compare-btn');
    const instructions = d3.select('#compare-instructions');
    
    if (compareMode) {
        btn.text('Exit Compare Mode').classed('active', true);
        instructions.style('display', 'block');
        d3.select('#comparison-charts').classed('visible', false);
    } else {
        btn.text('Compare Countries').classed('active', false);
        instructions.style('display', 'none');
        d3.select('#comparison-charts').classed('visible', false);
    }

    // Reset country selections
    d3.selectAll('.country-path').classed('selected', false);
    hideTooltip();
}

function handleCountryClick(event, d) {
    const countryName = d.properties.NAME || d.properties.name;
    const countryData = countriesData.find(c => c.country === countryName);

    if (compareMode) {
        handleCountrySelection(event, d, countryData);
    } else {
        showCountryDetails(countryData, event);
    }
}

function handleCountrySelection(event, geoData, countryData) {
    const countryName = geoData.properties.NAME || geoData.properties.name;
    const countryElement = d3.select(event.currentTarget);

    // Check if already selected
    const existingIndex = selectedCountries.findIndex(c => c.name === countryName);
    
    if (existingIndex !== -1) {
        // Deselect
        selectedCountries.splice(existingIndex, 1);
        countryElement.classed('selected', false);
    } else if (selectedCountries.length < 2) {
        // Select
        selectedCountries.push({
            name: countryName,
            data: countryData,
            element: countryElement
        });
        countryElement.classed('selected', true);
    }

    // Update comparison charts if we have 2 countries
    if (selectedCountries.length === 2) {
        showComparison();
    } else {
        d3.select('#comparison-charts').classed('visible', false);
    }
}

function handleMouseOver(event, d) {
    if (!compareMode) {
        const countryName = d.properties.NAME || d.properties.name;
        const countryData = countriesData.find(c => c.country === countryName);
        showTooltip(countryData, event);
    }
}

function handleMouseOut() {
    if (!compareMode) {
        hideTooltip();
    }
}

function updateVisualization() {
    const config = DATA_CONFIG[currentView];
    
    // Update country colors
    d3.selectAll('.country-path')
        .attr('fill', d => {
            const countryName = d.properties.NAME || d.properties.name;
            const countryData = countriesData.find(c => c.country === countryName);
            
            if (!countryData) return '#f0f0f0';
            
            if (config.type === 'continuous') {
                const value = countryData[config.key];
                return value ? config.colors(value) : '#f0f0f0';
            } else {
                const majority = countryData[config.key];
                return config.colors[majority] || '#f0f0f0';
            }
        });

    // Update legend
    updateLegend();
}

function updateLegend() {
    const config = DATA_CONFIG[currentView];
    const legendContent = d3.select('#legend-content');
    
    legendContent.selectAll('*').remove();

    if (config.type === 'continuous') {
        // For continuous data like age, show a gradient
        const legendSvg = legendContent.append('svg')
            .attr('width', '100%')
            .attr('height', '60px');

        const gradient = legendSvg.append('defs')
            .append('linearGradient')
            .attr('id', 'legend-gradient')
            .attr('x1', '0%').attr('x2', '100%');

        const domain = config.colors.domain();
        const steps = 10;
        
        for (let i = 0; i <= steps; i++) {
            const value = domain[0] + (domain[1] - domain[0]) * (i / steps);
            gradient.append('stop')
                .attr('offset', `${(i / steps) * 100}%`)
                .attr('stop-color', config.colors(value));
        }

        legendSvg.append('rect')
            .attr('width', '100%')
            .attr('height', '20px')
            .style('fill', 'url(#legend-gradient)')
            .attr('y', 10);

        legendSvg.append('text')
            .attr('x', 0)
            .attr('y', 45)
            .text(`${domain[0]}`)
            .style('font-size', '12px');

        legendSvg.append('text')
            .attr('x', '100%')
            .attr('y', 45)
            .attr('text-anchor', 'end')
            .text(`${domain[1]}`)
            .style('font-size', '12px');

    } else {
        // For categorical data, show color swatches
        Object.entries(config.colors).forEach(([key, color]) => {
            const item = legendContent.append('div')
                .attr('class', 'legend-item');
            
            item.append('div')
                .attr('class', 'legend-color')
                .style('background-color', color);
            
            item.append('span')
                .text(key);
        });
    }
}

function showTooltip(countryData, event) {
    const tooltip = d3.select('#tooltip');
    
    if (!countryData) {
        tooltip.classed('visible', false);
        return;
    }

    let content = `<h4>${countryData.country}</h4>`;
    
    const config = DATA_CONFIG[currentView];
    
    if (currentView === 'age') {
        content += `<div>Median Age: <strong>${countryData.medianAge || 'N/A'}</strong></div>`;
    } else {
        const distKey = currentView === 'religion' ? 'rDist' :
                       currentView === 'economic' ? 'eDist' :
                       currentView === 'marriage' ? 'mDist' :
                       currentView === 'abortion' ? 'aDist' :
                       'sDist';
        
        const distribution = countryData[distKey];
        const majority = countryData[config.key];
        
        if (distribution && Object.keys(distribution).length > 0) {
            content += '<ul>';
            Object.entries(distribution)
                .sort(([,a], [,b]) => b - a)
                .forEach(([key, value]) => {
                    const className = key === majority ? 'majority' : '';
                    content += `<li class="${className}">${key}: ${value.toFixed(1)}%</li>`;
                });
            content += '</ul>';
        } else {
            content += '<div>No data available</div>';
        }
    }

    tooltip.html(content)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
        .classed('visible', true);
}

function hideTooltip() {
    d3.select('#tooltip').classed('visible', false);
}

function showComparison() {
    d3.select('#comparison-charts').classed('visible', true);
    
    selectedCountries.forEach((country, index) => {
        const chartId = `chart${index + 1}`;
        const titleId = `chart${index + 1}-title`;
        
        d3.select(`#${titleId}`).text(country.name);
        
        if (currentView === 'age') {
            showAgeComparison(chartId, country.data);
        } else {
            showDistributionChart(chartId, country.data);
        }
    });
}

function showDistributionChart(chartId, countryData) {
    const svg = d3.select(`#${chartId}`);
    svg.selectAll('*').remove();

    const distKey = currentView === 'religion' ? 'rDist' :
                   currentView === 'economic' ? 'eDist' :
                   currentView === 'marriage' ? 'mDist' :
                   currentView === 'abortion' ? 'aDist' :
                   'sDist';
    
    const distribution = countryData[distKey];
    
    if (!distribution || Object.keys(distribution).length === 0) {
        svg.append('text')
            .attr('x', '50%')
            .attr('y', '50%')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .text('No data available')
            .style('font-size', '16px')
            .style('fill', '#999');
        return;
    }

    const width = 350;
    const height = 350;
    const radius = Math.min(width, height) / 2 - 40;

    const g = svg.append('g')
        .attr('transform', `translate(${width/2}, ${height/2})`);

    const pie = d3.pie()
        .value(d => d.value)
        .sort(null);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    const data = Object.entries(distribution).map(([key, value]) => ({
        key, value
    }));

    const config = DATA_CONFIG[currentView];
    
    const arcs = g.selectAll('.arc')
        .data(pie(data))
        .enter().append('g')
        .attr('class', 'arc');

    arcs.append('path')
        .attr('d', arc)
        .attr('fill', d => config.colors[d.data.key] || '#999')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

    arcs.append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', '#fff')
        .text(d => d.data.value > 5 ? `${d.data.value.toFixed(1)}%` : '');
}

function showAgeComparison(chartId, countryData) {
    const svg = d3.select(`#${chartId}`);
    svg.selectAll('*').remove();

    const age = countryData.medianAge;
    
    if (!age) {
        svg.append('text')
            .attr('x', '50%')
            .attr('y', '50%')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .text('No age data available')
            .style('font-size', '16px')
            .style('fill', '#999');
        return;
    }

    const width = 350;
    const height = 350;

    // Create a simple bar chart for age
    const maxAge = 70;
    const barHeight = 50;
    const barWidth = (age / maxAge) * (width - 100);

    const g = svg.append('g')
        .attr('transform', `translate(50, ${height/2})`);

    // Background bar
    g.append('rect')
        .attr('width', width - 100)
        .attr('height', barHeight)
        .attr('fill', '#f0f0f0')
        .attr('stroke', '#ddd');

    // Age bar
    g.append('rect')
        .attr('width', barWidth)
        .attr('height', barHeight)
        .attr('fill', DATA_CONFIG.age.colors(age));

    // Age text
    
