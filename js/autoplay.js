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

function showAutoPlaySettings() {
    if (typeof dialogFramework === "undefined") {
        alert("Dialog framework not ready.");
        return;
    }

    const modal = document.createElement("div");
    modal.id = "autoPlaySettingsModal";
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
    title.textContent = "Auto-Play Settings";
    title.style.cssText = `
        margin: 0 0 1.5rem 0;
        color: var(--txt-color, #ddd);
        font-size: 1.5rem;
    `;

    const delayLabel = document.createElement("label");
    delayLabel.textContent = "Delay between scenes (ms):";
    delayLabel.style.cssText = `
        display: block;
        margin-bottom: 0.5rem;
        font-weight: bold;
    `;

    const delayInput = document.createElement("input");
    delayInput.type = "number";
    delayInput.min = "0";
    delayInput.max = "10000";
    delayInput.step = "100";
    delayInput.value = dialogFramework.autoPlaySettings.delayBetweenScenes;
    delayInput.style.cssText = `
        width: 100%;
        padding: 0.5rem;
        margin-bottom: 1rem;
        background: #2a2a2a;
        border: 1px solid #444;
        border-radius: 4px;
        color: #ddd;
        font-size: 1rem;
    `;

    const delayHelp = document.createElement("small");
    delayHelp.textContent =
        "Time to wait after scene effects complete before moving to next scene (recommended: 500-2000)";
    delayHelp.style.cssText = `
        display: block;
        margin-bottom: 1.5rem;
        color: #999;
        font-size: 0.85rem;
    `;

    const typeSpeedLabel = document.createElement("label");
    typeSpeedLabel.textContent = "Typing speed (ms per character):";
    typeSpeedLabel.style.cssText = `
        display: block;
        margin-bottom: 0.5rem;
        font-weight: bold;
    `;

    const typeSpeedInput = document.createElement("input");
    typeSpeedInput.type = "number";
    typeSpeedInput.min = "1";
    typeSpeedInput.max = "200";
    typeSpeedInput.step = "5";
    typeSpeedInput.value = dialogFramework.autoPlaySettings.typeSpeed;
    typeSpeedInput.style.cssText = `
        width: 100%;
        padding: 0.5rem;
        margin-bottom: 1rem;
        background: #2a2a2a;
        border: 1px solid #444;
        border-radius: 4px;
        color: #ddd;
        font-size: 1rem;
    `;

    const typeSpeedHelp = document.createElement("small");
    typeSpeedHelp.textContent = "Lower = faster typing. Controls dialog text animation speed (recommended: 15-30)";
    typeSpeedHelp.style.cssText = `
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
            const delay = parseInt(delayInput.value);
            const typeSpeed = parseInt(typeSpeedInput.value);

            if (delay >= 0 && delay <= 10000) {
                dialogFramework.autoPlaySettings.delayBetweenScenes = delay;
            }
            if (typeSpeed >= 1 && typeSpeed <= 200) {
                dialogFramework.autoPlaySettings.typeSpeed = typeSpeed;
                dialogFramework.typeSpeed = typeSpeed;
            }

            try {
                localStorage.setItem("tcoaal_autoplay_settings", JSON.stringify(dialogFramework.autoPlaySettings));
            } catch (e) {
                console.warn("Failed to save auto-play settings:", e);
            }
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
    modalContent.appendChild(delayLabel);
    modalContent.appendChild(delayInput);
    modalContent.appendChild(delayHelp);
    modalContent.appendChild(typeSpeedLabel);
    modalContent.appendChild(typeSpeedInput);
    modalContent.appendChild(typeSpeedHelp);
    modalContent.appendChild(buttonsContainer);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    delayInput.focus();
}

function loadAutoPlaySettings() {
    if (typeof dialogFramework === "undefined") return;

    try {
        const saved = localStorage.getItem("tcoaal_autoplay_settings");
        if (saved) {
            const settings = JSON.parse(saved);
            if (settings.delayBetweenScenes !== undefined) {
                dialogFramework.autoPlaySettings.delayBetweenScenes = settings.delayBetweenScenes;
            }
            if (settings.typeSpeed !== undefined) {
                dialogFramework.autoPlaySettings.typeSpeed = settings.typeSpeed;
                dialogFramework.typeSpeed = settings.typeSpeed;
            }
        }
    } catch (e) {
        console.warn("Failed to load auto-play settings:", e);
    }
}

function initializePlayPauseButton() {
    const playButton = document.getElementById("playSequenceButton");
    if (playButton) {
        playButton.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            showAutoPlaySettings();
        });
    }

    if (typeof dialogFramework !== "undefined") {
        loadAutoPlaySettings();
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(initializePlayPauseButton, 100);
    });
} else {
    setTimeout(initializePlayPauseButton, 100);
}
