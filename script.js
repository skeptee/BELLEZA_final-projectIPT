"use strict";
const $ = id => document.getElementById(id);
const log = (el, msg) => { el.textContent += (el.textContent ? "\n" : "") + msg; };
const wait = ms => new Promise(res => setTimeout(res, ms));

/* ---------- 1. Arrays ---------- */
const reel = ["wide shot", "close-up"];
const numbers = [1, 2, 3, 4, 5, 6];

function renderReel() {
  const box = $("reel");
  box.innerHTML = "";
  if (!reel.length) { box.innerHTML = '<span class="empty">[ empty reel ]</span>'; return; }
  reel.forEach(name => {
    const f = document.createElement("span");
    f.className = "frame";
    f.textContent = name;
    box.appendChild(f);
  });
}
function arrOp(op) {
  const out = $("arrOut");
  const v = $("arrIn").value.trim();
  if (op === "push" || op === "unshift") {
    if (!v) { out.textContent = "Type a shot name first."; return; }
    const len = reel[op](v);
    out.textContent = op + "('" + v + "') -> new length " + len;
    $("arrIn").value = "";
  } else {
    const removed = reel[op]();
    out.textContent = op + "() -> " + (removed === undefined ? "undefined (reel was empty)" : "removed '" + removed + "'");
  }
  renderReel();
}
function arrMethod(m) {
  const result = {
    map: () => numbers.map(n => n * 2),
    filter: () => numbers.filter(n => n % 2 === 0),
    reduce: () => numbers.reduce((s, n) => s + n, 0),
    find: () => numbers.find(n => n > 3)
  }[m]();
  $("arrOut").textContent = "numbers." + m + "(...) -> " + JSON.stringify(result);
}
renderReel();

/* ---------- 2. Async ---------- */
let start = performance.now();
const elapsed = () => ((performance.now() - start) / 1000).toFixed(2) + "s";
function resetAsync() { $("asyncOut").textContent = ""; start = performance.now(); }
function runCallback() {
  resetAsync(); log($("asyncOut"), "[callback] rendering...");
  setTimeout(() => log($("asyncOut"), "[callback] done at " + elapsed()), 1000);
}
function runPromise() {
  resetAsync(); log($("asyncOut"), "[promise] rendering...");
  wait(1000).then(() => log($("asyncOut"), "[promise] done at " + elapsed()));
}
async function runAwait() {
  resetAsync(); log($("asyncOut"), "[await] rendering...");
  await wait(1000);
  log($("asyncOut"), "[await] done at " + elapsed());
}
function runOrder() {
  resetAsync();
  log($("asyncOut"), "1 - sync start");
  setTimeout(() => log($("asyncOut"), "4 - setTimeout (macrotask)"), 0);
  Promise.resolve().then(() => log($("asyncOut"), "3 - promise.then (microtask)"));
  log($("asyncOut"), "2 - sync end");
}

/* ---------- 3. Events ---------- */
const boxes = ["bOuter", "bMiddle", "bInner"].map($);
const labels = { bOuter: "Outer", bMiddle: "Middle", bInner: "Inner" };
const handlers = {};
function attach() {
  const cap = $("useCapture").checked;
  boxes.forEach(b => {
    if (handlers[b.id]) b.removeEventListener("click", handlers[b.id].fn, handlers[b.id].cap);
    const fn = e => {
      log($("evOut"), (cap ? "capture" : "bubble") + " -> " + labels[b.id] + (e.target === b ? " (target)" : ""));
      if (b.id === "bMiddle" && $("stopProp").checked) {
        e.stopPropagation();
        log($("evOut"), "   stopPropagation()");
      }
    };
    handlers[b.id] = { fn, cap };
    b.addEventListener("click", fn, cap);
  });
}
$("useCapture").addEventListener("change", attach);
$("clearLog").addEventListener("click", () => { $("evOut").textContent = ""; });
attach();

/* ---------- 4. DOM ---------- */
function updateCount() {
  $("domOut").textContent = "Tasks: " + document.querySelectorAll("#todo li").length;
}
function addTodo() {
  const input = $("todoIn");
  const text = input.value.trim();
  if (!text) return;
  const li = document.createElement("li");
  const label = document.createElement("span");
  label.textContent = text;
  label.addEventListener("click", () => {
    label.style.textDecoration = label.style.textDecoration ? "" : "line-through";
  });
  const del = document.createElement("button");
  del.textContent = "x";
  del.setAttribute("aria-label", "Remove " + text);
  del.addEventListener("click", () => { li.remove(); updateCount(); });
  li.append(label, del);
  $("todo").appendChild(li);
  input.value = "";
  updateCount();
}
$("todoIn").addEventListener("keydown", e => { if (e.key === "Enter") addTodo(); });
function toggleDomStyle() { document.querySelector("#dom h3").classList.toggle("accent-on"); }

/* ---------- 5. OOP ---------- */
class Character {
  #energy = 100;
  constructor(name) { this.name = name; }
  get energy() { return this.#energy; }
  tire(n) { if (n > 0) this.#energy = Math.max(0, this.#energy - n); return this; }
  move() { return this.name + " moves"; }
}
class Hero extends Character { move() { return this.name + " leaps into action!"; } }
class Villain extends Character { move() { return this.name + " sneaks along the wall..."; } }
class Shape {
  area() { throw new Error("Shape.area() must be implemented"); }
  describe() { return this.constructor.name + " area = " + this.area().toFixed(2); }
}
class Circle extends Shape { constructor(r) { super(); this.r = r; } area() { return Math.PI * this.r ** 2; } }
class Rect extends Shape { constructor(w, h) { super(); this.w = w; this.h = h; } area() { return this.w * this.h; } }

function oopEncap() {
  const o = $("oopOut"); o.textContent = "";
  const c = new Character("Pip").tire(30);
  log(o, "Encapsulation: energy is private, changed only by tire()");
  log(o, "tire(30) -> energy: " + c.energy);
  try { c.energy = 999; } catch (e) { log(o, "c.energy = 999 -> blocked (" + e.name + ")"); }
  log(o, "energy is still: " + c.energy);
}
function oopInherit() {
  const o = $("oopOut"); o.textContent = "";
  const h = new Hero("Nova");
  log(o, "Inheritance: Hero extends Character");
  log(o, "h.name (from Character): " + h.name);
  log(o, "h instanceof Character: " + (h instanceof Character));
  log(o, "h.move(): " + h.move());
}
function oopPoly() {
  const o = $("oopOut"); o.textContent = "";
  log(o, "Polymorphism: same call, different result");
  [new Character("Extra"), new Hero("Nova"), new Villain("Shade")].forEach(c => log(o, "c.move() -> " + c.move()));
}
function oopAbstract() {
  const o = $("oopOut"); o.textContent = "";
  log(o, "Abstraction: callers use describe() without knowing the math");
  [new Circle(3), new Rect(4, 5)].forEach(s => log(o, s.describe()));
  try { new Shape().describe(); } catch (e) { log(o, "new Shape() -> " + e.message); }
}

/* ---------- Projects: search + filter ---------- */
// Edit this list with your own work.
const projects = [
  { title: "Beyond the Bell", category: "Animation", description: "A 3D animated short film about the daily life of working students.", link: "#" },
  { title: "CreateHub", category: "Web", description: "A portal where clients request digital media and approve finished work.", link: "#" },
  { title: "ArtWorth", category: "Web", description: "A website where artists share their art and get support from viewers.", link: "#" },
  { title: "DOETS Short Film", category: "School", description: "A mystery thriller short made for a multimedia systems class.", link: "#" }
];
let currentFilter = "All";

function renderProjects() {
  const query = $("searchBox").value.trim().toLowerCase();
  const list = $("projectList");
  list.innerHTML = "";
  const shown = projects.filter(p =>
    (currentFilter === "All" || p.category === currentFilter) &&
    (p.title + " " + p.description).toLowerCase().includes(query)
  );
  if (!shown.length) { list.textContent = "No projects found."; return; }
  shown.forEach(p => {
    const div = document.createElement("div");
    div.className = "project";
    const h = document.createElement("h3"); h.textContent = p.title;
    const small = document.createElement("small"); small.textContent = "Type: " + p.category;
    const d = document.createElement("p"); d.textContent = p.description;
    const a = document.createElement("a"); a.href = p.link; a.textContent = "View project";
    div.append(h, small, d, a);
    list.appendChild(div);
  });
}
function setFilter(cat) {
  currentFilter = cat;
  document.querySelectorAll("#filterBtns button").forEach(b => b.classList.toggle("active", b.dataset.cat === cat));
  renderProjects();
}
document.querySelectorAll("#filterBtns button").forEach(b => b.addEventListener("click", () => setFilter(b.dataset.cat)));
$("searchBox").addEventListener("input", renderProjects);
renderProjects();

/* ---------- Contact form + localStorage ---------- */
const MSG_KEY = "mediaPortfolioMessages";
function loadMessages() {
  try { return JSON.parse(localStorage.getItem(MSG_KEY)) || []; } catch (e) { return []; }
}
function saveMessages(arr) {
  try { localStorage.setItem(MSG_KEY, JSON.stringify(arr)); } catch (e) { /* storage blocked */ }
}
function renderMessages() {
  const box = $("msgList");
  const msgs = loadMessages();
  box.innerHTML = "";
  if (!msgs.length) { box.textContent = "No saved messages yet."; return; }
  msgs.forEach((m, i) => {
    const div = document.createElement("div");
    div.className = "msg";
    const del = document.createElement("button");
    del.textContent = "Delete";
    del.addEventListener("click", () => deleteMessage(i));
    const text = document.createElement("div");
    text.textContent = m.name + " (" + m.email + ") - " + m.date + ": " + m.message;
    div.append(del, text);
    box.appendChild(div);
  });
}
function deleteMessage(i) {
  const msgs = loadMessages();
  msgs.splice(i, 1);
  saveMessages(msgs);
  renderMessages();
}
function clearMessages() { saveMessages([]); renderMessages(); }

$("contactForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = $("cName").value.trim();
  const email = $("cEmail").value.trim();
  const message = $("cMsg").value.trim();
  let valid = true;
  ["errName", "errEmail", "errMsg", "formStatus"].forEach(id => { $(id).textContent = ""; });
  if (name.length < 2) { $("errName").textContent = "Enter your name (at least 2 letters)."; valid = false; }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { $("errEmail").textContent = "Enter a valid email."; valid = false; }
  if (message.length < 10) { $("errMsg").textContent = "Message must be at least 10 characters."; valid = false; }
  if (!valid) return;
  const msgs = loadMessages();
  msgs.push({ name, email, message, date: new Date().toLocaleString() });
  saveMessages(msgs);
  $("contactForm").reset();
  $("formStatus").textContent = "Thanks! Your message was saved.";
  renderMessages();
});
renderMessages();
