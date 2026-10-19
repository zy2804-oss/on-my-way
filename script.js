const $ = (selector) => document.querySelector(selector);

const scenes = {
  autumn: {
    number: "SCENE 01",
    title: "AUTUMN IN NEW YORK",
    caption: "Three years in this city.\nOne last autumn walk.\nA goodbye, held gently.",
    pov: "It’s autumn in New York.\nI’m leaving the city after three years of living here.\nI want to hold onto this moment a little longer.",
    track: "Music Demo",
    artist: "Audio 873767",
    audio: "audio/873767_musicdemo.wav",
    atmosphere: "autumn · bittersweet · reflective",
    context: "New York · autumn · leaving after three years",
    feeling: "nostalgic · tender · reflective"
  },
  night: {
    number: "SCENE 02",
    title: "NEW YORK AFTER DARK",
    caption: "Rain on the pavement.\nA takeout run after dark.\nA little danger looks good on you.",
    pov: "It’s a rainy night in New York.\nI’m walking fast to pick up takeout.\nI want to feel cool, fearless, and a little dangerous.",
    track: "Industraumatic Loop",
    artist: "Audio 875304",
    audio: "audio/875304_industraumaticloop.mp3",
    atmosphere: "rainy night · cool · dangerous",
    context: "New York · rain · walking to pick up takeout",
    feeling: "cool · fearless · cinematic · dangerous"
  }
};

const audio = new Audio();
audio.loop = true;
audio.preload = "metadata";
const state = { originalPOV: "", selectedScene: null, activeScene: null };
const player = $(".player");
const playButton = $("#playButton");
const playerStatus = document.createElement("span");
playerStatus.setAttribute("role", "status");
playerStatus.style.cssText = "display:block;font:10px Arial,sans-serif;color:#ffd7c7;margin-top:4px";
$("#trackArtist").after(playerStatus);
player.querySelector("div span").textContent = "SOUNDTRACK · LOOPING";

const switchButton = document.createElement("button");
switchButton.type = "button";
switchButton.textContent = "⇄";
switchButton.title = "Switch scene and soundtrack";
switchButton.setAttribute("aria-label", "Switch scene and soundtrack");
switchButton.style.cssText = "flex:0 0 36px;background:transparent;color:white;border-color:#ffffff99";
player.append(switchButton);

function updatePlayButton() {
  const playing = !audio.paused;
  playButton.textContent = playing ? "Ⅱ" : "▶";
  playButton.setAttribute("aria-label", playing ? "Pause soundtrack" : "Play soundtrack");
}

audio.addEventListener("play", updatePlayButton);
audio.addEventListener("pause", updatePlayButton);
audio.addEventListener("error", () => {
  playerStatus.textContent = "Audio unavailable. Please try again.";
  updatePlayButton();
});

async function startAudio() {
  playerStatus.textContent = "";
  try {
    await audio.play();
  } catch (error) {
    playerStatus.textContent = "Press play to start the soundtrack.";
    updatePlayButton();
  }
}

function interpretPOV(text) {
  const lower = text.toLowerCase();
  if (/(rain|takeout|take-out|night|dark|danger|fearless|rebellious|cool)/.test(lower)) return "night";
  if (/(autumn|fall|leav|leaving|goodbye|farewell|three years|3 years|nostalg|bittersweet)/.test(lower)) return "autumn";
  return null;
}

function showScene(key) {
  const scene = scenes[key];
  const changed = state.activeScene !== key;
  state.activeScene = key;
  if (changed) {
    audio.pause();
    audio.src = scene.audio;
    audio.load();
  }
  $("#opening").classList.add("hidden");
  $("#cinema").classList.remove("hidden");
  $("#cinema").classList.toggle("autumn", key === "autumn");
  $("#sceneNumber").textContent = scene.number;
  $("#sceneTitle").textContent = scene.title;
  $("#sceneCaption").innerHTML = scene.caption.replaceAll("\n", "<br>");
  $("#originalPov").textContent = state.originalPOV;
  $("#trackTitle").textContent = scene.track;
  $("#trackArtist").textContent = scene.artist;
  $("#atmosphere").textContent = scene.atmosphere;
  $("#panelOriginal").textContent = state.originalPOV;
  $("#panelAtmosphere").textContent = scene.context + " → " + scene.feeling;
  $("#panelTrack").textContent = scene.track + " — " + scene.artist + " · loops until paused or switched";
  $("#behindPanel").classList.add("hidden");
  updatePlayButton();
  if (changed) startAudio();
}

document.querySelectorAll(".example").forEach((button) => {
  button.textContent = button.dataset.scene === "autumn" ? "Leaving New York" : "New York After Dark";
  button.addEventListener("click", () => {
    state.selectedScene = button.dataset.scene;
    $("#povInput").value = scenes[state.selectedScene].pov;
    $("#voiceStatus").textContent = "Write it as you would say it.";
  });
});
$("#povInput").addEventListener("input", () => { state.selectedScene = null; });
$("#soundtrackButton").addEventListener("click", () => {
  const text = $("#povInput").value.trim();
  const key = state.selectedScene || interpretPOV(text);
  if (!key) {
    $("#voiceStatus").textContent = "Choose a scene above or describe an autumn goodbye or rainy night.";
    return;
  }
  state.originalPOV = text || scenes[key].pov;
  showScene(key);
});
$("#backButton").addEventListener("click", () => {
  $("#cinema").classList.add("hidden");
  $("#opening").classList.remove("hidden");
});
playButton.addEventListener("click", () => audio.paused ? startAudio() : audio.pause());
switchButton.addEventListener("click", () => {
  const next = state.activeScene === "autumn" ? "night" : "autumn";
  state.selectedScene = next;
  state.originalPOV = scenes[next].pov;
  $("#povInput").value = state.originalPOV;
  showScene(next);
});
$("#behindButton").addEventListener("click", () => $("#behindPanel").classList.toggle("hidden"));
$("#closePanel").addEventListener("click", () => $("#behindPanel").classList.add("hidden"));
$("#micButton").addEventListener("click", () => {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    $("#voiceStatus").textContent = "Voice input is unavailable here — typing works beautifully.";
    return;
  }
  const recognition = new Recognition();
  recognition.lang = "en-US";
  recognition.onresult = (event) => {
    $("#povInput").value = event.results[0][0].transcript;
    state.selectedScene = null;
    $("#voiceStatus").textContent = "Your POV is ready to score.";
  };
  recognition.onerror = () => { $("#voiceStatus").textContent = "Couldn’t hear that. Try typing your scene."; };
  recognition.start();
  $("#voiceStatus").textContent = "Listening…";
});
