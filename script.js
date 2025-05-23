const width = document.getElementById("map").clientWidth;
const height = document.getElementById("map").clientHeight;

const svg = d3
  .select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// projection & path
const projection = d3
  .geoNaturalEarth1()
  .scale(1050)
  .center([15, 55]) // roughly Europe
  .translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);

// the “countries” data from your Leaflet example
const countries = [
  {
    name: "France",
    coords: [2.2137, 46.2276],
    religionDist: { Catholic: 70, Muslim: 15, Atheist: 15 },
    religion: "Christianity (Catholicism)" /*…*/,
  },
  {
    name: "Germany",
    coords: [10.4515, 51.1657],
    religionDist: { Protestant: 45, Catholic: 40, Atheist: 15 },
    religion: "Christianity (Protestantism & Catholicism)",
  },
  {
    name: "Italy",
    coords: [12.5674, 41.8719],
    religionDist: { Catholic: 80, Atheist: 10, Other: 10 },
    religion: "Christianity (Catholicism)",
  },
  {
    name: "United Kingdom",
    coords: [-3.436, 55.3781],
    religionDist: { Anglican: 50, Catholic: 20, Atheist: 30 },
    religion: "Christianity (Anglican)",
  },
  {
    name: "Spain",
    coords: [-3.7492, 40.4637],
    religionDist: { Catholic: 75, Atheist: 15, Muslim: 10 },
    religion: "Christianity (Catholicism)",
  },
  {
    name: "Russia",
    coords: [105.3188, 61.524],
    religionDist: { Orthodox: 72, Atheist: 16, Muslim: 10, Other: 2 },
    religion: "Christianity (Orthodox)",
  },
  {
    name: "Greece",
    coords: [21.8243, 39.0742],
    religionDist: { Orthodox: 90, Atheist: 5, Other: 5 },
    religion: "Christianity (Orthodox)",
  },
  {
    name: "Turkey",
    coords: [35.2433, 38.9637],
    religionDist: { Muslim: 98, Other: 2 },
    religion: "Islam",
  },
  {
    name: "Lithuania",
    coords: [23.8813, 55.1694],
    religionDist: { Catholic: 80, Judaism: 5, Orthodox: 5, Atheist: 10 },
    religion: "Christianity (Catholicism)",
  },
];

// the “views”
const views = [
  { key: "religion", label: "Predominant religion" },
  { key: "meaningInLife", label: "Does religion give meaning to life?" },
  // … add the rest
];

let currentView = views[0].key;
let compareMode = false;
let selected = [];

// tooltip
const tooltip = d3.select("#tooltip").style("position", "absolute");

// load Europe topojson
d3.json("data/europe-topo.json").then((topo) => {
  const geo = topojson.feature(topo, topo.objects.europe);
  const countryGroup = svg.append("g").attr("id", "countries");

  countryGroup
    .selectAll("path")
    .data(geo.features)
    .join("path")
    .attr("d", path)
    .attr("fill", "#ddd")
    .attr("stroke", "#999")
    .style("cursor", "pointer")
    .on("click", (event, d) => {
      event.stopPropagation();

      const country = countries.find((c) => c.name === d.properties.NAME);
      if (!country) return;

      if (!compareMode) {
        // 1) clear old highlight
        svg.selectAll("#countries path").classed("country-highlight", false);

        // 2) highlight this one
        d3.select(event.currentTarget).classed("country-highlight", true);

        // 3) compute pointer coords *inside* the SVG
        const [mx, my] = d3.pointer(event, svg.node());

        // 4) show & position tooltip
        tooltip
          .html(`<strong>${country.name}</strong><br>${country[currentView]}`)
          .style("left", `${mx + 10}px`)
          .style("top", `${my - 28}px`)
          .style("display", "block");
      } else {
        selectCountry(country, d3.select(event.currentTarget));
      }
    });
  // hide tooltip & clear highlight on background click
  svg.on("click.tooltip", () => {
    if (!compareMode) {
      tooltip.style("display", "none");
      svg.selectAll("#countries path").classed("country-highlight", false);
    }
  });

  const zoom = d3
    .zoom()
    .scaleExtent([1, 8]) // how far users can zoom in/out
    .on("zoom", (event) => {
      svg
        .selectAll("g") // apply transform to *all* your layers
        .attr("transform", event.transform);
    });

  svg.call(zoom);

  // view radio controls
  const vp = d3.select("#view-panel");
  vp.selectAll("label")
    .data(views)
    .enter()
    .append("label")
    .html(
      (d) =>
        `<input type="radio" name="view" value="${d.key}" ${
          d.key === currentView ? "checked" : ""
        }> ${d.label}`
    )
    .on("change", (_, d) => {
      currentView = d.key;
      tooltip.style("display", "none");
    });

  // compare button
  d3.select("#compareBtn").on("click", function () {
    compareMode = !compareMode;
    selected = [];
    d3.selectAll(".marker").classed("selected", false);
    d3.select(this).text(compareMode ? "Select up to 2" : "Compare");
    d3.select("#charts").style("display", "none");
  });

  function selectCountry(country, node) {
    if (selected.find((s) => s.name === country.name)) return;
    if (selected.length >= 2) return;
    node.classed("selected", true);
    selected.push(country);
    if (selected.length === 2) {
      showComparison(selected[0], selected[1]);
    }
  }

  function showComparison(c1, c2) {
    d3.select("#charts").style("display", "flex");
    [
      { c: c1, id: "#chart1" },
      { c: c2, id: "#chart2" },
    ].forEach((obj) => {
      renderPie(obj.c.religionDist, obj.id, obj.c.name);
    });
  }

  // draw a pie chart into <svg> at selector
  function renderPie(data, selector, title) {
    const svgC = d3.select(selector);
    svgC.selectAll("*").remove();
    const w = +svgC.attr("width"),
      h = +svgC.attr("height");
    const radius = Math.min(w, h) / 2 - 10;
    const g = svgC
      .append("g")
      .attr("transform", `translate(${w / 2},${h / 2})`);

    const pie = d3.pie().value((d) => d[1]);
    const arcs = pie(Object.entries(data));
    const arcGen = d3.arc().innerRadius(0).outerRadius(radius);

    const color = d3
      .scaleOrdinal(d3.schemeCategory10)
      .domain(Object.keys(data));

    g.selectAll("path")
      .data(arcs)
      .enter()
      .append("path")
      .attr("d", arcGen)
      .attr("fill", (d) => color(d.data[0]))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1);

    // title
    svgC
      .append("text")
      .attr("x", w / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .text(title);
  }
});
