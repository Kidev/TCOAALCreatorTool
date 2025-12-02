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
        value: "N4EwlghgNg9g5gMQE4QLYFMDuMkGsB0EIIAygMboB26AFMAERz0Bcj0U6SAnswAphkALgFck6AM4B6AA4CRY8QH0A7ADYAnPmmUmAGnoALFvQCClEF3r6wxgDLouHLroAEASRcgYlAOSCAtP74wS6YEJSCLoIw+Fb0uCwAjAAMyfpQSan6qJlp9JQs-il5MCwArFn0qsZw7Jw8AEIQZLhwSDDC5i7i3nBSAFbo0B1KXlBQ+PBMAL4AlITE5FS0DEysteP1zACyYOJkkuEWTk5aOnFGrPaODnE2rADq6OOuHl6x+gnMxdmFP-SlZgVPLVdZ1bjMJotNodLo9HQDIawYSjGDjSZwGbzIikCjUOiMGrgni7faHcw3SlnPSGOwOJx3YwAKRRkTgMBcMAAbpwXEcXC5FIpcALFOhFALoqKhRLBYpBAYBVwOh8qkTNhCoa12p0QN1eojhijFGMJlN6HMFrjlgS1mwNSS9gcjpTTtoaZdTBTGawPAqOnADJFxAZ0D5xC5laIXAAzJBgKggAD8cVB9o4mua2thevhfUkgyNqPR5stOKW+NW6ozjrJLpODmpFzplJ99G2MFQ3QgYD1UZ8etDUGkLgwoTACr5lC4CrAOgAhHEMt9KgUVyDq1stTDdfqEQWkSMTWizZiLdjFniVrTWGYLG2nj5xi44OhInOojqAEYcYKqr7-Mu-w5Ou+hrv8gLAvoaYbDWkJZjucIGgeRbHiWZ5lpeNpVmCDp8HIogSDIBEKIoqiJIkTafLk6Q0fQIH-Gu-iqJUkGVOIm4QiQOYuOgMYxugQhSOI4oURiWJWhW152rBWz8EIhFSLICmkQALAAHAAzFR8R0UBlQgcxq50WxySYdalaErhcGkgcUBgFyc4wp2On3PQADiMBeTA-jeXqqA4JQTmuCYIZOPOi7UaB9EmeUlQwcS8HQjqSH7iAYhoE5ihzoMQhgN44lxCYLCCEgwjoPoDQsMoFTmVJtqcbWdkOU57Que6za3mFtzWMYACqgZ-kNf6po1SXZrueZSOlQyoFlOWCYI+WUIV+gAHJjbwOClT2ghSBA3VcIo6lNnVV4NdZWy2ZI9mOTobWoK5xihaOwhkIqB2Rh0LiwDysboM8Tn6kg3CxjgX2iCJUAxvo+j9MYE4uHsURgGOMbgxAP0ToIHBIxEnBQMIIDoCN0FjduKW5shM2ZTo2WULlS0FaWF4WdJY3XbdrVeY9HW9b674RktOPoCAzAuPQCBziAa3CKVCYROIAAqMBrTAggACIJrEo2XZmyU8VNkg03NdMLXlzMYaz9U4emV1OjdLX3TzT2sAASkMFiuCJgiuOykX0PpG5640CGU3u+Ym-NDOLcthVndhVl2xC10HQYTiKOy8ooCG+BwGAMa68nocG5N1MZabcD04zccs5J5227JKcO2nGcQII2dpzpCV4RThvl7N0c15bNIAAIlWVFX0AAxCwADa9AAKKYCvmBxCQQxIO9UShp+acuF+EB9PQAC6+gACRJAnlkyYlqeHYo7ed7nfP0G5SsGMjyOYKGYgQ1OfYOhIE5FAYmwCvztAVLyWQuMozAJ2rnOIAF4rkzDv3NKFch6xxHueeuidb54XvunBwj8O4IIMK7egbhBDhj5FADKFgD4A0oN0MgEAeQ6FFt0dAPIUBQBRhgcQrh+R7DiPDVgpVhBQC4AAlwctBAExkegAAHgYCArIuGfUxujGAVNRAUFVD3OCfcy4YMHmbGOFsVp13LA3JOTcmqHAfk-chlCGhy1CLtecLgHhqMFjvduwQUy0WikYrcaDTGR0wRY4e1irZ4JvhzFuziyE5woa-T0asloxgEO3ZabZPKRExgAYXCJyGMLgVaoHbjACQAdkF5CDvoDiIdmDcV3HxASQlJAiUUAAJm0uaMmrSTGpSieYqu5smZxIkrY-BSS6wpOfuk84-NTDVIAF5OW8QATW+iGDooDugGBgJgAJkQpRwIPpA3+-49J0TCfrCaYzprRMmZY6Z8dZgAG5wDDEQCgDA2A8D4B9sUzs0gYDiAnMtcQNA54MAQMYMgELFCJDUIkPpyhkiqVUsoPpZREiKC5OoEAGykDqFUMorkcR3LGHrPSHq9AAASSQ+mUv0G4aqfS8hMnngwAA0sYQ+pdzBxFsJtEiRFlLyAkCoDQOltgsDyBtZgeRWXfHZaoTl3K8gAHkJ7lX0LwZV0xdCCuFREsV+gJWtPkrKpSUqlApE0K-JVar1rKv0BqzFHKqG6v0Aa5gkip4mu+NME+ZrEXItRei8iWLEiaU0ni5ImljrvQAI7KOSLgVSfTaXGC5s7TscQfVap1cwfFvL+X0CFawEVzyQDitQaKkAUgG2ITbf01Q2k3VevoKq9VbK-VcsrTywNhrQ2mvNbW4w4hpDxgUc21p7k0DoG6AuicRF52LokCGAGHdMXKPUood6EAUBCE4EoE6fbmCqD6apT1zBNLqUfSylgGkK1+qDSG41SR9AAEV57JDPvQN2LAYzQBEvoEgLACV5AeCwBgKKoAtMxfodomAWnqWmFG2drAd1buXcXZgq6xyEYUcJTdlH91vjRX049p61EXoUUgJQfTFXVVUOpJ9iR1B9O9R+nj-rmCfvoD+yef7mACfoEB5gc9VCgfA8wSDqGp6wekxUfQiHmDIbRGhmTmHsO4ZnXW+gFH0DEYcaRtdG7d1Ufs7Rw9DGT1npY1e-pnGgRqCfX09SwmNVidHWJiTRr6Bhs0oB+eiR1JKYg1B9TcGtP0B03p1DbKMOnOM3hszFmrOJTI+uizDmt3iCc-RxjbnmisfY15soPmB0sCTdq99onhPBeE6Fqdomovyb43FlTCWYNJYQ0h+gKGDOZawywHDOW53UcszasahW7OlZ6QtsroY6NHtc8x6rHmOO3o0iquD-nBNtYrSFydUmyi9YUwN1T0H6Aafg9psbE2Mv0CMzN3DkaZ1ItYCi1A0g0VqAJcodSZRNLqFxckMiIBcD9DJSkYQBbWCtxIVnchpbh0tdHVW-QfL5MWvrVaptS2Rlk-bVT7tvbVntn7YO87vq8cBvE9d8L06SfmYW-lvCK3ivrcc1t5zlW9uXrY8dHSXWpOJH0ErDnfUa0ADV+3uvvW+1VL632BfaywP1tqSMC420L0r5WdtMfPftyXN76e5d53dkD+hlOPcS5p0bunxv6c+995gs2Z2q8reofQ6uH1Pu1+doL+uWuG+s8b+zpuaMi4q7tq3Evr06Xt7uuIcm56aW1ZpZQugX0Dd-c9kbb3Pcfc1VN7LAe2XJFuwzu9YfGvfFxZHvXzADfLds4L4r5uXOW-czbzP83s93bDwS3QfTFPO45y95LqWvfpZr19rLP28OB743691BO2+JA761qP3eY+9-IybgfyeLdVfT1L1+WeiOO90HLvppfJPl-d5XtLk31-Tb9yZgwIHn5omiHmzqqnxjJrrl+mfiun3pfhtoPmLmnjVvfnbuPk-rJsBg9kNp-q9ilu9t7mvr7rNn9tzh2pTHzsYlTpIBQTmM6uoMkF5idh6q1izhWvvjLpztJnNgRg7vQLHgVvAQnlfgeinsPtbrVrevVi1lrvnp3pdp1hzhFndv1vPoNmpsNl-gQVXkQehn-nXtznlhTkbsIWtqIdtkPrfqgYdvTu6jIb5mdsfl3ldsGh-mGm+rnjFjgZoXgUvoQavvoSQYAfhjzhPgIefkVggcLmITfuLjYV5moMJhAfxgoSJq4WXmGk3rnnPmBvFr4Yvh7j-j7hvgAbwWEZgYIfzmYZRonnutflYfEQdl5sdo4QFkJooROm4WFmGi1jkT4U9oUd-ivr-sERGnhgDl7sDqDvevVupMoMmmoGUIoJpNIHAIkEgBmrgJgGQGjvQBjkdC4mkjjpqiOmzkTgiqEXQbqFQeEq2tTvcbTswU+kOqcazmOvqsoVzqEcYREXARfiIYgQ0cgSPhnrevvikVAR0SJt+l8d8I7gMW7vgcvtXkEaUf7kYfwVUXBPHuYUCbEY0Sgc0eCdxrxqkc4Z0ezt0d1jJv0eoa7lociQEaMeiSEY-kuiYXHjUduviZYSCZIZ5tIQ1qqn5u0RdukUodSVJpFlgX1rFvSbgUMTocUcQayeUb8diVsLibURYaLqnqCYKXYeUMKU1vIRSRKV0ZkR+qoeoIiYyf4boYEYZmqaZhgRyX8aYQCXiTEXyfqQKbYTSO6q0W3qKWkR1pae4eUHdrkS7oqRXsqSMSUf-hiVcWTrcU8p2g8Y2gwUwbeiwa8ewSJpwXCaoOMSfD8tMEAA",
    },
    {
        name: "empty",
        value: "",
    },
    {
        name: "win",
        value: "N4EwlghgNg9g5gMQE4QLYFMDuMkGsB0EIIAygMboB26AFMAERz0Bcj0U6SAnswLJgBnMgHpMYSgAZ8cMADN6AGnqUWAWgCMEiUoBsLNlA7dmAIQhlccJDACulEAAIBMSnAHCAVumi2BAfRAYQ3x4JiUATRYpAA4lADIWABckG3QAXwBKQmJyKloGJlY4dk4efiFRcXVpOUV6AAt9AEF7JCw6sH0HfG7env6+wYHhwbrcFk1telQ1SaUVZg0tJRgWAFZl+j0ikuMzCytbeycXN09vWBt-QODQusjmGPiklPSsolIKajpGfWLDUp8QQiMSUdSqABMNXkSkarCaAnqHC4HX0AAUqJQuA5ZDgHFxbEgHIl6rY4PVEgIAPx1GaLObKWabbYGIw8faWax2RzOVzuLw+K4BIJQEJwML0B5PegJZjJVKZbKfPI-QqswHlEFVSHQupw+gtEBtTCo1gAORgDhAF3wtKZUwWqg2UxZ-zZpnMnKOPNO-IuvmFt3F9yi+FiMpeCveOS++V+OwBxk1lUkuthzURyNN9AAwgByVAuHoAcTAADd0A4MA4XJXsEgQLalHSnZtHc7dH9duzPYduSc+edBdcRWKJVKw885a9FR9ct8Cl3E2VgSmoTIYQ1mq12kpOqx8Iej8fD3neDhEnIuOI4Hmm-RxswGS2O4zFq-VsxX67ux6Dlzjl5M4BUuEcg3HUNw1leU3iVec4zVN0NVXUEAGY0y3eFM3QFE930AAJGx6h6AARMAQEoPNEicdB0FQBwoDAXBKzAaiICrcQbESSsIDgGB70fZ81FfR0GU-b8l3dDk+0A30h1AwNRTuCJIKnGDZxjFVFwTd1k1BAAWDD9QRJEcOzEhLQASWJepxFwfFbCrbxKGoxJLQECBsTzKwIEvWRr1cO87XpNt7U7HTAWkgCfUHECAxuJTgxUx5Jwjacozg2NVUk5CKlBNYjO3I1d3ofd6BMMA4AcesQAEK0XConFWIccQHJsIlCy44jD2CpYHTCrYcr2XtooHYD-SFBKxxDFKoMjWC5yy7T1STFDxB0QqsNM3DSv0cJvHqKkHAsjASRvBx0CgARK1kZqPCuajbuoC6ICQRjOHvFsGVE5khp7f9vTGv1h0U6bkulaCZ2jZUF3jFaVzy8QAHZNoNHcTTw1h8Igepsex3GmgAQl676BoEP7mAs-t0FkWR0DISlhGuvw1miMHBoi4aAf7IDgYUqblMlVS0vU6H4OyzmEa1Sg2Y3PUM227MAHl6nxA7CYcAAeMAAD4LJgA2Dc14RdarC85DAdAQAUBxXsrAkbBpZsBp+l0KaiwHefk+LR0Fic5vShbNNhxDfz08QAE5UcNY1s3CRzcEoGBMAcSyCxegRsTcq1BGScxEmPEnQpCt3Jb-L0ebkuLJt9pKhdmtSocyrS4aQ1bEbBKQ5fTLas0x+gTsrOAbDAKBEmxMgXCES3KAoNq8wrBw+MSYmlCgCZNi+4vW1L+Hy5kmLxpBgW6-9xuMsWlvQ+XIEO-Uapu8wtHiox3bWBIS9DAcAAjdBEm4okJIICUDakgAQAkN5TBfNvD86xfplw9pXWKE0wKJQgg3EWTdL4hwpuHVMj9jLo2zPmDAbQbYO1XtMYS28GQ-hvog2SyDj613QRDeaGkYYIVwWtfBtQe4GmwjtMqTR6g4wgITShW9+olyUOTMuVNjg0zpgzdwzNWbszoVJEansq4oNBn7YWkML7By4WXPBXc+FPxMn3N+9AADqEBWKqFUBrYsqg4BUESFALgrjPHeJtnxYgaBUCsQkXUdeT5N4uzgbvNu-0K6MKPvzFhM02GBw4eLZacTb7S3UFCAADq4bMAAVeolYyyCDAC4C69g6piBJLYaiDsrQBTgD0MYkDnZfk2OJTYABHTp9A5F7wUY4JR9NGbM1QgVO4GSlqtzDjwvJ+BCkSjKhZW21EOAQAEK5MpbQ8x1SAYkchjkBA2HyfkmA11bRzKvtwu+BSin8OsWZfuNATyfK+SeOxl18n4AyOEwZCxJh3JwWXNEYAGbtXQO4fJULEgwv8PpNYBVVlx0ctgewnAWqyAcDHLATgIAp2am5fiHTIlTAiUJSl8xBm9Nib+Bhh93CiMMMnWilA-BkFsvkxF1B2YAA1hYTgjmC0xe9IXQraHChFSK-CoQhFHdFLyiH92+RqzVWrNUUppWJGJ4U97MqBsINlsBMCcu5by-l6AhUitDGKsW8zr7uilYimVwh4XSthQqpVKznm2N4J5UR+TwFAtpW+Wh7ttFILOGajlVArVgD5XYW1gthUYNFeKiWe88HLJVVYtVtilaqBgKrREoSNbxxsHmNottMAQGYmEpQgkokRoZYa7JxqvbxotYmnlyabV2szQ6pQvAKZogvCgVi7hgEvz8BCaoBaABeLAADaa65jaCRssCQABdBQa7tDHoUPuvd2asmLMef6iUxlBHZl+YYG2ZT2XEktM0sl95NGRRjYk1l7AE1coHSmgV6b7UpQjmOidU7HGMzncaBdS6A1mmg0gPOM7hA7O2n4fNAbV3MA3doLdp6D2buWMRs9mQADc4AfCIBQBgesBBrqJBzDAVAVyBCsSqZQAQNA10MAQPoSeHGcNIx0Iq-S6hoioqRqhVCfgR76T6VANYEISR1GLPoUEEg6j4QmBCaIUxLIsCRhCKYAApddDAADS+hv6-pAHUAAMg8kQl4vGwvUAum9dRx2PCUChgL9B9NPkM8Z0z5mlBK3mkoNEUQ0gKFs-oAQ+SkCsXQC5imxY0CVlS+l7iqi0sZYEIiWiiQcMQgAB7RCta9fOnB-AowLf5yY4YgtTFCxHHQSgTPMG69F2L9B4tPiUAARXXRHVCCgI76Rm2sA99AABKQ2SAsAhBsJQdiWAMEnldAzShrCYDkdENIiXkusHyxlrLZccvViu4VpmxXCtlb-pVmrdWUAM0a34ZrAbWvqDU4F9YhmlBdZ6-QPrA36AxcDnF9b4313RHUAoaIEJUeoUWytuHA91ubfsTt+ge25F5MO8nE7Z2kv0Ds5d57mWlCudu7lpwdOisFdha9ireSPs8vq99sBv3fNQf6xDoL+kjNg5YNDqHEPYcwXh8wab9AJsEamzNubEcFtKGx-L3HzANtTG28wXbQQSfo-oEdin53qcpbpzdved28us6e+z0rZS3vc9q7zr7AD-DSaF-QVrEdzcdcl8wcXvWpey6GyNubyukdzeiD1mTWPVt48N4T4nB2Lfk5YKd63NOhl24Z9l5nD3YUu5K5z97XvRE+5+2zFrExAch5YBHkLbfwwy8GzjkbaxEcEeiEjVHsRogR1Tzjtb+v8dG5N-tsLZPjt57O+eqnQnWAifyWJnQEId2oVmxIMfSM-BwFkFVzAuB8lVZgDtLTrBQTqD0wZ6XkXLPWZt7T9n9vsmO5Z67yvL27uXO1WtefOvuguTelK7WUQYeL+IuPeuuI2UwKua6aus282E+uuU+BuW2mepu2eluy+BetuX+JeTO92zu5ebu5WNen2DWAuf2EoAOQO9AQWam4Y4Oke8BMOMeEwA+a6yOqO6O0QmO2uae0+GexuRO+BC+OeS+zA+eVOhe5e3+v4v+VBABHOQBtB3u9BTWAe-m0OYuEuHe3B3ePBveCO8equ026BmumBrwSg2BM+eB8+pOchVuShJB12ZBDuZelBrO1enudB-Ofuje-2EwwewOwWoW7e5hcujhw2LASuKB0QieyeWuy24hOBBOUhWeshhBChlOF2RepB9AjOfhFB-+VBQRIBIR4B4RTBzeLBxhYecRUeCBiRse-BQ+I+qO4+Yhk+6euBeRMh7hhRihJRDm3M9gqhN8bqSKnqcqMqfgOgOgaKERwWoepheScBZmUwCRqQCugOaQq+gmwm7GW+6g4mu+Eg+kweqKh+Cq+SawfSqAu+DMmm2m2oEIT+YWexUW9AVmBGJRKhvhP+-h1RgR2hwRuhoREBmxbW0RnWHRkOqJhx6ACuyBk2thGumROuiRzhkhc+Zui+nhoJxe5RpeVRJWmh1BHudRcJ4BjBfmzRreX4oOphcB0OGJxxPRKOaOGODhRxeuORs+0hbh5uExxRH+pRPhVJ5BTuUJrutRPOdeehCJTR3BxhKJZh6JvB+u-BaBeJwpmJopLhoxkpZJRBXhn+8pFREJNJj2NRMJjJ6p8J-ukB6gURrBMBph7R3BvJSRiuPR6RqO+J2RFpJJBBueRRxBdp3Ecx7o6hARKprpapYBDeBhbJ0R7esRXe+plh4ePRw+0Qo+AxWRQxEhIx0ZBRsZkxsp0xCSTm4Jv4CxHqXq7qPqawcm2ZWxfpoWuxEOfW+xnRIpI26gOgpx1u6+0hom1xO+e+EcY++kO+fg+kHgEgKQZYqEVWjQSgd+9AoIvxYeQ5XBo5QJ7+yhlJDpahkJtJLpNBsJ7pzJfZSJvpMRqJ8RBp2JNh6uGBgxWBwxuRtZ4x9ZMp15ZRt5N8KZypVe6ZoB9eDBb5Le0R7BsBw5hZiBfB1hAhApwhohlZQF1ZIFEppJHhNpFJUF1JSpD50JT5bpmZyFkBRhneup3J0eRZ5uKBxpAFRFhJwF4p+RYF8hDZkF9pNFf+dFaZDFGZSFYRb5Pp2x+ZXBPJBpKRCeqOGRppThglrh5F0p8ZcpiZrZMF95zp9FDJclGpjRrJT4qFH5eZneqlnF2FxZuFvRZZ-ROl5pxJZFMZolEF9mjmSZgI7ZFenZ8qUmtlwuUwylz+mFzAF5QZE5+k05a+Fx85NxO6+kEg6gqEaR+kfgsgqAHgHgZ+sgSqXx9+4gqEfxZ5aJSVgJwJAmspYJCplRtFFlMlVliFGpLJwu758VepgZP5RpuJfFBJIpRJNZ-ldZgVRl7V0FyZ5lFej5vV9RP2A1geOZH56FXJiValRZKOHl+FQpgFAlJFQlYxUp4Fi1N5klGh61wB1l8J21hhoubFGFLlY5ZpI23FOJ-59hF101ellpBld1tpxl9OHVjpXVa1llL1fVHpMVO1T4SlA5zljVR1blGlg+YZKeINZpM1pFwlt1C1UNS1j1qZ8FslyNDRKFLRWNKl2NrlXRbeJZfRY+PlJN11VpFFcZUNTZB8oVxg4Vsq3q-gSeqN-mcVmN-xiVyVBpYqZx9As5m+2+txuViqqEOgEcfgEgRAcAqAcAZYiQAyB53xlA+k9VSqitzVV53hJlsNd5TpCNPVSNm1zFiJWg0Bn5I1ON7NwWPFE1wN-FoNV1+lAV5JbVD1ipUl3VtNG1TJW1jN7J+1nBrNv1fJp1Qh514dxNYNoF5NMd4lzty1gIsF0lSdntKd3tWprF4eJhmd35XF41QNEZVZYpUd81pdTtMNFdxgVdidgBdNXtClXpGN-tAZgd45yRoZWl4ZPNRdc1IlfdCZA91NcFo9ydL5WZXpDlrR-pBZo1RZceqRpZ5Zy9kd4N0dlFjZIVplrqyxEVL9-gBVfZct-tDVI5gJKVpm6V5xG+lxmtOVEgOgMmyOJ+UAEAOMUAy6OgMNh5+UttAJb+IJsd1F8dT1iNOhe99ddlQ18tHF2dwZv5qBodndxF3dt9vd99Zdm92DNNO9td+D+hB9TNHJHBX5WFQdJ1qRZ1Ih19NDxd1pgtVFElTD29WhY9dd7Dmxjd4u7Fh1bNc9hpuFvFYdU1hdN9ojAtYl-dotPAw97tNdeDTFE9iJU9upM9qjf189HlBNVDl1Ijq9Jd9DhjT9ldq1bOZjz5FjfgMtu1R9LNrdbl59SOl93lRNulujbjYjBjrAwt0URjzA4tSxktOG4Dn9yJp5dt55f9BpU5Qtj9Lt8xb9GTXZ79QT-Z39+TjVStRZSMgDatmVVx2VdxEgEcSM+kcmimMASMXAiQEIrENtltNVlAegeTaDSgLVEj5dW91dLD5j8lmphDvtuTB1P1Fhbl5DmjzjEdrjZNCTQVG9qTJjvjyz-jqz71wTIO3DAddjOdAjedQjMTvls1xz+jpz0N5zPjdJqp9NqdLFn1Tdyj2z-96jIdHdwjUZ8T3z91WDnVCdpjVzjFqznpVj7JNjJ9s99jIZjji9hNBdsTRzN1JziLkjyLODHtKzNladuZDztjpD3RHlUT3N7zvNPda9HjSTpTg9PA6TkVKxmgG0kBX9upP9r+LLLAxTUx-LE6FTwrPqy5yqmxEr0z9tBxBpp2qt6tIDC5Wt6guV0m+tqAZAaw389Qsgk8dV4zR5yMqDWrszjtZzXjQ9-zz1dLb1b5GzH54LWdOzQdezlDsLflXzhllNcd1LzDMju9ATtz9lnDGdPDp9bl-DSOgjhF2jpLcLEbkN8zjDMb0j9JrDCbfZijzdqbeLCuANf5dhBzOjZL-NkbhbfzbtlzcbZbGLNT3p2LbRuLTzwZeNAhTjYbnz5LCLUbSLcNKLnbpb3rDNHD7JTlTdELBpETg+7LFZObHzpNk7rbD9MxLZZTz9ktlT8qu+NTGrOx9Tv92rRZawRlyT3oqTQrb9fgqrOT-rmrBTD7blurM5bToDdx1xPZ4Dv2wet0u5NgJ7yD4g0QTrf7LrGDDD7b8N87gL49azg1frw1JDQbajIbMLnLK9+bFNbb7rxjnruD1z-VDLe1nJLdvDajGbg+Wb47+7LbBbmDVLs7NLfj6L9HILjLAbYTQddbFDJHJLe7fNENFHvHCzUjSzXbi7P2mLWpfbmzoTLH+LI7aRRLjbub4bB7PHaHVHzAFzALCF2Hvbh9zNWN4najm7Ah27nHcnd94jR7zZb7SrH7V737w1UrTV-7QdT7JTx7vn57yr1TgX8twXjTblzTerwHhrOV5mOgxrEgfgtSZAZYcA0QcAFt9A8HlAEcSHDTDtqHnjp73jHb1nsjbDOHaNRD-tBHkLxHDb7n3L7jXn5ntXHr9XXrdHPry7aFTH1bQ7E5-Jrz2bkZJn3HCn-XArlnNHtLI3r5InjlVbjzMrULgNXXpHcT5H69vzFnVnw3QnKNil-bx967RZ+nY7R3zb8np3VNynI9qnG3+9iJ9na7d3gbkLLnnlV9z3ebpnS3wVkXFn77mTH94r2nCVyHhH+LzTEXPnMPfnmTSMY+cXdTMzKPxxEgLT+rWVi5dxEI+k9xrMC6VWqEIA+kEA+kXA381VDrncFX97KHrVy3izn3C733BDuHh+iPu3hPZD7dh3MnXLtDPLfXNXK3F3tHV3m3v3ybE3YvkLbHeFs33XsvvXiTZ3A31HQ3yvr1qvDdoLSj31gPBpkn+zevejh7vPH3qLX3Kv6nvb1jA793uNC9SeS9YPC3r3vLRviva3gn5vP3mnf3q7zL4vrLF9XNO783E7i3p3L73IUXVTF7KxX7CPP7t7BPkLp26PItmP0XH7OParWpN7g5d70rCfG8JPqXHT+ku+qE1x2XNgUAuA++cAEgAgEopX98nPjfczinRb-HsbAvHvQvLXeHxDKje3nXJpQfafIf8vbrxvq3pv63c-8jMf6vDz7XBp2vghgpbz0vZHEPb30b0-JbWHcjzXH1onNvTn+L9vob6-XHm-hv73xbFTrPyj4C4NOhDb3gDw-4K5HuhnR3vC2d4K8+ebvYAUCwFx2dOGcfQdnt2B5ucf+HnOhlv3oCZ9ZiFfHPjF1+z3E8ekrBviFz273wW+wDMnlrTWJ20FMawSgLIBsCaB8kG5Nng-hPJF9nWl5arny2h479mU7gYgbVBwzdMqBv7SrqFyI6UslOgA-nk-ya41MdAZmaItJn7yQDdOzzddPukGKyBoA10Yzhv087-97+rtDDg13jarNNBlPHQTJh962826uFObswFMFXQm24PdPkQXPR7oMgVGNIEAA",
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
