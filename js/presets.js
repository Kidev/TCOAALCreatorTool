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
        name: "Reset",
        description: "Remove all scenes",
        url: "index.html?mode=viewer&use=empty",
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
        value: "N4BgXMAsYC4E4FcCmAaArLRqBsYB2CANoSgOxgCMKAlJsgL4oUQBEAgngCZxIDuLEABxgWAYkHZOAZlIBDFigCcYANrsuATwXsAxjoCWnJHhjaAIvoDOsgA42A9vpMBbY6ZTqjcSywC6HhARDARYdAAtZOFkdGCQ4AFoQWQAmSCMKSHjSTkgpeNyAM0542QpsJHjBJEUQRUFZHOxsQW1wyOjYuABhQllLSwA5WVcQyxskWQBrOPjCJwq2qJiZpNT0zOzc-KkikrKKqpq6hsgmlsZ2SzDCJC0hEVEkHUEpHSkFZTUAGVubrQ8AKLOABGkSi-VcJm0AFkrDApkg-AEgpwQosOiskMDBDpSNhSJUdHV8sk0CBCSA8mSQGgdLU0oJFGhWhElp0en1BsNESIxhNpgk5ngFqyMQkQFicXiCTjiZBSeScZT4tTafTOIzmRczPYEABzXo+e5iNCKZqKCgfVQsMwNGFwAB0AAIAOJRABuSB8HgAYrIYGE4kiWIFgiJ0csErJyi8pCAdPFkoIChVILlFPEaqQCcDqdjkhLZBKWe1Ixz+kMRrzxgjBfN4hHOiUY1I4wmkyn8unMyBs-FcyAQPnC8WLgAlYxIHnAYRiKcTUjJK1qaH2Zz2yzOt2yT3elirgNB-whlFo0WR+JSbAUWSyRcJyClPKQUhoYGZpDYNDxJ6lV+MigsSXDxGzicsuSrFg+VrWZ61AhIrxvO9kgfJ98lfd9FE-b9fwof8LSAlgLgAKSIfR5GNR4p2Q5dj1DVFw3PJsKGSM1IAoAoCWkTtHzQWRKjSCopFkNA8KnUgQE4YFURApiwMNCCeSgmsBVg4UGzkhIWLYjiuJ2VMRP4wRBMvESxKQCSpNRC4vnsOBOCdABVPBJjwexeDwAQZweJk0EgNBsGXFgAGU1yQAMnD1J0ABU4jgfQCg0SLtFC1wIrwKKAGknBklgfQQHRJkip1grc+wbGDeiz1LJsQAKId834yAnmfbAr37SBgQzZJUj4nI6WzeRZJq+TOUrJToNUoURRG8V6uBRr8ha-I2uwDqusTXqTgGuQiI8AB+J1Dv2rzZ1EXz-MCpRrWiwMnTcfQYC0OjT0Y2af0ECg0E4NAkAofskEEZJ8kktbsVBFbwZeJAkynEs2VGituVGFSZmmjT3sBr6fr+gGgZBzgwcECHTihqQYaqRELm3LhnAo7yxGMxRSGBd5rpUF6w1CTSVWwVjicgBNalKEkLP7RRpHF7BJOSW8CmwUp4bFcDxpR-k0bgnmAv54FBcSRQRflMWuslrrpc4WXZHlxXqaiLgbHps632d4FaORLn4L2JBfsgeof0B1MXgJRQ4zyaGQGvUgLSkRRXeGhHugU1Xq3Vut1M90pvaQX3+KnKp8iDzNQ8qcmI7w6PY72lgAHlD28J0NCQYh3NOh55xo9n2CdOnPI8LoiBgOFtH7whB8sGA9y+Bp-hYbLOB8TmGO596sJYtA-OKYm3m2BWSlj-ipA4oxSAycpfaVssk+RlOYPRz3V9JDfKmBbfcl32R98vI+LNP7Pzg8WugZ67AkIMgVuJozQASCgAdUiEYXuLBooADUUoIDgHqJA9hPKL2qgnfsfNpDJB+lkKQnB-qCxDpmFCwNZC5lIC8PmIdsBx2XgnFW19lKpzUjNPBwICFSCId+UgpDyFEjyIoahJQ6EMNYleV29BGDJAgLIB4g41EgAUMCB40hODxg0SgHQYAyQoE4EYlASA6CoAKCINgAAhLoZgAQ+hdAACQAJLEUyl8aEAxq4AAUACKY5grRUckg6BAANAAmgALVoToIwBQ9RhH0AAK0mIQZwbkbAAEdvAwAQO6XgAAPDQAAvEALEpCXXoYoPaUhVDAFwCwPUshiBxA0GAWx0RJh6jgLqLgTpLBYL1JYAA9KkiYhBdSWAAPqcHsMQB09g9R6gUOQKgeoRCtPaXATpsJLA6DGbwJwIAHR6gSgoMIIgFD6BuSgVJ9zJhgBACgQgLyUDOA+XgMA8QKCDhQPYD5NgPk5I+XAD5lh8BEBIDASgKAEAfJifCgAhPCiJ8KokvIdIIFA7owAFDaZYVAvACVEtQMU6FxAUCdIINSgAZJYlAAAqMlhBiUoAABRso5WU1QKhXmCpQCAfwArhXipFf4NgVKSC2I+V0eFZgjEAoAAIypQKIVQ-gAAkHyACkyrXlQQGZwWx0zgSOTgIQAQdKSAsFBIVPpJroQIEsPoHQZr7AWqtSEEBXqwBhBgDAEFYyxnTJ0G0sI9hx5gDatU5IYyyg6D8kDPIwtUxqhKFJNaRIUycCZKQAoscrosH0HTDBnrvXWpEH6rRgbg1gFDeGyN0a4VxvlGMt8shBAal1vEbAscCSQDqhmeonB+JMj-NJCR2dLQeGBK6mAPwCgwErZa6ttr52LrHPoZJq7zXrptTCxgTTtltJuHsrpPSnUIEGcMjK4zJltJmfMxZhBlmrPWfCrZLTz0dLAAco5Jy8AUHOZclA1zPA8H4CgO5LAnTOkQwh5DSHUMofQ2hhQjyWAKGef8157zXlfL+QCn5JHXlAupCgEFrywWvIha8qFm64VUERa85FVA0VUAxVQLFZzcX4sJeyklPKKXqtpTClAjL4DIBZaJrl8m+UqDFUKkVKAVMSt8FK9VcrXkKqoEqqjarN2ao5igXVryDVUeNbe01B6fXqvtde-ptmXVuo9fZ6t9rzUBqDSGsN9gI2ECjTG9tCak0puSGmg2Ga6RZr4Q2RQeaC1Fr4doMtsgK2ed9T5+t-nm3BdbbG1sHa9BphpBaSoEjMiPgjZmPEgh+zAgmCAQQQNOA6CKNoBd49l37q9YexzPWYA7r3WuhztqT3NJ2Rezp3THUubvSMx9UyX0LKWSstZZBv1nt2fsqwQGnD-WSGBgoVybFXD+LckQfjjB4A0E6AodkG66jgE6AMuo92WBOg8p5HzCOfN+fhlAZHgdAteTRlAdGUAMZQExyTLGEVItReizF2KBPydJUJjllLN0SYZUy1l2PUDcuJygJTGnBWitU8KrTKBpWbt0ygfTKBDOqvVaZnV+rDUeGGbZ8bG7JNOYW86117qBc5f9XlxtAWgshbbSV8L2Bk2+yi-rWQsXyQNAS7mpA+a0CFuLel8tSAJc1ty35mXBX5fFfjWMzgJ92JdWDtnb8OdMjAmSJ7xM+aUISVZmJbri6+tm83fa7du7A2h+PSgU9v69tXpF7ZoZy2Jmrdda+jbn7tubN27NgDB3jlHcTKd87UG+DXZYAMewTojBtIdFhv7BGPnEeB2Rqj4PqOgvBZC9ViO2MoA4ygLjKAeMoD4zivFmP5O48k-jkg0msBybJ6T8l5P+U07U5T2n2nGfysVTz4zknOfme59ZvnXBo-UuF70xbnA3Pi+y+bqXlum2BZbaFxXibleReixr-Ima2uOaSWeuKWRuHgGWWWA2Dm3mL+Dab+cuRWYW9ujuFAzuH4-kBcsgHuXuwMRCEiuIQ4h8pAiIW6vWSAK6V+dqw2o2UeT+k2se02f6l682t+JqKeD6aez6Ge6276m2X6ue8e+egGReeAZyFyZ2EGF21wtwleXQAA5M4FgluPoJ6N3EgE6FghobwHZJwA3r9jhigM8s3kRr8lRu3gCp3pDtDrDvDtSv3sjpxqjrxujlPmTljmvrPtSvPlJoTvJqvsJuvsppvtThKjvvTjpvvgZofhzlqqfpZjzjZpfvQULg6mwa5mLh5tAV5rWr5vAbLh-grnbhFqrn-prvFsAclgbqliWpAabk-rAXWq-gUYVp-nbl2j2gLP2oOiDEWpUA0BOnxHhNOskLOkHuQZQSkdfjQZHv1lWkesQFNnnv+qwTektpwU+tMjwW+h+lthsigD+jNv+iIcBidhIWXhwNwBXrBiIA6HcfcQ8XcfIauHAIPIlJFPIfodhrhpQACgDsRuYWYZYTztYT3oxn3vCgPkPiPmPhPhju4TPuJuqovrJkTmvgEbyhvmEVviEbvpJkzizmzq8kftSifhZigFZgCkkXZtkQsdQc5qLu5mbo0Xkflu-q0UUR2iUamuruUUAYllUYbmlhASbsybkdLggYUbbh2vUIoGkF+OSM0GLLkGkCXIyCULIMJNRNgAUBxCWsNiHlMdQRHmNkaUsUISsQycnveqMlwVsXMrwbsQIQccsZeicU4FIKXlIZcDIf8HBi4ggGEM6BYJwHgPITAEMlOM4E6HMNME6I9E6LIN3E4AgLEImXqPYF8X9sDv8UCa8qDsCVRqCfRr3sxpCY4cPs4ePq4YJmvh4YEV4SQD4SiagGiYERiagBTiEepriREXvnpgfkZrEWZuSZSUahfjSfMUNlaVwA-lkVOSyRKS0TbsgdyWrumgAXFvybrvrkKbUaKQ0eKc0dbkgV-r2D2tUZkNLKxPkKzI1rrJqfkA7oIG+KHEDJIeHhMXMYNmHjMaabSTKuaUcSwTOQ5DaSttwQ6TsfwTni6RaW6YXsBpAF6ZBmwJdrITcSFDXm4u9iki5C9ggOobICYO9jXtYA9vIX0v6AlElBlJ8Y3oYcYW8i3kDqRqxRRsCt3iWeCWWaxhWTCWjvxm4XWYiXjsiX4SvopliapqETJXidSgSYOeziZnEaOYkROVQfOqBXOWKRbvkSeW0VyT-qUbyZuVrtmgKaAdUeAaWgeQBYuceeySuV-s8C-MCJSOSEQW7pIJvMJN+MCAULkFJDSChKQuMUuhQd+RNqkSaXQQBQwXHsBXNqBRwbaZsWttBdnvsYccwftocqIWgChTYlwNBpXrYruk6DofZJYLXlguGY9gmU4ARW9koamUGXcQxT8SYYDuRiDuxYCpxbRmCXDhCXxexijtxoJZPrWYEfWTjkiZui2cvuiVJcEdibJZpvJbKlEazjESpSOWflSRpUaVpUnrOZkbpXAWyYgYZUrirjyRuf5FuRZTuWAcKbZZlvUfZUefpU5aeXbqMbDBQHKGkBmC+NUgJLSIkCmNkEWD9MOqQZ+RFZMfFTFePLQVFYLosYwa6clWdWBanuldsVnnsTtvBXlYdngNgEVT6VdphVEhMGEIdKlOFHhVFE3MSg1RGakoug1cKPdJEHMHEFmYxf9ixb1QWRxRDlxTDqWQjuWeNU4ZNS4UJTNRynNWJmJYtRJStWTl2etT2etVtSgIpdEUOftVzgkefiappTfmsffhdYeXpddVKaucZQ9TFmZRUZZbuTUcbp9ZdU0b9TdZyQmrrIDDoG1AUP2NUmtGkJABmO5aJH8qxOOrogtBxIjQaZFbbX+XFVOQlUwQnqsXfqlRBfaZnnwVlWTUlQXvlcBqQDTZcaVZhS4rIGEG3W3R3WwCip1UYWLaYRLf1VYTLbYbjWAKFMnhQSmDEOMsSrMmgIIE6SgA4YrZWcrdWardPmTo2TSuJTJq2f4atdvjiUbX2fiTtUSSgCSSQGSYdeOTbU7VdVbn9bdYmpSPUNePxKQJHamCmGtBLJQp7kDJqc8CQZ9N1tpY7d9c7S-SHdKXdb-qZU9eZTriAb7TZXUYHayXA67V-jDDoE8EOOSJ7viEtCkFIpVpqdrpHd9OOi0GQcjZjXSYwxjVQUBblYnukesWlenlBSTc6TlQnu6XgEvecd6Whb6ZXtXGEA3IzSik6AADz6AAB8oU9gGjGjijYyqj3cdkbx+geuKAiZPABFP23x-d3VrebFvVI9Q13FI1vFSOa9AlKt0129nhC1kmS1bZHKHZQRJ9G1VOxtptu15tx+ql99vOj9qN0xUDTJT9QdLtHJCD3+9165ntKD3tr11l71WDiTODkpKTyBpCFkRaMc-YIAKEkMiowIHEhIFBeE9DUWc6SNhpsTxp6Nsx7DON5NXD9tZddpGVAjsFQjwhiFTgigTdJV1xcGUSuoTork7kTobiihAtlgD2MANenAcIbIDxfdTFuZQ9tjg1UOw1dhsKCtg+E1o+U18JIlO9XjBOB9y17Zx93ZgTITl9e1ETB1VtR1MTBdqR8Tj+MDz9RTzlxR7tGT-+WT256Db1+5AdBTS5BlodYy14SaFB-EzC5MXY68-YRCCY+ayaiggDBYdU4V7TQL0xsVzDgFvTtdJd7B4FQzxNVdpNghtdIj-yTd6FfpIgLNToeoQQo8D2OgWChyhjeAhDBF8hahGZMAvdBhXVzFwO1j+ZeZA10t9jstPF8tY11zSttzbj9zs1olc++9S+vjJO7zBtnz59Cl3z4TpJkT-zD9-OJ1dtd+OlKLjl8Dbt6TZRXt8LgpftIpyLYLSTuDxTLl14uIBQyamYH8xQ7EyQ0dEgOgmQibOgZQfCOgfCOpVLOdXred9Lhd49zL1phNfDldy92V49PLoG4jqFMzMGcGwUg8xATozWQacQuFxFzVm4BzvxVjWrFhHFRZo9ct9hVz0JVZcJwl5rjzWt3jOtbzet0lmmhtcljr21A5ZtylvzltFJ6lgLP5wL+NvrUbhTy5-1RlQbyDgBL1CLuTSLUBC5P1yTkLHaDQ2YBQUgZI8QnEX0JI0YlQAU34AEyQLMn4IAaYOgxbKNNLnTI23TZpjLnDVbPD5dwzHLgjjbEzYh0zVx7bIgChrgPAxjGguoyrFjhz4tgJJzOrZzDjFzK9c7NzsJNZHjDZTzC+67fjdrMlO7m1e7JtzrR7rrfzp71tnrHTp13DDtCTN7qLr96La5wbcLL7YbmDdln7sDEL97CaHRvaV5PRw6fRY6gxU6vuYxjD1LF7tLXT-5KHHDxdKVrLRN-D+HozhH9dpyfLUjmFbAEQEQKKdHTezFg9bew9pzNhvefTk9gy09TwE8Yy89i9y9q9Rr69Jrm97jCJK7lr2tLzNrCmm7a1InDrDOF9B7YTUnt9brsnAL8nBn4Ld7b9-yUgn9N4WQv9+Q-9mY+aeQwDssrwgg4DrTaR9t177X0bRnXX0LWnz7aDuneT+ng2DlwdeD7RoInRfaA6wIQ6I6-R46mYQxLMdn7ESH5baNaHrnTnhA7n+e2HBNGxtbjpMFDbfTIj4h4GqF-LlesCj08Q8QCjLo8QGCJghAGgEPbgsPxjGZnA46zgzgj0EXI7ze6r-VPyHe8X5zo1zjuXrjBXZr6tFr3hVrqJR9lXgTonwT4noTV9N9GqzXY50TbXT3ins30D83t7aLqTmnT7z1a3Vle5-tH7W3X7MbP7Jn+3Zn3Rx3vRo6AxF3tnM6N3DnJbCnSNbDGHp6m6P33LRHLEDoNgGUZelet0Gh7oVg+gWC90XANVJyH2qZBFtetFeozoI7OZLFgJk7AKoJwOY9SX7BqXs9GXSAsygH2XnHxr3HVAatImxXVP2tZO5X-j+t1XvZtXTr9XLPw5J7HP1J2DanAbX+yQkg0k9QFQBsCWnUCdPYBs8QuiRIzw8oyQaBQ03rjJoLKHEbUvMBMvi36LRCd4ZQzUl4J85CrWdfhKBIBYQMZLmpmLLC2dyH3Pev6HHTSxRvNdnDPLJ2FvW2kGleoUiZEZNwfQEZdcSA8hNVAY-o1HCzlgCAdg0aSAItqruZmrUtXeurMek4yhJcc0cSfXjvNVXYE4M+tPNfNn23Y1dIiBfH5tJ2L5nsue0VOJlez55b98mqnf1rtw7Tj8T42AKfjIAoCz984SWO8ImFaysQDYiENArd1zp0semhvSTMb0P6m9j+lvCRkD0wqcpHiQg4QY8WgRNwbADoagFjzVYAovkmrMHATzY5E8QBCfMAUuwp6p8my4lGAZJTp4fNc+SA5nEpWJJF94iLXD1skV14zcfWOAzAXajwH89y+hAhNMQMn5CQZ+IMKgQv1oHL8GBa-ZgaW1YEG8i6r3TzqngiDNxeAU4PALMnCD6AbABSYUPWwP4J4-E7qApDwHGQ2B0haCL0LMn8iFUT+Vvemgsx0JcB+2CUJ0M3T4BDJZAvAeMrfw0bf9+6fvHHrFwUFTtABM7S5oa3naTUhKE+RQOoJT6eMoBAnHQbrTgFbsqcDPcInn33ZGDD2Jgi2mYJL7HUrBILectL0M6dd0WaQPyEWjNA9gKAqbaMHkBEj1REwUcTiK2FBAnDEaDg7YR10F7IFJAAsVsFSG7TR12ICSQltJEvAf1RihMG8F7gCFWCghu-TDh53xqDMIh0yKIcYFiEpIEht6L-t9xSH540hMQXIVkJyGZCY+rEc3rwNbakdK8Ig8kRSMpEUjfefxFirF0D4scEu+rWdr0NAEDDsUQw5PigA1ooBd6zZeTJn2E4ICDB-ZRYQ12WHHtVh6AywQP174ZEVOjgggbGztz7DIAhwgBpUlOFtQSgaAS4TBySzCIpAdwowJLy+qKiduyojtPVAtADoeoAkCWAAQtgfhd4-yGGL2FJCfQBEYI2UWWzYEhDLSMI1lnCPcjRCkR8QxIWiOrpctOGWIjIV6DGTZDsR+IgRFMyKHelK80IWQBoAiA2Bh2KrSxjINMLyDgSjIwnsAP4qo52RZyTkRAM1olc12EwjdlMKq7Ciz68wiTsgJdZNcZOaw89nYJ542CFRTwhbrsNSaqj1RxwrUecN1Hkh9RNwo0aUBNGD8zRw4gXup1SbWiygEiYGEzFTbfRgYWEF0RKALCLhF6FAL0dr0379jt+j3OwS9wDFKdYR56EMYiLiEoikh6I6McI24FEjT+xVUkZhWrjxB7AsjK4BjwUbzMEA8hUxnUIRCY98xeGWkaYXpEDVOhrHPVo4wNbE8+htzKsQ6BrFFdPGfTPxPoyiCPRxkxFUjrMi76-iFA-IxsUJzp7A5XkEkGYYgNFGEkUB3YtAXJxlFb9rBffLYcPx2EvCv844slhqJOH5AzhOovUdcMNHGiHhm3YSc8PXHIFXBpA9wRQM8Hz8aBS-egavwoHr9g8Ovc0d+2M725SBtQT8PeWvBg0Cg1TbAgOj+TSQI0L8K8D9AYY3j86T3e8SBUDHhDnxCImIW+IjHJCvx4zALiBh4F-jaaGFODGIOpROhAwzcUih7y2aZlpBv-Pqv-2LIYT2OOXHCRijwkESHmRE2uiRNeJkT0ulE6DNRNAxpjOkxE0ibIHIljI+gvpWZGbzTGMoGJtrPQUwABRsTgczEuYYYM4ldi2ePY6UZOX4mbCy+SouXmMnElHCagUkx8NqIuGzj5JtwxcUpMjZmTZeFkjSWQI8HDovBekugSv0YHGSvyC0i0UtMJjDpDxtk4GoN0cmnAMwaBDrPEg8mL1wq+vfAQ9Isndp2IoM4GHiAWj5AKAzwTMPVGJaEodSgHT8FmyXD0B-AAIRpD6HDBrgbAXUvECxAkhphTxFAWZO6AlhlI4AZoYpO6AUAugRAlEjQH8DpouJKArEbACgDcRgBFwryYiI0kyg1pQKCgL4OPVjE4iExeIvIXiFTG8DoQHyAYB8lZnaQOZXMnmSgGrhMo-ELyE9ALLlFcBhZosyWbiKTF5D-kMsrbHLNeQKzXkSs9mZzO5kFh1ZmsygOjJPTYzQguM-GXzANyTdqkeINADHxsB6gKAcAHJJMF4CIcUA9MlgB1L+CzJ-QsyeAB1IUC2yzQ9stWXzJUDABdZAk2zAbL6Zvdxkuc53tRLai0SUAlslANbJQCpyVZDs15BrJeZayQAOs6sPFFiD5za6LobkEMhsDtz4xYwfuf0EDDhQupyQYpIICRGzQ5kS9NMXLLVkKzgayQGuWAF9j2y05jcpfFrKoABJVAamMcPJmChgAFQKAaBKwAlbsoBALEDwP0l4BGhBACiWPLrMHmPRSCIsvpt3NcC9yh5GXPua-OHlTgYAY8ieVPIThzIYpCgeec0CrmUAJEK8teVzLXmbzZMWs5ebvJUDYB-AB8snEfJPlnzgAHsy+WzJvnuR75j87OW3NfmdzOGn8jQi-NiBz0-5DCq4IAuAWTz4I4C8uXLINwcyFZSYXFKzIQWrzcUyC1AFrKkAoB0FFAQQFgsPnHzjE+CwhUaGvksBb5ZC1ucpH7nUKE8tC7+f-N-lDyWFo8liCAo4XUSuFRiPEDAtbAczBFuKRBSIudmQBJFqgYGrIpwXyLXkiii+couXmqLSFAgB+RovoVvzx6uikJYwsMUjygFJi9hZpE4VzzhFVs4+W1ngX2LhFTspuWYnQWYKUA2CtfLgoUXnzFkvikhXfMCXkKc5QslAO-KZagUi59SrqTUAsXJKbZbMtOarMdmiKUAWs7AK7NjzuyJWzgPGXhG9n0I0AMccrLMkkCTBUknAMpP8gQB0yGZ-LWZBmUTnggwgKc9pXXIzn8zBZ+NbRaEPxoNKTlpcz0oktaUrzlZ6crpc7JblPzKFHcmpWEp7kRKDF-8oxTEvHlxLp5syWebwO6XbyUA0UJlI5EaRIIPkcsvmM4oVk9dnFdi9eRzNqU0K3lTCgeeioAXGKfloCsUDPPLnPz0VCgdBfvLkV4LilRClRWooqUnpIVUcCubGlSDWLjIaSpFS8o-loqf5ESr5WwtxWRh8VaYwlVopcUqArwKAGQOKpkV5KmUhSrxRStKX+LylYAIJbHkhUsQaQDKmFTAoyAIqMlXMtOSip0Wcr9F3K6JbyrMUAqtsQqqhSKqZWkgUAVfWRS81lWnz5VV8vxdSuVXkK1VEkhlQvMoBphWV+q5Fa8q-nvLTVrC2JXys6ACreB1q55SSqYAOqnVS+F1d4pKXuqyl6i1VSkvPF+rHZi8uBYiuDXsqu5xqhhR8uYVmqo1FqglU8tIIkr3FBSzxa6oIU+LM1iq9Rb4A0XFyZIhq45Up1OWDqmlZyS5TAraU3LOlDc52ckGCVErS1qKsNZisrVegeVNa+JeYsSU8LrFYq4tRkqBVgAJFUixQE2sCJpq3VxCztTSseWaKbV-a-9OEuXURrsVpijdRAoZXbq+FqSvdUgqcUirpFp6jlOerbUZrL1nqlVRQtvXPL71l6R9VysxVrqcVZi99VAtxSFrl5P6xxVkrQAircl+Ss9S2vTWUqPVASr1XOuFUwbOkcGk1QhurVIa31Fi32Mkv4VBr91zsjmTksA2oBgNSijteBoUTdqBlOM4ZV7MJnni-ZlIf5eEByTFIQAkweUMspYBzA7eGUfpGuG2WTr65KATOZBt7VHKHx9tIdYZvOUtLx11yu2VOsyVbztZN6kJfptg3lqMVUSyNfRr+WWrIFjK2FYepZV7qN5zsneXvK40oAeN7asDaRog3xrQlHKpdfBuc0vrflYCzdbLO5nQL0NrG39VkrQWqA8NZKopSBuI1Zrr1kGuzQuqNUxaaNcW75a+r+UobLFvClJQIr1VsaslR61xVKvw1AbCNF6qleFsqX1r7NVGxzZEs+V0bqtiW2rZ+sPW7qmtGW6zc4uPVBaQtoGnrUqoi39bSt+eajRWufVVaEteKpLRbKSUwKWNmGqzSguyXZbFtXW-LQqv439LgAgyz2aMoETsQXyBuVsLMiCCQAckhANAMkADCKbgM+iW2YIFeSWadNVSw5RtuOKF5B4MAG4JYFJm1arlIOsHVpoPUPLit86yjWAC21OaRtLmsbftsbqJL8MaGxWWAA6WU6OZB6gLSoBDhKBnFTIFNbJiW0Far1ZG2zdjtDV0Kn1tGwnXtv5WzISdyWigX9pgV-bGtVOvzZlpFWfQUAQMBXVIBZ3cbrtvGsLatr61QaotZa8rdtv53xbo1cQOZCLsO1pyFZTGledLpp3OzWt9OiRXKSUBoAVdwWtXaFpW3ZqsdFGnnXov12VbzVG66RRYqXlmbfNNurJfNtUAsqJACu53dKudVu7ltJGzXeRrvU+7w1Bu3bUbu8D-Lg9X0ZeRbsa1CKZd1mnDegsm4K7cUjIF3Wztu29b7tj2kTaMpg7wcJE68VrIHLQA5JnAMHGIIDuLzARa5ty3mfsu10DbcdQ2ldViqz1mLTdHmsnaHup1sqMdIqhnY7uZ3x7U1ie9nXdq53e7otvO2LQTsN2z6894uhWZLqt11yS952unfLsV0vAa92+uvSnr31p6D9vu-HVWoF3Z6TdFi83UdtZnW6ztYi4+avod1M649B8hPeSpu18b69b+6Denr53+711fyoPaTrgXVyw9IBnpYerl3OKY9L5J-bAfV0e6itkW8fXjuG3f6T9G69zQyrF0F6MlOBg9ZHpUAV7Ul1ezfazuf3wHX9um6pTjrFmZCJZJsuZO9tM3YGdlw+3A9vL6WCaHtwmkZXiBb2TLWszMNZQUGKS8BJgNgYpPYH+DRzgMc6IfeDtH0lacd1BqfYhqJ1C659jBwcOTraXAGV96CtfZAZIN5ayDyez3ZQeh0Oa9dX+1daNsF0xrhdZ+5g5fqAPX7w91mu-VQAf3K6eDqu0g+7t8MUH1tVhyfTtoD1-KHDcsgA5bpiPL6Z14BxnU7q8Nyq4DGuvw1keQNH7aDM+wPQwblkh7pDxeuI+drt3R6OZxBlI67rSNJ7CtnOr3e-t12H6Ktx+5o25siMwK15rBv9eXtICV6FdJ6gY7Xv4N1G9Zfaw2eIbENxi5kTQQoclpR0yHLNtOtAA3uUNeyW98oNMEyEnnjzSEj4SABoDjjGGjswO841poh31GP9Ge1A65sS0FHR2zhq-aUayWvJ3DEByoxsb4O1HMjY+gI4NqCM0GQjP+0-aTvz0S6kwEJktbTrl2JHl5j++E0MZ30IGxjSBgEygemN5GQT-++rcUaX0EmyjMJioxvugNb7yTL+7Y5YYaNTGmj9J-bRgdF1YGKdnRuQ-gfL2EG+jUBmVQifIOjH-D2RtEzYdCO-7c92J8-Swaa037QD7Bzg1XvWNcneDPJrY0ib00omwAIh+MYmMOOzI6g5sjzWcc01qyD1D8m9VaeENGyDjOI4XYyCkMU63TdyrJf8muMeym9qhomTB2IIgBPthASYDHD1AgBLAW2T4yBlMM-G9lWclUwKb910m0DDJ0nU4cX2uH7l5R9ffKZgPeH0jIxtbcidVOTGCzQpos8TrmMX68TJR1k2GaJMK6STyR006kdrPDGOdDZ-kzScaMYm6D+Rxk-MdB34ml9B6rLfbo5PVnuTI5ikwIbzOTnBT05mY4ltFOHb2jEp9JfqbwM9HZTseqo62p8P1mtdE5iY5-vRPT7hTQu1o5QBxOF7WN55rWYaZWNcGTTCp804ieVMHKlO4+208bIdOkAE6QZidRZvR3+aKAEZoZSob5hEymg7MqQAvTwAFAEA-yGwJAFST97opGmxCzmcENQ6cdhcsZL2rmTA1QTrpii6Ges2Y6dzT5wE4WeBP7aPz+IZg9Ipw2LHezja6VR4pAtKnxz3O3cy2f3NvnwjfFplYvJfI-mujoBlc4Ody3VG7zY5gTW7JuPN6JIMcRkKcGSD5DUkIARAO6CkDFItlUckQKcXItU7KLHFxdc2eCOvm2z9h4PaWekPlmoTlZzw2Sc3O8mkTj5ty8+fVOYmN1oJpg7ial2xGpTCR-s0rpvNEbQrYFxs-mY8u2GwjxuiI4kqKMLnuzS5tk6oA8NwmhzgxkKxacyvhWyt7ll87lc1NHn594ptpZKYPWXmFdcptK91oyN1XpLnF2k62Z4vvmOzupzq0saj0AXjTfVmo5Ja13em9jhxv0-iNe3wXzNzl1i7fsgCoWnt0Z+DpUnhWQBZkBQZwKklSTaGHJdSeyywGAxswzDvxiw0NYitcXRrdh8I7Fd8sU7-LbFwK5VeAs1XQLUl-fcNanOeWxrX1ia9EZZOlWRLUe4k6leCvaW6zul1PdSfBt7nIbn1-K6CaKsuHEry5gG5yaBuo3Rzu+qkzrresjW5LXl8I61cYPtXVLUp7q0QfXNmngbi1jG9TYauRXcj9N-Kx+bivfnhLc2uXbNbWPzWdLlNyHRBetNQW1reQiQB+eYvbXp1WSxQPtajMYWjrAiK8IoFmRJBOAeoZwHqHdAwAckpFyAE5d2WOy-jWVmSzlY1NYnRdP1wm5Cf+vsmqz0ttG7Lf+NY3ZLONvKzntitfmjEXZuG7+fhTl6kbpJqq5sZBsPnXrfN963Taht425zhej2z2es0rmKrpNms+Ta3N8mU7m2nI5nvkv5XGbbR5m2Le6MEGer15lG7eb9uUnXLqd2m8Hc1PC3w7CxvU2pbwP-nVj3BhO4qYGsNnlrxE30-af9M9dNrT19087NIDa30LdxiOC+U+hrLeg7dQgGUnKCkXmQW1u2yPtzMB2abEN5q67ePPu3Fz0d6E+VdhOF2NzxdjK6DfGMX3sbV9mKzDcjt-Xb9fZpI77Ypvt3z7ndy+y7Z-uFWmTxVqO4PdQUk2Obw51+7VffuY3P7Qd7++geFt12B7rNxu+zeAcl2wrZdh9RXaBO42c9vdnU-3amsR6JbI9oC0XdbsgPtz4F+2pBZntGyupEcBe9mZ2ugG+lXpoQytfFmz3kxqtxfSGY1vWaV7ihxvWvaJm1BYLwiT7fYFIAaAYAyQR6DbbuvAYroi9+2y9bBsYPnb0V2cyWdaxlmibFZ720FbHsSWJ7ydkx+A6-uQOLHou8O7Df-ugHkrQDlu+ldQfOOP7rjzB+4+LPJaCbd9+B2AbseA3mHgTpOzzaoPkPuLlDhizg+YMdWzzMTtm71YCf9X7zyT609YYFsZ2qHE12hzk6lPD3ALRDt+0tZEfT39j4j02bw7HXSHpHUpoR1Rfls+mWn3Dp03w66cenV7txomRkEqSMhZkzgZNMCDCCJt7AbMDM6QFtuyGHb9V8u2qbKfpOCrbtqx35ZscBW4nz9zmyg6SeIHebWzxq1FZnMRPjzXjv+0c-iOAOBz9ToJ8U6bP83K7gt0O1ncANwOpT+dp+0g+qvnPublzlJ9s5+flOMnwe3B3Q+s15Pm7Djrm048+fZWmr4T3i5U6L3VO2DDDupwU4WvovhH1F0R6IdafgL6EwzlizI-O1XGyXfTil3acGeBmOnwZul1KYfnyODLh19iK+AkjYBhdEiAoPoBssIAZIGZhhoY9PtU2oXNznZyHb-2WPwTJV++4g-ecXP5XJT1Jx9eVd7OHnOp7x884Aex2Ur8dsmyw+IeDWXH1z75xQ4Nf42YHOd+G3nc1fEuZboDx24HbMd3ORTmTxfYi4bsymm7-R1F+C9Jc6uvnad7u7Wu1PMGqnnt87bU7mueu27bDnY5w4GfiHqJNLjlwhfVtSnGXvTjhwra4e5v57Bb4+7IYPVyP9LkZxR-BwLDXhh0syZ3joHdB6hBAeoK23o8mZrPzDZ9n16Y6xfmP7n8+2++q5icP3VzPt9N6w9Lt2uyH0Lx15qbDvGunnyb3x68+RsRvrXDTjF07bHf+vvL0D+c66+jvAu1zWriF9G8xe3ODzAb+F1k5ZtdWCH+T-d4k7vcd37XsbrB4luoeJu8X27oe4S7TdfvCn6Npl2W-6erWqXMfSR5065d1ue1TTiqRW5gvsvTjUjlD-5pbndru1QAA",
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
        /*overflow-y: auto;*/
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
        let presetImage = null;
        if (preset.name === "Introduction") {
            presetImage = "img/sequence-intro.webp";
        } else if (preset.name === "❤️☀️💔") {
            presetImage = "img/sequence-vision.webp";
        }

        const presetItem = document.createElement("button");
        presetItem.className = "preset-item";

        if (presetImage) {
            presetItem.style.cssText = `
                background: transparent;
                border: 2px solid transparent;
                border-radius: 8px;
                padding: 0;
                cursor: pointer;
                transition: all 0.2s;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                position: relative;
            `;
            presetItem.title = preset.description;

            const img = document.createElement("img");
            img.src = presetImage;
            img.alt = preset.name;
            img.style.cssText = `
                display: block;
                width: 100%;
                height: auto;
                border-radius: 6px;
                transition: all 0.2s;
            `;

            const playButton = document.createElement("div");
            playButton.innerHTML = "▶";
            playButton.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 3rem;
                color: var(--white, #ffffff);
                opacity: 0;
                transition: opacity 0.2s ease;
                pointer-events: none;
                text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
            `;

            presetItem.appendChild(img);
            presetItem.appendChild(playButton);

            presetItem.onmouseenter = () => {
                presetItem.style.transform = "translateY(-2px)";
                presetItem.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.4)";
                presetItem.style.borderColor = "var(--white, #ffffff)";
                img.style.filter = "brightness(1.1)";
                playButton.style.opacity = "1";
            };
            presetItem.onmouseleave = () => {
                presetItem.style.transform = "translateY(0)";
                presetItem.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";
                presetItem.style.borderColor = "transparent";
                img.style.filter = "brightness(1)";
                playButton.style.opacity = "0";
            };
        } else {
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
        }

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
