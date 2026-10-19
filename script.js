const $ = (selector) => document.querySelector(selector);

const scenes = {
  autumn: {
    number: "SCENE 01",
    title: "AUTUMN IN NEW YORK",
    caption: "Three years in this city.\nOne last autumn walk.\nA goodbye, held gently.",
    pov: "It’s autumn in New York.\nI’m leaving the city after three years of living here.\nI want to hold onto this moment a little longer.",
    keywords: ["autumn", "fall", "leaving", "leave", "goodbye", "farewell", "three years", "3 years", "nostalgic", "bittersweet"],
    atmosphere: "autumn · bittersweet · reflective",
    context: "New York · autumn · leaving after three years",
    feeling: "nostalgic · tender · reflective"
  },
  night: {
    number: "SCENE 02",
    title: "NEW YORK AFTER DARK",
    caption: "Rain on the pavement.\nA takeout run after dark.\nA little danger looks good on you.",
    pov: "It’s a rainy night in New York.\nI’m walking fast to pick up takeout.\nI want to feel cool, fearless, and a little dangerous.",
    keywords: ["rain", "raining", "rainy", "takeout", "take-out", "night", "dark", "danger", "dangerous", "fearless", "rebellious", "cool"],
    atmosphere: "rainy night · cool · dangerous",
    context: "New York · rain · walking to pick up takeout",
    feeling: "cool · fearless · cinematic · dangerous"
  }
};

// Each track belongs to a scene; add more tracks here as they become available.
const musicLibrary = [
  { scene: "autumn", title: "Music Demo", artist: "Audio 873767", src: "audio/873767_musicdemo.wav" },
  { scene: "night", title: "Industraumatic Loop", artist: "Audio 875304", src: "audio/875304_industraumaticloop.mp3" }
];

const audio = new Audio();
audio.loop = false;
audio.preload = "metadata";
const state = { originalPOV: "", activeScene: null, playlist: [], trackIndex: 0, matchedKeywords: [] };
const player = $(".player");
const playButton = $("#playButton");
const playerStatus = document.createElement("span");
playerStatus.setAttribute("role", "status");
playerStatus.style.cssText = "display:block;font:10px Arial,sans-serif;color:#ffd7c7;margin-top:4px";
$("#trackArtist").after(playerStatus);
const playerLabel = player.querySelector("div span");

const playlistButton = document.createElement("button");
playlistButton.type = "button";
playlistButton.textContent = "♫";
playlistButton.setAttribute("aria-label", "View scene playlist");
playlistButton.style.cssText = "flex:0 0 36px;background:transparent;color:white;border-color:#ffffff99";
player.append(playlistButton);

const nextButton = document.createElement("button");
nextButton.type = "button";
nextButton.textContent = "⏭";
nextButton.setAttribute("aria-label", "Next track in this playlist");
nextButton.style.cssText = "flex:0 0 36px;background:transparent;color:white;border-color:#ffffff99";
player.append(nextButton);

const playlistPanel = document.createElement("aside");
playlistPanel.className = "behind-panel hidden";
playlistPanel.setAttribute("aria-label", "Scene playlist");
const closePlaylist = document.createElement("button");
closePlaylist.type = "button";
closePlaylist.textContent = "×";
closePlaylist.setAttribute("aria-label", "Close playlist");
const playlistHeading = document.createElement("p");
playlistHeading.className = "eyebrow";
playlistHeading.textContent = "YOUR SCENE PLAYLIST";
const playlistList = document.createElement("div");
playlistPanel.append(closePlaylist, playlistHeading, playlistList);
$("#cinema").append(playlistPanel);

function updatePlayButton() {
  const playing = !audio.paused;
  playButton.textContent = playing ? "Ⅱ" : "▶";
  playButton.setAttribute("aria-label", playing ? "Pause soundtrack" : "Play soundtrack");
}

audio.addEventListener("play", updatePlayButton);
audio.addEventListener("pause", updatePlayButton);
audio.addEventListener("ended", () => {
  if (state.playlist.length) loadTrack((state.trackIndex + 1) % state.playlist.length);
});
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
  const scored = Object.entries(scenes).map(([key, scene]) => ({
    key,
    keywords: scene.keywords.filter((word) => new RegExp("\\b" + word + "\\b", "i").test(lower))
  })).sort((a, b) => b.keywords.length - a.keywords.length);
  return scored[0].keywords.length ? scored[0] : null;
}

function renderPlaylist() {
  playlistList.replaceChildren();
  state.playlist.forEach((track, index) => {
    const item = document.createElement("button");
    item.type = "button";
    item.textContent = (index === state.trackIndex ? "▶ " : "") + track.title + " — " + track.artist;
    item.setAttribute("aria-label", "Play " + track.title);
    item.style.cssText = "position:static;display:block;width:100%;text-align:left;border:0;border-top:1px solid #ddd;background:transparent;padding:10px 0;font:12px Arial,sans-serif;cursor:pointer";
    item.addEventListener("click", () => loadTrack(index));
    playlistList.append(item);
  });
}

function loadTrack(index) {
  if (!state.playlist.length) return;
  state.trackIndex = index;
  const track = state.playlist[index];
  audio.pause();
  audio.src = track.src;
  audio.load();
  $("#trackTitle").textContent = track.title;
  $("#trackArtist").textContent = track.artist;
  playerLabel.textContent = "SOUNDTRACK · " + (index + 1) + " / " + state.playlist.length;
  $("#panelTrack").textContent = track.title + " — " + track.artist + " · scene playlist (" + state.playlist.length + (state.playlist.length === 1 ? " track)" : " tracks)");
  nextButton.disabled = state.playlist.length < 2;
  nextButton.title = nextButton.disabled ? "Only one track in this playlist" : "Next track in this playlist";
  nextButton.style.opacity = nextButton.disabled ? "0.4" : "1";
  renderPlaylist();
  startAudio();
}

function showScene(match) {
  const key = match.key;
  const scene = scenes[key];
  const changed = state.activeScene !== key;
  state.activeScene = key;
  state.matchedKeywords = match.keywords;
  $("#opening").classList.add("hidden");
  $("#cinema").classList.remove("hidden");
  $("#cinema").classList.toggle("autumn", key === "autumn");
  $("#sceneNumber").textContent = scene.number;
  $("#sceneTitle").textContent = scene.title;
  $("#sceneCaption").innerHTML = scene.caption.replaceAll("\n", "<br>");
  $("#originalPov").textContent = state.originalPOV;
  $("#atmosphere").textContent = scene.atmosphere;
  $("#panelOriginal").textContent = state.originalPOV;
  $("#panelAtmosphere").textContent = "Matched: " + state.matchedKeywords.join(", ") + " → " + scene.context + " → " + scene.feeling;
  $("#behindPanel").classList.add("hidden");
  playlistPanel.classList.add("hidden");
  if (changed || !state.playlist.length) {
    state.playlist = musicLibrary.filter((track) => track.scene === key);
    loadTrack(0);
  } else {
    startAudio();
  }
}

document.querySelectorAll(".example").forEach((button) => {
  button.textContent = button.dataset.scene === "autumn" ? "Leaving New York" : "New York After Dark";
  button.addEventListener("click", () => {
    $("#povInput").value = scenes[button.dataset.scene].pov;
    $("#voiceStatus").textContent = "Write it as you would say it.";
  });
});
$("#soundtrackButton").addEventListener("click", () => {
  const text = $("#povInput").value.trim();
  const match = interpretPOV(text);
  if (!match) {
    $("#voiceStatus").textContent = "Choose a scene above or describe an autumn goodbye or rainy night.";
    return;
  }
  state.originalPOV = text;
  showScene(match);
});
$("#backButton").addEventListener("click", () => {
  $("#cinema").classList.add("hidden");
  $("#opening").classList.remove("hidden");
});
playButton.addEventListener("click", () => audio.paused ? startAudio() : audio.pause());
nextButton.addEventListener("click", () => {
  if (state.playlist.length > 1) loadTrack((state.trackIndex + 1) % state.playlist.length);
});
playlistButton.addEventListener("click", () => {
  $("#behindPanel").classList.add("hidden");
  playlistPanel.classList.toggle("hidden");
});
closePlaylist.addEventListener("click", () => playlistPanel.classList.add("hidden"));
$("#behindButton").addEventListener("click", () => {
  playlistPanel.classList.add("hidden");
  $("#behindPanel").classList.toggle("hidden");
});
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
    $("#voiceStatus").textContent = "Your POV is ready to score.";
  };
  recognition.onerror = () => { $("#voiceStatus").textContent = "Couldn’t hear that. Try typing your scene."; };
  recognition.start();
  $("#voiceStatus").textContent = "Listening…";
});
