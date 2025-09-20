document.getElementById("wireForm").addEventListener("submit", function(e) {
  e.preventDefault();

  // 1. Collect Inputs
  const loadCurrent = parseFloat(document.getElementById("loadCurrent").value);
  const nominalVoltage = parseFloat(document.getElementById("nominalVoltage").value);
  const powerFactor = parseFloat(document.getElementById("powerFactor").value);
  const material = document.getElementById("material").value;
  const insulation = document.getElementById("insulation").value;
  const conductors = parseInt(document.getElementById("conductors").value);
  const method = document.getElementById("method").value;
  const ambient = parseFloat(document.getElementById("ambientTemperature").value);
  const grouped = parseInt(document.getElementById("groupedCables").value);
  const length = parseFloat(document.getElementById("cableLength").value);
  const maxVD = parseFloat(document.getElementById("maxVD").value);

  // Basic validation
  if (isNaN(loadCurrent) || isNaN(nominalVoltage)) {
    document.getElementById("result").innerText = "⚠️ Please fill all required fields correctly.";
    return;
  }

  // 2. Full IEC Data Tables (simplified copy from original file)
  const baseCapacities = {
    "Copper": {
      "PVC": {
        "A1": {1.5: 14.5, 2.5: 19.5, 4: 26, 6: 32, 10: 43, 16: 57, 25: 75, 35: 93, 50: 115, 70: 144, 95: 177, 120: 207, 150: 239},
        "C":  {1.5: 18.5, 2.5: 25, 4: 34, 6: 43, 10: 59, 16: 79, 25: 106, 35: 129, 50: 157, 70: 199, 95: 246, 120: 285, 150: 326},
        "E":  {1.5: 22, 2.5: 30, 4: 40, 6: 52, 10: 70, 16: 94, 25: 126, 35: 153, 50: 187, 70: 236, 95: 290, 120: 335, 150: 383}
      },
      "XLPE": {
        "A1": {1.5: 19, 2.5: 26, 4: 35, 6: 45, 10: 61, 16: 82, 25: 110, 35: 136, 50: 167, 70: 209, 95: 258, 120: 300, 150: 345},
        "C":  {1.5: 24, 2.5: 33, 4: 45, 6: 57, 10: 77, 16: 103, 25: 138, 35: 168, 50: 204, 70: 257, 95: 316, 120: 365, 150: 418},
        "E":  {1.5: 26, 2.5: 36, 4: 49, 6: 63, 10: 85, 16: 113, 25: 152, 35: 185, 50: 226, 70: 285, 95: 349, 120: 404, 150: 461}
      }
    },
    "Aluminium": {
      "PVC": {
        "A1": {2.5: 15, 4: 20, 6: 25, 10: 34, 16: 45, 25: 60, 35: 74, 50: 91, 70: 114, 95: 140, 120: 164, 150: 189},
        "C":  {2.5: 19, 4: 26, 6: 34, 10: 47, 16: 63, 25: 85, 35: 103, 50: 126, 70: 159, 95: 196, 120: 227, 150: 260},
        "E":  {2.5: 23, 4: 31, 6: 40, 10: 54, 16: 72, 25: 97, 35: 118, 50: 144, 70: 182, 95: 223, 120: 258, 150: 295}
      },
      "XLPE": {
        "A1": {2.5: 19, 4: 25, 6: 32, 10: 44, 16: 59, 25: 79, 35: 97, 50: 119, 70: 150, 95: 184, 120: 214, 150: 246},
        "C":  {2.5: 25, 4: 34, 6: 44, 10: 60, 16: 80, 25: 108, 35: 132, 50: 161, 70: 203, 95: 249, 120: 288, 150: 330},
        "E":  {2.5: 32, 4: 43, 6: 56, 10: 75, 16: 100, 25: 134, 35: 163, 50: 199, 70: 251, 95: 308, 120: 356, 150: 407}
      }
    }
  };

  const resistancePerKm = {
    "Copper": {
      1.5: 12.1, 2.5: 7.41, 4: 4.61, 6: 3.08, 10: 1.83,
      16: 1.15, 25: 0.727, 35: 0.524, 50: 0.387, 70: 0.268,
      95: 0.193, 120: 0.153, 150: 0.124
    },
    "Aluminium": {
      2.5: 12.0, 4: 7.5, 6: 5.0, 10: 3.0, 16: 1.9,
      25: 1.2, 35: 0.86, 50: 0.63, 70: 0.44, 95: 0.31,
      120: 0.25, 150: 0.20
    }
  };

  // 3. Derating (simplified for demo: you can add temp correction here)
  const tempFactor = 1.0;
  const groupingFactor = grouped > 1 ? 0.8 : 1.0;

  const requiredIz = loadCurrent / (tempFactor * groupingFactor);

  // 4. Find Suitable Size
  let recommended = null;
  let actualVD = 0, actualVDPercent = 0, capacity = 0;

  const sizes = Object.keys(baseCapacities[material][insulation][method]).map(Number).sort((a,b)=>a-b);

  for (let s of sizes) {
    capacity = baseCapacities[material][insulation][method][s] * tempFactor * groupingFactor;
    const resistance = resistancePerKm[material][s];
    if (!resistance) continue;

    if (conductors === 2) {
      actualVD = (2 * loadCurrent * length * resistance) / 1000;
    } else {
      actualVD = (Math.sqrt(3) * loadCurrent * length * resistance) / 1000;
    }
    actualVDPercent = (actualVD / nominalVoltage) * 100;

    if (capacity >= loadCurrent && actualVDPercent <= maxVD) {
      recommended = s;
      break;
    }
  }

  // 5. Display Result
  let result = "--- Calculation Summary ---\n";
  result += `Load Current: ${loadCurrent} A\n`;
  result += `Nominal Voltage: ${nominalVoltage} V\n`;
  result += `Cable Length: ${length} m\n`;
  result += `Max VD Allowed: ${maxVD}%\n\n`;

  if (recommended) {
    result += `✅ Recommended Wire Size: ${recommended} mm² ${material}\n`;
    result += `Capacity: ${capacity.toFixed(1)} A\n`;
    result += `Voltage Drop: ${actualVD.toFixed(2)} V (${actualVDPercent.toFixed(2)}%)\n`;
  } else {
    result += "⚠️ No suitable wire size found in this dataset. Try different inputs or larger cable.";
  }

  document.getElementById("result").innerText = result;
});
