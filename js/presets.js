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
        value: "N4EwlghgNg9g5gMQE4QLYFMDuMkGsB0EIIAygMboB26AFMAERz0Bcj0U6SAnswAphkALgFck6AM4B6AA4CRY8QH0AHAAZ80ykwA09ABYt6AQUogu9XWEMAZdFw5dtAAgCSTkDEoByQQFpf+IFOmBCUgk6CMPgW9LgsAIyqqrpQCUm6qGnJ9JQsvonZMCwArOn0AGyGcOycPABCEGS4cEgwwqZO4p5wUgBW6NBtSh5QUPjwTAC+AJSExORUtAxMrNWjtcwAsmDiZJKhZg4OGloxBqy29nYxVqwA6uijzm4e0bpxzAUZeV-0RcylbKVVY1bjMBpNFptDpdLR9AawYTDGCjcZwKazIikCjUOiMKqgnjbXb7UxXcknHT6Gx2Bw3QwAKSR4TgMCcMAAbpwnAcnE5FIpcHzFOhFHzIsKBWL+YpBHo+Vw2m8KgT1mCIc1Wu0QJ1uvDBkjFCMxhN6DM5tjFniVmw1USdnsDuTjpoqedjGT6aw3HK2nA9OFxHp0F5xE5FaInAAzJBgKggAD8MWBto46samuhOthPUk-QNyNRpvNWIWuOWqrT9pJTqOdkpZxp5K99E2MFQnQgYB1Ea8OuDUGkTgwwTAcp5lC4crAWgAhDFUp8yrkl0DKxsNVDtbq4XmEUMjSiTeizZj5jiltTWCYzC2Hl5Rk44OhwjOIlqAEYcQLKj6-Re-Jkq66Cuvz-ICugpmsVbghmW4wnqe4FoeRYniW55WhWIJ2nwciiBIMh4QoKgAEwNu8WQpJR9BAb8K6+OUZTgWU4jrmCJBZk46BRlG6BCFI4iigAzAA7GiGIWmWl42tBGz8EI+FSLICnEcoQnkbE1EAWUQEMcu1HMao6GWuW+LYTBxJ7FAYAcjOULthptz0AA4jAbkwL47k6qgOCUHZzhGEGDizvOFHATRBklGUUGErBkJaghu4gGIaB2YoM79EIYCeOJMRGCwghIMI6C6HULAiaUxlSdabHVlZNl2a0Dmuo215BdcliGAAqv6P59T+ya1XFmbbjmUjJQMqBpRlfGCNllC5boAB6Q28DghVdoIUgQO1XCKAAnA2VUXjV5kbJZkjWbZWhNagjmGIFw7CGQ8o7eGbROLAXLRugjx2bqSDcNGODvaIglQFGui6L0hhjk4OwRGAI5RiDECfWOggcPDYScFAwggOgA2QUNm4JdmiETalWjpZQmVzTlxZniZ0lDRdV2NW5d0tZ13qvmGc2Y+gIDME4AA69AIDOOoAHLCIVcZhGGAAqbLSzA4QACJxvg4uDWd6bxZxY2SJTU3UzNWUM2hTPVVhqbnQ6l0NTdnP3awABKAxmM4gmCM4rKhfQ2lrvr9RwWTO65qb0207N825cdmFmfbYIXTtegOIorKyigQb4HAYBRnrKdh4bo0UylZtwDTdPx4zkknXbsmp476eZxAgg5+nGkxThpNGxXk0x7XVtUgAAgVRUlfQADELAANr0AAopgq+YDEJADEgL0RMG77p04H4QD09AALq6AAJAkiemTJsVp7tigd13efc-QTlK3oCMI5gwZiKDE4extCQOyKABMQEflaHKbksgsYRhARtPOMQ-zRRJuHAeSVK7DzjqPU8Dck53xwg-DOdgn6d0QXoN29AXCCFDDyKAKUzCH1+pQToZAIBci0ELTo6AuQoCgIjDA4hnC8h2DEGGrBCrCCgFwQBTg5aCFxrI9AAAPPQEBmTcLemjFGMByaiAoMqXuMF+7l0wUPc2sdLYLXrqWRuydm51X2I-Z+FCqF1DlsETas4nB3HUXzXeHdAhJiouFYxG50FmKjlgyxI8bHW3wbfVmrcXHkNzpQt+7o1ZzSjAIDu80WyuXCGjAAwqEdkUYnAq1QB3GAEhA4oOyMHXQrFQ7MA4tubivF+KSEEooeIi0VRtNMYlaJFjq4W3pvEiSdiCHJJrKkl+GTTg82MDUgAXnZHxABND6QY2hgM6HoGAmBAnhAlPAw+UC-6-i0tRcJBsRqjPGjEiZVipkJ2mAAbnAIMRAKAMDYDwPgX2JT2zSBgOIMc81xA0HngwBAhgyDgv6SJco8QSIiVUAAFmxSJEixR4iKA5PtEA6ykD7XKCojkMRnKGFrLSDq9AAASCQSKUt0C4cqJFsgMgXgwAA0oYI+ZdTAxGsKtIiBFlLyAkCodQb9NgsGyNLZVuhWWfHZeUTl3LsgAHlJ7FV0LwZVkxtCCuFZEsVugJVtPkrKpSUqlDKAGYqtV9BVXMGyBqjFHLqG6t0Aa5gUjp4ms+JMU+ZqEVIpRfENFGKRLxCEkJPFqghIqBegARxUaoXA2KSK0sMOzF27YYg+q1Tq5g+LeX8voEK1gIqnkgHFWg0VIApCNvgu2xQxQNJKq9boT13q2V+q5VWnlgbDWhtNeauthhxDSFjIoltbTnJoHQJ0RdY4CILqXRIIMv1O4YpUcoRQL0IAoCEJwZ1faWDlBItiwdLAhLKEfSylg2LlCVr9UGkNxqEi6AAIoL1UOfeg7sWBRmgIJXQJAWAEuyHcFgDBkVQFaRi3QrRMCtOUJMKNc7WC7u3SukuzA10jiI4ogSW6qMHpfP0kiJ6z3qMvYopAShEi3qreUL9HqEj7RIuqj9vGx2fsncGqe-7mCCfoMB5g89yhgYg8wKDaHp5wek6UXQSHmAoZROhmTWGcN4dnfW+glH0AkccWR9dm693Ufs3Ro9jHT3ntY9e-pCqVmthKGip90nlC8Y1WJ-1zAQu-sk-QMNQkgML3iMoJTkHoPqfg1p+gOm9NobZZhk5xn8NmYs1Z2K5GN0WYc9u8QTmGNMbc40NjHGvNUn7cUPzfHmDJu1e+sLInhPib-VFj9sX5PxH2ollTyXYOpcQ8h+gqGDM5ewywXD+X500cszaoaJW7MVd6WtyrwZ6PHtcyxurHnONuu6yq+DgWhPdcreFqdUnihDYU2N1TMH6AaYQ9pmbc3sv0CM0tvDkbZ2ItYMi1A0hUX3pa8oYoQl9q4tUIocoIBcC9DJYkYQhbWBt1IdnChZaR2dbHdW3QfL5MWobVa5tG3hk047QzntXGrsDq676knAb6ARaNQNr1K3CNraKzhLbZXduOYO85mrJ2r3sZUBpHn07Pi6CVo9+gXVa0ADV3X9vvW+z1L633BZ68wP1trSOi72+LirVWjvMYvaduXygNIFaFy90DuhlPvZS5p6bunZv6f+4D5gy3Z3a6rftXQuuH3+cN7dkLY6zebds2LsrtuXP2-c07l3q290xDk-PIS2rRLaBfWN-rX20sZYD1lzVC28th7ZaoZ7PnmB6-8-EXF8eTdJ9XSnq3afJfVeOw72XN636u7zy9mPBLtAkUU57tXle-eZfmwD3LQP8Ph5G36-tZO2ud6N710LveLf9-s9b2jQ+7e1bH-LifufiPu+0PEOf5fIvL5+-7v7df1+LZDyZgwOHiRC6jFq3vvp6iNjJsbt+p1ubtZpbhfoPoesPpno7uPt5pPk-rJiBm9hNp9lNl-qvkHhvgARGgLvQJ2mTMLiYgzpIFQVmEoOUCzv5sOpqqOlzorlJiRBQYVnTmfhRgPntuntLqPvVp5lxi1p1gbkXt3vdrxlwXzmAQXiNngWppNr7kQTXmvsHqHlTuZm7vQPAcVufjtsgYdhnrfuIedt5s1q1p6iAUFsfqJgoWrmGm+ioQlovuNuoQQZoelr9oHr-roYAQRgYVPkYcnoIUgcIdfpYTLtYY1jEHvjxh3gJnIaFg9hJrzmGi3gXgvuBklr4Z-gEd-kERhn-g3voXwZEX3tEWYbESgTfgkWdkkVHsJqzo4RkS4X1pFmGp1vkWoR9iUdXj-hUSEeQaDjGpDtDgSiJMoCJCmmisUIoEJNIHAPEEgJmrgJgGQDjvQHjntK4ukkTuwZzuOjWpTmEQwdqDQREm2ozg8czhdqzmwRzpWvvooWGkZKZo-suvwQgaYVRpfvunEaIVnhgU1lzpAekV1gniwD+m4QBjgfJh7oUT4cMYQaUcQcEaQXoWETUcYSLkCTuo0RYeCegRIRdmirxjCdAc4cfl8fBi9gUV7vgSMYEbXuMXiaEVgf8bUQIaVkIRLk0fEWIa0ZIfYddk4Xdpka4dkUrsoXFl4eid7hod9tidoSQf-viXyetgKYCfUcCeYVLiPhCVSbYb5tIc+rIXCSblkf1u4S9qod4WqX4RqaMeUYZjybwYYUSTBIgQ0SKeSWaZSTYVCZdv5l0XafIb0TkSUCyUMT7h6ZyToT6b8dTm2ncY8l2o8U2kwSwW1m8RWqFp8UiW3uQafN8pMEAA",
    },
    {
        name: "empty",
        value: "",
    },
    {
        name: "win",
        value: "N4EwlghgNg9g5gMQE4QLYFMDuMkGsB0EIIAygMboB26AFMAERz0Bcj0U6SAnswLJgBnMgHpMYSgAZ8cMADN6AGnqUWAWgCMEiUoBsLNlA7dmAIQhlccJDACulEAAIBMSnAHCAVumi2BAfRAYQ3x4JiUATRYpAA4lADIWABckG3QAXwBKQmJyKloGJlY4dk4efiFRcXVpOUV6AAt9AEF7JCw6sH0HfG7env6+wYHhwbrcFk1telQ1SaUVZg0tJRgWAFZl+j0ikuMzCytbeycXN09vWBt-QODQusjmGPiklPSsolIKajpGfWLDUp8QQiMSUdSqABMNXkSkarCaAnqHC4HX0AAUqJQuA5ZDgHFxbEgHIl6rY4PVEgIAPx1GaLObKWabbYGIw8faWax2RzOVzuLw+K4BIJQEJwML0B5PegJZjJVKZbKfPI-QqswHlEFVSHQupw+gtEBtTCo1gAORgDhAF3wtKZUwWqg2UxZ-zZpnMnKOPNO-IuvmFt3F9yi+FiMpeCveOS++V+OwBxk1lUkuthzURyNN9AAwgByVAuHoAcTAADd0A4MA4XJXsEgQLalHSnZtHc7dH9duzPYduSc+edBdcRWKJVKw885a9FR9ct8Cl3E2VgSmoTIYQ1mq12kpOqx8Iej8fD3neDhEnIuOI4Hmm-RxswGS2O4zFq-VsxX67ux6Dlzjl5M4BUuEcg3HUNw1leU3iVec4zVN0NVXUEAGY0y3eFM3QFE930AAJGx6h6AARMAQEoPNEicdB0FQBwoDAXBKzAaiICrcQbESSsIDgGB70fZ81FfR0GU-b8l3dDk+0A30h1AwNRTuCJIKnGDZxjFVFwTd1k1BAAWDD9QRJEcOzEhLQASWJepxFwfFbCrbxKGoxJLQECBsTzKwIEvWRr1cO87XpNt7U7HTAWkgCfUHECAxuJTgxUx5Jwjacozg2NVUk5CKlBNYjO3I1d3ofd6BMMA4AcesQAEK0XConFWIccQHJsIlCy44jD2CpYHTCrYcr2XtooHYD-SFBKxxDFKoMjWC5yy7T1STFDxB0QqsNM3DSv0cJvHqKkHAsjASRvBx0CgARK1kZqPCuajbuoC6ICQRjOHvFsGVE5khp7f9vTGv1h0U6bkulaCZ2jZUF3jFaVzy8QAHZNoNHcTTw1h8Igepsex3GmgAQl676BoEP7mAs-t0FkWR0DISlhGuvx0OUwaIuGgH+yA4GFKmtmJzm9KFs02HEN-PTxGiVGTKzTH6AAeXqfEDsJhwAB4wAAPgsmA9b19XhG1qsLzkMB0BABQHFeysCRsGlmwGn6XQpqLAZ5+T4tHAXVLS9Tofg7KOYRrVKAAThl9Hs3CRzcEoGBMAcSyCxegRsTcq1BGScxEmPEnQpCl3g7-L1ubkuLJu9pLJV9yGMsWrS4aQ1bEbBKQNz1DNtvMmBqzgGwwCgRJsTIFwhHNygKDavMKwcPjEmJpQoAmTYvoL1si-hkuZJi8aQf56vBbUqHMsb8XlyBVv1GqDv03hKP5ZIS9DAcAAjdBEm4okSQgSg2qQAQAkV5TBfOvD86xfrFzdmXWKE0wKJQgrNY+9dRYIQppLVMt9MJo2KhjXarB8wYDaFbO2i9pjCXXgyH8F9oGyVgfvKuiCIbzQ0jDNBxcMHt1qHfA02EdplSaPUHGEBCZkLXv1QuShybFypscGmdMGbuGZqzau1CpIjXduXOBoMfZIL9ifBuYt0FrUwdw7BsszLywAOoQFYqoVQatiyqDgFQRIUAuCONce4q2fFiBoFQKxURdRl5PlXk7CBm9m7-VLnQvefNGEzWYcLVhgdlpRMvqHdQUIAAOrhswABV6iVjLIIMALgLr2DqmIEkthqJ2ytAFOAPQxjAMdl+TY4lNgAEdWn0GkVvWRjh5H00ZszTQ00UlLSbhLExWT8C5IlGVCy1tqIcAgAIVyRS2h5jqj-RIJDHICBsNk7JMBrq2kmWfYxV8cl5J4RY-h+gaAnhea8k8VjLrZPwBkYJvSFiTEuUY4uaIwAM3augdw2TQWJHBf4CE6hpYLOjo5bA9hOAtVkA4Q0xonAQETs1Ny-EWmhKmCEoSJL5i9M6ZE38tDd7uCEYYBOtFKB+DILZbJMLqBg3oAADV9hOMOgL2FbxBWCtokLoWwr8PCiOSL7kP3wfQN5KrVVqtVcS8lYkInhS3nSoGwhGWwEwCytlHKuXoB5fyvRgrhVB1FVKiVwgoXiohTK9Qcq7lKt4J5IR2TAG-IpW+KhrsNEwLOEa5lVAzVgE5XYS1bNrXSltQHKZ59dKzNuRKYyiqyoK1UDAZWiJAlqxjjYPMbRraYAgMxIJShBJhKDdS3V6T9Ue0jSa6N7LY0WqtQK0MYclAAD8KZogvCgVi7hf64JZtUeV9AABeLAADay65jaCRssCQABdBQy7tAHoUDu7ddq0kzJufMr1xk+HZg+YYK2RSmXEktPUwl941GRTDbEhl7Ao2su7XG7lib+0pUHfQEdwLx22MZtO40s7L0SgAHqjqg5O4Q6ztp+HUIZedS7mCru0Ouo9u613LCI8ezIABucAPhEAoAwPWAg11Eg5l7qcgQrEymUAEDQZdDAED6FHqgbJWGkY6FQhCfSCK1hrCRqhVCfgB76S6VANYEISR1GLPoUEEg6j4QmBCaIUxLIsCRhCKYAApFdDAADS+gBDZKQKxdAdQAAyFNixoErA5pz3ElGOecwIREtFEhYYhAAD2iGa16OdOD+Bw163gwDwxmiiEofTzAw46CUCZzL2XFbzSUGiNL9AACKK6w6oQUGHfS1W1i7voAAJUK-QEgLAIQbCUFYlgDBR5XQM0oawmBpHRDSGkBQtn7MBe4m5jzXmnDTYhUzRbQWikfzC5F6LKAGZxb8AliUSWnzqDU0oVLX5DPpZYFlnLV38sKxa8Vp8Shyv4eiOoBQ0QIQfdQg15rwslBteYB1qY3XmC9aCNIrJg2E4jbGxN+gdnWA+ec7N4unnqzI788t3zELgvrayZt9lMWdsAL2whuoh3rv0DO-pIzl28s3YZwV-79BHtfbKxVqrNW6u-Za4D4HXWev0D65D9nQ3Yfjcm0jxbqOt7o+8yt7HgW8ehYJ1Fon22v7+GvuTpQh2PXs7O1MDLtPGdU-uyzx7VWOevdq9EbL0R6tKD+zBAH7XOv0FB+D-rT4xcw5YKNyXCOps49l+k+XC2cf+ajyrjb6uhGa924ixLExjuG5YKb+gJvwy5fNw9jPz2V3RCRh92I0Qw685Z-zj3XvhcQ4G-QcXAexsnvhwJ1gQmRPqDExCTdqEasSHL0jPwcBZDhcwLgbJ4WYA7S06wUE6g9MGap7lszlnrPB+l6HpQ7m0fzcx0tg-q2Qtx627F0n+2KfJdOyVjLK-btKAt671nJWXvLsq9V2rYcndNb5+7kHQuIuDeTezAge8OiOfSMuO+c2GOiuR+seauZ+JO8Wuu9A+uaeN+524Yd++Wued2+eT2Nuy6b2H2X20QP2zuf+QONegB9evu0Ow2zeQeEBB+Yev4EeR+SufmCBEW8exOWuZO86lO+WNOdOWeD+9AeBj+BB7Ob+H+3O3+lez+1eABYOdePuUOje-uoBcOUukB2+9Au+cu++cBK2PBhOCe5+2uc6KeT4Yc6ejw9OmeUhzOz+VuhetuH2DuP+Lurwbu1Bqh3uouDBEu4BIeKO0Be+sBUeXBuOa2quvBSBAhyeB2qeJ21OGe2BmRZu+BluBeRBxepeH2FelBVe-+guahQB9BWhjBOhzB+gr8X6IAbBF8YqMKTqLq7RbqqEawKRV+jhGRAxGWWS9+zAa+0heRT4awaQre-GgmbGomOgveEg+k9hMmg+LM2SawXSqAveDMmm2m2oEIS+vuox4x9AVm+GehrBkRxh0RgWsRx++OiRGuVhghthkwKWt+EhLhT+fhL+AxchXOX+PhVBAunutBGhfutRYB1xUBhhMBCuMR8B8Rp+rxyB7xqRR26RZ2amWRTOvxBB72BR72n232Sh-xKhFRQRwB2hsJm++hERCJURSJDxKJJ+iB6JAhl+euEhohxuPxEhfxqQRW7WHh7+wJPOpRyh5REJlRdBmhIB9JLB8JRh4eJhyJZhqJnJlhGJOuQhEw9hmBApzAzhQpBB1ub+0Qdu3hFJIprWspteVRipdJuhDJNxzJdxrJWO7JzxFh-BSeqB6BOJ2R4hppOe5pkxtWBRJe0QZeJRv+ZRAR1J6hwRNRoRehjRXM9gLR7obRsKzqjq3RawnqWJUwRu9OIxuBpm5mExbhEwOgMxQe7edewmixyx-e5e+kSxe2HgEgKQZYqE4WjQSgc+9AoIxxlZEIZxtZFxG+KpBhap7BGpbJWpHJLxup3JQZ1+gxJpoxeekxUwQJn+UpiZMpyZcpNJ1RSpbpC5TJS5F8HBphMe2pG5AZF+252JDheJ9O+5uR9ZhBVppJZBFBZ5lJjpkJaZN59RW+95iJkeq5L565-pieH5BpTO-Jv51ZTOwp6AopQO4p8hIJdpeFDpF5TpCp0JGZ7pqp8FnBvpCRKFbx+pHxRpu5ThEZOFFp4p1pXhH2oJSZ4JFFUJIRTBYRsFM2tx6p9xPpa5fpfBqF-gfRvJX5mBme2eORdZ-xj20ZVpsZ8ZJF-hQlkFtJMJt5DRTRuZgI+ZHRRZ-gqEOgUg6F5Z3xpx2F5xuF+F2GTZbe8xbZ3eSxm6+kEg6gqE1p+kfgsgqAHgHgY+sg05Bx8+4gqEJxVZjO5xlxfGNFi5dFz5yur5TFGJPJaBO5FZYZf5Wl9pj2R5nOJ5ih0p4F5FJl15rpMFjJklnp0l3ph+cljFClbxxVwZ35F25V2FB5AFxJQFpB5JDV9pVJl5qZpl1Fd5HVD57oT5mpSF8lSRu2g1fJmRe5Y1-52lYpRBRFp5vhc1EF8pIl6ZYlcJOVLJCFslW1fVO1pOLFWJBuxpHFmlrhJ1zAlpReNp-FhlZFxlN1UFrV4l7VLmUly5MlPVr1aJm5gZ6F18IZ4Zv1khkZAFulRe+lxRYN81wlUNZlbVWZMSzR8NrRdlhZrq9lOgNhZZP1YZaVONYxs5nlAJQqsx9ALZne7ZQVEgEmDlYcfgEgRAcAqAcAZYiQPSo5hxlA+kqV057ls5mVD1cFT19FvVKN75KB6NWgXxQxgpXFh5hFkp9VYFV1TVkNS1912V2tXpz1SN+VyF-VRVn5GNw1+JFV-1VVEwPFwFM1NtpFJNzVLp5NMNHpa1gIG1iF7t21XJu1n5VOmFo1f13NbOltdVAl55ENV5Udy14Rq1uVm1Sdb1KdH1zN-R317FYZZp5tAFQNnh9uoNs14d11RdVFjtK1cNnVCN3V0eld+tilfgylJVqlgx6loZhJUZPFhN5exN3di1LV0dmZllNNeZdNnR0qDlWa-RLlptbl6VXNBBSMPlcxHeCxAVyxwVOgjub2I+UAEAOMUAC6OgA9Y5+UqtM56+VxTtZdOteV3BBVntW5Rtg+rNOBWdBBNV+G511tl1XddtPdoldRMdtFIDFdYDHt71htHxGBgxP5mdHN41ANk1ReId5BK9aDa9xdfdpdA9cdxgCdL1o9OpBtmJ-R6dB1WFcDkxshtVCh+djVhdDDvdmDWtwDLtutyNXD49n1ddbFZVGl5Dx1gdgNPFINjudDEjzpUjypzDVlbDK5HDeDydqNpOk9Q1al+JTdFDWj+Nr2S9CZKDRlNB9t69JdrAlNO8pjPANlS2e9EqLM4mn5x9Jp7Nq+59kxjZMN-j0UgTzAwTkqDN4Th9KlUTU5-9lVpFj2l9fNAtt9PewtYcSM+kcmimMASMXAiQEIrEKtitSVlAeguT6tADWV-dKT7DbtljVd1jhDX1xtMDZtTjBTr+IjxFndnjgRkjGDxjElLD5didAzY9A13txDuJI1sDGj+TXlwd01tDsz4NXj6Dd10jQDKzODazcR+D1dwzvDIh-DZD89AFwjiDVtYjttBjlFiz5lyzvT5j-T9zVj3DyjKl9dajc9uNANrdxBujPzqDfzt10FWDj1cjoDYLgz3DtjaRDhs9WN+zAdkzppi9RRy9pzEd3jjDVzEBST3oKTaT9NXRjN6EzlYzp9HNHlBBCTm92Z1Ng9tNDNrL+9Oge1AxML3LsTUw2dzexTflXeZTKx2GIV5efgqAZAawr89Qsgo8KVLT45yMf9nTSgmt1zwLiNI96zijmzUDJth1gjAFCDEped+j5zCzlzSzsNVrw9jx5hEDqd6N2z6wuz4zmjZLVDr2NDoFHjZz8zhjALbVsdqzFjOLGzXt6FfD4ZTrJL8rBFZ13zHrib-z3rgLvr298dILNrGbdreptdULqjrljjkb+FCLvF7dej1Lq9Sb5bKb2DWLuDdbb549+L09oh2N7zANLjxBbjJbKZfb6LArVNzLu9dl4TBUnLDdwxatZ9crBB0xiTW9wrO9oroT3RErkTXLMTNZB7kxo2irN9-lKrUmSMsmEgOgfgSM9ht0Q5NgQrP9Uspr+75r85JjVbZj1rAb4DBDPDULozO7EbBzAJrrSDyLczi7Zby7lrkHPAfTtbTxuL49krPtmBpDez07Wj0bxBsbC7C1S70NMjNzQ7dzRHmbkDthObtOebVHZLnzbroj9HpNDt9LEHp71b0HDFHHu2kLU90LLbnFEz7bOjfF3bYdmHDH2HTHuHEnUH-r0n9byRWzmNRLrbKHOlFLcZRNPb9DjHG9DJjL3Ia757G7DlW7thOTbNe7PLcTAFR7K7ATeHqT67GTB917SHMrd7FnpmV9-NSrQtKx5mTNwVfglSZAZYcA0QcACt9AQH4cIHvnXTzHfrrthHgbcHpHiH0r-tBbaHxbtnqLZNvjlben+HNbMHDzQz8H8nobWBAj+bRJRzZJJzGnCbWHaLOnPTwXBHnX4LJHadLzubA3fH+FAn6HwnkdRjFbqbtz6b7HRnsnjb8nzbJ95npLKnBRSLm3tL23A7mLXVZXc3xHbx47ZHM9DjSnbbAJs7hR1nVLY3NLFzOHDLJ7rDQToXbLmTEX0rt7nN97AFl9x7grLnbLYrYTDlG027sPPnsrMXoScXJTL7gVSX+kqxvRMq4WqEIA+kEA+kXAr8iVxrbchXePc5gD03bXzAs3hno79rHx1XrltX8DudQnjXnr9nLXu3rH+3FXjzPXdjJD4bBJcL1Hw3IFN3wPU34n4P3PHXvPhVnHWJ3HYhlHqv-HovMzgPvb2nDnnPuvPPeth3Nd3tp3Jp53BbHb134vpbk3dvOvaboLB3fPGJb3fXZnX3+Pv387PvE3zXTDfjYPo6kP4rkrXnu7eTF3AJo2yPq7wXLLF7jNWPnnN7uP0XWfj2mghPCXd9QVveqE3eEgimUAuA-ecAEgAgEo+X18rP5fFr9vgf5XsH8vVX0DkXwvFtRb7rsfWnfvUvg7j38jnDIfRvddfXFHyHFfQdJJxzcbYJEvtv8-D3Q9T3BvQbaFXHS3PHK35va3lvF1+-vv8fYnQLM3+vTvK-R3rvDh7vkfW-2jV3NThh3G6z9n+PraXov2xbB9DeaNIhqZ0+7OsZ2VnAyjPxE4+ME+9AJzjmXz4p8MeOgFGNj1cpw9eWkxa+NX2fbKsdAama+IZkkxZY-A2SOWnrB0AqZVgRrBfJOW86Z9++FlFHsFzpTuAsBtUCek5RL6RdiBfnAGhIHu7O1IBw7aAefyUqfl8BDhaTFO1v4AkaOO6UorIGgDXRNOaAuluAIX4n8l+trT-jY2UGSZMCagxun-wLYCc9+zAXQVdBRYH85+TBE9NugyCUY0gQAA",
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
