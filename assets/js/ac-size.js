document.getElementById("acForm").addEventListener("submit", function(e) {
  e.preventDefault();

  // Inputs
  const area = parseFloat(document.getElementById("roomArea").value);
  const height = parseFloat(document.getElementById("ceilingHeight").value);
  const occupants = parseInt(document.getElementById("occupants").value);
  const windowArea = parseFloat(document.getElementById("windowArea").value);
  const wallType = document.getElementById("wallType").value;
  const exposedWalls = parseInt(document.getElementById("exposedWalls").value);
  const shading = document.getElementById("shading").value;
  const floorLevel = document.getElementById("floorLevel").value;
  const outdoor = parseFloat(document.getElementById("outdoorTemp").value);
  const indoor = parseFloat(document.getElementById("indoorTemp").value);

  if (isNaN(area) || isNaN(height) || isNaN(occupants)) {
    document.getElementById("acResult").innerText = "⚠️ Please fill all fields correctly.";
    return;
  }

  // 1. Base load from volume (BTU/hr)
  const volume = area * height;
  let load = volume * 5; // 5 BTU per cubic ft approx for Dhaka climate

  // 2. Occupants
  load += occupants * 600; // ~600 BTU per person

  // 3. Window load
  let windowFactor = 150; // BTU per sq ft (average)
  if (shading === "light") windowFactor = 100;
  if (shading === "heavy") windowFactor = 60;
  load += windowArea * windowFactor;

  // 4. Walls
  let wallFactor = 400; // default for brick
  if (wallType === "concrete") wallFactor = 500;
  if (wallType === "insulated") wallFactor = 250;
  load += exposedWalls * wallFactor;

  // 5. Floor / Roof
  if (floorLevel === "top") load += 1200;
  else if (floorLevel === "ground") load += 600;

  // 6. Temperature difference adjustment
  const deltaT = outdoor - indoor;
  load *= (deltaT / 10); // scale effect by 10°C reference

  // Results
  const tons = load / 12000; // 1 ton = 12000 BTU/hr

  let result = "--- AC Load Calculation ---\n";
  result += `Room Volume: ${volume.toFixed(0)} ft³\n`;
  result += `Cooling Load: ${load.toFixed(0)} BTU/hr\n`;
  result += `Recommended AC Size: ${tons.toFixed(2)} tons\n`;

  document.getElementById("acResult").innerText = result;
});
