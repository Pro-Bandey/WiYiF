
let state = {
    t: "The Grand Celebration", st: "You are cordially invited", desc: "Join us for an evening of elegance and joy.",
    ac: "#d4af37", bg: "#0a0505", bl: 20, ff: "serif", pt: 0,
    dc: "", ph: "", loc: "", bgi: "", dt: "", mu: ""
};

const PRESETS = {
    shaadi: { t: "Walima / Shaadi", st: "بسم الله الرحمن الرحيم", desc: "By the grace of Allah, we invite you to celebrate the marriage of our beloved children.", ac: "#ffd700", bg: "#4a0000", ff: "urdu", pt: 1, dc: "Formal Traditional", bgi: "" },
    mehndi: { t: "Mehndi Ki Raat", st: "Dance, Colors & Joy", desc: "Join us for a vibrant night filled with henna, music, and unforgettable memories.", ac: "#ffcc00", bg: "#003311", ff: "sans", pt: 1, dc: "Colorful Traditional / Yellows & Greens", bgi: "" },
    arabian: { t: "عقد قران", st: "Bismillah", desc: "We are honored to invite you to the joyous occasion of our Nikah ceremony.", ac: "#d4af37", bg: "#001a11", ff: "arabic", pt: 2, dc: "Modest Formal", bgi: "" },
    eid: { t: "Eid Milan Party", st: "Eid Mubarak", desc: "Let's gather to share the blessings, food, and joy of Eid together.", ac: "#ffffff", bg: "#1f0033", ff: "serif", pt: 2, dc: "Festive Attire", bgi: "" },
    classic: { t: "The Wedding Gala", st: "Together Forever", desc: "Request the honor of your presence to celebrate our new beginning.", ac: "#ffffff", bg: "#111111", ff: "serif", pt: 0, dc: "Black Tie", bgi: "" },
    birthday: { t: "Birthday Bash", st: "Let's Celebrate", desc: "Another year older, another year bolder! Come celebrate with drinks, food, and fun.", ac: "#00f2ff", bg: "#05001a", ff: "sans", pt: 0, dc: "Smart Casual", bgi: "" }
};

// History System (Ctrl+Z)
let historyStack = [];
function saveHistory() {
    if (historyStack.length > 20) historyStack.shift();
    historyStack.push(JSON.stringify(state));
}
window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z' && historyStack.length > 0) {
        state = JSON.parse(historyStack.pop());
        syncStateToUI(); showToast("Undo Successful");
    }
});

/**
 * UI RENDERER
 */
function syncStateToUI() {
    document.getElementById('d-t').innerText = state.t;
    document.getElementById('d-st').innerText = state.st;
    document.getElementById('d-desc').innerText = state.desc;

    if (state.dc) { document.getElementById('d-dc').innerText = "Dress Code: " + state.dc; document.getElementById('d-dc').classList.remove('hidden'); }
    else document.getElementById('d-dc').classList.add('hidden');

    document.documentElement.style.setProperty('--primary', state.ac);
    document.documentElement.style.setProperty('--bg', state.bg);
    document.documentElement.style.setProperty('--blur', `${state.bl}px`);

    // Fonts & RTL Handling
    const card = document.getElementById('main-card');
    card.className = `card ff-${state.ff}`;

    if (state.bgi) document.getElementById('bg-image').style.backgroundImage = `url(${state.bgi})`;
    else document.getElementById('bg-image').style.backgroundImage = 'none';

    // Links
    const btnWa = document.getElementById('rsvp-wa');
    const btnLoc = document.getElementById('loc-btn');
    const btnCal = document.getElementById('cal-btn');

    if (state.ph) { btnWa.classList.remove('hidden'); btnWa.href = `https://wa.me/${state.ph.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hi! RSVP for ' + state.t)}`; } else btnWa.classList.add('hidden');
    if (state.loc) { btnLoc.classList.remove('hidden'); btnLoc.href = state.loc; } else btnLoc.classList.add('hidden');
    if (state.dt) { document.getElementById('countdown').classList.remove('hidden'); btnCal.classList.remove('hidden'); } else { document.getElementById('countdown').classList.add('hidden'); btnCal.classList.add('hidden'); }

    // Sync Inputs
    const inputs = ['t', 'st', 'desc', 'dc', 'ph', 'loc', 'bgi', 'dt', 'ac', 'bg', 'bl', 'ff', 'pt', 'mu'];
    inputs.forEach(key => { const el = document.getElementById(`in-${key}`); if (el) el.value = state[key]; });

    updateLiveURL();
}

function updateLiveURL() {
    const encoded = btoa(encodeURIComponent(JSON.stringify(state)));
    window.history.replaceState({}, '', `?s=${encoded}`);
}

/**
 * IMAGE EXPORT (html2canvas)
 */
async function downloadAsImage() {
    const btn = document.getElementById('img-btn');
    const card = document.getElementById('main-card');
    const originalText = btn.innerText;
    btn.innerText = "⏳ Generating...";

    try {
        const canvas = await html2canvas(card, {
            backgroundColor: state.bg,
            scale: 2, // High resolution
            useCORS: true,
            logging: false
        });
        const link = document.createElement('a');
        link.download = `WiYiF_Invitation_${Date.now()}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
        showToast("📸 Image Saved!");
    } catch (err) {
        console.error("Image generation failed", err);
        showToast("⚠️ Could not generate image.");
    } finally {
        btn.innerText = originalText;
    }
}

/**
 * DB SAVING & QR CODE
 */
let qrCodeInstance = null;
async function saveToDatabase() {
    const btn = document.getElementById('btn-save');
    btn.innerText = "⏳ Saving..."; btn.disabled = true;

    try {
        const response = await fetch('/api/save', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state)
        });

        let targetUrl = window.location.href;
        if (response.ok) {
            const data = await response.json();
            targetUrl = `${window.location.origin}?id=${data.id}`;
            window.history.pushState({}, '', `?id=${data.id}`);
        }

        document.getElementById('share-link-input').value = targetUrl;

        // QR Code
        const qrContainer = document.getElementById("qrcode");
        qrContainer.innerHTML = "";
        qrCodeInstance = new QRCode(qrContainer, { text: targetUrl, width: 180, height: 180, colorDark: "#000", colorLight: "#fff" });
        document.getElementById('qr-modal').classList.add('show');

    } catch (err) {
        console.error("DB Error", err);
        showToast("⚠️ DB Error. Long Link Created!");
    } finally {
        btn.innerText = "💾 Save & Get Link"; btn.disabled = false;
    }
}

async function loadData() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id'); const base64 = params.get('s');

    if (id) {
        try {
            const res = await fetch(`/api/get?id=${id}`);
            if (res.ok) { const dbState = await res.json(); state = { ...state, ...dbState }; }
            else showToast("❌ Invitation Expired/Not Found");
        } catch (e) { console.error(e); }
    } else if (base64) {
        try { state = { ...state, ...JSON.parse(decodeURIComponent(atob(base64))) }; } catch (e) { }
    }
    saveHistory(); syncStateToUI();
}

/**
 * ICS CALENDAR
 */
window.downloadICS = () => {
    if (!state.dt) return;
    const sDate = new Date(state.dt).toISOString().replace(/-|:|\.\d+/g, '');
    const eDate = new Date(new Date(state.dt).getTime() + 2 * 3600000).toISOString().replace(/-|:|\.\d+/g, '');
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${sDate}\nDTEND:${eDate}\nSUMMARY:${state.t}\nDESCRIPTION:${state.desc}\nLOCATION:${state.loc}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: 'text/calendar' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'WiYiF_Event.ics'; a.click();
};

/**
 * MULTI-PARTICLE ENGINE (Fireworks, Petals, Stars)
 */
const canvas = document.getElementById('canvas'); const ctx = canvas.getContext('2d'); let particles = [];
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resize); resize();

class Particle {
    constructor(x, y, color, type) {
        this.x = x; this.y = y; this.color = color; this.type = parseInt(type);
        this.a = 1; this.angle = Math.random() * Math.PI * 2;

        if (this.type === 0) { // Fireworks
            this.v = { x: (Math.random() - 0.5) * 10, y: (Math.random() - 0.5) * 10 };
            this.f = 0.95; this.g = 0.05; this.decay = 0.015;
        } else if (this.type === 1) { // Rose Petals
            this.v = { x: (Math.random() - 0.5) * 2, y: Math.random() * 2 + 1 };
            this.f = 0.99; this.g = 0.01; this.decay = 0.005;
        } else { // Stars
            this.v = { x: (Math.random() - 0.5) * 0.5, y: (Math.random() - 0.5) * 0.5 - 0.5 };
            this.f = 1; this.g = 0; this.decay = 0.008;
        }
    }
    draw() {
        ctx.globalAlpha = this.a; ctx.fillStyle = this.color;
        ctx.save(); ctx.translate(this.x, this.y);

        if (this.type === 0) { // Circle
            ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2); ctx.fill();
        } else if (this.type === 1) { // Petal Oval
            ctx.rotate(this.angle); ctx.beginPath(); ctx.ellipse(0, 0, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
        } else { // Star
            ctx.rotate(this.angle); ctx.beginPath();
            for (let i = 0; i < 5; i++) { ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * 4, -Math.sin((18 + i * 72) * Math.PI / 180) * 4); ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * 2, -Math.sin((54 + i * 72) * Math.PI / 180) * 2); }
            ctx.closePath(); ctx.fill();
        }
        ctx.restore();
    }
    update() {
        this.v.x *= this.f; this.v.y *= this.f; this.v.y += this.g;
        this.x += this.v.x; this.y += this.v.y; this.a -= this.decay;
        if (this.type === 1) { this.x += Math.sin(this.y * 0.05); this.angle += 0.05; } // Flutter effect
        if (this.type === 2) this.angle += 0.02; // Spin effect
    }
}

function createBurst(x, y, manual = false) {
    const amount = state.pt == 0 ? 40 : (state.pt == 1 ? 5 : 10);
    const color = state.pt == 1 ? (Math.random() > 0.5 ? "#e60000" : "#ff4d4d") : state.ac; // Force red for petals
    for (let i = 0; i < amount; i++) particles.push(new Particle(x, y, color, state.pt));
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Auto generation
    if (state.pt == 1 && Math.random() < 0.05) createBurst(Math.random() * canvas.width, -10); // Falling petals
    if (state.pt == 2 && Math.random() < 0.1) createBurst(Math.random() * canvas.width, Math.random() * canvas.height); // Twinkling stars

    particles.forEach((p, i) => { if (p.a > 0) { p.update(); p.draw(); } else particles.splice(i, 1); });
    requestAnimationFrame(animate);
}
animate();

// 3D Parallax & Clicks
const scene = document.getElementById('scene');
window.addEventListener('mousemove', (e) => {
    if (window.innerWidth < 768) return;
    scene.style.transform = `rotateY(${(window.innerWidth / 2 - e.pageX) / 40}deg) rotateX(${(window.innerHeight / 2 - e.pageY) / 40}deg)`;
});
window.addEventListener('mousedown', (e) => { if (state.pt == 0 && !e.target.closest('#sidebar') && !e.target.closest('.modal')) createBurst(e.clientX, e.clientY); });

/**
 * COUNTDOWN LOGIC
 */
setInterval(() => {
    if (!state.dt) return;
    const diff = new Date(state.dt) - new Date();
    if (diff <= 0) { document.getElementById('countdown').innerHTML = `<div style="color:var(--primary); font-weight:bold; font-size:1.5rem; letter-spacing:2px;">IT'S TIME!</div>`; return; }
    document.getElementById('cd-d').innerText = Math.floor(diff / 864e5).toString().padStart(2, '0');
    document.getElementById('cd-h').innerText = Math.floor((diff % 864e5) / 36e5).toString().padStart(2, '0');
    document.getElementById('cd-m').innerText = Math.floor((diff % 36e5) / 6e4).toString().padStart(2, '0');
    document.getElementById('cd-s').innerText = Math.floor((diff % 6e4) / 1000).toString().padStart(2, '0');
}, 1000);

/**
 * INITIALIZATION & EVENTS
 */
let audioInit = false;
window.addEventListener('click', () => {
    if (!audioInit && state.mu) { const a = new Audio(state.mu); a.loop = true; a.volume = 0.5; a.play().catch(() => { }); audioInit = true; }
}, { once: true });

document.getElementById('ui-toggle').onclick = () => document.getElementById('sidebar').classList.toggle('open');

const inputKeys = ['t', 'st', 'desc', 'dc', 'ph', 'loc', 'bgi', 'dt', 'ac', 'bg', 'bl', 'ff', 'pt', 'mu'];
inputKeys.forEach(key => {
    document.getElementById(`in-${key}`).addEventListener('change', (e) => {
        saveHistory(); state[key] = ['bl', 'pt'].includes(key) ? Number(e.target.value) : e.target.value; syncStateToUI();
    });
    document.getElementById(`in-${key}`).addEventListener('input', (e) => {
        state[key] = ['bl', 'pt'].includes(key) ? Number(e.target.value) : e.target.value; syncStateToUI();
    });
});

document.getElementById('btn-save').onclick = saveToDatabase;

window.applyPreset = (p) => { saveHistory(); state = { ...state, ...PRESETS[p] }; syncStateToUI(); };

function showToast(msg) {
    const t = document.getElementById('toast'); t.innerText = msg;
    t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000);
}

window.onload = loadData;
