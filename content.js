console.log("YT Music Segment Looper loaded");

/* ================= STATE ================= */

let video = null;
let startTime = null;
let endTime = null;
let looping = false;
let isDragging = null; // 'start' or 'end'

// UI
let controlBox;
let markersContainer;
let startMarker;
let endMarker;
let loopRegion;
let progressBarElement = null;

// Dragging state for control box
let isDraggingBox = false;
let boxOffsetX = 0;
let boxOffsetY = 0;

/* ================= INIT ================= */

const waitForVideo = setInterval(() => {
  const v = document.querySelector("video");
  if (v && v.duration) {
    video = v;
    clearInterval(waitForVideo);
    init();
  }
}, 500);

function init() {
  createControls();
  waitForProgressBar();
  setupVideoListeners();
  setupMessageListener();
  
  // Start with control box hidden
  controlBox.style.display = "none";
}

/* ================= FIND PROGRESS BAR ================= */

function waitForProgressBar() {
  const checkInterval = setInterval(() => {
    // Try multiple selectors for YT Music's progress bar
    const selectors = [
      '#progress-bar',
      '.progress-bar',
      '#sliderBar',
      'tp-yt-paper-slider#progress-bar',
      '.ytmusic-player-bar #progress-bar',
      '[role="slider"]'
    ];
    
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) {
        progressBarElement = el;
        console.log("Found progress bar:", selector);
        clearInterval(checkInterval);
        injectMarkers();
        return;
      }
    }
  }, 500);
  
  // Fallback after 10 seconds
  setTimeout(() => {
    if (!progressBarElement) {
      clearInterval(checkInterval);
      console.warn("Progress bar not found, creating overlay");
      createOverlayBar();
    }
  }, 10000);
}

/* ================= CONTROLS ================= */

function createControls() {
  controlBox = document.createElement("div");
  Object.assign(controlBox.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "rgba(0, 0, 0, 0.9)",
    color: "#fff",
    padding: "12px",
    borderRadius: "8px",
    zIndex: "999999",
    fontSize: "12px",
    fontFamily: "Roboto, Arial, sans-serif",
    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
    minWidth: "200px"
  });

  const title = document.createElement("div");
  title.style.display = "flex";
  title.style.justifyContent = "space-between";
  title.style.alignItems = "center";
  title.style.marginBottom = "8px";
  title.style.padding = "4px 0";
  title.style.userSelect = "none";
  
  const titleText = document.createElement("span");
  titleText.innerText = "🔁 Loop Controller";
  titleText.style.fontWeight = "bold";
  titleText.style.fontSize = "13px";
  titleText.style.cursor = "move";
  titleText.style.flexGrow = "1";
  
  const closeBtn = document.createElement("button");
  closeBtn.innerText = "✕";
  closeBtn.title = "Close";
  Object.assign(closeBtn.style, {
    background: "transparent",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "18px",
    padding: "0 4px",
    lineHeight: "1",
    opacity: "0.7",
    transition: "opacity 0.2s"
  });
  
  closeBtn.onmouseenter = () => closeBtn.style.opacity = "1";
  closeBtn.onmouseleave = () => closeBtn.style.opacity = "0.7";
  closeBtn.onclick = (e) => {
    e.stopPropagation();
    controlBox.style.display = "none";
  };
  
  title.appendChild(titleText);
  title.appendChild(closeBtn);
  
  // Make draggable via title bar (but not the close button)
  titleText.addEventListener("mousedown", (e) => {
    isDraggingBox = true;
    boxOffsetX = e.clientX - controlBox.offsetLeft;
    boxOffsetY = e.clientY - controlBox.offsetTop;
    controlBox.style.cursor = "grabbing";
    titleText.style.cursor = "grabbing";
  });

  const timeDisplay = document.createElement("div");
  timeDisplay.id = "loop-time-display";
  timeDisplay.style.fontSize = "11px";
  timeDisplay.style.color = "#aaa";
  timeDisplay.style.marginBottom = "8px";
  timeDisplay.innerText = "No loop set";

  const startBtn = createButton("Set Start", () => {
    startTime = video.currentTime;
    updateMarkers();
    updateTimeDisplay();
  });

  const endBtn = createButton("Set End", () => {
    endTime = video.currentTime;
    updateMarkers();
    updateTimeDisplay();
  });

  const playLoopBtn = createButton("▶ Play Loop", () => {
    if (startTime === null || endTime === null) {
      alert("Please set both start and end points first!");
      return;
    }
    looping = true;
    video.currentTime = startTime;
    video.play();
    document.getElementById("loop-toggle-btn").innerText = "✓ Loop ON";
    document.getElementById("loop-toggle-btn").style.background = "#1db954";
  });
  playLoopBtn.style.background = "#1e40af";
  playLoopBtn.style.width = "calc(100% - 4px)";

  const loopBtn = createButton("Loop OFF", () => {
    looping = !looping;
    loopBtn.innerText = looping ? "✓ Loop ON" : "Loop OFF";
    loopBtn.style.background = looping ? "#1db954" : "#333";
    if (looping && startTime !== null) {
      video.currentTime = startTime;
    }
  });
  loopBtn.id = "loop-toggle-btn";

  const clearBtn = createButton("Clear Loop", () => {
    startTime = null;
    endTime = null;
    looping = false;
    updateMarkers();
    updateTimeDisplay();
    document.getElementById("loop-toggle-btn").innerText = "Loop OFF";
    document.getElementById("loop-toggle-btn").style.background = "#333";
  });
  clearBtn.style.background = "#522";

  controlBox.append(title, timeDisplay, startBtn, endBtn, playLoopBtn, loopBtn, clearBtn);
  document.body.appendChild(controlBox);
}

function createButton(text, onClick) {
  const btn = document.createElement("button");
  btn.innerText = text;
  btn.onclick = onClick;
  Object.assign(btn.style, {
    margin: "4px 2px",
    padding: "6px 10px",
    cursor: "pointer",
    background: "#333",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "11px",
    transition: "background 0.2s",
    width: "calc(50% - 4px)",
    display: "inline-block"
  });
  btn.onmouseenter = () => btn.style.background = "#444";
  btn.onmouseleave = () => {
    if (btn.id !== "loop-toggle-btn" || !looping) {
      btn.style.background = btn.innerText.includes("Clear") ? "#522" : "#333";
    }
  };
  return btn;
}

function updateTimeDisplay() {
  const display = document.getElementById("loop-time-display");
  if (startTime !== null && endTime !== null) {
    display.innerText = `${formatTime(startTime)} → ${formatTime(endTime)}`;
  } else if (startTime !== null) {
    display.innerText = `Start: ${formatTime(startTime)}`;
  } else if (endTime !== null) {
    display.innerText = `End: ${formatTime(endTime)}`;
  } else {
    display.innerText = "No loop set";
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/* ================= MARKERS ON NATIVE PROGRESS BAR ================= */

function injectMarkers() {
  if (!progressBarElement) return;

  // Get the actual slider container
  let sliderContainer = progressBarElement.querySelector('#sliderContainer') || 
                        progressBarElement.querySelector('.slider-container') ||
                        progressBarElement;

  // Ensure relative positioning
  sliderContainer.style.position = "relative";

  // Create container for markers
  markersContainer = document.createElement("div");
  Object.assign(markersContainer.style, {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "100"
  });

  // Loop region (highlighted area between markers)
  loopRegion = document.createElement("div");
  Object.assign(loopRegion.style, {
    position: "absolute",
    top: "0",
    height: "100%",
    background: "rgba(29, 185, 84, 0.25)",
    opacity: "0",
    transition: "opacity 0.3s",
    pointerEvents: "none"
  });

  // Start marker
  startMarker = createMarker("#22c55e", "start");
  
  // End marker
  endMarker = createMarker("#ef4444", "end");

  markersContainer.append(loopRegion, startMarker, endMarker);
  sliderContainer.appendChild(markersContainer);
  
  console.log("Markers injected into progress bar");
}

function createMarker(color, type) {
  const marker = document.createElement("div");
  Object.assign(marker.style, {
    position: "absolute",
    top: "-4px",
    width: "4px",
    height: "calc(100% + 8px)",
    background: color,
    borderRadius: "2px",
    opacity: "0",
    transition: "opacity 0.3s, transform 0.2s",
    pointerEvents: "auto",
    cursor: "ew-resize",
    boxShadow: `0 0 6px ${color}`,
    zIndex: "101"
  });
  
  marker.dataset.type = type;
  
  // Dragging functionality
  marker.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging = type;
    marker.style.transform = "scaleY(1.2)";
    document.body.style.cursor = "ew-resize";
  });
  
  return marker;
}

function createOverlayBar() {
  // Create standalone overlay bar as fallback
  markersContainer = document.createElement("div");
  Object.assign(markersContainer.style, {
    position: "fixed",
    bottom: "100px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "70%",
    height: "8px",
    background: "rgba(68, 68, 68, 0.8)",
    borderRadius: "4px",
    zIndex: "999998"
  });

  loopRegion = document.createElement("div");
  Object.assign(loopRegion.style, {
    position: "absolute",
    top: "0",
    height: "100%",
    background: "rgba(29, 185, 84, 0.4)",
    opacity: "0",
    borderRadius: "4px"
  });

  startMarker = createMarker("#22c55e", "start");
  endMarker = createMarker("#ef4444", "end");

  markersContainer.append(loopRegion, startMarker, endMarker);
  document.body.appendChild(markersContainer);
  
  console.log("Using fallback overlay bar");
}

/* ================= EVENT LISTENERS ================= */

function setupMessageListener() {
  // Listen for messages from background script to toggle menu
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleMenu") {
      if (controlBox) {
        controlBox.style.display = controlBox.style.display === "none" ? "block" : "none";
        sendResponse({visible: controlBox.style.display === "block"});
      }
    } else if (request.action === "showMenu") {
      if (controlBox) {
        controlBox.style.display = "block";
        sendResponse({visible: true});
      }
    }
  });
}

function setupVideoListeners() {
  // Looping logic
  video.addEventListener("timeupdate", () => {
    if (!looping || startTime === null || endTime === null) return;
    if (video.currentTime >= endTime) {
      video.currentTime = startTime;
    }
  });

  // Dragging for control box
  document.addEventListener("mousemove", (e) => {
    // Handle control box dragging
    if (isDraggingBox) {
      e.preventDefault();
      const newLeft = e.clientX - boxOffsetX;
      const newTop = e.clientY - boxOffsetY;
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - controlBox.offsetWidth;
      const maxY = window.innerHeight - controlBox.offsetHeight;
      
      controlBox.style.left = `${Math.max(0, Math.min(newLeft, maxX))}px`;
      controlBox.style.top = `${Math.max(0, Math.min(newTop, maxY))}px`;
      controlBox.style.right = "auto";
      controlBox.style.bottom = "auto";
      return;
    }
    
    // Handle marker dragging
    if (!isDragging || !video || !markersContainer) return;
    
    const rect = markersContainer.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const percent = x / rect.width;
    const time = percent * video.duration;
    
    if (isDragging === "start") {
      startTime = endTime !== null ? Math.min(time, endTime - 0.1) : time;
    } else {
      endTime = startTime !== null ? Math.max(time, startTime + 0.1) : time;
    }
    
    updateMarkers();
    updateTimeDisplay();
  });

  document.addEventListener("mouseup", () => {
    // Handle control box drag end
    if (isDraggingBox) {
      isDraggingBox = false;
      controlBox.style.cursor = "default";
      const titleText = controlBox.querySelector("span");
      if (titleText) titleText.style.cursor = "move";
    }
    
    // Handle marker drag end
    if (isDragging) {
      const marker = isDragging === "start" ? startMarker : endMarker;
      marker.style.transform = "scaleY(1)";
      document.body.style.cursor = "default";
      isDragging = null;
    }
  });
}

/* ================= MARKER UPDATE ================= */

function updateMarkers() {
  if (!video || !video.duration || !markersContainer) return;

  const hasStart = startTime !== null;
  const hasEnd = endTime !== null;

  if (hasStart) {
    const startPercent = (startTime / video.duration) * 100;
    startMarker.style.left = `${startPercent}%`;
    startMarker.style.opacity = "1";
  } else {
    startMarker.style.opacity = "0";
  }

  if (hasEnd) {
    const endPercent = (endTime / video.duration) * 100;
    endMarker.style.left = `${endPercent}%`;
    endMarker.style.opacity = "1";
  } else {
    endMarker.style.opacity = "0";
  }

  // Update loop region
  if (hasStart && hasEnd) {
    const startPercent = (startTime / video.duration) * 100;
    const endPercent = (endTime / video.duration) * 100;
    loopRegion.style.left = `${startPercent}%`;
    loopRegion.style.width = `${endPercent - startPercent}%`;
    loopRegion.style.opacity = "1";
  } else {
    loopRegion.style.opacity = "0";
  }
}