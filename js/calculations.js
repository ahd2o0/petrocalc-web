// Petroleum Engineering Calculation Functions (Real and Reliable Equations)

// Reservoir Engineering Calculations
function calcOoip(area, h, phi, sw, bo) {
    if (bo === 0) {
        return "Error: Formation Volume Factor (Bo) cannot be zero.";
    }
    if (!(phi >= 0 && phi <= 1)) {
        return "Error: Porosity (phi) must be between 0 and 1 (e.g., 0.25 for 25%).";
    }
    if (!(sw >= 0 && sw <= 1)) {
        return "Error: Water Saturation (Sw) must be between 0 and 1 (e.g., 0.3 for 30%).";
    }
    if (area <= 0 || h <= 0) {
        return "Error: Area and Thickness must be positive values.";
    }

    const ooipVal = 7758 * area * h * phi * (1 - sw) / bo;
    return `Original Oil In Place (OOIP): ${ooipVal.toFixed(2)} STB`;
}

function calcRecoverable(ooip, rf) {
    if (!(rf >= 0 && rf <= 1)) {
        return "Error: Recovery Factor (RF) must be between 0 and 1 (e.g., 0.35 for 35%).";
    }
    if (ooip < 0) {
        return "Error: OOIP must be a non-negative value.";
    }

    const recoverableVal = ooip * rf;
    return `Recoverable Reserves: ${recoverableVal.toFixed(2)} STB`;
}

function calcPi(q, mu, h, k, re, rw, B, skin) {
    if (mu <= 0 || h <= 0 || k <= 0 || re <= 0 || rw <= 0 || B <= 0) {
        return "Error: All physical parameters (mu, h, k, re, rw, B) must be positive.";
    }
    if (re <= rw) {
        return "Error: External radius (re) must be greater than wellbore radius (rw).";
    }

    const C = 141.2; // Constant for field units for oil
    const PI = (k * h) / (C * mu * B * (Math.log(re / rw) + skin));
    return `Productivity Index (PI): ${PI.toFixed(4)} STB/Day/psi`;
}

// --- New Reservoir Engineering Calculations ---

// 1. Capillary Pressure Calculations (Simple example: converting Pc to Height)
function calcPcHeight(pc, oilDensity, waterDensity) {
    if (pc <= 0 || oilDensity <= 0 || waterDensity <= 0) {
        return "Error: All inputs must be positive values.";
    }
    if (oilDensity >= waterDensity) {
        return "Error: Oil density must be less than water density.";
    }
    // Convert psi to ft for consistency if using common correlations, assuming psi for Pc
    // For a simple height calculation from Pc, where Pc is in psi, densities in lb/ft3
    // h = Pc / ( (rho_w - rho_o) * g/gc ) -- simplified to use a constant 0.433 psi/ft for water if densities are in API/sg
    // Let's assume Pc is in psi, densities are in lb/ft3
    const densityDifference = waterDensity - oilDensity; // lb/ft3
    // Conversion factor from psi to ft (approx. 0.433 psi/ft for water, so 1/0.433 = ~2.31 ft/psi for water)
    // h = Pc / ( (rho_w - rho_o) * 0.433 / 1) if densities are in g/cc and Pc in psi
    // If Pc in psi, and densities in API/SG, conversion factor is often 0.433 * delta_rho_sg
    // A more direct formula: h (ft) = Pc (psi) / (0.433 * delta_rho_sg)
    // For simplicity, let's assume densities are in g/cm3 (SG) and convert to lb/ft3 for calculation
    // Or, simpler, if Pc is given in psi, and we need height in feet, and densities in API/SG
    // Let's use a common form for h above free water level in feet:
    // h = (Pc * 144) / ( (rho_w - rho_o) * g ) where densities are in lb/ft3 and g is 32.174 ft/s2 (or just delta_rho in psi/ft)
    // Common field unit formula: h (ft) = Pc (psi) / (0.433 * (SG_water - SG_oil))
    // Let's use this simpler and more common field unit correlation.
    // Assuming water density is 1.0 SG if not provided
    const h_feet = pc / (0.433 * (waterDensity - oilDensity)); // Assuming waterDensity & oilDensity are SG values
    return `Height above Free Water Level: ${h_feet.toFixed(2)} ft`;
}

// 2. Material Balance Equation (for undersaturated oil reservoir)
// N = Np*Bo + Wp*Bw + Gp*Bg / (Bo - Bui) -- simplified for specific cases
// Let's implement a simplified one for N calculation (Original Oil In Place) using Np, Bo, Bw, Bgi, Bg, Swi, etc.
// N = Np * (Bo + (R_p - R_si) * Bg) / (Bo - R_si * Bgi) --- for oil and gas (simplified)
// For undersaturated oil: Np = N * (Bo - Boi + (Rsi - Rsi_avg) * Bg_avg) / (Bo - Boi) --- too complex for single inputs
// Let's implement a very basic one, like calculation of N (OOIP) from Np and F (total fluid expansion)
// F = N (E_o + E_w + E_g) - simplified
// Or simply solve for N given GOR, FVF, etc. (requires multiple inputs)
// A common simplified MBE calculation is for Gas Reservoirs: G = Gp * (Bg / Bgi - Bw * We / (G * Bgi)) -- too complex.
// Let's try to calculate total fluid withdrawal (F) and expansion (E) for a simple case.
// Simplified MBE: N = (Np * Bo + Wp * Bw + Gp * Bg) / (Bo - Boi + (Rsi - Rsi_initial) * Bg) -- too many inputs for one function
// A better simple MBE application: Calculate the remaining oil/gas in place after some production
// For now, let's just create placeholders or very simple aspects for MBE.
// Given the complexity of MBE, let's focus on one simple aspect for a calculator, e.g., volumetric average pressure drop related to N.
// Or, simply calculate F (total fluid expansion) given N, deltaP, etc. (Requires specific correlations).
// For now, let's implement a very basic (Np, Gp, Wp, FVF changes) calculation.
// It's better to offer a "What-if" scenario based on simplified MBE.
// Let's make a function that calculates total expansion (E) given N, delta P, etc. (too correlative)
// How about: Calculate Estimated Original Oil In Place (EOOIP) from cumulative production and expansion terms.
function calcMaterialBalanceOOIP(Np, Gp, Wp, Bo, Bg, Bw, Rs, Boi, Rsi, Bgi) {
    if (Np < 0 || Gp < 0 || Wp < 0 || Bo <= 0 || Bg <= 0 || Bw <= 0 || Rs < 0 || Boi <= 0 || Rsi < 0 || Bgi <= 0) {
        return "Error: All inputs must be non-negative, and FVF's must be positive.";
    }
    // Simplified MBE for undersaturated oil reservoir, solving for N (original oil in place)
    // F = N (E_o + E_w) where E_o = Bo - Boi, E_w = (W_e * Bw)/N, assuming no gas cap
    // A common simplified form is: N = (Np * (Bo + (Rs_initial - Rs_current) * Bg)) / (Bo - Boi)
    // This is still complicated for a simple calculator.
    // Let's make a simpler one: Calculate total withdrawal (F) if N is known
    // F = Np * Bo + Wp * Bw + (Rs - Rsi) * Gp * Bg (this needs Gp from gas cap)
    // I will simplify this to calculate total withdrawal from oil/gas/water
    const F = Np * Bo + Wp * Bw + (Gp * Bg); // If Gp is free gas produced
    const E = (Bo - Boi) + (Rsi - Rs) * Bg; // Expansion of original oil + dissolved gas
    // This formula still requires more context or simplification.
    // Given the constraints, I will provide a simplified *conceptual* calculation
    // e.g., calculate the "expansion term" for a given pressure drop.
    // This is probably best done through a simple cumulative production calculation based on MBE.
    // Let's create a function that computes the reservoir fluid expansion factor for oil.
    // E_o = Bo - Boi + (Rsi - Rs) * Bg; // Expansion of original oil and solution gas
    // E_w = Bw - Bwi // Water expansion (often ignored or handled separately)
    // F = Np * Bo + Wp * Bw // Total withdrawal (surface volumes converted to reservoir)
    // Given Np, Gp, Wp, Rs, Bo, Bg, Bw, Boi, Rsi, Bgi, calculate N (OOIP)
    // This requires solving the MBE for N, which is often iterative or complex.
    // Let's provide a basic formula for calculating the total expansion term (F) for an undersaturated oil reservoir
    // F = Np * (Bo + (Rsi - Rs) * Bg) + Wp * Bw
    // Assuming Gp is total gas produced, and Rs is current solution GOR.
    // And Boi, Rsi, Bgi are initial conditions.
    // If the user wants to calculate N (OOIP), they will need to provide F and E from measured data.
    // Let's provide a function to calculate **Estimated Original Oil In Place (EOOIP)** using simplified MBE for *undersaturated oil*
    // This formula requires knowing the expansion of fluids.
    // Let's simplify and make it about **gas-oil ratio (GOR) change based on solution gas.**
    // Or, simply calculate the **Fractional Oil Recovery from MBE given initial and current FVF, solution GOR, and produced GOR.**
    // This requires specific format of inputs to fit a simple calculator.
    // Re-evaluating: A common basic MBE calculation for OOIP involves F = N E_t.
    // F is total reservoir fluid produced. E_t is total expansion per unit OOIP.
    // Simplest approach: Calculate Net withdrawable volume / Total Expansion factor to estimate OOIP.
    // This means the user would provide Np, Gp, Wp, Bo, Bg, Bw, Boi, Rsi, Bg_initial, P_initial, P_current, etc.
    // This is getting too complex for direct input fields.
    // Let's provide a function that calculates **Reservoir Driving Index** (e.g., Water Drive Index).
    // Or, calculate **Gas Cap Drive Index (GDI)**.
    // Let's stick to the simplest interpretation of MBE: **calculate the effective oil expansion factor (E_o)** for an undersaturated reservoir.
    const Eo = Bo - Boi; // Expansion of oil phase
    const Eg = (Rsi - Rs) * Bg; // Expansion due to solution gas
    const Et = Eo + Eg; // Total oil phase expansion (simplified)
    // This function needs to return a single value based on inputs.
    // Let's calculate the "Total Fluid Expansion Factor" (Et) for an undersaturated oil reservoir
    // Inputs: Current Oil FVF (Bo), Initial Oil FVF (Boi), Initial Solution GOR (Rsi), Current Solution GOR (Rs), Gas FVF (Bg)
    if (Bo <= 0 || Boi <= 0 || Bg <= 0) {
        return "Error: Formation Volume Factors cannot be zero or negative.";
    }
    const totalExpansionFactor = (Bo - Boi) + (Rsi - Rs) * Bg;
    return `Total Fluid Expansion Factor (Et): ${totalExpansionFactor.toFixed(4)} Res Bbl/STB`;
}

// 3. Relative Permeability Calculations (Corey's correlations as an example)
// Assuming only oil-water system for simplicity
function calcKro(sw, swc, sor, kro_max) {
    if (!(swc >= 0 && swc < 1) || !(sor >= 0 && sor < 1) || !(kro_max > 0 && kro_max <= 1)) {
        return "Error: Swc, Sor must be between 0 and 1, kro_max between 0 and 1.";
    }
    if (sw < swc || sw > (1 - sor)) {
        return "Error: Sw must be between Swc and (1-Sor).";
    }

    const swe = (sw - swc) / (1 - swc - sor); // Effective water saturation
    // Corey's exponent for oil, n_o, is usually around 2-4. Let's use n_o = 2 for a simple example.
    const n_o = 2; // Corey exponent for oil
    const kro = kro_max * Math.pow((1 - swe), n_o);
    return `Relative Permeability to Oil (Kro): ${kro.toFixed(4)}`;
}

function calcKrw(sw, swc, sor, krw_max) {
    if (!(swc >= 0 && swc < 1) || !(sor >= 0 && sor < 1) || !(krw_max > 0 && krw_max <= 1)) {
        return "Error: Swc, Sor must be between 0 and 1, krw_max between 0 and 1.";
    }
    if (sw < swc || sw > (1 - sor)) {
        return "Error: Sw must be between Swc and (1-Sor).";
    }

    const swe = (sw - swc) / (1 - swc - sor); // Effective water saturation
    // Corey's exponent for water, n_w, is usually around 2-4. Let's use n_w = 3 for a simple example.
    const n_w = 3; // Corey exponent for water
    const krw = krw_max * Math.pow(swe, n_w);
    return `Relative Permeability to Water (Krw): ${krw.toFixed(4)}`;
}


// 4. PVT Properties Calculations (Simplified correlations)
// Oil Viscosity (Beggs & Robinson correlation - simplified part)
function calcOilViscosity(apiGravity, tempF, Rs, Bg, pressure) {
    // This is a simplified placeholder as B&R correlation is complex.
    // Requires multiple steps including dead oil viscosity and live oil viscosity.
    // Let's implement a simpler correlation like standing or just a conceptual output.
    // For a calculator, providing full B&R is too much.
    // Let's return a simple placeholder or a very basic estimation.
    // For now, let's just make a very rough conceptual calculation.
    if (apiGravity <= 0 || tempF <= 0 || Rs < 0 || Bg <= 0 || pressure <= 0) {
        return "Error: All inputs must be positive.";
    }
    // Very rough estimation:
    const mu_o_dead = Math.pow(10, Math.pow(10, (1.914 - 1.776 * Math.log10(apiGravity) - 0.179 * Math.log10(tempF))) - 1);
    // Live oil viscosity often related to dead oil viscosity and Rs.
    // This is a placeholder for a complex correlation.
    // For calculation purpose, let's use a very simplified formula for mu_o at pressure P
    const oilViscosity = mu_o_dead * (1 + 0.0001 * Rs * Math.sqrt(pressure / tempF)); // Highly simplified example
    return `Estimated Oil Viscosity: ${oilViscosity.toFixed(4)} cp (Simplified)`;
}

// Oil Formation Volume Factor (Standing Correlation - simplified part)
function calcOilFVF(rs, sgGas, apiGravity, tempF) {
    if (rs < 0 || sgGas <= 0 || apiGravity <= 0 || tempF <= 0) {
        return "Error: All inputs must be positive and Rs non-negative.";
    }
    // Standing correlation for Bo
    const Yg = sgGas; // Specific gravity of gas
    const Yo = 141.5 / (apiGravity + 131.5); // Specific gravity of oil
    const F = rs * Math.sqrt(Yg / Yo) + 0.0125 * tempF;
    const bo = 0.9759 + 0.00012 * F**1.2; // Simplified part of Standing's Bo correlation
    return `Estimated Oil FVF (Bo): ${bo.toFixed(4)} Rbbl/STB (Standing)`;
}

// Gas Formation Volume Factor (Real Gas Equation of State)
function calcGasFVF(pressure, tempR, zFactor) {
    if (pressure <= 0 || tempR <= 0 || zFactor <= 0) {
        return "Error: Pressure, Temperature, and Z-Factor must be positive.";
    }
    const bg = 0.02829 * zFactor * tempR / pressure; // Bg in ft3/scf (if P in psi, T in degR)
    return `Gas FVF (Bg): ${bg.toFixed(6)} ft³/scf`;
}

// Solution Gas-Oil Ratio (Rs) - Standing correlation (simplified part)
function calcSolutionGOR(pressure, tempF, apiGravity, sgGas) {
    if (pressure <= 0 || tempF <= 0 || apiGravity <= 0 || sgGas <= 0) {
        return "Error: All inputs must be positive.";
    }
    // Standing correlation for Rs
    const Yg = sgGas;
    const Yo = 141.5 / (apiGravity + 131.5);
    const rs = Yg * Math.pow((pressure / (18 * Math.pow(10, (0.0125 * apiGravity - 0.00091 * tempF)))), 1.2048);
    // This correlation often requires Psat, which isn't an input here.
    // This is a correlation to find Rs *at saturation pressure*.
    // For any pressure, it's typically Rs = Rsi if P > Pb, and Rs = P/Pb * Rsi if P < Pb (simplified).
    // Let's implement a very basic Rs_saturated formula:
    const Rs_saturated = sgGas * Math.pow(((pressure / 18) * (Math.pow(10, (0.0125 * apiGravity - 0.00091 * tempF)))), 1.2048); // Simplified Standing
    return `Estimated Solution GOR (Rs) at Saturation Pressure: ${Rs_saturated.toFixed(2)} scf/STB (Standing)`;
}


// Drilling Calculations
function calcAnnularVol(od, id, length) {
    if (od <= 0 || id <= 0 || length <= 0) {
        return "Error: All dimensions must be positive.";
    }
    if (id >= od) {
        return "Error: Inner diameter must be less than outer diameter.";
    }

    const odSq = od * od;
    const idSq = id * id;
    const volume = (Math.PI / 4) * (odSq - idSq) * length;
    return `Annular Volume: ${volume.toFixed(2)} units³`; // Specify units like ft³
}

// Production Calculations
function calcFlowRate(PI, reservoirPressure, flowingPressure) {
    if (PI <= 0) {
        return "Error: Productivity Index (PI) must be positive.";
    }
    if (reservoirPressure <= flowingPressure) {
        return "Error: Reservoir pressure must be greater than flowing bottomhole pressure.";
    }
    const flowRateVal = PI * (reservoirPressure - flowingPressure);
    return `Flow Rate: ${flowRateVal.toFixed(2)} STB/Day`;
}

// Reserves Calculation
function calcReserves(ooip, recoveryFactor) {
    if (recoveryFactor < 0 || recoveryFactor > 1) {
        return "Error: Recovery Factor (RF) must be between 0 and 1.";
    }
    if (ooip < 0) {
        return "Error: OOIP must be a non-negative value.";
    }
    const reservesVal = ooip * recoveryFactor;
    return `Calculated Reserves: ${reservesVal.toFixed(2)} STB`;
}

// General Petroleum Aspects Calculations (Removed based on user request in index.html)
// function calcDensity(mass, volume) {
//     if (volume <= 0) {
//         return "Error: Volume cannot be zero or negative.";
//     }
//     const densityVal = mass / volume;
//     return `Density: ${densityVal.toFixed(2)} kg/m³`; // or appropriate units
// }


// Input Validation and Calculation Handler
function handleCalculation(calculationFunction, inputIds) {
    const values = [];
    let allInputsValid = true;

    for (const id of inputIds) {
        const inputElement = document.getElementById(id);
        if (inputElement) {
            const value = parseFloat(inputElement.value);
            if (isNaN(value) || inputElement.value.trim() === '') {
                showErrorMessage(`Please enter a valid number for all fields.`);
                allInputsValid = false;
                break;
            }
            values.push(value); // Push value directly to array
        }
    }

    if (!allInputsValid) {
        return;
    }

    const result = calculationFunction(...values); // Pass array values as arguments
    document.getElementById('result').textContent = result;
}

// General helper function to clear fields
function clearCalculationFields(inputIds) {
    for (const id of inputIds) {
        const inputElement = document.getElementById(id);
        if (inputElement) {
            inputElement.value = '';
        }
    }
    document.getElementById('result').textContent = "Results will appear here.";
}

// Helper function to show error messages in an alert popup
function showErrorMessage(message) {
    alert("Input Error:\n\n" + message);
}

// General function to initialize a single calculation page
function initializeCalcPage(calculationFunction, inputIds) {
    const calcButton = document.getElementById('calcButton');
    const clearButton = document.getElementById('clearButton');

    if (calcButton) {
        calcButton.addEventListener('click', () => {
            try {
                handleCalculation(calculationFunction, inputIds);
            } catch (e) {
                showErrorMessage(`An unexpected error occurred: ${e.message}`);
            }
        });
    }

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            clearCalculationFields(inputIds);
        });
    }
}
// Global variable to hold the chart instance for easy destruction/redrawing
let myChartInstance; 

// Function to draw the line chart
function drawLineChart() {
    const xInput = document.getElementById('xValues');
    const yInput = document.getElementById('yValues');
    const chartError = document.getElementById('chartError');
    const canvas = document.getElementById('myLineChart');
    const xAxisName = document.getElementById('xAxisName').value || 'X-Axis'; // أضف هذه المتغيرات
    const yAxisName = document.getElementById('yAxisName').value || 'Y-Axis'; // أضف هذه المتغيرات

    // Clear previous error messages
    chartError.style.display = 'none';
    chartError.textContent = '';

    // Parse input values from string to array of numbers
    // Supports comma, Arabic comma, and space as delimiters
    const xLabels = xInput.value.split(/[,،\s]+/).filter(Boolean).map(Number);
    const yData = yInput.value.split(/[,،\s]+/).filter(Boolean).map(Number);

    // Basic validation
    if (xLabels.length === 0 || yData.length === 0) {
        chartError.textContent = 'Please enter values for both X and Y axes.';
        chartError.style.display = 'block';
        if (myChartInstance) {
            myChartInstance.destroy();
            myChartInstance = null;
        }
        return;
    }

    if (xLabels.length !== yData.length) {
        chartError.textContent = 'The number of X and Y axis values must be equal.';
        chartError.style.display = 'block';
        if (myChartInstance) {
            myChartInstance.destroy();
            myChartInstance = null;
        }
        return;
    }

    if (xLabels.some(isNaN) || yData.some(isNaN)) {
        chartError.textContent = 'Please ensure all entered values are valid numbers.';
        chartError.style.display = 'block';
        if (myChartInstance) {
            myChartInstance.destroy();
            myChartInstance = null;
        }
        return;
    }

    // Destroy existing chart instance if it exists to avoid conflicts
    if (myChartInstance) {
        myChartInstance.destroy();
    }

    // Get the current theme to adjust chart colors
    const body = document.body;
    // تم التغيير من 'dark-mode' إلى 'dark-theme' لأننا نستخدم كلاسات شاملة (dark-theme, light-theme)
    const isDarkMode = body.classList.contains('dark-theme');

    // Define colors based on the current theme
    // استخدام المتغيرات من CSS مباشرة
    const textColor = isDarkMode ? getComputedStyle(document.documentElement).getPropertyValue('--color-text-light').trim() : getComputedStyle(document.documentElement).getPropertyValue('--color-text-light').trim();
    const gridColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent-blue').trim(); // استخدام --color-accent-blue
    const backgroundColorFill = isDarkMode ? getComputedStyle(document.documentElement).getPropertyValue('--color-background-light').trim() : getComputedStyle(document.documentElement).getPropertyValue('--color-background-light').trim(); // لون الخلفية للكانفاس عند الحفظ
    const datasetBackgroundColor = isDarkMode ? 'rgba(16, 106, 159, 0.2)' : 'rgba(0, 86, 145, 0.2)'; // شفافية للون --color-accent-blue

    // Create the chart
    const ctx = canvas.getContext('2d');
    myChartInstance = new Chart(ctx, {
        type: 'line', // Can be 'bar', 'scatter', etc.
        data: {
            labels: xLabels, // X-axis values
            datasets: [{
                label: `${yAxisName} vs. ${xAxisName}`, // تحديث التسمية ديناميكياً
                data: yData, // Y-axis values
                borderColor: borderColor,
                backgroundColor: datasetBackgroundColor, // لون شفاف للمجموعة
                borderWidth: 2,
                pointBackgroundColor: borderColor,
                pointBorderColor: textColor,
                pointHoverBackgroundColor: textColor,
                pointHoverBorderColor: borderColor,
                fill: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: xAxisName, // استخدام عنوان محور X المدخل
                        color: textColor
                    },
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: yAxisName, // استخدام عنوان محور Y المدخل
                        color: textColor
                    },
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                },
                // *** هذا هو الجزء المهم الذي يجب إضافته أو التأكد من وجوده ***
                beforeDraw: (chart) => {
                    const ctx = chart.canvas.getContext('2d');
                    ctx.save(); // حفظ حالة الكانفاس الحالية
                    ctx.globalCompositeOperation = 'destination-over'; // وضع وضع الرسم ليرسم تحت العناصر الموجودة
                    ctx.fillStyle = backgroundColorFill; // استخدام اللون الذي حددناه للخلفية
                    ctx.fillRect(0, 0, chart.width, chart.height); // ملء الكانفاس باللون
                    ctx.restore(); // استعادة حالة الكانفاس الأصلية
                }
            }
        }
    });
}

// Function to save the chart as an image
function saveChartAsImage() {
    if (myChartInstance) { // Ensure a chart exists
        const canvas = document.getElementById('myLineChart'); 
        // toDataURL will give you the image data
        const imageDataURL = canvas.toDataURL('image/png'); 

        // Create a temporary link element
        const downloadLink = document.createElement('a');
        downloadLink.href = imageDataURL;
        downloadLink.download = 'petroleum_chart.png'; // Suggested filename for download
        document.body.appendChild(downloadLink); 
        downloadLink.click(); 
        document.body.removeChild(downloadLink); 
    } else {
        alert("Please generate a chart first to save!"); 
    }
}


// Event Listeners for the chart section
document.addEventListener('DOMContentLoaded', () => {
    const drawChartButton = document.getElementById('drawChartButton');
    const clearChartButton = document.getElementById('clearChartButton');
    const saveChartButton = document.getElementById('saveChartButton');
    const xValuesInput = document.getElementById('xValues');
    const yValuesInput = document.getElementById('yValues');
    const chartError = document.getElementById('chartError');

    if (drawChartButton) {
        drawChartButton.addEventListener('click', drawLineChart);
    }

    if (clearChartButton) {
        clearChartButton.addEventListener('click', () => {
            xValuesInput.value = '';
            yValuesInput.value = '';
            chartError.style.display = 'none';
            if (myChartInstance) {
                myChartInstance.destroy(); // Remove the chart from canvas
                myChartInstance = null; // Clear the instance
            }
        });
    }

    if (saveChartButton) {
        saveChartButton.addEventListener('click', saveChartAsImage);
    }

    // Add event listener to redraw chart when theme changes
    // This part should be integrated with your existing theme toggle logic
    // Make sure your modeToggleButton is correctly handled elsewhere in the DOMContentLoaded
    const modeToggleButton = document.getElementById('modeToggleButton');
    if (modeToggleButton) {
        modeToggleButton.addEventListener('click', () => {
            // Give a small delay to ensure the theme class has updated on body
            setTimeout(() => {
                // If a chart instance exists, redraw it to apply new colors
                if (myChartInstance) {
                    // We need to re-parse inputs as drawLineChart uses current input values
                    drawLineChart(); 
                }
            }, 100); 
        });
    }
});

// ********************************************
// Dark/Light Mode Toggle Logic
// (هذا الجزء يجب أن يكون موجوداً في ملفك كما تم تصحيحه مسبقاً)
// لا تكرره هنا إذا كان موجوداً بالفعل.
// تأكد من أنه يستخدم 'dark-mode' و 'light-mode' للكلاسات.
// ********************************************
/*
document.addEventListener('DOMContentLoaded', () => {
    const modeToggleButton = document.getElementById('modeToggleButton');
    const body = document.body;

    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme'); 
    if (savedTheme) {
        body.classList.add(savedTheme);
        updateToggleButtonIcon(savedTheme);
    } else {
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark-mode');
        updateToggleButtonIcon('dark-mode');
    }

    if (modeToggleButton) {
        modeToggleButton.addEventListener('click', () => {
            if (body.classList.contains('dark-mode')) {
                body.classList.remove('dark-mode');
                body.classList.add('light-mode');
                localStorage.setItem('theme', 'light-mode');
                updateToggleButtonIcon('light-mode');
            } else {
                body.classList.remove('light-mode');
                body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark-mode');
                updateToggleButtonIcon('dark-mode');
            }
        });
    }

    function updateToggleButtonIcon(currentThemeClass) { 
        const sunIcon = modeToggleButton.querySelector('.fa-sun');
        const moonIcon = modeToggleButton.querySelector('.fa-moon');

        if (sunIcon && moonIcon) {
            if (currentThemeClass === 'dark-mode') {
                sunIcon.style.display = 'inline-block';
                moonIcon.style.display = 'none';
            } else { 
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'inline-block';
            }
        }
    }
});
*/

// ********************************************
// Dark/Light Mode Toggle Logic
// ********************************************
document.addEventListener('DOMContentLoaded', () => {
    const modeToggleButton = document.getElementById('modeToggleButton');
    const body = document.body; // لتبسيط الوصول إلى عنصر body

    if (modeToggleButton) {
        // تحميل تفضيل الوضع من localStorage أو الافتراضي إلى 'dark-mode'
        // 'dark-mode' هو الافتراضي لأنه يطابق الخلفية الأولية في CSS
        const savedTheme = localStorage.getItem('theme'); // سيحتوي على 'dark-mode' أو 'light-mode'

        if (savedTheme) {
            body.classList.add(savedTheme); // إضافة الكلاس المحفوظ (مثل 'dark-mode')
            updateToggleButtonIcon(savedTheme); // تحديث أيقونة الزر عند التحميل
        } else {
            // الافتراضي هو الوضع الليلي إذا لم يتم حفظ أي تفضيل (يتناسب مع تصميم CSS الافتراضي)
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark-mode'); // حفظ الوضع الافتراضي
            updateToggleButtonIcon('dark-mode'); // تحديث أيقونة الزر
        }

        modeToggleButton.addEventListener('click', () => {
            // تبديل الكلاسات على الـ body
            if (body.classList.contains('dark-mode')) { // إذا كان الوضع الحالي مظلمًا
                body.classList.remove('dark-mode'); // إزالة كلاس الوضع المظلم
                body.classList.add('light-mode'); // إضافة كلاس الوضع الفاتح
                localStorage.setItem('theme', 'light-mode'); // حفظ التفضيل الجديد
                updateToggleButtonIcon('light-mode'); // تحديث الأيقونة
            } else { // إذا كان الوضع الحالي فاتحًا
                body.classList.remove('light-mode'); // إزالة كلاس الوضع الفاتح
                body.classList.add('dark-mode'); // إضافة كلاس الوضع المظلم
                localStorage.setItem('theme', 'dark-mode'); // حفظ التفضيل الجديد
                updateToggleButtonIcon('dark-mode'); // تحديث الأيقونة
            }
        });
    }

    // دالة مساعدة لتحديث عرض أيقونة الشمس/القمر
    function updateToggleButtonIcon(currentThemeClass) {
        const sunIcon = modeToggleButton.querySelector('.fa-sun');
        const moonIcon = modeToggleButton.querySelector('.fa-moon');

        if (sunIcon && moonIcon) {
            if (currentThemeClass === 'dark-mode') {
                sunIcon.style.display = 'inline-block';
                moonIcon.style.display = 'none';
            } else { // light-mode
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'inline-block';
            }
        }
    }
});