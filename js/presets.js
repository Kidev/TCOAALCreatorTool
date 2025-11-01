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
        url: "index.html?mode=viewer&use=empty",
    },
    {
        name: "Introduction",
        description: "The very first scene of TCOAAL Chapter 1",
        url: "index.html?mode=viewer&use=introduction",
    },
    {
        name: "❤️☀️💔",
        description: "Penny for your thoughts? The infamous scene from Chapter 2",
        url: "index.html?mode=viewer&use=win",
    },
    {
        name: "Burglary time",
        description: "Let's find a plank to cross",
        url: "index.html?mode=viewer&use=plank",
    },
];

const shortPresets = [
    {
        name: "introduction",
        value: "N4BgXMAsYC4E4FcCmAaArLRqBsYB2CANoSgOxgCMKARAM4AWA9gO4AiAlgIaGMDmAgnDgtqmZAF8UFCNX54AJnCTNRwABxhqAYjXZ5AZlKdqKAJxgA2rIUBPE7IDGD9vKR4Y9jrU4AHH43Z3AFs3Dxo5VzhaagBdGgQEF1FqB3pOOE4HGCQ4AFoAJlNOADNdACNsXOwkModcyHlSUly1SDLTKvbTB3y1BxB87DV7VPTM7LgAYUJOWloAOU4Q5NofJE4AaxzcwkCkXNGMrO3CkvLK6tr6xubW9s7Tbt7+weHJWQZCJDsIDW0kBxqfQOfQmcxWAAy3y+dhoAFEgmV0hk5iF3PYALLsWgwTZIWLxRLyZKHcbbEAgMpqUxobDNBykNRqeplMogXKssr7eSceQONDFSAgJCkNojNJHCbTWYLJb4zSrdZbPK7PD7UnHPIUqk0ukHRnMtpsjms7m8-mC4WisrUd6sRgIXgzaK-TRaNCmIamChgyzUVi8zFwAB0AAIAOIZABuSGiNAAYpwYPQcgTqAkkpoNRNcpwyk0QJwkPpchQ2WV6pBIJxc9gKDWBqY1KVXNSQD6aNmctK5otlgq1niVXsDhKyXk8wWiyWy5TK9Xa-Xco3m2pW6Z27aaAAlNxIeXqN379akfK+qwYxhBIO0MORzgxuPUS-J1NxdNEkljzW5NBl0xIJSaC5MCFCVJAxTyOyNLyJAy5qPkkDFtgAy0vinbflKzqyv2dCDsqOwjl2eR-u0gFlMBoHgZB0FoLB8GIchqHVFu1AAFJEFwqh-Fox6cKe57vhmxJZphJyZA4xTdMBriGPU2BoMySL6MypiDNgnCKcU+T5BQDjimMmo9jh8p4Uq2yquqYl5PkElSfyuSyc0kAKUpnAqbkanYBpWk6XprEQowcDyKGACqeAbHgLB4Nxbo0mgkC0ue1AAMpXkgyaBLwoYACo5HA7DFDYWX2GlISZXg2UANKBMSCYIA4GxZaGKVRYwPhpsJX6GTm8gUBQAGkBuBSmKQwGQGopAULmfQVlyzZoDUfQ0pABmSt22F9qZipDoRaqjj12x9QNIrDYUY31JN02cLNHJIAtS0OCtrEAPyhm9L2xdo8WJdgyU5SmoahOwMB2EJn6iYdJHTq2zJqANhoOBQ7Lww48i5KQ7YUPoICkFS+T6MYGFQ8ZW0rPhFlEdZv4w-dcMI-USMo3p6OY-1ON4whhOsfeChBMYrraK0o1lKCZiWODmYpNTahckgfVoCWphIcUl3eS0knNGykCipwakgPo8g2sT61TJtcrk+Zw77cRLRywrSsq2rlR9MUWsgDr1b64bNrvLz8g+ALh7aGgFFh4JhJS7b7P6HopCqwMSDTVWaktKN02CpwnAs-LID8mt46kxbA5W3tVlQ6W2Ox40Cf5Enlap9SU25Jn2do7n+fvAA8q+UShjYSDECIgu8fu-FnuLVj8KG-MxTQkxEDA2JhNQC+EEvOJPhCvKwtQNXyNEksidLFcVA4SeSXBDgKeBjR1KYbLTQTPTn9jbtUgXRnm7hO0EZZB2mw5NgV+l8Dg32uKQe+j8CjAnyK-fQ783g0B7imPuZRCDIC+u6T01IOzgmoAAdXSK4Oe1AcoADVSoIDgLwJAjAYpH26oAia7kQQ42XPkY0E1GQtDZi3U6VYyjyFMJBP6JtC7f22hTa25dmFqFYfodhAwuGTThnw4oAi2jCNEbaSQ+QICcDdBSYxIATBlDdAYKC-QTAODAGgEAKB5B2JQEgMQqBiiaH4AAIUmKwOE8ZwwAAkACSbEqoQgxPMLuAAFAAituFKOVQrkIIQADQAJoAC08zt2KLweg7AABWGxCBBCij4AAjlEGACAozMAAB42AAF7tgJr9Rkpgtz6EsMAXA1BeDcC+HAGwYAvGZA2LwYQCAFChloPQ3gtAAD0hT1g8AQLQAA+vIRgxBgx8F4CYcgVBeCaAGcQHIIzonsCyNQ2MiyfDXJqUoTZpBsCmGDD4SqJh6CeNsCYdgmgoQ2BhCgUMwTQzbLwAAchgLkXIwYEWhmYJwdwoYYCMGDCYQpmgTAbEoBSFAhB8UOKCMSlAeAwClgJYwOxBKfBgAcRUhlKA4DMtoPgIgJAYCUBQAgZlmSeUAEIeWpJ5eknlUYwDFG4LQVAzApUytQPUjlxAUAjIIKqpplgLAON1SgEAcQdX6uNQauI-AVUkC8cyyYPLWC0ocQAAQtSgLQEsUAABJmUAFJ7U0DmdM+QXieBlFCnAQgogNUkGoEiRqkyHQKAxOs65QbGAhrDckdBqawD0BgDAelizFk8AcNwJgOIwDYEUZAfIizihoEUmoYsJY2R8nqPWCsJQ6y-jrBQdYAJFFlnsOwfmtCU1pvDZoTN5ic15rAAWotJbGBlorfoKtiyRRQX0PuSo-a4KQG6DWBt8hmSUnckgDcVJY5oHsGUdZMAoTFBgKO0N47I00BvTibc7B8mPuDc+iNnLJC9NOYMi5ozxlxoDbM+ZSyVncAdJs7Zuz9mHJ5Sc-pIHhlgCxLQBwiyUXyGBdCb4HyvkoB+dQIFMJ-maAIYPEgYKIUYqxTilAeLkYOKJSSyl7HyXMppfYhx9LGXMtZQ49lr7uVUD5Q4gVVBhVUFFVQcVVBJXSsILKlA8q1MaeVa+9VnKUBaosEavVBqUAmZNTEM1zqrUOJtVQO1AmUBOtfa6iwcRPUOJ9U5ug8bA2-vTc66N4GpkJqTQ4J9gXo3Buzbm-NhbGDFsIKW7ly7V21vrY2jkIAW2QDbbmYonbaT9V7WwgdNAh2cBHQF8d0Ws3Tvi-O5Li7UuVurXpFyCkkBwVKGUfILJ+ItDacufiIBigaKLFJUg17b33p-amv9QX30wE-d+yLL6AMoCA+h85mGxmxtCyFOZlUYOrPg1snZhA9m8AOWQVDwHdsjOw7h-DhG3skdu+Ryj3xqPsVvaGXgjBQyMBjHAUM+HQyhg2RsjYkONlIA2ZD9FcPoeI6hxs5MkObAOkxSgbF1BcXMs4ygUlDiKUOJpYJ5lTKHGiZQOJgzkneX8qFSKsVEqFXqblZznTzr9Oau1aZ-VhqhempQOa19tmUD2ZQI5glLmDNuY89631vmA3rf-aq4LB2-OJtoMmmrGaYsNdnQlpLKXy1tZrXWpkWXm11Dy3mArRXu2lf7cbaglXqsLai5O2LM652JYXUuq3HXvKLR67LfrbRBtczgoWTG43e1TZmziObGulu3tWzmjPkbAN9LOUMkZ+2JmHagyd5ZZ31kXaQzdlDxyHtF6w9iF7tgYQwg+9835BHfvguTA6b9syUxQtoP3B0YPigFTcPIT6eOWN4o48y0nvGKfMqEygGnLK2XOqZ9JlAsmUDyZQIplAymUCqcVZpnnSq+fOqMxZ3VIuTXC+s5L61trfUK9VUrj1KufP+oUFzwM211L113CwzzqynTi1NyawtzS2rQy1t0UWy1y3yw7WmmKx7SLDKw9y9yQAgL9xN0D3Nxa0txXXawcE6wjxbijwG1uGGwTzGwmyQBTzfVmxYPmzHU1yjWW2z04MWzzy2wLww2LxCz83LwWUrzg2r0Qyu2Qzuwbx2yb2ezwzbyIxsE7zI0BXUN+0vCCFmU4BcDHwQChRChTEIB8BniQCRRBnoHBzwBsAql4EFWYwJ1YyJzJWXwpR40pxQHX03zpwZ1VV3xZzkzZyUw52025yiJQF0wM35xIHv1Fyf1Mys3Fxs3fwc0-2dR-08xQG8wJTV0AMNyWzEIDT1wNx91q0IOgOIOD1a3IOt0y2QPt1bSd3QK7RK2wPd0HWHXwJKMgP90ayD2axD0aLDy60jz6zoKGxXRG0T2YNYOjXYIfSAK114K-RzxKMEO20L1AxLwgxmWO0kNgzWQQ0u2u1uyORQBOVfXIwiFhABUISQChWIABwylDECDRSmXQSQARVx3x0Jx4yJR41JR428OpV9X8JE23wkx5T3wPyPxPzPwvy5yvxiLiNVQSMM0F2fzMwfxf3SLfzsw-ycy-xIFyL-0KIAP8yqO4LfTKLC31wiwGJqIDzN3qLIPSxtwbRaJywdzQMKwwNd26P0HK09z6LWJ4JWP4MC1fWWI-U2NlI22IHz2dWuLQz2MwyuRuWeXuUeVuU2W7U0PI1+1cKBIJRBIJTBIJQpSqEhKc2hNp23yUNAzSkgxYI0SyCWVlQ2X6kuJMBCJk1ZwU3ZxU2v3RMv0xJIGxKSLxJSMs1fwMylxlzl0dRyLdTyIKIcSKNpK4InWN1qI5NGIaNXUUV5HyEWlZlIFy0kmmjKB7Wj1Fjrj6yAjQH0gZJ13KPAO2OALwIIMLPZNgNIPgMWSsQZEMHvnkDQGciEThnuibRcjQE4G4VZBBFTzvQ4KlLYMVLW17NVKEPVPu1dO1INL1IeV1NjA2Qmn0BNJYyePNPcOBM8MpRQjJzJX4zpWpxhLEx33hNCMP3CNP0iMvy0yjNv1fTjNSPM2SKTNVRTNJPlwzPc1-y81VxpO3JAMOPkAqJZLpKC37NZMHOGJILGNXSBGKAoGlTLAKCFENDpGAm6AqAKyrjeRAHhkgA7IVM3NWP3OlN3K2Pwp2OEMezAy7KOOgzHKUCWCyg2UCBWSyHYHoQDIUJuMb1AxUN2CjCymECvDvLcKePDEYGMsYFyBMpCiCCCjwCylBX4E+G+EFRcLnzcLY0tKXzJXJxQE-Kp2E2dN-LhKkwAqRLDPPwjLArROjLVTv1xOgoJLF3NXgGQBQCtTGhJKyLJOQuVzQv-z80wpjVAO7OZIHPqyLOHLIurXxnkCqtlk8iglVjywbQ5FIEJgxkrKgjrEmlMEMF6Kq36PwsGKIOLLgKt1jlGiTgQnqGLAFLXCaobKqDUEpB6CQDokgk6R3J4uVPpO4r4KlLVJPNEPEqO0ksUHWCCFkvkoBCXmUvkI1PUsw00vYG0sql0qCH0rsvoCoxQCeNCnyX+L+v+MfIX0JXcvfNXx8o3x-Ppz-MCuDLCNDIiPDJiPCt5z0zusuSCngEMJgCWVmA+u+A2TUE0KgssxgvjLgstUyNl2yNc0zKpJzIwr4s7IKqZMqPzIGtKpGOGsaMquqorFMDqtbUavzBatPDohAA6qGm6oq0lKIpKqHM5pHJGreVIHGujymsFvRnzDmqGEWrrhWuEQ3PT0Zu2qVOKqgPltItLOrUZCEUgnjl-GKBAHGiLEqEeCopbkLBXP6korKD3S3F2JELEuZqOorxOpksqjkrwAUqurwBUtuv2ubxw0LUep0uMtes+U+3vM8VHyCAajsNmGMNDB4BjFDA0UHmajmSEBsFLqCmMKiEHmKBoGcpBk+NHyXhCBrrB04CLpBhgC+E+PcByAwVcABvcMXy41Bq8rX2-L8qhoCuZ1hsAvhuAsRtAojMitjJipJrirSIl2TMprTOc0ytQvyPQtyuNvyuwtwrNqGJgIVvKsWR5qPT5oFoav2GFprFFvaooE6qlolN6pvsGrKqtsWVGpVp-rVuBA1tmumh1tqD1vkFWsNq3Ivqz1Nr4r2q1IOuDokKWTDrOojousUuurr1Us1MDoeqerjT0ozq7wMs0GCRgFbrRRBi+CcVDAAB1qB4xapQx5gEB4B2BQhR8cogd5hGAmGOA-iuHAaPCJ6V8p7waAjYTGd-zF7gqEbQqkb16IKDNibH9SbUjybkqD7qbFdabsrqTz6hLgDL7Dtr7ZbzaSLOTRyn6ar+axtBb37mrP62rxaf7JbptpaAHHHb66iSyuTq0wHVbJqoGGrNa8ZYGFr4HlrEGDb1qjabH1i0G9ysnCBMHA6Diy9ji8HpKCHeBI7o6lLY6brjysHE7cMtLU6aHSNTSvrNBdwd5QVZUYBQVAcnLASx7gbQTmVPLfCnSt9-LVGYb98Qzj8QrUSNNkab9UbIKt6DGd7jGEL0qkKaaUKsyz71cL7GScKez+q2TnGInXGEIqrn7arPG36mqRa-GJauqgn-7vc2aLm77LbInQHlaYmkI4mf6Entbkmlr9a1ruLMn8z5SNjcnYXNsA7RKinxCSmpLTrzqo7Lrqm466mKGW88N7KbANlAcMcUR6BgxeBCo6GzTnLCdx6SdRm+Np7fLJm57pmF7Zm4b5nNHFnojwLVm9H1nhdDHEyiT960qqaMq9msrT6cqjm8mmar6zmvniKfmXGrc3GX6Hmf7vHnmxbXm-7CLzn1Xwmuayy90UJ8xKhRZ9x6g-xbgmgOghQH59BugEEmRhgMmUGlWTaEWBCkWRKm9UXIN0X8GsWqmSGrj8XRKVDcaYQNkkxyXcb9K6XBmgbicvCWWlHIagiuU1HuWl7eWV6tG16MTdGBdjNkixXH8tnTGMrErUA3NqA4RmB22VAaAUp1g4BUg0VAZMaGBQwkQFkCRPUqBsy-VrHEX1iTmHHTW5bLmLWKqbneb7n6q9WnnfHDWAm3merPnFt2aLbNXGiQEGyNIQJvRd1r4Oh2gbp4JZZUrpxRRkHeK-X4XBKZ38nDyE7Q2JLQ6ynI2cXo3681KE743iWk2YAU2GA032myEClR9sQkVUFrDscEB7CQp0OwcdlIhh3hBe5QwHl+7sPvjU3ZHnz5GxnWWIbZ782UAgyi2NHS3+XIyIrK3EiRX8TYKJX4KG3dnzH9m6ap3FWv3lX7HVXD3vnzXFbubV27mPGN2hafHWqd3f73mTW1XF2NWrmrcz2wIax3WKBr23kOQihj0mR8x7Fn3VofW32xP-XP3A2DzkWQ2TncGMXw6KmiGY68XFD6mIO8aSXk3B3KXaGtD6HqBGGR9wdCBpKCNh39w8BZli0YxKp5ZZkkBQduAWGQhaBQUIdsRXDErCBq6IcBGJhSugZ6k0hb0MuC7u7ihjKjrqFz5cdM2QaFHxmZ72X6PGPESgKUSwqdGhWq2d7a3CS96+OpXD7ySXULH5WrHRPnOeC53JPfczWhrZPV1tX12vGt3VPv71P92+qtOnGdPl3Fl9OL2jOTPb3zOH2rPCxiwX27PNrM8BL3vhK0ag7sKPOI3CHsXiGanSH46AvCWE38aQuKW4OnivEBGkUsbBVQwCE0gmHkPkwkwEVZ8M2PCRnJ7uu2XAjoauWBvl6hvtGK3RvOPq34yJv4qMiZuzHv8FvJ3cy8q1uirQmgH76QHdvFP9uP7Dv-HjvgmD2NvtOZOH7rvDOr3GZTO72LPH3rOXvbPoXfWHOP2vug2fu-2Q7JCAfvOgffPan-OCWk7IfgvoPQv9LxGl5ihrkkxqnfsjKmHu7JgUVgdihcorwkxGBYwBn58yUrSqOc2-CevieE73SZlPTLqfSEcCYVL+u5nkSQK0TlnYiOOcTafYqeOpuKameZXBO5W2eGaF3zupeQHK0PGBQWh9B7F6hihjR4YAQWgdZgFBgKBpyKRr1OfWapPNvgG-n+fX7N2hev6RfAmTvAGObfnRyZfL3jP5f7v732LlfnvDA1flsYWVv1qdqMGf36m9f-vAPAeo2QeY2ze42IfIPofU3wu2mnj+B+Ymkspkf0kHQh8HRCAjsmBmB+2kwaKIHKRzKAEdUEAJIPs+Xx5dcaOyjKZsEULZk8S2FPctoK3iLRUc+29PPoz2lyIV0ysrE+qX2na78sKEnLnuXzCZbcH6I-XVspwNZHcp+YvU7gP0l5UCQGC-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-miyx5v8-+UNPhkzzcR5Q8oUAA",
    },
    {
        name: "empty",
        value: "",
    },
    {
        name: "win",
        value: "",
    },
    {
        name: "plank",
        value: "",
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
