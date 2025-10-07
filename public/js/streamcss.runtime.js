// streamcss.runtime.js
export var streamCSS = {
    component: { scene: null }
}
export function setBot(newBot, onChange = null) {
    streamCSS.component.bot = newBot;
    console.log("set Bot");
    onChange?.call(this, newBot);
}
export function getBot() {
    return streamCSS.component.bot;
}
async function updateSegment(el, file) {
    if (file == undefined) {
        console.dir(window.segmentData);
        const sgements = window.segmentData.filter(seg => { return seg.fullFild == false });
        const seg = (sgements[0]);
        el.querySelector(".seg-name").innerText = seg.name;
        el.querySelector(".seg-desc").innerText = seg.description;

    } else {
        getSegmentsData(file, (seg) => {
            el.querySelector(".seg-name").innerText = seg.name;
            el.querySelector(".seg-desc").innerText = seg.description;
        }, (err) => {
            console.error(err);
        })
    }
}
export function getSegmentsData(file, onSuccess, onError) {
    const url = file.includes("/") ? file : `../data/Library/${file}`;

    const task = (async () => {
        try {
            const res = await fetch(url, {
                method: "GET",
                headers: { "Accept": "application/json" },
                cache: "no-cache"
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status} ${res.statusText} while fetching ${url}`);
            }

            // On lit en texte puis on parse nous-même pour être tolérant
            const text = await res.text();
            let parsed;
            try {
                parsed = JSON.parse(text);
            } catch (e) {
                throw new Error(`Invalid JSON in ${url}: ${e.message}`);
            }

            // Accepte soit un tableau direct, soit un objet { data: ... }
            const dataRaw = Array.isArray(parsed)
                ? parsed
                : (typeof parsed.data === "string" ? JSON.parse(parsed.data) : parsed.data);

            if (!Array.isArray(dataRaw)) {
                throw new Error(`Invalid format: expected an array of segments, got ${typeof dataRaw}`);
            }

            // Mémorisation globale (si tu veux absolument conserver ce comportement)
            window.segmentData = dataRaw;

            // Choisit le premier segment non "fullFild", sinon le premier
            const currentSeg = dataRaw.find(seg => seg.fullFild === false) ?? dataRaw[0];
            return currentSeg;

        } catch (err) {
            throw err;
        }
    })();

    // Support des callbacks si fournis
    task.then(seg => onSuccess?.(seg)).catch(err => onError?.(err));

    // …et on retourne aussi la Promise pour un usage moderne
    return task;
}

export function applyStreamData(timing) {
    parseTag();
    getLiveData();
    setInterval(getLiveData, timing * 1000);
}

export function animElements(elements, animName, timing) {
    let index = 0;
    const parent = elements[0].parentNode;

    const setupStyles = (el, styles) => Object.assign(el.style, styles);

    const applyCommonStyles = (el) => {
        setupStyles(el, {
            display: "block",
            width: "100%",
            position: "absolute",
            transition: ".7s"
        });
        el.parentNode.style.position = "relative";
        el.parentNode.style.overflow = "hidden";
    };

    if (animName === "sliders") {
        elements.forEach(el => {
            applyCommonStyles(el);
            el.style.left = "100%";
        });

        parent.intervalAnime = setInterval(() => {
            elements.forEach(el => el.style.left = "100%");
            elements[index].style.left = "0";
            index = (index + 1) % elements.length;
        }, timing * 1000);

    } else if (animName === "fade") {
        elements.forEach(el => {
            applyCommonStyles(el);
            el.style.opacity = 0;
            el.style.background = "#336";
        });

        parent.intervalAnime = setInterval(() => {
            elements.forEach(el => el.style.opacity = 0);
            elements[index].style.opacity = 1;
            index = (index + 1) % elements.length;
        }, timing * 1000);
    }
}

function parseTag() {
    document.querySelectorAll("data-source").forEach(el => {
        const span = document.createElement("span");
        span.dataset.source = el.innerText;

        const format = el.getAttribute("format");
        const label = el.getAttribute("label");
        const animate = el.getAttribute("animate");
        if (label) span.setAttribute("label", label);
        if (format) span.setAttribute("format", format);
        if (animate) span.setAttribute("animate", animate);

        el.replaceWith(span);
        formatAnimTag(); // Assumes function is defined elsewhere
    });
}

function setCounter(component) {
    let value = parseInt(component.getAttribute("initialValue"), 10) || 0;
    const incrKey = component.getAttribute("incr");
    const decrKey = component.getAttribute("decr");
    const display = document.createElement("span");
    display.innerText = value;

    document.addEventListener("keyup", (e) => {
        if (e.keyCode === 107 && incrKey === "+") value++;
        if (e.keyCode === 109 && decrKey === "-") value--;
        display.innerText = value;
    });

    component.appendChild(display);
}

function setSound(el, soundIndex) {
    if (el.propAnim[soundIndex] != undefined) {
        let snd = el.propAnim[soundIndex].split(' ');
        let audio = document.createElement("audio");
        audio.src = snd[0];

        if (snd[1] != undefined) {
            let during = snd[1].substring(0, snd[1].length - 1)
            console.log(during);
            setTimeout(() => {
                el.appendChild(audio)
                audio.play();
            }, during * 1000);
        } else {
            el.appendChild(audio)
            audio.play();
        }
    }
}
function launchAlertAnimation(el, during = 5) {
    // Annuler si déjà en animation
    if (el._alertRunning) return;

    el._alertRunning = true;

    const toClassList = cls => cls?.split(",").map(c => c.trim()).filter(Boolean) ?? [];

    const enterClasses = toClassList(el.propAnim.onEnter);
    const alertClasses = toClassList(el.propAnim.onAlert);
    const leaveClasses = toClassList(el.propAnim.onLeave);

    if (enterClasses.length) el.classList.add(...enterClasses);
    setSound(el, "soundEnter");


    const onEnterEnd = () => {
        el.removeEventListener("animationend", onEnterEnd);
        if (enterClasses.length) el.classList.remove(...enterClasses);

        if (alertClasses.length) el.classList.add(...alertClasses);
        setSound(el, "soundAlert");
        setTimeout(() => {
            if (alertClasses.length) el.classList.remove(...alertClasses);

            if (leaveClasses.length) {
                el.classList.add(...leaveClasses);

                el.addEventListener("animationend", function onLeaveEnd() {
                    el.removeEventListener("animationend", onLeaveEnd);
                    el._alertRunning = false;
                    setSound(el, "soundLeave");
                    // el.remove(); // ou el.style.display = "none";
                });
            } else {
                el._alertRunning = false;
                //  el.remove();
            }
        }, during * 1000);
    };

    el.addEventListener("animationend", onEnterEnd);
}




export function clipDiffuse(url, duration) {
    if (document.getElementById("clipDiffuse") != undefined) {
        return false;
    }
    const iframe = document.createElement("iframe");
    let del = document.createElement("span");
    del.classList.add("closeBtn");
    del.innerText = "X";
    iframe.id = "clipDiffuse";
    iframe.src = url;
    iframe.autoplay = true;
    del.onclick = function () {
        iframe.remove();
        this.remove();
    }
    document.querySelector("[clip_displayer]").appendChild(iframe);
    setTimeout(() => {
        document.querySelector("[clip_displayer]").appendChild(del);
    }, duration * 1000);

}
function setChatDisplayer(chat) {
    let divs = chat.querySelectorAll("div");
    if (divs.length > 5) {
        divs[0].remove();
    }
}
async function getDatas(success, failed) {
    try {
        fetch("/api/data")
            .then(r => { return r.json() })
            .then(result => {
                success.call(this, result);
            })
    } catch (err) {
        failed?.call(this, err)
    }
}
function isNotExist(el,fnc){
    if(el!=undefined){
        fnc();
    }
}
export function applyStreamCSS(bot, styleSelector = 'style[type="streamcss"]') {
    if (bot == undefined)
        console.log("no bot")
    console.log("apply StreamCSS");
    const rules = {
        "stream-label": (el, val) => {
            const label = document.createElement("span");
            label.innerText = val;
            el.appendChild(label);
        },
        "stream-compoment": (el, val, props) => {
            const propMap = Object.fromEntries(props.map(p => p.split(":").map(s => s.trim())));

            switch (val) {
                case "liveMessage": {
                    let timer = propMap["duration"] ? propMap["duration"] : 5;
                    getDatas((data) => {
                        el.classList.add("liveMessage");
                        el.innerHTML =`<span>${data.message}</span>` ;
                    }, (err) => {
                        console.error(err);
                    });
                    streamCSS.component.intervalMessage = setInterval(() => {
                        getDatas((data) => {
                           el.innerHTML =`<span>${data.message}</span>` ;
                        }, (err) => {
                            console.error(err);
                        });
                    }, timer * 1000);
                    break;
                }

                case "wheel": {
                    let span = document.createElement("span");
                    let canvas = document.createElement("canvas");
                    canvas.width = 300;
                    canvas.height = 300;
                    let spinButton = document.createElement("div");
                    el.appendChild(span);
                    el.appendChild(canvas);
                    el.appendChild(spinButton);
                    const wheelObject = new Wheel(canvas, spinButton, span, "../data/wheel.json");
                    streamOverlay.wheel = wheelObject;
                    wheelObject.start();
                    break;
                }

                case "segment-progress": {
                   /* if (el.querySelector("h2") == undefined) {
                        let title = document.createElement("h2");
                         title.innerText = propMap["title"] ? propMap["title"] : "Segments";
                        el.appendChild(title);
                    }*/
                    isNotExist(el.querySelector("h2"),()=>{
                        title.innerText = propMap["title"] ? propMap["title"] : "Segments";
                        el.appendChild(title);
                    })
                    if (propMap["segments"] == undefined) {
                        console.error("segments File Missing");
                    } else {
                        let file = propMap["segments"];
                        let timer = (propMap["timing"]) ? propMap["timing"] : 5;

                        getSegmentsData(file, (seg) => {
                            if (el.querySelector(".seg-name") == undefined) {
                                let name = document.createElement("span");
                                name.classList.add("seg-name");
                                name.innerText = seg.name;
                                el.appendChild(name);
                            }
                            if (el.querySelector(".seg-desc") == undefined) {
                                let desc = document.createElement("p");
                                desc.classList.add("seg-desc");
                                desc.innerText = seg.description;
                                el.appendChild(desc);
                            }

                            if (propMap["data-display"] != undefined) {
                                console.dir(propMap["data-display"]);
                                const dataDisplay = propMap["data-display"].split(",");
                                let dataEl = el.querySelector(".seg-data") || document.createElement("ul");
                                dataEl.classList.add("seg-data");
                                dataEl.innerHTML = ""; // vide avant de remplir (évite les doublons)
                                dataDisplay.forEach(key => {
                                    console.log("element", key);
                                    console.dir(seg.data[key]);
                                    let item = document.createElement("li");
                                    item.innerText = seg.data[key];
                                    dataEl.appendChild(item);
                                });

                                if (!el.querySelector(".seg-data")) {
                                    el.appendChild(dataEl);
                                }
                            }

                            // L'interval doit toujours démarrer (qu'il y ait data-display ou non)
                            let segInt = setInterval(() => {
                                updateSegment(el, file);
                            }, timer * 1000);
                        }, (err) => {
                            console.error(err);
                        });
                    }

                    if (propMap.nextCMD && typeof bot !== "undefined" && bot)
                        bot.setCommand(propMap.nextCMD, (args, tag, channel) => {
                            if (tag.username !== channel.substring(1)) {
                                bot.message(`/me vous n'avez pas accès à cette commande`);
                                return;
                            }
                            bot.message(`/me segment suivant`);
                            const index = window.segmentData.findIndex(seg => seg.fullFild === false);

                            if (index !== -1) {
                                window.segmentData[index].fullFild = true;
                            }

                            updateSegment(el);
                        });

                    break;
                }

                case 'chat': {
                    if (el.querySelector("h2") == undefined) {
                        let title = document.createElement("h2");
                        title.innerText = (propMap["chat-label"]) ? propMap["chat-label"] : "chat";
                        el.appendChild(title);
                    }
                    if (bot) {
                        bot.onMessage((tag, message) => {
                            setChatDisplayer(el);
                            let msgContainer = document.createElement("div");
                            msgContainer.style.display = 'flex';
                            msgContainer.innerHTML = `<span>${tag.username}</span><span>${message}</span>`;
                            getDatas((data) => {
                                if (data.chatState == "hide") {
                                    el.style.display = "none";
                                } else {
                                    console.log("no chat State");
                                }
                            }, (err) => {
                                console.error(err);
                            });
                            el.appendChild(msgContainer);
                        });
                        if (propMap.hideCmd)
                            bot.setCommand(propMap.hideCmd, (args, tag, channel) => {
                                if (tag.username !== channel.substring(1)) {
                                    bot.message(`/me vous n'avez pas accès à cette commande`);
                                    return;
                                }
                                el.style.display = "none";
                            });
                        if (propMap.displayCmd)
                            bot.setCommand(propMap.displayCmd, (args, tag, channel) => {
                                if (tag.username !== channel.substring(1)) {
                                    bot.message(`/me vous n'avez pas accès à cette commande`);
                                    return;
                                }
                                el.style.display = "flex";
                            });
                    }
                    break;
                }

                case "widget": {
                    if (propMap.showCompoment && propMap.showCompoment !== "onload") {
                        el.style.display = "none";

                        if (propMap.showCompoment === "oncmd" && propMap.displayCmd) {
                            if (bot)
                                bot.setCommand(propMap.displayCmd, (args, tag, channel) => {
                                    if (tag.username !== channel.substring(1)) {
                                        bot.message(`/me vous n'avez pas accès à cette commande`);
                                        return;
                                    }
                                    el.style.display = "block";
                                });
                        }

                        if (propMap.showCompoment === "oncmd" && propMap.hideCmd) {
                            if (bot)
                                bot.setCommand(propMap.hideCmd, (args, tag, channel) => {
                                    if (tag.username !== channel.substring(1)) {
                                        bot.message(`/me vous n'avez pas accès à cette commande`);
                                        return;
                                    }
                                    bot.message(`/me vous masquez ce composant`);
                                    el.style.display = "none";
                                });
                        }
                    }
                    break;
                }

                case "alert": {
                    Object.assign(el.style, {
                        width: "25%",
                        aspectRatio: "16/9",
                        margin: "0 auto"
                    });
                    console.log("Displayer");
                    console.dir(el);
                    const during = parseInt(propMap.duration) || 5;
                    const sounds = propMap.sound;
                    console.dir(propMap);
                    el.triggerEvent = false; // ne se lance pas automatiquement
                    el._alertRunning = false;
                    el.propAnim = propMap;
                    // Prépare la fonction trigger manuelle
                    el.trigger = () => {
                        if (!el._alertRunning) {
                            launchAlertAnimation(el, during);
                        }
                    };

                    break;
                }

                case "clip": {
                    Object.assign(el.style, {
                        width: "360px",
                        aspectRatio: "16/9"
                    });
                    el.setAttribute("clip_displayer", "1");
                    break;
                }

                case "counter": {
                    el.style.width = "15%";
                    el.style.aspectRatio = "16/9";
                    setCounter(el);
                    break;
                }
            }
        },

        "stream-default": (el, val) => {
            if (val === "true") {
                Object.assign(el.style, {
                    margin: "0",
                    padding: "0",
                    overflow: "hidden",
                    width: "100%",
                    height: "60px",
                    fontFamily: "Calibri"
                });
            }
        }, "stream-overlay": (el, val) => {
            if (val === "true") {
                Object.assign(el.style, {
                    margin: "0",
                    padding: "0",
                    overflow: "hidden",
                    width: "100%",
                    height: "100%",
                    fontFamily: "Calibri"
                });
            }
        },
        "stream-height": (el, val) => {
            el.style.height = val;
        },
        "fix-areas": (el, val) => {
            let params = new URLSearchParams(window.location.search);
            let sceneName = params.get('scene');
            streamOverlay.sceneName = sceneName;
            let cssParams = val.split("-");
            let sceneParam = cssParams[0];

            if (sceneName == sceneParam) {
                Object.assign(el.style, {
                    gridTemplateAreas: `${cssParams[1]}`
                });
                let areas = cssParams[1]
                    .replace(/"/g, "")       // enlève tous les guillemets
                    .split(/\s+/)            // split par espaces
                    .filter(a => a.trim() !== ""); // enlève les vides
                document.querySelectorAll("[g_area]").forEach(el => {
                    let a = el.getAttribute("g_area");
                    if (!areas.includes(a)) {
                        el.style.display = "none";
                    }
                });
                let sceneEl = document.querySelectorAll("[scene]");
                sceneEl.forEach(el => {
                    console.log(el.getAttribute("scene"))
                    if (el.getAttribute("scene") != sceneName)
                        el.style.display = "none";
                })
            }

        },
        "fix-grid": (el, val) => {
            console.log(val);
            Object.assign(el.style, {
                display: "grid",
                gridTemplateAreas: `${val}`
            });
            el.style.gridTemplateAreas = `${val}`;
            document.querySelectorAll("[g_area]").forEach(el => {
                el.style["grid-area"] = el.getAttribute("g_area");
            });
        },
        "fix-flex": (el, val) => {
            const [direction, justify] = val.split(" ");
            Object.assign(el.style, {
                display: "flex",
                flexDirection: direction,
                justifyContent: justify
            });
        },
        "fix-overflow": (el, val) => {
            if (val === "true") {
                Object.assign(el.style, {
                    overflow: "hidden",
                    width: "100%",
                    height: "60px"
                });
            }
        },
        "clock-format": (el) => {
            const updateTime = () => {
                const d = new Date();
                el.textContent = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
            };
            updateTime();
            el._clockInterval = setInterval(updateTime, 1000);
        },
        "auto-refresh": (el, val) => {
            const delay = parseInt(val);
            if (!el._autoRefresh) {
                el._autoRefresh = setInterval(() => {
                    el.dispatchEvent(new CustomEvent("refresh"));
                }, delay);
            }
        }
    };

    const parseRules = () => {
        const link = document.createElement("link");
        link.href = "../css/streamcss.runtime.css";
        link.rel = "stylesheet";
        document.head.appendChild(link);

        const styleTag = document.querySelector(styleSelector);
        if (!styleTag) return;

        const raw = styleTag.innerHTML;
        const blocks = raw.split("}").map(b => b.trim()).filter(Boolean);

        blocks.forEach(block => {
            const [selector, propString] = block.split("{").map(x => x.trim());
            const elements = document.querySelectorAll(selector);
            if (!elements.length) return;

            const props = propString.split(";").map(p => p.trim()).filter(Boolean);
            props.forEach(rule => {
                const [key, value] = rule.split(":").map(x => x.trim());
                if (rules[key]) {
                    elements.forEach(el => rules[key](el, value, props));
                }
            });
        });
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", parseRules);
    } else {
        parseRules();
    }
}
