document.getElementById("printForm").addEventListener("submit", function(e) {
  e.preventDefault();

  // Inputs
  const material = document.getElementById("material").value;
  const infill = parseFloat(document.getElementById("infill").value);
  const layerHeight = parseFloat(document.getElementById("layerHeight").value);
  const orientation = document.getElementById("orientation").value;
  const annealed = document.getElementById("annealed").value;

  // Base material properties (typical values in MPa / GPa)
  const baseProperties = {
    PLA: { strength: 60, modulus: 3.5 },
    ABS: { strength: 40, modulus: 2.0 },
    PETG: { strength: 50, modulus: 2.2 },
    Nylon: { strength: 70, modulus: 2.8 }
  };

  let base = baseProperties[material];
  if (!base) base = { strength: 50, modulus: 2.5 };

  // Factors
  const infillFactor = infill / 100;  // linear approx
  const orientationFactor = orientation === "Z" ? 0.6 : 1.0; // weaker if printed vertically
  const annealFactor = annealed === "yes" ? 1.2 : 1.0;
  const layerFactor = layerHeight <= 0.2 ? 1.0 : 0.9;

  // Calculations
  const tensileStrength = base.strength * infillFactor * orientationFactor * annealFactor * layerFactor;
  const modulus = base.modulus * infillFactor * orientationFactor * annealFactor;

  let result = "--- 3D Print Property Estimate ---\n";
  result += `Material: ${material}\n`;
  result += `Infill: ${infill}%\n`;
  result += `Layer Height: ${layerHeight} mm\n`;
  result += `Orientation: ${orientation}\n`;
  result += `Annealed: ${annealed}\n\n`;
  result += `Estimated Tensile Strength: ${tensileStrength.toFixed(2)} MPa\n`;
  result += `Estimated Young's Modulus: ${modulus.toFixed(2)} GPa\n`;

  document.getElementById("printResult").innerText = result;

  // Show CSV download
  const downloadBtn = document.getElementById("downloadBtn");
  downloadBtn.style.display = "block";

  downloadBtn.onclick = function() {
    const csv = [
      ["Material", "Infill %", "Layer Height", "Orientation", "Annealed", "Strength (MPa)", "Modulus (GPa)"],
      [material, infill, layerHeight, orientation, annealed, tensileStrength.toFixed(2), modulus.toFixed(2)]
    ].map(r => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "3d_print_properties.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
});
