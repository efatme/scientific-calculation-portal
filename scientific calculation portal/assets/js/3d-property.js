document.getElementById("propertyForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const material = document.getElementById("material").value;
  const infill = parseFloat(document.getElementById("infill").value);
  const layer = parseFloat(document.getElementById("layer").value);
  const speed = parseFloat(document.getElementById("speed").value);
  const orientation = document.getElementById("orientation").value;
  const anneal = document.getElementById("anneal").value;

  // Base material properties (example values)
  const baseData = {
    PLA: { density: 1.24, strength: 60, modulus: 3.5 },
    ABS: { density: 1.05, strength: 40, modulus: 2.0 },
    PETG: { density: 1.27, strength: 50, modulus: 2.2 },
    Nylon: { density: 1.15, strength: 70, modulus: 2.8 }
  };

  let base = baseData[material];

  // Factors
  const infillFactor = infill / 100;
  const layerFactor = layer <= 0.2 ? 1.0 : 0.9;
  const speedFactor = speed > 80 ? 0.85 : 1.0;
  const orientFactor = orientation === "Z" ? 0.6 : 1.0;
  const annealFactor = anneal === "yes" ? 1.15 : 1.0;

  // Calculations
  const density = base.density * (0.5 + 0.5 * infillFactor);
  const strength = base.strength * infillFactor * layerFactor * orientFactor * annealFactor * speedFactor;
  const stiffness = base.modulus * infillFactor * orientFactor * annealFactor;

  let result = "--- 3D Print Property Estimate ---\n";
  result += `Material: ${material}\n`;
  result += `Infill: ${infill}%\n`;
  result += `Layer Thickness: ${layer} mm\n`;
  result += `Print Speed: ${speed} mm/s\n`;
  result += `Orientation: ${orientation}\n`;
  result += `Annealed: ${anneal}\n\n`;
  result += `Estimated Density: ${density.toFixed(2)} g/cm³\n`;
  result += `Estimated Tensile Strength: ${strength.toFixed(2)} MPa\n`;
  result += `Estimated Modulus: ${stiffness.toFixed(2)} GPa\n`;

  document.getElementById("propertyResult").innerText = result;

  // CSV Download
  const btn = document.getElementById("downloadPropertyBtn");
  btn.style.display = "block";
  btn.onclick = function() {
    const csv = [
      ["Material","Infill %","Layer","Speed","Orientation","Anneal","Density (g/cm³)","Strength (MPa)","Modulus (GPa)"],
      [material,infill,layer,speed,orientation,anneal,density.toFixed(2),strength.toFixed(2),stiffness.toFixed(2)]
    ].map(r=>r.join(",")).join("\n");

    const blob = new Blob([csv], {type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "3d_property_estimate.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
});
