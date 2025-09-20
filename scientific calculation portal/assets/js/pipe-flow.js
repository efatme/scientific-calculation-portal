document.getElementById("pipeForm").addEventListener("submit", function(e) {
  e.preventDefault();

  // Inputs
  const d = parseFloat(document.getElementById("diameter").value); // m
  const L = parseFloat(document.getElementById("length").value); // m
  const Q = parseFloat(document.getElementById("flowRate").value) / 1000; // convert L/s to m³/s
  const rho = parseFloat(document.getElementById("density").value); // kg/m³
  const mu = parseFloat(document.getElementById("viscosity").value); // Pa·s
  const eps = parseFloat(document.getElementById("roughness").value); // m

  if (isNaN(d) || isNaN(L) || isNaN(Q) || isNaN(rho) || isNaN(mu)) {
    document.getElementById("pipeResult").innerText = "⚠️ Please fill all fields correctly.";
    return;
  }

  // 1. Velocity
  const A = Math.PI * Math.pow(d/2, 2);
  const v = Q / A;

  // 2. Reynolds Number
  const Re = (rho * v * d) / mu;

  // 3. Friction factor (Swamee–Jain equation for turbulent flow)
  let f;
  if (Re < 2000) {
    f = 64 / Re; // Laminar
  } else {
    f = 0.25 / Math.pow(Math.log10((eps/(3.7*d)) + (5.74/Math.pow(Re,0.9))), 2);
  }

  // 4. Head loss (Darcy–Weisbach)
  const g = 9.81;
  const hf = f * (L/d) * (Math.pow(v,2) / (2*g));

  // Results
  let result = "--- Pipe Flow Calculation ---\n";
  result += `Velocity: ${v.toFixed(3)} m/s\n`;
  result += `Reynolds Number: ${Re.toExponential(2)}\n`;
  result += `Flow Regime: ${Re < 2000 ? "Laminar" : Re < 4000 ? "Transitional" : "Turbulent"}\n`;
  result += `Friction Factor (f): ${f.toFixed(4)}\n`;
  result += `Head Loss: ${hf.toFixed(3)} m\n`;

  document.getElementById("pipeResult").innerText = result;
});
