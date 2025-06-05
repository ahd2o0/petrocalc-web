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
    const h_feet = pc / (0.433 * (waterDensity - oilDensity)); // Assuming waterDensity & oilDensity are SG values
    return `Height above Free Water Level: ${h_feet.toFixed(2)} ft`;
}

// 2. Material Balance Equation (for undersaturated oil reservoir)
function calcMaterialBalanceOOIP(Np, Gp, Wp, Bo, Bg, Bw, Rs, Boi, Rsi, Bgi) {
    if (Np < 0 || Gp < 0 || Wp < 0 || Bo <= 0 || Bg <= 0 || Bw <= 0 || Rs < 0 || Boi <= 0 || Rsi < 0 || Bgi <= 0) {
        return "Error: All inputs must be non-negative, and FVF's must be positive.";
    }
    const totalExpansionFactor = (Bo - Boi) + (Rsi - Rs) * Bg;
    return `Total Fluid Expansion Factor (Et): ${totalExpansionFactor.toFixed(4)} Res Bbl/STB`;
}

// 3. Relative Permeability Calculations (Corey's correlations as an example)
function calcKro(sw, swc, sor, kro_max) {
    if (!(swc >= 0 && swc < 1) || !(sor >= 0 && sor < 1) || !(kro_max > 0 && kro_max <= 1)) {
        return "Error: Swc, Sor must be between 0 and 1, kro_max between 0 and 1.";
    }
    if (sw < swc || sw > (1 - sor)) {
        return "Error: Sw must be between Swc and (1-Sor).";
    }

    const swe = (sw - swc) / (1 - swc - sor); // Effective water saturation
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
    const n_w = 3; // Corey exponent for water
    const krw = krw_max * Math.pow(swe, n_w);
    return `Relative Permeability to Water (Krw): ${krw.toFixed(4)}`;
}


// 4. PVT Properties Calculations (Simplified correlations)
function calcOilViscosity(apiGravity, tempF, Rs, Bg, pressure) {
    if (apiGravity <= 0 || tempF <= 0 || Rs < 0 || Bg <= 0 || pressure <= 0) {
        return "Error: All inputs must be positive.";
    }
    const mu_o_dead = Math.pow(10, Math.pow(10, (1.914 - 1.776 * Math.log10(apiGravity) - 0.179 * Math.log10(tempF))) - 1);
    const oilViscosity = mu_o_dead * (1 + 0.0001 * Rs * Math.sqrt(pressure / tempF)); // Highly simplified example
    return `Estimated Oil Viscosity: ${oilViscosity.toFixed(4)} cp (Simplified)`;
}

function calcOilFVF(rs, sgGas, apiGravity, tempF) {
    if (rs < 0 || sgGas <= 0 || apiGravity <= 0 || tempF <= 0) {
        return "Error: All inputs must be positive and Rs non-negative.";
    }
    const Yg = sgGas; // Specific gravity of gas
    const Yo = 141.5 / (apiGravity + 131.5); // Specific gravity of oil
    const F = rs * Math.sqrt(Yg / Yo) + 0.0125 * tempF;
    const bo = 0.9759 + 0.00012 * F**1.2; // Simplified part of Standing's Bo correlation
    return `Estimated Oil FVF (Bo): ${bo.toFixed(4)} Rbbl/STB (Standing)`;
}

function calcGasFVF(pressure, tempR, zFactor) {
    if (pressure <= 0 || tempR <= 0 || zFactor <= 0) {
        return "Error: Pressure, Temperature, and Z-Factor must be positive.";
    }
    const bg = 0.02829 * zFactor * tempR / pressure; // Bg in ft3/scf (if P in psi, T in degR)
    return `Gas FVF (Bg): ${bg.toFixed(6)} ft³/scf`;
}

function calcSolutionGOR(pressure, tempF, apiGravity, sgGas) {
    if (pressure <= 0 || tempF <= 0 || apiGravity <= 0 || sgGas <= 0) {
        return "Error: All inputs must be positive.";
    }
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

// Global variable to hold the chart instance - NOT NEEDED FOR PLOTLY, but kept for clarity if other Chart.js calculators exist
// let myChartInstance; 


// ********************************************
// Charting Logic (using Plotly.js)
// ********************************************

function drawLineChartPlotly() {
    const xInput = document.getElementById('xValues');
    const yInput = document.getElementById('yValues');
    const chartError = document.getElementById('chartError');
    const chartDiv = document.getElementById('plotlyChart'); // الـ div الذي سيحتوي الرسم البياني
    const xAxisName = document.getElementById('xAxisName').value || 'X-Axis';
    const yAxisName = document.getElementById('yAxisName').value || 'Y-Axis';

    chartError.style.display = 'none';
    chartError.textContent = '';

    const xLabels = xInput.value.split(/[,،\s]+/).filter(Boolean).map(Number);
    const yData = yInput.value.split(/[,،\s]+/).filter(Boolean).map(Number);

    // Basic validation
    if (xLabels.length === 0 || yData.length === 0) {
        chartError.textContent = 'Please enter values for both X and Y axes.';
        chartError.style.display = 'block';
        Plotly.purge(chartDiv); // مسح الرسم البياني الحالي
        return;
    }

    if (xLabels.length !== yData.length) {
        chartError.textContent = 'The number of X and Y axis values must be equal.';
        chartError.style.display = 'block';
        Plotly.purge(chartDiv); // مسح الرسم البياني الحالي
        return;
    }

    if (xLabels.some(isNaN) || yData.some(isNaN)) {
        chartError.textContent = 'Please ensure all entered values are valid numbers.';
        chartError.style.display = 'block';
        Plotly.purge(chartDiv); // مسح الرسم البياني الحالي
        return;
    }

    // Get the current theme to adjust chart colors
    const body = document.body;
    // التحقق من كلاس 'dark-mode' أو 'light-mode' الموجود على body
    const isDarkMode = body.classList.contains('dark-mode'); 
    const rootStyles = getComputedStyle(document.documentElement);

    // Plotly colors based on theme
    const plotBgColor = isDarkMode ? rootStyles.getPropertyValue('--color-background-light').trim() : '#F5F5F5'; 
    const paperBgColor = isDarkMode ? rootStyles.getPropertyValue('--color-primary-dark-blue').trim() : '#FFFFFF'; 
    const textColor = isDarkMode ? rootStyles.getPropertyValue('--color-text-light').trim() : '#333333';
    const gridColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const lineColor = rootStyles.getPropertyValue('--color-accent-blue').trim();

    const trace = {
        x: xLabels,
        y: yData,
        mode: 'lines+markers',
        type: 'scatter', // لتمثيل البيانات كنقاط وخطوط
        name: `${yAxisName} vs. ${xAxisName}`,
        line: {
            color: lineColor,
            width: 2
        },
        marker: {
            color: lineColor,
            size: 6,
            line: {
                color: textColor, // لون حدود النقطة
                width: 1
            }
        }
    };

    const layout = {
        title: {
            text: `${yAxisName} vs. ${xAxisName}`,
            font: {
                color: textColor
            }
        },
        xaxis: {
            title: {
                text: xAxisName,
                font: {
                    color: textColor
                }
            },
            tickfont: {
                color: textColor
            },
            gridcolor: gridColor,
            linecolor: gridColor,
            zerolinecolor: gridColor
        },
        yaxis: {
            title: {
                text: yAxisName,
                font: {
                    color: textColor
                }
            },
            tickfont: {
                color: textColor
            },
            gridcolor: gridColor,
            linecolor: gridColor,
            zerolinecolor: gridColor
        },
        plot_bgcolor: plotBgColor, // لون خلفية منطقة الرسم
        paper_bgcolor: paperBgColor, // لون خلفية الحاوية (خارج منطقة الرسم)
        font: {
            color: textColor // لون الخط الافتراضي للرسومات
        },
        margin: {
            l: 50, // left margin
            r: 50, // right margin
            b: 50, // bottom margin
            t: 50, // top margin
            pad: 4
        },
        autosize: true, // مهم لجعل الرسم البياني يملأ الحاوية
    };

    const config = {
        responsive: true, // يجعل الرسم البياني يستجيب لتغيير حجم الشاشة
        displaylogo: false, // إزالة شعار Plotly
        modeBarButtonsToRemove: ['zoom2d', 'pan2d', 'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'autoscale', 'resetaxes', 'hoverclosest', 'hovercompare'] // يمكنك إزالة بعض الأزرار إذا لم تحتاجها
    };

    Plotly.newPlot(chartDiv, [trace], layout, config);
}

// Function to clear the chart
function clearChartPlotly() {
    const chartDiv = document.getElementById('plotlyChart');
    const xValuesInput = document.getElementById('xValues');
    const yValuesInput = document.getElementById('yValues');
    const xAxisNameInput = document.getElementById('xAxisName');
    const yAxisNameInput = document.getElementById('yAxisName');
    const chartError = document.getElementById('chartError');

    xValuesInput.value = '';
    yValuesInput.value = '';
    xAxisNameInput.value = 'X-Axis'; // إعادة تعيين لأسماء المحاور الافتراضية
    yAxisInput.value = 'Y-Axis';
    chartError.style.display = 'none';

    Plotly.purge(chartDiv); // مسح الرسم البياني من الـ div
}

// Function to save the chart as an image
function saveChartAsImagePlotly() {
    const chartDiv = document.getElementById('plotlyChart');
    if (chartDiv.data && chartDiv.data.length > 0) { // التحقق من وجود رسم بياني
        Plotly.downloadImage(chartDiv, { format: 'png', filename: 'petroleum_chart' });
    } else {
        alert("Please generate a chart first to save!");
    }
}


// Event Listeners for the chart section and general page setup
document.addEventListener('DOMContentLoaded', () => {
    const drawChartButton = document.getElementById('drawChartButton');
    const clearChartButton = document.getElementById('clearChartButton');
    const saveChartButton = document.getElementById('saveChartButton');
    const xValuesInput = document.getElementById('xValues');
    const yValuesInput = document.getElementById('yValues');
    const chartError = document.getElementById('chartError');

    // Attach event listeners for chart buttons
    if (drawChartButton) {
        drawChartButton.addEventListener('click', drawLineChartPlotly); // استدعاء دالة Plotly الجديدة
    }

    if (clearChartButton) {
        clearChartButton.addEventListener('click', clearChartPlotly); // استدعاء دالة Plotly الجديدة
    }

    if (saveChartButton) {
        saveChartButton.addEventListener('click', saveChartAsImagePlotly); // استدعاء دالة Plotly الجديدة
    }

    // ********************************************
    // Dark/Light Mode Toggle Logic
    // ********************************************
    const modeToggleButton = document.getElementById('modeToggleButton');
    const body = document.body; 

    if (modeToggleButton) {
        // Load theme preference from localStorage
        const savedTheme = localStorage.getItem('theme'); 

        if (savedTheme) {
            body.classList.add(savedTheme); 
            updateToggleButtonIcon(savedTheme); 
        } else {
            // Default to dark mode if no theme is saved (matches initial CSS design)
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark-mode'); 
            updateToggleButtonIcon('dark-mode'); 
        }

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

            // Give a small delay to ensure the theme class has updated on body
            // This is crucial for getComputedStyle to read the correct new colors for Plotly
            setTimeout(() => {
                const chartDiv = document.getElementById('plotlyChart');
                // Re-draw the chart only if there is data displayed
                if (chartDiv && chartDiv.data && chartDiv.data.length > 0) {
                    drawLineChartPlotly(); // Re-draw the chart to apply new colors
                }
            }, 100); 
        });
    }

    // Helper function to update sun/moon icon display
    function updateToggleButtonIcon(currentThemeClass) {
        const sunIcon = modeToggleButton.querySelector('.fa-sun');
        const moonIcon = modeToggleButton.querySelector('.fa-moon');

        if (sunIcon && moonIcon) {
            if (currentThemeClass === 'dark-mode') {
                sunIcon.style.display = 'inline-block';
                moonIcon.style.display = 'none';
                sunIcon.style.color = '#FFD700'; // Set sun icon color for dark mode
            } else { // light-mode
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'inline-block';
                // Moon icon color from theme for light mode
                moonIcon.style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-text-light').trim(); 
            }
        }
    }
});