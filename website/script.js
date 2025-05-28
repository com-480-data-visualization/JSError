(async function () {
  // --- Constants & Setup ---
  const width = document.getElementById("map").clientWidth;
  const height = document.getElementById("map").clientHeight;

  const svg = d3
    .select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const projection = d3
    .geoNaturalEarth1()
    .scale(1050)
    .center([15, 55])
    .translate([width / 2, height / 2]);
  const path = d3.geoPath().projection(projection);

  const dataFiles = {
    religion: "data/religions_cleaned.csv",
    economic: "data/economic_state_percentages.csv",
    marriage: "data/marriage_status_percentages.csv",
    age: "data/median_age.csv",
    abortion: "data/support_abortion.csv",
    sameSex: "data/support_same_sex_marriage.csv",
  };

  const religionColors = d3
    .scaleOrdinal()
    .domain([
      "Christian",
      "Catholic",
      "Protestant",
      "Orthodox",
      "Muslim",
      "Jewish",
      "Atheist",
      "Nothing in particular",
      "Other",
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
      "#999999", // Other
    ]);
  const legend = d3
    .select("#legend")
    .style("display", "flex")
    .style("flex-wrap", "wrap")
    .style("gap", "10px");

  religionColors.domain().forEach((r) => {
    const item = legend
      .append("div")
      .style("display", "flex")
      .style("align-items", "center");

    item
      .append("div")
      .style("width", "16px")
      .style("height", "16px")
      .style("margin-right", "6px")
      .style("background-color", religionColors(r))
      .style("border", "1px solid #ccc");

    item.append("span").style("font-size", "14px").text(r);
  });

  const views = [
    { key: "religion", label: "Predominant religion" },
    { key: "median_age", label: "Median Age" },
    { key: "marriage_status", label: "Marriage Status" },
    { key: "economic_state", label: "Perception of Economic State" },
    { key: "abortion_support", label: "Support for Abortion Rights" },
    { key: "same_sex_support", label: "Support for Same Sex Marriage" },
  ];

  let currentView = views[0].key;
  let compareMode = false;
  let selected = [];

  const tooltip = d3.select("#tooltip").style("position", "absolute");

  // --- Utility Functions ---
  function getCoordsByCountry(geoJSON) {
    return geoJSON.features.reduce((acc, feature) => {
      const name = feature.properties.name || feature.properties.NAME;
      acc[name] = d3.geoCentroid(feature);
      return acc;
    }, {});
  }

  async function loadDistribution(path) {
    const rows = await d3.csv(path);
    const categoryCol = Object.keys(rows[0]).find(
      (k) => k !== "country" && k !== "percentage"
    );
    const long = rows.map((d) => ({
      country: d.country,
      key: d[categoryCol],
      value: +d.percentage,
    }));
    return d3.group(long, (d) => d.country);
  }

  async function loadMedianAge(path) {
    const rows = await d3.csv(path);
    const map = new Map();
    rows.forEach((d) => map.set(d.country, +d.median_age));
    return map;
  }

  async function loadAllData() {
    const [religion, economic, marriage, abortion, sameSex] = await Promise.all(
      [
        loadDistribution(dataFiles.religion),
        loadDistribution(dataFiles.economic),
        loadDistribution(dataFiles.marriage),
        loadDistribution(dataFiles.abortion),
        loadDistribution(dataFiles.sameSex),
      ]
    );
    const age = await loadMedianAge(dataFiles.age);
    return { religion, economic, marriage, abortion, sameSex, age };
  }

  function processCountries(dataMaps, coordsByCountry) {
    const religionDist = dataMaps.religion;
    const economicDist = dataMaps.economic;
    const marriageDist = dataMaps.marriage;
    const abortionDist = dataMaps.abortion;
    const sameSexDist = dataMaps.sameSex;
    const ageMap = dataMaps.age;

    const allNames = new Set([
      ...religionDist.keys(),
      ...economicDist.keys(),
      ...marriageDist.keys(),
      ...abortionDist.keys(),
      ...sameSexDist.keys(),
      ...ageMap.keys(),
    ]);

    const makeDist = (distMap, country) => {
      const recs = distMap.get(country) || [];
      return Object.fromEntries(recs.map((d) => [d.key, d.value]));
    };

    const maxKey = (dist) => {
      const entries = Object.entries(dist);
      if (entries.length === 0) return null;
      return entries.reduce((best, curr) =>
        curr[1] > best[1] ? curr : best
      )[0];
    };

    return Array.from(allNames).map((country) => {
      const rDist = makeDist(religionDist, country);
      const eDist = makeDist(economicDist, country);
      const mDist = makeDist(marriageDist, country);
      const aDist = makeDist(abortionDist, country);
      const sDist = makeDist(sameSexDist, country);

      return {
        name: country,
        coords: coordsByCountry[country] || [0, 0],

        rDist,
        religionMajority: maxKey(rDist),

        eDist,
        economicMajority: maxKey(eDist),

        mDist,
        marriageMajority: maxKey(mDist),

        aDist,
        abortionMajority: maxKey(aDist),

        sDist,
        sameSexMajority: maxKey(sDist),

        medianAge: ageMap.get(country) ?? null,
      };
    });
  }

  // --- Main Initialization ---
  async function init() {
    const topo = await d3.json("data/europe-topo.json");
    const geo = topojson.feature(topo, topo.objects.europe);
    const coordsByCountry = getCoordsByCountry(geo);
    console.log("Country coordinates:", coordsByCountry);

    const dataMaps = await loadAllData();
    const countries = processCountries(dataMaps, coordsByCountry);
    initUI(geo, coordsByCountry, countries);
  }

  init();

  // --- UI Setup & Interaction ---
  function initUI(geo, coordsByCountry, countries) {
    // Draw countries
    const countryLayer = svg.append("g").attr("id", "countries");
    countryLayer
      .selectAll("path")
      .data(geo.features)
      .join("path")
      .attr("d", path)
      .attr("fill", "#ddd")
      .attr("stroke", "#999")
      .style("cursor", "pointer")
      .on("click", handleCountryClick);

    // Zoom behavior
    svg.call(
      d3
        .zoom()
        .scaleExtent([1, 8])
        .on("zoom", ({ transform }) =>
          svg.selectAll("g").attr("transform", transform)
        )
    );

    // Tooltip & background
    svg.on("click.tooltip", () => {
      if (!compareMode) {
        tooltip.style("display", "none");
        countryLayer.selectAll("path").classed("country-highlight", false);
      }
    });

    // View selectors
    d3.select("#view-panel")
      .selectAll("label")
      .data(views)
      .join("label")
      .html(
        (d) =>
          `<input type=\"radio\" name=\"view\" value=\"${d.key}\"${
            d.key === currentView ? " checked" : ""
          }> ${d.label}`
      )
      .on("change", (_, d) => {
        currentView = d.key;
        tooltip.style("display", "none");
      });

    // Compare button
    d3.select("#compareBtn").on("click", () => {
      compareMode = !compareMode;
      selected = [];
      d3.selectAll(".marker").classed("selected", false);
      d3.select("#charts").style("display", "none");
      d3.select("#compareBtn").text(compareMode ? "Select up to 2" : "Compare");
    });

    // Country click handler
    function handleCountryClick(event, d) {
      event.stopPropagation();
      const propName =
        d.properties.NAME ||
        d.properties.name ||
        d.properties.ADMIN ||
        d.properties.admin ||
        "";
      let country = countries.find(
        (c) =>
          c.name && propName && c.name.toLowerCase() === propName.toLowerCase()
      );
      if (!country) {
        country = {
          name: propName,
          medianAge: null,
          rDist: {},
          eDist: {},
          mDist: {},
          aDist: {},
          sDist: {},
          religionMajority: null,
          economicMajority: null,
          marriageMajority: null,
          abortionMajority: null,
          sameSexMajority: null,
        };
      }

      if (!compareMode) showSingle(country, event.currentTarget, event);
      else selectForCompare(country, d3.select(event.currentTarget));
    }

    function showSingle(country, node, event) {
      const sel = d3.select(node);
      countryLayer.selectAll("path").classed("country-highlight", false);
      sel.classed("country-highlight", true);

      const [mx, my] = d3.pointer(event, svg.node());
      let html = `<strong>${country.name}</strong><br>`;
      if (currentView === "median_age") {
        // explicit null check
        if (country.medianAge == null) {
          html += "No available data";
        } else {
          html += `Median Age: ${country.medianAge}`;
        }
      } else {
        let dist, majority;
        switch (currentView) {
          case "religion":
            dist = country.rDist;
            majority = country.religionMajority;
            break;
          case "economic_state":
            dist = country.eDist;
            majority = country.economicMajority;
            break;
          case "marriage_status":
            dist = country.mDist;
            majority = country.marriageMajority;
            break;
          case "abortion_support":
            dist = country.aDist;
            majority = country.abortionMajority;
            break;
          case "same_sex_support":
            dist = country.sDist;
            majority = country.sameSexMajority;
            break;
        }
        const entries = Object.entries(dist).sort((a, b) => b[1] - a[1]);
        if (entries.length === 0) {
          html += "No available data";
        } else {
          html += "<ul>";
          entries.forEach(([k, v]) => {
            const pct = v.toFixed(2) + "%";
            if (k === majority)
              html += `<li><strong>${k}: ${pct}</strong></li>`;
            else html += `<li>${k}: ${pct}</li>`;
          });
          html += "</ul>";
        }
      }
      tooltip
        .html(html)
        .style("left", `${mx + 10}px`)
        .style("top", `${my - 28}px`)
        .style("display", "block");
    }

    function selectForCompare(country, node) {
      if (selected.some((s) => s.name === country.name) || selected.length >= 2)
        return;
      node.classed("selected", true);
      selected.push(country);
      if (selected.length === 2) renderComparison();
    }

    function renderComparison() {
      d3.select("#charts").style("display", "flex");
      selected.forEach((c, i) =>
        renderPie(c.religionDist, `#chart${i + 1}`, c.name)
      );
    }

    function renderPie(data, selector, title) {
      const svgC = d3.select(selector);
      svgC.selectAll("*").remove();
      const w = +svgC.attr("width"),
        h = +svgC.attr("height");
      const radius = Math.min(w, h) / 2 - 10;
      const g = svgC
        .append("g")
        .attr("transform", `translate(${w / 2},${h / 2})`);

      const pie = d3.pie().value((d) => d[1])(Object.entries(data));
      const arc = d3.arc().innerRadius(0).outerRadius(radius);
      const color = d3
        .scaleOrdinal(d3.schemeCategory10)
        .domain(Object.keys(data));

      g.selectAll("path")
        .data(pie)
        .join("path")
        .attr("d", arc)
        .attr("fill", (d) => color(d.data[0]))
        .attr("stroke", "#fff");

      svgC
        .append("text")
        .attr("x", w / 2)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .text(title);
    }
  }
})();
