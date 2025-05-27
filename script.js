const width = document.getElementById("map").clientWidth;
const height = document.getElementById("map").clientHeight;
const religionColors = d3.scaleOrdinal()
  .domain([
    "Christian", "Catholic", "Protestant", "Orthodox",
    "Muslim", "Jewish", "Atheist", "Nothing in particular", "Other"
  ])
  .range([
    "#1f77b4", // Christian
    "#4daf4a", // Catholic
    "#377eb8", // Protestant
    "#984ea3", // Orthodox
    "#e41a1c", // Muslim
    "#ff7f00", // Jewish
    "#a65628", // Atheist
    "#f781bf", // Nothing in particular 
    "#999999"  // Other
  ]);
  const legend = d3.select("#legend")
  .style("display", "flex")
  .style("flex-wrap", "wrap")
  .style("gap", "10px");

religionColors.domain().forEach(r => {
  const item = legend.append("div")
    .style("display", "flex")
    .style("align-items", "center");

  item.append("div")
    .style("width", "16px")
    .style("height", "16px")
    .style("margin-right", "6px")
    .style("background-color", religionColors(r))
    .style("border", "1px solid #ccc");

  item.append("span")
    .style("font-size", "14px")
    .text(r);
});
let countries = [];

function loadReligionData(callback) {
  d3.csv("data/religions_cleaned.csv").then(data => {
    const grouped = d3.group(data, d => d.country);
    countries = [];

    grouped.forEach((records, country) => {
      let max = -Infinity;
      let mainReligion = "Other";
      let dist = {};
      records.forEach(row => {
        const p = parseFloat(row.percentage);
        dist[row.religion] = p;
        if (p > max) {
          max = p;
          mainReligion = row.religion;
        }
      });
      countries.push({
        name: country,
        religionDist: dist,
        religion: mainReligion
      });
    });

    callback(); // trigger rendering
  });
}

console.log("log");
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

const zoom = d3
  .zoom()
  .scaleExtent([1, 8]) // how far users can zoom in/out
  .on("zoom", (event) => {
    svg
      .selectAll("g") // apply transform to *all* your layers
      .attr("transform", event.transform);
  });

loadReligionData(() => {
  d3.json("data/europe-topo.json").then((topo) => {
    const geo = topojson.feature(topo, topo.objects.europe);
    const countryGroup = svg.append("g").attr("id", "countries");

    countryGroup
      .selectAll("path")
      .data(geo.features)
      .join("path")
      .attr("d", path)
      .attr("fill", d => {
        const country = countries.find(c => c.name === d.properties.NAME);
        return country ? religionColors(country.religion) : "#ccc";
      })
      .attr("stroke", "#999")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();

        const country = countries.find((c) => c.name === d.properties.NAME);
        if (!country) return;

        if (!compareMode) {
          svg.selectAll("#countries path").classed("country-highlight", false);
          d3.select(event.currentTarget).classed("country-highlight", true);

          const [mx, my] = d3.pointer(event, svg.node());
          tooltip
            .html(`<strong>${country.name}</strong><br>${country.religion}`)
            .style("left", `${mx + 10}px`)
            .style("top", `${my - 28}px`)
            .style("display", "block");
        } else {
          selectCountry(country, d3.select(event.currentTarget));
        }
      });

    svg.on("click.tooltip", () => {
      if (!compareMode) {
        tooltip.style("display", "none");
        svg.selectAll("#countries path").classed("country-highlight", false);
      }
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
});
