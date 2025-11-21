/*
 *  TCOAAL Creator Tool
 *  Copyright (C) 2025, Alexandre 'kidev' Poumaroux
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published
 *  by the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

let mediaRecorder = null;
let recordedChunks = [];
let recordingCanvas = null;
let recordingContext = null;
let recordingAnimationId = null;
let recordingStream = null;
let recordingCheckInterval = null;

window.isRecording = false;

let recordingSettings = {
    fps: 30,
    bitrate: 2500000,
};

function showRecordingSettings() {
    const modal = document.createElement("div");
    modal.id = "recordingSettingsModal";
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(4px);
    `;

    const modalContent = document.createElement("div");
    modalContent.style.cssText = `
        background: var(--bg-color, #1a1a1a);
        border-radius: 8px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        color: var(--text-color, #ddd);
    `;

    modalContent.onclick = (e) => {
        e.stopPropagation();
    };

    const title = document.createElement("h2");
    title.textContent = "Recording Settings";
    title.style.cssText = `
        margin: 0 0 1rem 0;
        color: var(--txt-color, #ddd);
        font-size: 1.5rem;
    `;

    const warning = document.createElement("div");
    warning.textContent =
        "ℹ️ Recording uses your browser's screen capture with audio. Select which tab to record and enable 'Share audio' when prompted.";
    warning.style.cssText = `
        background: rgba(74, 157, 74, 0.1);
        border: 1px solid rgba(74, 157, 74, 0.3);
        border-radius: 4px;
        padding: 0.75rem;
        margin-bottom: 1.5rem;
        color: var(--green, #4a9d4a);
        font-size: 0.85rem;
        line-height: 1.4;
    `;

    const fpsLabel = document.createElement("label");
    fpsLabel.textContent = "Frames per second (FPS):";
    fpsLabel.style.cssText = `
        display: block;
        margin-bottom: 0.5rem;
        font-weight: bold;
    `;

    const fpsInput = document.createElement("input");
    fpsInput.type = "number";
    fpsInput.min = "10";
    fpsInput.max = "60";
    fpsInput.value = recordingSettings.fps;
    fpsInput.style.cssText = `
        width: 100%;
        padding: 0.5rem;
        margin-bottom: 1rem;
        background: #2a2a2a;
        border: 1px solid #444;
        border-radius: 4px;
        color: #ddd;
        font-size: 1rem;
    `;

    const fpsHelp = document.createElement("small");
    fpsHelp.textContent = "Higher FPS = smoother video. Native screen capture performs well. (recommended: 24-30)";
    fpsHelp.style.cssText = `
        display: block;
        margin-bottom: 1rem;
        color: #999;
        font-size: 0.85rem;
    `;

    const bitrateLabel = document.createElement("label");
    bitrateLabel.textContent = "Bitrate (Mbps):";
    bitrateLabel.style.cssText = `
        display: block;
        margin-bottom: 0.5rem;
        font-weight: bold;
    `;

    const bitrateInput = document.createElement("input");
    bitrateInput.type = "number";
    bitrateInput.min = "0.5";
    bitrateInput.max = "10";
    bitrateInput.step = "0.5";
    bitrateInput.value = recordingSettings.bitrate / 1000000;
    bitrateInput.style.cssText = `
        width: 100%;
        padding: 0.5rem;
        margin-bottom: 1rem;
        background: #2a2a2a;
        border: 1px solid #444;
        border-radius: 4px;
        color: #ddd;
        font-size: 1rem;
    `;

    const bitrateHelp = document.createElement("small");
    bitrateHelp.textContent = "Higher bitrate = better quality but larger files (recommended: 1-2)";
    bitrateHelp.style.cssText = `
        display: block;
        margin-bottom: 1.5rem;
        color: #999;
        font-size: 0.85rem;
    `;

    const buttonsContainer = document.createElement("div");
    buttonsContainer.style.cssText = `
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    `;

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.className = "tcoaal-button-menu";

    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.className = "tcoaal-button-menu success";

    const closeModal = (save) => {
        if (save) {
            const fps = parseInt(fpsInput.value);
            const bitrate = parseFloat(bitrateInput.value) * 1000000;

            if (fps >= 10 && fps <= 60) {
                recordingSettings.fps = fps;
            }
            if (bitrate >= 500000 && bitrate <= 10000000) {
                recordingSettings.bitrate = bitrate;
            }

            try {
                localStorage.setItem("tcoaal_recording_settings", JSON.stringify(recordingSettings));
            } catch (e) {
                console.warn("Failed to save recording settings:", e);
            }

            //alert(
            //    `Recording settings saved!\nFPS: ${recordingSettings.fps}\nBitrate: ${(recordingSettings.bitrate / 1000000).toFixed(1)} Mbps`,
            //);
        }
        modal.remove();
        document.removeEventListener("keydown", escHandler);
    };

    cancelButton.onclick = () => closeModal(false);
    saveButton.onclick = () => closeModal(true);

    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal(false);
        }
    };

    const escHandler = (e) => {
        if (e.key === "Escape") {
            closeModal(false);
        }
    };
    document.addEventListener("keydown", escHandler);

    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(saveButton);

    modalContent.appendChild(title);
    modalContent.appendChild(warning);
    modalContent.appendChild(fpsLabel);
    modalContent.appendChild(fpsInput);
    modalContent.appendChild(fpsHelp);
    modalContent.appendChild(bitrateLabel);
    modalContent.appendChild(bitrateInput);
    modalContent.appendChild(bitrateHelp);
    modalContent.appendChild(buttonsContainer);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    fpsInput.focus();
}

function loadRecordingSettings() {
    try {
        const saved = localStorage.getItem("tcoaal_recording_settings");
        if (saved) {
            const settings = JSON.parse(saved);
            if (settings.fps) recordingSettings.fps = settings.fps;
            if (settings.bitrate) recordingSettings.bitrate = settings.bitrate;
        }
    } catch (e) {
        console.warn("Failed to load recording settings:", e);
    }
}

function initializeRecordButton() {
    const recordButton = document.getElementById("recordButton");
    if (recordButton) {
        recordButton.title = "Record (right-click for settings)";

        recordButton.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            showRecordingSettings();
        });
    }
}

async function captureScreenshot() {
    const gameContainer = document.querySelector(".game-container");
    if (!gameContainer) {
        console.error("Game container not found");
        return;
    }

    const controlsContainer = document.getElementById("controlsContainer");
    const startMessage = document.getElementById("startMessage");
    const mobileControls = document.getElementById("mobileControls");
    const interactionBlocker = document.getElementById("interactionBlocker");

    const elementsToHide = [controlsContainer, startMessage, mobileControls, interactionBlocker].filter((el) => el);
    elementsToHide.forEach((el) => (el.style.display = "none"));

    try {
        const canvas = await html2canvas(gameContainer, {
            backgroundColor: "#000000",
            allowTaint: true,
            useCORS: true,
            scale: 2,
            logging: false,
            width: gameContainer.offsetWidth,
            height: gameContainer.offsetHeight,
        });

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `tcoaal_screenshot_${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
        }, "image/png");
    } catch (error) {
        console.error("Error capturing screenshot:", error);
        alert("Failed to capture screenshot. Please try again.");
    } finally {
        elementsToHide.forEach((el) => (el.style.display = ""));
    }
}

function toggleRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        stopRecording();
    } else {
        startRecording();
    }
}

async function startRecording() {
    const gameContainer = document.querySelector(".game-container");
    const recordButton = document.getElementById("recordButton");

    if (!gameContainer) {
        console.error("Game container not found");
        return;
    }

    if (typeof dialogFramework === "undefined") {
        alert("Dialog framework not ready. Please wait and try again.");
        return;
    }

    const controlsContainer = document.getElementById("controlsContainer");
    const startMessage = document.getElementById("startMessage");
    const mobileControls = document.getElementById("mobileControls");
    const interactionBlocker = document.getElementById("interactionBlocker");

    if (startMessage) startMessage.style.display = "none";
    if (interactionBlocker) interactionBlocker.style.display = "none";
    if (controlsContainer) {
        controlsContainer.style.opacity = "0.3";
        controlsContainer.style.pointerEvents = "auto";
    }

    try {
        const displayMediaOptions = {
            video: {
                displaySurface: "browser",
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                frameRate: { ideal: recordingSettings.fps },
            },
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                sampleRate: 48000,
            },
        };

        recordingStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

        let options = { videoBitsPerSecond: recordingSettings.bitrate };

        if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
            options.mimeType = "video/webm;codecs=vp9";
        } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
            options.mimeType = "video/webm;codecs=vp8";
        } else if (MediaRecorder.isTypeSupported("video/webm")) {
            options.mimeType = "video/webm";
        } else {
            throw new Error("WebM recording not supported in this browser");
        }

        mediaRecorder = new MediaRecorder(recordingStream, options);
        recordedChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        recordingStream.getVideoTracks()[0].addEventListener("ended", () => {
            if (mediaRecorder && mediaRecorder.state === "recording") {
                stopRecording();
            }
        });

        mediaRecorder.onstop = () => {
            window.isRecording = false;

            if (recordingCheckInterval) {
                clearInterval(recordingCheckInterval);
                recordingCheckInterval = null;
            }

            if (recordingStream) {
                recordingStream.getTracks().forEach((track) => track.stop());
            }

            const blob = new Blob(recordedChunks, { type: "video/webm" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `tcoaal_recording_${Date.now()}.webm`;
            a.click();
            URL.revokeObjectURL(url);

            recordedChunks = [];
            recordingCanvas = null;
            recordingContext = null;
            recordingStream = null;

            if (controlsContainer) {
                controlsContainer.style.opacity = "";
                controlsContainer.style.pointerEvents = "";
            }
            if (startMessage) startMessage.style.display = "";
            if (interactionBlocker) interactionBlocker.style.display = "";
            if (mobileControls) mobileControls.style.display = "";

            if (recordButton) {
                recordButton.textContent = "📽";
                recordButton.title = "Record (right-click for settings)";
            }
        };

        mediaRecorder.start(100);

        window.isRecording = true;

        if (recordButton) {
            recordButton.textContent = "⏹";
            recordButton.title = "Stop recording (auto-stops at end)";
        }

        recordingCheckInterval = setInterval(() => {
            if (
                typeof dialogFramework !== "undefined" &&
                dialogFramework.currentScene >= dialogFramework.scenes.length
            ) {
                stopRecording();
            }
        }, 500);
    } catch (error) {
        console.error("Error starting recording:", error);

        let errorMessage = "Failed to start recording.";
        if (error.name === "NotAllowedError") {
            errorMessage = "Screen recording permission denied. Please allow screen sharing to record.";
        } else if (error.name === "NotFoundError") {
            errorMessage = "No screen available to record.";
        } else {
            errorMessage = "Failed to start recording: " + error.message;
        }

        alert(errorMessage);

        if (controlsContainer) {
            controlsContainer.style.opacity = "";
            controlsContainer.style.pointerEvents = "";
        }
        if (startMessage) startMessage.style.display = "";
        if (interactionBlocker) interactionBlocker.style.display = "";

        window.isRecording = false;
        if (mediaRecorder) {
            mediaRecorder = null;
        }
        if (recordingStream) {
            recordingStream.getTracks().forEach((track) => track.stop());
            recordingStream = null;
        }
        if (recordButton) {
            recordButton.textContent = "📽";
            recordButton.title = "Record (right-click for settings)";
        }
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        if (recordingStream) {
            recordingStream.getTracks().forEach((track) => track.stop());
        }
    }

    if (recordingCheckInterval) {
        clearInterval(recordingCheckInterval);
        recordingCheckInterval = null;
    }
}

loadRecordingSettings();

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeRecordButton);
} else {
    initializeRecordButton();
}
