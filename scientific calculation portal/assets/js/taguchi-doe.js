// Define orthogonal arrays
const arrays = {
  L4: {
    factors: ["A", "B"],
    levels: 2,
    runs: 4,
    OA: [
      {run:1, A:1, B:1},
      {run:2, A:1, B:2},
      {run:3, A:2, B:1},
      {run:4, A:2, B:2}
    ],
    factorRunMaps: {
      A: {1:[1,2], 2:[3,4]},
      B: {1:[1,3], 2:[2,4]}
    }
  },
  L9: {
    factors: ["A", "B", "C"],
    levels: 3,
    runs: 9,
    OA: [
      {run:1, A:1, B:1, C:1},
      {run:2, A:1, B:2, C:2},
      {run:3, A:1, B:3, C:3},
      {run:4, A:2, B:1, C:2},
      {run:5, A:2, B:2, C:3},
      {run:6, A:2, B:3, C:1},
      {run:7, A:3, B:1, C:3},
      {run:8, A:3, B:2, C:1},
      {run:9, A:3, B:3, C:2}
    ],
    factorRunMaps: {
      A: {1:[1,2,3], 2:[4,5,6], 3:[7,8,9]},
      B: {1:[1,4,7], 2:[2,5,8], 3:[3,6,9]},
      C: {1:[1,6,8], 2:[2,4,9], 3:[3,5,7]}
    }
  }
};

// Generate factor inputs
function generateFactorInputs(selectedArray) {
  const array = arrays[selectedArray];
  let html = "";
  for (let factor of array.factors) {
    html += `<label>Factor ${factor} Name: <input type="text" id="factor${factor}" value="${factor}"></label><br>`;
    for (let level = 1; level <= array.levels; level++) {
      html += `<label>Level ${level}: <input type="text" id="${factor}${level}" value="Level ${level}"></label>`;
    }
    html += "<br><br>";
  }
  document.getElementById("factorInputs").innerHTML = html;
}

// Generate measurement table
function generateMeasurementTable(selectedArray) {
  const array = arrays[selectedArray];
  let html = "<table><thead><tr><th>Run</th>";
  for (let f of array.factors) html += `<th>${f}</th>`;
  html += "<th>M1</th><th>M2</th><th>M3</th></tr></thead><tbody>";
  for (let run=1; run<=array.runs; run++) {
    const data = array.OA.find(o=>o.run===run);
    html += `<tr><td>${run}</td>`;
    for (let f of array.factors) html += `<td>${data[f]}</td>`;
    html += `<td><input type="number" class="measurement" data-run="${run}" data-meas="1"></td>`;
    html += `<td><input type="number" class="measurement" data-run="${run}" data-meas="2"></td>`;
    html += `<td><input type="number" class="measurement" data-run="${run}" data-meas="3"></td></tr>`;
  }
  html += "</tbody></table>";
  document.getElementById("measurementTable").innerHTML = html;
}

// Init defaults
let selectedArray = "L9";
generateFactorInputs(selectedArray);
generateMeasurementTable(selectedArray);

document.getElementById("arraySelect").addEventListener("change", function() {
  selectedArray = this.value;
  generateFactorInputs(selectedArray);
  generateMeasurementTable(selectedArray);
});

// Calculate S/N ratio
function calculateSN(measurements, type) {
  if (type === "larger") {
    let sum = measurements.reduce((acc,m)=>acc+(1/(m*m)),0);
    return -10 * Math.log10(sum/measurements.length);
  } else if (type === "smaller") {
    let sum = measurements.reduce((acc,m)=>acc+(m*m),0);
    return -10 * Math.log10(sum/measurements.length);
  } else if (type === "nominal") {
    let mean = measurements.reduce((a,b)=>a+b,0)/measurements.length;
    let variance = measurements.reduce((a,b)=>a+(b-mean)**2,0)/measurements.length;
    return 10*Math.log10((mean*mean)/variance);
  }
  return null;
}

document.getElementById("calculate").addEventListener("click", function() {
  const snType = document.getElementById("snType").value;
  const array = arrays[selectedArray];

  // Collect data
  let measurements = {};
  for (let run=1; run<=array.runs; run++) {
    measurements[run] = [];
    for (let meas=1; meas<=3; meas++) {
      let input = document.querySelector(`input[data-run="${run}"][data-meas="${meas}"]`);
      if (input.value) measurements[run].push(parseFloat(input.value));
    }
  }

  // S/N Ratios
  let snRatios = {};
  for (let run=1; run<=array.runs; run++) {
    if (measurements[run].length>0) snRatios[run] = calculateSN(measurements[run], snType);
  }

  let snDiv = document.getElementById("snRatios");
  snDiv.innerHTML = "<h4>S/N Ratios</h4><ul>";
  for (let run=1; run<=array.runs; run++) {
    snDiv.innerHTML += `<li>Run ${run}: ${snRatios[run]?.toFixed(2) || "No data"}</li>`;
  }
  snDiv.innerHTML += "</ul>";

  // Optimal Settings
  let avgSN = {}, optimal = {};
  for (let f of array.factors) {
    avgSN[f] = {};
    for (let lvl=1; lvl<=array.levels; lvl++) {
      let runs = array.factorRunMaps[f][lvl];
      let valid = runs.filter(r=>snRatios[r]!==undefined);
      avgSN[f][lvl] = valid.reduce((a,r)=>a+snRatios[r],0)/valid.length;
    }
    optimal[f] = Object.entries(avgSN[f]).sort((a,b)=>b[1]-a[1])[0][0];
  }

  let optDiv = document.getElementById("optimalSettings");
  optDiv.innerHTML = "<h4>Optimal Settings</h4><ul>";
  for (let f of array.factors) {
    let fname = document.getElementById(`factor${f}`).value;
    let lvl = optimal[f];
    let val = document.getElementById(`${f}${lvl}`).value;
    optDiv.innerHTML += `<li>${fname}: Level ${lvl} - ${val}</li>`;
  }
  optDiv.innerHTML += "</ul>";
});

// CSV Download
document.getElementById("download").addEventListener("click", function() {
  const rows = [["Run","Factor Levels","M1","M2","M3","S/N Ratio"]];
  const array = arrays[selectedArray];
  for (let run=1; run<=array.runs; run++) {
    const inputs = [...document.querySelectorAll(`input[data-run="${run}"]`)].map(i=>i.value||"");
    const factors = array.factors.map(f=>array.OA.find(o=>o.run===run)[f]).join("-");
    rows.push([run,factors,...inputs,""]);
  }
  const csv = rows.map(r=>r.join(",")).join("\n");
  const blob = new Blob([csv],{type:"text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "taguchi_results.csv";
  a.click();
  URL.revokeObjectURL(url);
});
