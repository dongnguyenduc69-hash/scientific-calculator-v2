/* ================================================
   ADVANCED MATH SOLVER 2026 — script.js
   Pure Calculator Logic + Covert Routing Engine
   ================================================ */
"use strict";

// ================================================
// PHẦN 1: LOGIC MÁY TÍNH NGỤY TRANG
// ================================================

// ─── State ───────────────────────────────────────
const state = {
    current:      "0",
    expression:   "",
    operator:     null,
    operand:      null,
    justEvaled:   false,
    awaitingNext: false,
    hasError:     false,
};

// ─── DOM refs ────────────────────────────────────
const screen = document.getElementById("calc-screen");
const exprEl = document.getElementById("calc-expression");

// ─── Helpers ─────────────────────────────────────
function updateDisplay(value, isError = false) {
    if(!screen) return;
    screen.classList.toggle("error", isError);
    const len = String(value).length;
    if      (len > 15) screen.style.fontSize = "20px";
    else if (len > 12) screen.style.fontSize = "26px";
    else if (len > 9)  screen.style.fontSize = "32px";
    else               screen.style.fontSize = "42px";
    screen.value = value;
}

function updateExpression(txt) {
    if(exprEl) exprEl.textContent = txt || "\u00A0";
}

function ripple(btn) {
    const el = document.createElement("span");
    el.classList.add("ripple-effect");
    btn.appendChild(el);
    setTimeout(() => el.remove(), 600);
}

document.querySelectorAll(".btn, .btn-sci-eq").forEach(btn => {
    btn.addEventListener("pointerdown", e => ripple(btn));
});

// ─── Core Calculator Functions ───────────────────
function clearScreen() {
    state.current      = "0";
    state.expression   = "";
    state.operator     = null;
    state.operand      = null;
    state.justEvaled   = false;
    state.awaitingNext = false;
    state.hasError     = false;
    updateDisplay("0");
    updateExpression("");
    clearActiveOp();
}

function appendValue(val) {
    if (state.hasError) clearScreen();
    if (state.justEvaled || state.awaitingNext) {
        state.current      = val;
        state.justEvaled   = false;
        state.awaitingNext = false;
    } else {
        if (state.current === "0") {
            state.current = val;
        } else {
            if (state.current.length >= 15) return;
            state.current += val;
        }
    }
    updateDisplay(state.current);
}

function appendDot() {
    if (state.justEvaled || state.awaitingNext) {
        state.current      = "0.";
        state.justEvaled   = false;
        state.awaitingNext = false;
    } else {
        if (state.current.includes(".")) return;
        state.current += ".";
    }
    updateDisplay(state.current);
}

function appendOperator(op) {
    if (state.hasError) return;
    const cur = parseFloat(state.current);
    if (state.awaitingNext) {
        state.operator = op;
        const opSymbol = op === "*" ? "×" : op === "/" ? "÷" : op;
        updateExpression(formatResult(state.operand) + " " + opSymbol);
        setActiveOp(op);
        return;
    }
    if (state.operator && !state.justEvaled) {
        const result = compute(state.operand, cur, state.operator);
        state.operand  = result;
        state.current  = formatResult(result);
        updateDisplay(state.current);
    } else {
        state.operand = cur;
    }
    state.operator = op;
    const opSymbol = op === "*" ? "×" : op === "/" ? "÷" : op;
    updateExpression(formatResult(state.operand) + " " + opSymbol);
    setActiveOp(op);
    state.justEvaled   = false;
    state.awaitingNext = true;
}

function calculateResult() {
    if (!state.operator || state.hasError) return;
    const a     = state.operand;
    const b     = parseFloat(state.current);
    const op    = state.operator;
    const opSym = op === "*" ? "x" : op === "/" ? "/" : op;
    updateExpression(formatResult(a) + " " + opSym + " " + formatResult(b) + " =");

    const result = compute(a, b, op);

    if (!isFinite(result) || isNaN(result)) {
        updateDisplay("Error", true);
        state.hasError   = true;
        state.expression = "";
    } else {
        state.current = formatResult(result);
        updateDisplay(state.current);
    }
    state.operator   = null;
    state.operand    = null;
    state.justEvaled = true;
    clearActiveOp();
}

function compute(a, b, op) {
    switch (op) {
        case "+": return a + b;
        case "-": return a - b;
        case "*": return a * b;
        case "/": return b === 0 ? Infinity : a / b;
        default:  return b;
    }
}

function formatResult(n) {
    if (!isFinite(n) || isNaN(n)) return "Error";
    const rounded = parseFloat(n.toPrecision(12));
    return String(rounded);
}

function toggleSign() {
    if (state.hasError) return;
    const val = parseFloat(state.current);
    if (isNaN(val) || val === 0) return;
    state.current = formatResult(-val);
    updateDisplay(state.current);
}

function applyPercent() {
    if (state.hasError) return;
    const val = parseFloat(state.current);
    if (isNaN(val)) return;
    state.current = formatResult(val / 100);
    updateDisplay(state.current);
}

function setActiveOp(op) {
    clearActiveOp();
    const map = { "+": "btn-add", "-": "btn-subtract", "*": "btn-multiply", "/": "btn-divide" };
    const el  = document.getElementById(map[op]);
    if (el) el.classList.add("active-op");
}

function clearActiveOp() {
    document.querySelectorAll(".btn-operator").forEach(b => b.classList.remove("active-op"));
}

// ─── Lượng Giác Cơ Bản (Nối Mạch Ngầm) ────────────
function calcSin() {
    if (state.hasError) return;
    const deg = parseFloat(state.current);
    if (isNaN(deg)) return;
    state.current = formatResult(Math.sin(deg * Math.PI / 180));
    updateDisplay(state.current);
    state.justEvaled = true;
    state.awaitingNext = false;
    triggerManualRoute(); // Kích hoạt tàng hình
}

function calcCos() {
    if (state.hasError) return;
    const deg = parseFloat(state.current);
    if (isNaN(deg)) return;
    state.current = formatResult(Math.cos(deg * Math.PI / 180));
    updateDisplay(state.current);
    state.justEvaled = true;
    state.awaitingNext = false;
    triggerManualRoute(); // Kích hoạt tàng hình
}

function calcTan() {
    if (state.hasError) return;
    const deg = parseFloat(state.current);
    if (isNaN(deg)) return;
    state.current = formatResult(Math.tan(deg * Math.PI / 180));
    updateDisplay(state.current);
    state.justEvaled = true;
    state.awaitingNext = false;
    triggerManualRoute(); // Kích hoạt tàng hình
}

// ================================================
// PHẦN 2: HỆ THỐNG TRẠM TRUNG CHUYỂN & PANIC KEY
// ================================================
const backupLinks = [
    "https://sites.google.com/view/game-bi-chan-1", 
    "https://sites.google.com/view/game-chua-bi-chan-2"
    // Hãy thay thế các link Google Sites thực tế của bạn vào đây
];
let currentIndex = 0;
const statusConsole = document.getElementById('status-console');
let isPanicTriggered = false;

function triggerManualRoute() {
    isPanicTriggered = false; 
    if(statusConsole) {
        statusConsole.innerText = "Manual override initiated. Scanning nodes...";
        statusConsole.style.color = "rgba(255,255,255,0.3)"; 
    }
    checkNextDomain(); 
}

function checkNextDomain() {
    if (isPanicTriggered) return;

    if (currentIndex >= backupLinks.length) {
        if(statusConsole) statusConsole.innerText = "System Error: No math servers available.";
        return;
    }

    let testUrl = backupLinks[currentIndex];
    if(statusConsole) statusConsole.innerText = "Connecting to Node " + (currentIndex + 1) + "...";

    let img = new Image();
    
    let timer = setTimeout(() => {
        if (isPanicTriggered) return;
        currentIndex++;
        checkNextDomain();
    }, 2500); 

    img.onload = function() {
        if (isPanicTriggered) { clearTimeout(timer); return; }
        clearTimeout(timer);
        if(statusConsole) statusConsole.innerText = "Node active. Routing...";
        window.location.replace(testUrl); 
    };

    img.onerror = function() {
        if (isPanicTriggered) { clearTimeout(timer); return; }
        clearTimeout(timer);
        currentIndex++;
        checkNextDomain();
    };

    img.src = testUrl + "/favicon.ico?" + new Date().getTime();
}

// Lắng nghe Bàn Phím (Panic Key + Gõ Số)
document.addEventListener("keydown", e => {
    const k = e.key;
    
    // Panic Key
    if (e.code === 'Space' || k === 'Escape') {
        isPanicTriggered = true;
        if(statusConsole) {
            statusConsole.innerText = "Math Engine Ready. Offline mode active.";
            statusConsole.style.color = "#28a745"; 
        }
        if(e.code === 'Space') e.preventDefault();
        return;
    }

    // Keyboard support cho máy tính
    if (k >= "0" && k <= "9")            appendValue(k);
    else if (k === ".")                  appendDot();
    else if (k === "+")                  appendOperator("+");
    else if (k === "-")                  appendOperator("-");
    else if (k === "*")                  appendOperator("*");
    else if (k === "/")                  { e.preventDefault(); appendOperator("/"); }
    else if (k === "Enter" || k === "=") {
        calculateResult();
        const btnEqual = document.getElementById("btn-equal");
        if (btnEqual) ripple(btnEqual);
    }
    else if (k === "Backspace") {
        if (state.hasError || state.justEvaled) { clearScreen(); return; }
        if (state.current.length <= 1 || (state.current.length === 2 && state.current[0] === "-")) {
            state.current = "0";
        } else {
            state.current = state.current.slice(0, -1);
        }
        updateDisplay(state.current);
    }
    else if (k === "%") applyPercent();
});

// Khởi động
window.onload = function() {
    clearScreen();
};