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

const defaultPresets = [
    {
        name: "Reset",
        description: "Remove all scenes",
        url: "index.html?mode=viewer",
    },
    {
        name: "Introduction",
        description: "The very first scene of TCOAAL Chapter 1",
        url: "index.html?mode=viewer&use=N4BgXMAsYC4E4FcCmAaArLRSC+KCMEARAIIB2AJnEgO6EQAcYhAxAGysCcH7hKHYAbRIUAnrxIBjCQEtySUjHEARaQGcAhgAdNAe2kKAtvMUphcuKsIBdUwgSy6hCQAt1cdRJhI4AWgBGrJAA7EgSfpA+kEhoaJHq5PQ+3CAAZj6ceADMKXgATJn0uaz04i5uHl5wAMIANuqqqgBy6kaOqppI6gDW3j41+kg+Ze6evQHBoeGR0bGQ8YnJaRnZeQVFJbgkqs41SGIMTMxc7Fy8-EIAMnu7YqYAogZ+bu4NRgriALJqMN1I1rb2ciOYYVXpoFJIPCsEDkDiRPxBViRYoSHzqPCQPw+bJoCTkVjkPx4kASUquEaVWr1JotP5MdqdHq+fqkQYg0a+cGQ6Gw+GI5H0VHozHYlK4-GE4mkzZKHQIADmdUsBxYaG49A4eDOgkISninzgADoAAQAcXcADckJZTAAxdQwZzef6EOwOJjsypJPCFDiZEDqHy41hpSCZIK5fzZOFoEB+cj+4LQ1ha0ye7xUhrNVr0jq-ZkDIbk0G+TW+-2B4Oh8ORvzRoNxhMgJMgFOETYAJXkSDpwEYLHUrHU9FYfz4Oo+OgMBtUJvN6itNsIk8dzpsrsBwOLHJ8eDQrFyHA8kYkQXUmUiID9SXxWLQZ-IaEf5CCeBSrDJ5Q5mZpOcIDPzPpC3TXw9wPI8JBPM8L0gK8Lw4W8gwfJ8n1fd921MAApBB+nUOg+0OQdh1HbUhBdN0gQ9bcvTQehIHvCR6HIHxyAkZtIn3VEOHvQM-D8MVuHUJBmxANBPwpDMlV-Ol-zzJkgNZIsvxouiGKYli2IiejWC4nj-H4tUh2E2CxM2C4dDgchjQAVVILpSB0ahSHw-sjhibTSMIABlKckEdfR5WNAAVbw4GkFIRAC8QfKMfzSECgBpfQgTtBAJC6ALjS8hydE0cjNyo5TekyGJIMgcgInUVtEkxYc0QPWJR3oTIpFYTJ6KCDhxJLH9sxkgD5JZNlqOK0rcnKyrqvhOrB1yRqkGa1r2vvLrNgAfmNDa1pcw5uLQDzxyEIKnWNYxpBgMR1worcit8NiMT8EAQESXFxsiDgex8Ji338JA5kHCRgg4XJUycEbqikvq2jk3ohqUiS7pAB6npesr3s+760j8P71ABoGQYwwh5woAw8JVZg6I4II608-L3TB26vpSegkCCVIQDRCQOGrdr-DFBYz34kBsmbfFuu-SHaWhxlYeA8GmZZtmUg5jxuciTJeYMgX1CFkXyo-TZifITQyYI1U-DQC2-Fpq6CoZhGhiCKJIAQwMOAtmrlaxEd6EDXIUnjdRch7PEz3FylJb-AbZcUkDHed12kg9yIva+4o-YD8gg5Dl88M2AB5VcLGNEQkBqGpHJ2gchxHMdzhIY1Sec0wqhwmBvnEVuanb1QYCXC54luQgkvISxbfpuO31YAJyGF7EgktyJg45qmkAvX3MjwCRhJBlm8LTcHeql3MZYLWP5anme5-DRfIGXpIQnX88t53n1OkJwunWLvwamQKvmEMhqVM9cADqbg5DN0IEFAAatFBAcB5RIB0M5celF7YliGOoFIcwkApBjCkFIgZMRyDRPkRIQQF4BzQOGZ6IAgjh0ktSKGJ9AJwzjhILBOC8FBgIUQ+Mgwg4FB8BQ8EFsaH0Doe2XAuQIDqEOE9BRIBeB+F2kgbmR5eASDALGFA5BtEoCQJgZAKAUhMGIAAISqEoO4tpTQAAkACSmEEoXA+I0fOAAFAAih2LyQVrLQJAQADQAJoAC0dZ4lwfKZw0gABWXQagGAcpoAAjhYGACALTUAAB4iAAF5I3yNpIIGoMKZEEMAVgTB5TqHLt4EQYBzEeC6PKOAcoKDGlUMg+UqgAD0cTOgVwQKoAA+uQHQ5dDQ6HlPKXgQQwB4BQPKGpdTdhwEaR46Qnh4HWj6ZobZmSqBjMRBwQ0mh4q8GcGY0QvBpBMCuCIG4KBjQOONBM0gAByGAPgfCGn+caag6gFDGhgDoQ0vA4lMF4F0MAuQnooBqHChFBhkUgBQKQMAPh4Xop0NohFmgwDotSUSlAcBSWqDAKQHCNQUAwEWSgBApL-wdPIOYiufhrJwBqHQal5dTBPHSm01lHwRnbPZToTl3LHA-0lVSmlfT2rZzZsxLmpTLwYiSMzZim9hSQDomooIKULRgEITUVQqAcnyv5Y0vltL8nMukKTRBEqpU8qYLKlRdq+nNT8MDUpeBsSJmRCSNEIAijejQHgD6j4xTkFyOIPwIyYBXBSDAV1XL3V2oFcmjs0gYnpo5Zm3lNKUDEFNXUi1KBzGkqqAypQ+KQC4Cqas+pGymktOFQgTp3T4r9MGXUuUYyJlTJmXMlACylkrMILUttjSviqAkH04F5AnnXD2Ocy5KBrmEEeTcO5TAQFl1pa8954LIXQpQLCnFiLSWouxQizFuLG0oEJcS0l5L0WUuzfSpZTL0Usu7Wyot0rrW0sIIK1p7SgOitUOKkD7qIMcrA4quYwcVVDCpjVJGERubqV1RifVUQqbGoreay1YGUC2tLQ6gDTr1AuoQzK5D3qijcQ+lgnwAdWCzHfBebGsY0TYISBIS29B6AhETcm1NhbJXFsoxB3N+bnCybdSW-l5azVVpreiutSyG2xibSgFtM61kNI7UK6DPaen9qGUO8ZkyajTNmfMhl07Z3rPnWoJdK611+c3eOnde69gHsINhXuxp5Q6GNDoK0cBjQruNMaUZoyuhJdGUgUZSWwXpZS1l5LozHRJZEHKCFKAoWEBhaSpF6LUXoqfSgPF6K30oBJeiz9KBv2lt-Yy5l3SgMZtA9miDnarPkFg-BuToGkNyu9Uq9DMJMPqtgpqvDOq8B6oNSR3gJqtMUezdR-ltHTD0cY1NxDnqUNsbVJ0NI3HeNtV+oJzhImxMSbHIp3uMnBtZtLZ9mAeaC0-fU7SzTlbUA6ZQHplABmnrNuqaZudFmoOsq6TZgZdmRkOdHS5idbnW2ebAAunzogbg3AC1cm5q7QtvMdHKAtXSnSfNUCXOU8WUhhXkOQba5XL2wvRTVlAdWMWkqa6+0lbWyUUsoz1-9ph+sUGBwpyDXaKATYkErmbXqFXzdZottV2HVvauxBtwjW2jU7bI1Wq1B3KPHcIKdpAmvLusc4Ddzj92U6PYEyrYTgo3uSZzV93Bqn5PDaTb3QHKmlfZrB+R6ttb62NvhwT8zzTLOo97b0jHg6scjqc2O1zU7U-tuJ8u0n66RAU+3Q8yvoXJwGC6eoWQrOECfKsk6GomhG5IEBedZwCXSAiDivKAAhBeyrV7qtoqF6SzFN6xctclx1rr-LZd9dZTHv7Kuxvq+dyxnXaG9eqqwxq3DxuCOQCI4a0je2UA29LYd+1jrnVO6Yx6g-5c+nXY43dgID3+Nohfdyp-c-BxNA9-tvt39w8lMgdoDS049tNE99Nk9jMEcPM09RtM90cB1hlh1HNnNx1J1llKMd0yBqcUB7lCAj1Ply5Is-JjR9BQVoMf4kB-kysKsqsb0kUb1UUb158EU8VDNxd312tpcf0GU5dANFd4D+URsM8YMxUNd38tcUNdcMMDcz8tV8NTcr9zdb9wd79KMn8UB7dHct85CI8U0Q8LDwMrCo9Q8hsECrcIdkCYdUCW1s1iD3MzN20tkdljl9lDldkxkUw8Bq8d1QsJ8uCEUeCUUZ9MV0hBCX0l8P1pdEdCcfIgNToCFQg+4+kLVRk8BwjC86VJCN8BsVCXcddHpRw0B1AggfAFoOAtJYQOY-VCEeFRMzwjxRI-VE0sDFC4NlDzsQcUBdtDCH8bU7cX8GM39RiP9ZsFVchOoPBMg+JIg8hA1MQkAkRBQ2Y0R4xchcgGiIRnwpNg801bCg8AdlNHDfsNMXCE9dMk9DMU8vD8cMjzN-Cjk9kDkAjrRRl9VMgIjL0qDoip9uCZ971oR6sZ8hCCUJc0iv0ZdyiAMFdgMFjw9Bi1clDriJj48pjaUTCzDX998liv9ij-Y2I8RdwghwxkQ-BIwWi0BBgNYs48RuZWY8APsrCoCsTt9YDo9ZDQcnjIdodYcjMTMMD2108Udsis9+lKBOgDAApRl9BBlPBpBkFCCi8SCvjS9vM+l+gLQAp2kpxQTJ8qDTQdBbSdAfA7SrIDALJSAAoXliBtgbhR9x9edJ9r1Yi70EjRcUikSxCUSJC-0KiZCBTLCcTxs8SqjP8ag+kkBZ46wIRBgmIYgl4VivokY-ZMgdZcg5AigYRSRxiniiSqMZi6MyTEyKTky4wSQVgsQhI8AsQXZNQvpSyg0g59whxw1CgLjrCriRSbiHDrjy14BjEa0F4XiUC3i0CS9Gk5TVcrJFS+llSWg1SNS8jtTSBdS8di8DSvNF1jTpBTT4pzSDBLSPSdgQtKCmBrIYl2DXz2CIT+db1as59gzmtQypdwzus0T5dN8xz5D5TcThjyTtcv9Uy4xsgMZHxZhjjGiJENtsVCymSSyeRyyCTrdjDlywAPELJ4Bm98j6h7yRBRl6Bq9SS5joKUMmyJAWy0RIQOyuBA1ChoRey5p2Aqpcghybj+S1NlchT7jmMGy+kUgBKSQNtIxAhWZ4RAgkh2BBgIR-QJAdIkZAgPwy0xS3DJSU8Tzkc1y0c+1NyqBtz4p1TSBNT24dTSjvDCKy8TSzTbSbyLlAswSzEWcDA0oB96hW9jQK4rRjQMyWRApuk4ANkwqLJW8LAy4UhTBfTzpGCWd24jBYr4t1BgrzoYBdhGCFBvBf45B3yp8BdAy4Tn0-zRCALOtUTIz0TQKYy7C4y996yYLky4L0zELsy75cy0KCyizsKyzLc78qySTZizsRLVDvUmKWK2z2KuyuKOYNY+y+LByE0hKbCwL7C7jJz9L5z3DFzpTfCVy4yzLs8tzVTrLdytSHLccnLjKXKLy3KLTPLKcrSmAHEYA0rQVzpdg9FjQAAdQgW0ZKY0RoBAeAaQYwFnIKaLRoHQX6lQNg0Gj86fb8qqxrUlVIsM+qiM3rJqyolqgVNqhMhY2ahVbqhCzMpCnM1C-MjC4apAUs1iMayYgi7NOi6a+TKmr-eanIVsti96Zansta3igcgSrayAna0m-7CcscxA1wo6wypc4y1csbS6pUyym6+UGyuy-cw8p6mU08pdVyq89yy00LLsQeF5C1GAF5KLH0zg8q29Xgn86qkQ1rZEgmoCxqkCkmkS7EhQyCybGa6o2CtM2mr6em-qxm9C-IFmtm3CysrmmjKa+YiOpMvpQW9s1i-Ozszi8WwsyW-iwS2W0c+WvauA0m5W54qHV4uHGwO4SpW0D0KcTQIoxEPINmK-CMKNUZC0BCfJOAbgHJC0XgU0JgXzMnB8uxRZQ8VgFABxMACMdFTCSpBKD1OM3gC4Qin4kIoIgEk5TgavD4UlRoUlBevIbgFete+FFAfOIxVADxIlZtbe8Ctcveg+4IwI-434sZPAK8c+y+6+xeu+1e9ep+l+lAN+vAbAKwZtdupwTu7ulMFYrIdqNmTIailwVJHJEALoO+KepgC24VKcXgG+pe++6BzegQYAT+nfVlH+jWuM-pZhoDMZIoEEj6lAC+9FK+9FahyBh+9FZ+6c1+9+4zT+9oMKLwVh02sAU0WkLpTQeRvZOR86a0bYHsGAIo3IHJegUZECMZGivhi+g8SAFAK+goaxhe-Ve+u+iRrAOBhlLxQQEAGwDsJ4ryOFHRWSDR6BNwaQYFRQIgCQSZZUPIUwdpagZUegbAD+3MDRxRs65R1RrRrwfpLJnRp0PyAxoxkx8Gbh0BxEegGxxZYGFABxip1exxlx4xN+3IFADxgQVgbx3x-x9E9R7R4JsKMJ-CVB81OgGJwgOJhJpJmRlJ7RtJpHFRzK3JnJ3p7J3RgpvIIp0x0ZXIUB+8Zeq+gSip2p++hp2Bt+zIVpwQH0Tpu-PxuaHpoJkJwZiJqJ0Zlp8ZxySZ5JwJ2ZlAfe4yhZ3vJZgolZvJvRwp4xrZnZix7RRESpjWZe45+pipxpqR6xtp6NG5wwu5gJ3J-p0J94F5kZxe2Jz5ugRJ753JuZwnQFtRjR5Z+ltZ-RjZyFkp7Z0B-VQRuFcTGpsARx5FmByRtxtAS59prF+PHFh5vpp5wl4AYZ6J95iZ8lpJpBpBoAA",
    },
    {
        name: "Double dream",
        description: "Penny for your thoughts? The infamous scene from Chapter 2",
        url: "index.html?mode=viewer&use=",
    },
];

function showPresetsMenu() {
    const modal = document.createElement("div");
    modal.id = "presetsMenuModal";
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
        color: var(--txt-color, #ddd);
        max-height: 80vh;
        overflow-y: auto;
    `;

    modalContent.onclick = (e) => {
        e.stopPropagation();
    };

    const title = document.createElement("h2");
    title.textContent = "Load Preset Sequence";
    title.style.cssText = `
        margin: 0 0 1.5rem 0;
        color: var(--txt-color, #ddd);
        font-size: 1.5rem;
    `;

    const description = document.createElement("p");
    description.textContent = "Select a preset sequence to load:";
    description.style.cssText = `
        margin: 0 0 1rem 0;
        color: #aaa;
        font-size: 0.95rem;
    `;

    const presetsList = document.createElement("div");
    presetsList.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
    `;

    defaultPresets.forEach((preset) => {
        const presetItem = document.createElement("button");
        presetItem.className = "preset-item";
        presetItem.style.cssText = `
            background: #2a2a2a;
            border: 1px solid #444;
            border-radius: 6px;
            padding: 1rem;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s;
            color: #ddd;
        `;

        const presetName = document.createElement("div");
        presetName.textContent = preset.name;
        presetName.style.cssText = `
            font-size: 1.1rem;
            font-weight: bold;
            margin-bottom: 0.25rem;
            color: var(--white, #ffffff);
        `;

        const presetDesc = document.createElement("div");
        presetDesc.textContent = preset.description;
        presetDesc.style.cssText = `
            font-size: 0.9rem;
            color: #aaa;
        `;

        presetItem.appendChild(presetName);
        presetItem.appendChild(presetDesc);

        presetItem.onmouseenter = () => {
            presetItem.style.background = "#333";
            presetItem.style.borderColor = "var(--white, #ffffff)";
        };
        presetItem.onmouseleave = () => {
            presetItem.style.background = "#2a2a2a";
            presetItem.style.borderColor = "#444";
        };

        presetItem.onclick = () => {
            window.location.href = preset.url;
        };

        presetsList.appendChild(presetItem);
    });

    const buttonsContainer = document.createElement("div");
    buttonsContainer.style.cssText = `
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    `;

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.className = "tcoaal-button-menu";

    const closeModal = () => {
        modal.remove();
        document.removeEventListener("keydown", escHandler);
    };

    cancelButton.onclick = closeModal;

    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
        }
    };

    const escHandler = (e) => {
        if (e.key === "Escape") {
            closeModal();
        }
    };
    document.addEventListener("keydown", escHandler);

    buttonsContainer.appendChild(cancelButton);

    modalContent.appendChild(title);
    modalContent.appendChild(description);
    modalContent.appendChild(presetsList);
    modalContent.appendChild(buttonsContainer);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

function initializePresetsButton() {
    const presetsButton = document.getElementById("presetsButton");
    if (presetsButton) {
        presetsButton.onclick = (e) => {
            e.preventDefault();
            showPresetsMenu();
        };
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePresetsButton);
} else {
    initializePresetsButton();
}
