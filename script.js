// script.js

document.addEventListener("DOMContentLoaded", function () {
  // --- Leaflet map init ---
  var map = L.map("map").setView([54.526, 15.2551], 4);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // --- Countries data ---
  var countries = [
    {
      name: "France",
      coords: [46.2276, 2.2137],
      religion: "Christianity (Catholicism)",
      economic: "Moderately prosperous",
      feelingSafe: "Yes",
      qMarried: "Civil partnership allowed",
      age: 42,
      freqReligious: "Monthly",
      supportSSM: "Yes",
      meaningInLife: "High",
      religionDist: {
        "Catholic Christianity": 70,
        Muslim: 15,
        Atheist: 15,
      },
    },
    {
      name: "Germany",
      coords: [51.1657, 10.4515],
      religion: "Christianity (Protestantism & Catholicism)",
      economic: "Prosperous",
      feelingSafe: "Mostly safe",
      qMarried: "Civil partnership legal",
      age: 45,
      freqReligious: "Weekly",
      supportSSM: "Yes",
      meaningInLife: "Medium",
      religionDist: {
        "Protestant Christianity": 45,
        "Catholic Christianity": 40,
        Atheist: 15,
      },
    },
    {
      name: "Italy",
      coords: [41.8719, 12.5674],
      religion: "Christianity (Catholicism)",
      economic: "Moderately prosperous",
      feelingSafe: "Safe",
      qMarried: "Civil partnership recognized",
      age: 43,
      freqReligious: "Monthly",
      supportSSM: "Yes",
      meaningInLife: "High",
      religionDist: {
        "Catholic Christianity": 80,
        Atheist: 10,
        Other: 10,
      },
    },
    {
      name: "United Kingdom",
      coords: [55.3781, -3.436],
      religion: "Christianity (Anglican)",
      economic: "Prosperous",
      feelingSafe: "Safe",
      qMarried: "Civil partnership recognized",
      age: 40,
      freqReligious: "Weekly",
      supportSSM: "Yes",
      meaningInLife: "Medium",
      religionDist: {
        "Anglican Christianity": 50,
        "Catholic Christianity": 20,
        Atheist: 30,
      },
    },
    {
      name: "Spain",
      coords: [40.4637, -3.7492],
      religion: "Christianity (Catholicism)",
      economic: "Moderately prosperous",
      feelingSafe: "Mostly safe",
      qMarried: "Civil partnership recognized",
      age: 41,
      freqReligious: "Monthly",
      supportSSM: "Yes",
      meaningInLife: "High",
      religionDist: {
        "Catholic Christianity": 75,
        Atheist: 15,
        Muslim: 10,
      },
    },
    {
      name: "Russia",
      coords: [61.524, 105.3188],
      religion: "Christianity (Orthodox)",
      economic: "Mixed",
      feelingSafe: "Somewhat safe",
      qMarried: "Not recognized",
      age: 38,
      freqReligious: "Rarely",
      supportSSM: "No",
      meaningInLife: "Medium",
      religionDist: {
        "Orthodox Christianity": 72,
        Atheist: 16,
        Muslim: 10,
        Other: 2,
      },
    },
    {
      name: "Greece",
      coords: [39.0742, 21.8243],
      religion: "Christianity (Orthodox)",
      economic: "Moderately prosperous",
      feelingSafe: "Safe",
      qMarried: "Not recognized",
      age: 44,
      freqReligious: "Weekly",
      supportSSM: "No",
      meaningInLife: "High",
      religionDist: {
        "Orthodox Christianity": 90,
        Atheist: 5,
        Other: 5,
      },
    },
    {
      name: "Turkey",
      coords: [38.9637, 35.2433],
      religion: "Islam",
      economic: "Mixed",
      feelingSafe: "Somewhat safe",
      qMarried: "Not recognized",
      age: 30,
      freqReligious: "Daily",
      supportSSM: "No",
      meaningInLife: "High",
      religionDist: {
        Muslim: 98,
        Other: 2,
      },
    },
    {
      name: "Lithuania",
      coords: [55.1694, 23.8813],
      religion: "Christianity (Catholicism)",
      economic: "Average economic state perception",
      feelingSafe: "Mostly safe",
      qMarried: "Civil partnerships not recognized",
      age: 39,
      freqReligious: "Monthly",
      supportSSM: "No",
      meaningInLife: "High",
      religionDist: {
        "Catholic Christianity": 80,
        Judaism: 5,
        "Orthodox Christianity": 5,
        Atheist: 10,
      },
    },
  ];

  // --- Views & state ---
  var views = [
    { key: "religion", label: "Predominant religion" },
    { key: "economic", label: "Economic state perception" },
    { key: "feelingSafe", label: "How safe people feel?" },
    { key: "qMarried", label: "Civil partnership (QMARRIED)" },
    { key: "age", label: "Age at last birthday" },
    { key: "freqReligious", label: "Frequency of religious activities" },
    { key: "supportSSM", label: "Support for same-sex marriage" },
    { key: "meaningInLife", label: "Does religion give meaning to life?" },
  ];

  var currentView = views[0].key;
  var compareMode = false;
  var selected = [];
  // Marker layer group
  var markersGroup = L.layerGroup().addTo(map);

  // Build the radio control
  var viewControl = L.control({ position: "topright" });
  viewControl.onAdd = function () {
    var div = L.DomUtil.create("div", "view-control");
    views.forEach(function (v, i) {
      div.innerHTML +=
        '<input type="radio" name="view" id="' +
        v.key +
        '" value="' +
        v.key +
        '" ' +
        (i === 0 ? "checked" : "") +
        '> <label for="' +
        v.key +
        '">' +
        v.label +
        "</label><br>";
    });
    L.DomEvent.disableClickPropagation(div);
    return div;
  };
  viewControl.addTo(map);

  // Build the Compare toggle button
  var cmpControl = L.control({ position: "topright" });
  cmpControl.onAdd = function () {
    var div = L.DomUtil.create("div", "compare-control");
    div.innerHTML = '<button id="compareBtn">Compare</button>';
    L.DomEvent.disableClickPropagation(div);
    return div;
  };
  cmpControl.addTo(map);

  // Draw markers for a given view
  function drawMarkers(viewKey) {
    currentView = viewKey;
    resetSelection();
    markersGroup.clearLayers();
    countries.forEach(function (c) {
      var marker = L.marker(c.coords).addTo(markersGroup);
      marker._country = c;
      marker.on("click", function () {
        if (compareMode) {
          selectCountry(c, marker);
        } else {
          var val = c[currentView];
          marker
            .bindPopup("<strong>" + c.name + "</strong><br>" + val)
            .openPopup();
        }
      });
    });
  }

  // Handle radio changes
  document
    .querySelectorAll('.view-control input[name="view"]')
    .forEach(function (r) {
      r.addEventListener("change", function () {
        drawMarkers(this.value);
      });
    });

  // Compare button toggling
  document.getElementById("compareBtn").addEventListener("click", function () {
    compareMode = !compareMode;
    this.textContent = compareMode ? "Select 2 countries" : "Compare";
    resetSelection();
  });

  // Reset selections & hide charts
  function resetSelection() {
    selected.forEach(function (s) {
      s.marker.setIcon(new L.Icon.Default());
    });
    selected = [];
    document.getElementById("charts").style.display = "none";
  }

  // --- Select up to two countries ---
  function selectCountry(country, marker) {
    if (selected.find((s) => s.country.name === country.name)) return;
    if (selected.length >= 2) return;

    // highlight marker
    marker.setIcon(
      L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
        shadowUrl: "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
    );

    selected.push({ country: country, marker: marker });
    if (selected.length === 2) {
      showComparisonCharts();
    }
  }

  // --- Show comparison pie charts ---
  function showComparisonCharts() {
    var chartsDiv = document.getElementById("charts");
    chartsDiv.style.display = "flex";

    // Destroy previous charts if any
    //   if (window.chart1) window.chart1.destroy();
    //   if (window.chart2) window.chart2.destroy();

    // Country data
    var c1 = selected[0].country;
    var c2 = selected[1].country;
    var d1 = c1.religionDist;
    var d2 = c2.religionDist;

    // Ensure data exists
    if (!d1 || !d2) {
      alert("No distribution data available for this view.");
      return;
    }

    // Create pie chart for country 1
    var canvas1 = document.getElementById("chart1");
    var ctx1 = canvas1.getContext("2d");
    window.chart1 = new Chart(ctx1, {
      type: "pie",
      data: {
        labels: Object.keys(d1),
        datasets: [{ data: Object.values(d1) }],
      },
      options: {
        responsive: false,
        plugins: { title: { display: true, text: c1.name } },
      },
    });

    // Create pie chart for country 2
    var canvas2 = document.getElementById("chart2");
    var ctx2 = canvas2.getContext("2d");
    window.chart2 = new Chart(ctx2, {
      type: "pie",
      data: {
        labels: Object.keys(d2),
        datasets: [{ data: Object.values(d2) }],
      },
      options: {
        responsive: false,
        plugins: { title: { display: true, text: c2.name } },
      },
    });
  }

  // initial draw
  drawMarkers();
});
