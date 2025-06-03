// Petroleum Engineering Calculation Functions (Real and Reliable Equations)

// Reservoir Engineering Calculations
function calcOoip(area, h, phi, sw, bo) {
    if (bo === 0) {
        return "Error: Formation Volume Factor (Bo) cannot be zero.";
    }
    if (!(phi >= 0 && phi <= 1)) {
        return "Error: Porosity (phi) must be between 0 and 1.";
    }
    if (!(sw >= 0 && sw <= 1)) {
        return "Error: Water Saturation (Sw) must be between 0 and 1.";
    }
    if (area <= 0 || h <= 0) {
        return "Error: Area and Thickness must be positive values.";
    }

    const ooipVal = 7758 * area * h * phi * (1 - sw) / bo;
    return `Original Oil In Place (OOIP): ${ooipVal.toFixed(2)} STB`;
}

function calcRecoverable(ooip, rf) {
    if (!(rf >= 0 && rf <= 1)) {
        return "Error: Recovery Factor (RF) must be between 0 and 1.";
    }
    if (ooip < 0) {
        return "Error: OOIP must be a non-negative value.";
    }
    
    const recoverableVal = ooip * rf;
    return `Recoverable Reserves: ${recoverableVal.toFixed(2)} STB`;
}

function calcPi(q, pr, pwf) {
    if (pr === pwf) {
        return "Error: Reservoir Pressure (Pr) cannot equal Flowing Bottomhole Pressure (Pwf) (division by zero).";
    }
    if (pr < pwf) {
        return "Error: Reservoir Pressure (Pr) must be greater than Flowing Bottomhole Pressure (Pwf).";
    }
    if (q < 0) {
        return "Error: Production Rate (q) must be a non-negative value.";
    }

    const piVal = q / (pr - pwf);
    return `Productivity Index (PI): ${piVal.toFixed(2)} STB/day/psi`;
}

function calcGiip(area, h, phi, sg, bg) {
    if (bg === 0) {
        return "Error: Gas Volume Factor (Bg) cannot be zero.";
    }
    if (!(phi >= 0 && phi <= 1)) {
        return "Error: Porosity (phi) must be between 0 and 1.";
    }
    if (!(sg >= 0 && sg <= 1)) {
        return "Error: Gas Saturation (Sg) must be between 0 and 1.";
    }
    if (area <= 0 || h <= 0) {
        return "Error: Area and Thickness must be positive values.";
    }
    
    const giipVal = 43560 * area * h * phi * sg / bg;
    return `Original Gas In Place (GIIP): ${giipVal.toFixed(2)} SCF`;
}

// Drilling Calculations
function calcMw(ppg, tvd) {
    if (ppg <= 0 || tvd <= 0) {
        return "Error: Mud Weight and True Vertical Depth must be positive values.";
    }
    const pressure = 0.052 * ppg * tvd;
    return `Hydrostatic Pressure: ${pressure.toFixed(2)} psi`;
}

function calcAnnularVelocity(rate, ann_area) {
    if (ann_area === 0) {
        return "Error: Annular Area cannot be zero.";
    }
    if (rate < 0) {
        return "Error: Flow Rate must be a non-negative value.";
    }

    const v = (808.56 * rate) / ann_area;
    return `Annular Velocity: ${v.toFixed(2)} ft/min`;
}

function calcSpm(rate, bbl_per_stroke) {
    if (bbl_per_stroke === 0) {
        return "Error: Barrels per Stroke cannot be zero.";
    }
    if (rate < 0) {
        return "Error: Flow Rate must be a non-negative value.";
    }

    const spmVal = rate / bbl_per_stroke;
    return `Pump Speed (Stroke/min): ${spmVal.toFixed(2)} SPM`;
}

function calcCementVolume(casing_od, hole_id, length, excess) {
    if (casing_od <= 0 || hole_id <= 0 || length <= 0) {
        return "Error: Casing OD, Hole ID, and Length must be positive values.";
    }
    if (hole_id <= casing_od) {
        return "Error: Hole ID must be greater than Casing OD.";
    }
    if (!(excess >= 0 && excess <= 1)) {
        return "Error: Excess percentage must be between 0 and 1.";
    }
    
    const volumeBbl = (0.0009714 * (Math.pow(hole_id, 2) - Math.pow(casing_od, 2)) * length) * (1 + excess);
    return `Cement Slurry Volume: ${volumeBbl.toFixed(2)} bbl`;
}

function calcBurstPressure(yield_strength, od, t) {
    if (yield_strength <= 0 || od <= 0 || t <= 0) {
        return "Error: Yield Strength, OD, and Wall Thickness must be positive values.";
    }
    
    const burstPressureVal = (2 * yield_strength * t) / od;
    return `Burst Pressure: ${burstPressureVal.toFixed(2)} psi`;
}

// Production Calculations
function calcDarcyFlowRate(k, A, delta_p, mu, L, bo) {
    if (k <= 0 || A <= 0 || delta_p <= 0 || mu <= 0 || L <= 0 || bo <= 0) {
        return "Error: All inputs (Permeability, Area, Pressure Diff, Viscosity, Length, FVF) must be positive values.";
    }

    const qVal = (1.127 * k * A * delta_p) / (mu * L * bo);
    return `Oil Flow Rate (Darcy): ${qVal.toFixed(2)} STB/day`;
}

function calcWor(q_w, q_o) {
    if (q_o === 0) {
        return "Error: Oil Production Rate cannot be zero.";
    }
    if (q_w < 0 || q_o < 0) {
        return "Error: Production Rates must be non-negative values.";
    }
    
    const worVal = q_w / q_o;
    return `Water Oil Ratio (WOR): ${worVal.toFixed(2)}`;
}

function calcGasFlowRateSimplified(k, h, pr_sq, pwf_sq, mu_g, z, t, re, rw) {
    if (k <= 0 || h <= 0 || mu_g <= 0 || z <= 0 || t <= 0 || re <= 0 || rw <= 0) {
        return "Error: All inputs must be positive values.";
    }
    if (pr_sq <= pwf_sq) {
        return "Error: Reservoir Pressure Squared must be greater than Bottomhole Pressure Squared.";
    }
    if (re <= rw) {
        return "Error: Drainage Radius must be greater than Wellbore Radius.";
    }

    try {
        const denominator = mu_g * z * t * Math.log(re / rw);
        if (denominator === 0) {
            return "Error: Denominator in gas flow rate calculation cannot be zero (viscosity, Z-factor, temperature, or radius issue).";
        }
        
        const qgVal = 0.703 * k * h * (pr_sq - pwf_sq) / denominator;
        return `Gas Flow Rate (Simplified): ${qgVal.toFixed(2)} MSCF/day`;
    } catch (e) {
        return `Error in gas flow rate calculation: ${e.message}`;
    }
}

function calcPumpEfficiency(hp_actual, hp_hydraulic) {
    if (hp_actual <= 0) {
        return "Error: Actual Horsepower cannot be zero or negative.";
    }
    if (hp_hydraulic < 0) {
        return "Error: Hydraulic Horsepower cannot be negative.";
    }
    if (hp_hydraulic > hp_actual) {
        return "Error: Hydraulic Horsepower cannot exceed Actual Horsepower.";
    }

    const efficiencyVal = (hp_hydraulic / hp_actual) * 100;
    return `Pump Efficiency: ${efficiencyVal.toFixed(2)} %`;
}

function calcCorrosionRate(initial_thickness, final_thickness, time) {
    if (time <= 0) {
        return "Error: Time must be a positive value.";
    }
    if (initial_thickness <= 0 || final_thickness <= 0) {
        return "Error: Thickness values must be positive.";
    }
    if (final_thickness > initial_thickness) {
        return "Error: Final Thickness cannot be greater than Initial Thickness.";
    }

    const corrosionRateVal = (initial_thickness - final_thickness) / time;
    return `Corrosion Rate: ${corrosionRateVal.toFixed(2)} mm/year`;
}

function calcTankVolume(diameter, height) {
    if (diameter <= 0 || height <= 0) {
        return "Error: Diameter and Height must be positive values.";
    }
    
    const tankVolumeVal = (Math.PI * Math.pow(diameter, 2) * height) / (4 * 5.615);
    return `Cylindrical Tank Volume: ${tankVolumeVal.toFixed(2)} bbl`;
}

function calcWaterCut(q_water, q_oil) {
    if (q_water < 0 || q_oil < 0) {
        return "Error: Production rates cannot be negative.";
    }
    if ((q_water + q_oil) === 0) {
        return "Error: Total production (water + oil) cannot be zero.";
    }

    const waterCutVal = (q_water / (q_water + q_oil)) * 100;
    return `Water Cut: ${waterCutVal.toFixed(2)} %`;
}

// General helper function to handle inputs and display results
function handleCalculation(calculationFunction, inputIds) {
    const values = {};
    let allInputsValid = true;

    for (const id of inputIds) {
        const inputElement = document.getElementById(id);
        if (inputElement) {
            const value = parseFloat(inputElement.value);
            if (isNaN(value) || inputElement.value.trim() === '') {
                document.getElementById('result').textContent = "Error: All fields must be filled with valid numbers.";
                allInputsValid = false;
                break;
            }
            values[id] = value;
        }
    }

    if (!allInputsValid) {
        return;
    }

    const result = calculationFunction(...Object.values(values));
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