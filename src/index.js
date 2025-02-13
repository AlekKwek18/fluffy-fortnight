const sectors = [
    { color: "#FFBC03", text: "#333333", label: "Sweets" },
    { color: "#FF5A10", text: "#333333", label: "Prize draw" },
    { color: "#FFBC03", text: "#333333", label: "Sweets" },
    { color: "#FF5A10", text: "#333333", label: "Prize draw" },
    { color: "#FFBC03", text: "#333333", label: "Sweets + Prize draw" },
    { color: "#FF5A10", text: "#333333", label: "You lose" },
    { color: "#FFBC03", text: "#333333", label: "Prize draw" },
    { color: "#FF5A10", text: "#333333", label: "Sweets" },
    { color: "#FF5A10", text: "#333333", label: "Wan Teng" },
  ];
  
  const events = {
    listeners: {},
    addListener: function (eventName, fn) {
      this.listeners[eventName] = this.listeners[eventName] || [];
      this.listeners[eventName].push(fn);
    },
    fire: function (eventName, ...args) {
      if (this.listeners[eventName]) {
        for (let fn of this.listeners[eventName]) {
          fn(...args);
        }
      }
    },
  };
  
  const rand = (m, M) => Math.random() * (M - m) + m;
  const tot = sectors.length;
  const spinEl = document.querySelector("#spin");
  const ctx = document.querySelector("#wheel").getContext("2d");
  const dia = ctx.canvas.width;
  const rad = dia / 2;
  const PI = Math.PI;
  const TAU = 2 * PI;
  const arc = TAU / sectors.length;
  
  const friction = 0.991; // 0.995=soft, 0.99=mid, 0.98=hard
  let angVel = 0; // Angular velocity
  let ang = 0; // Angle in radians
  
  let spinButtonClicked = false;
  
  const getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot;
  
  function drawSector(sector, i) {
    const ang = arc * i;
    ctx.save();
  
    // COLOR
    ctx.beginPath();
    ctx.fillStyle = sector.color;
    ctx.moveTo(rad, rad);
    ctx.arc(rad, rad, rad, ang, ang + arc);
    ctx.lineTo(rad, rad);
    ctx.fill();
  
    // TEXT
    ctx.translate(rad, rad);
    ctx.rotate(ang + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = sector.text;
    ctx.font = "bold 30px 'Lato', sans-serif";
    ctx.fillText(sector.label, rad - 10, 10);
    //
  
    ctx.restore();
  }
  
  function rotate() {
    const sector = sectors[getIndex()];
    ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;
  
    spinEl.textContent = !angVel ? "SPIN" : sector.label;
    spinEl.style.background = sector.color;
    spinEl.style.color = sector.text;
  }
  
  // Modify the frame function to snap to position
function frame() {
  if (!angVel && spinButtonClicked) {
    // Snap to exact Wan Teng position
    ang = (targetIndex + 0.5) * arc;
    const sector = sectors[getIndex()];
    events.fire("spinEnd", sector);
    spinButtonClicked = false;
    forcedWin = false;
    return;
  }

  angVel *= friction;
  if (angVel < 0.002) angVel = 0;
  ang += angVel;
  ang %= TAU;
  rotate();
}
  
  function engine() {
    frame();
    requestAnimationFrame(engine);
  }
  
  function init() {
    sectors.forEach(drawSector);
    rotate(); // Initial rotation
    engine(); // Start engine
    // Modify the existing spin click handler
    
// Modify the click handler
spinEl.addEventListener("click", () => {
    if (!angVel) {
      forcedWin = true; // Activate rigging
      
      // Calculate required spin parameters
      const currentAngle = ang % TAU;
      const targetAngle = (targetIndex + 0.5) * arc;
      const requiredRotation = (5 * TAU) + (targetAngle - currentAngle);
      
      // Set initial velocity to reach target after friction
      angVel = requiredRotation * (1 - friction);
    }
    spinButtonClicked = true;
  });
  
  // Find Wan Teng's position first
const targetIndex = sectors.findIndex(s => s.label === "Wan Teng"); // Should be index 8

// Modify the spin initialization
let forcedWin = false;
  // Modify the getIndex function to force Wan Teng
  const originalGetIndex = getIndex;
  getIndex = () => {
    return forcedWin ? targetIndex : originalGetIndex();
    // Always return Wan Teng's index (8) when spinning
  };
  }
  
  init();
  
  // Force result display
events.addListener("spinEnd", (sector) => {
    console.log(`Congratulations! You won: Wan Teng`);
    alert(`Winner: Wan Teng!`); // Force display regardless of actual sector
  });