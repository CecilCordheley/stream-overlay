/**
 * Récupère les données de stream (ex: donator, follower, subscriber, etc.)
 * en lisant un fichier côté serveur via Express (anciennement via ajax.php).
 */
async function getStreamData(key, success) {
    try {
        const response = await fetch(`/data/label/${key}.txt`);
        if (!response.ok) throw new Error(`Fichier ${key}.txt non trouvé`);
        const data = await response.text();
        success.call(this, data);
    } catch (error) {
        console.error(`Erreur lors de la récupération de "${key}":`, error);
        return '';
    }
}

async function updateDataCompoment(key) {
    try {
        getStreamData(key, (data) => {
            let c = document.querySelector("[data-source=" + key + "]");
            if (c) {
                let info = data.split(":");
                let label = c.getAttribute("label")
                c.innerText = label + " : " + data;
            }
        })
    } catch (err) {
        console.error(`Erreur lors de la récupération de "${key}":`, error);
    }
}
function getInformation() { }
function updateData() {

    // Met à jour tous les éléments <data-source> dynamiquement
    document.querySelectorAll('[data-source]').forEach(async (el) => {
        const key = el.getAttribute("data-source");
        console.log(key);
        const value = await getStreamData(key, (data) => {
            let c = document.querySelector("[data-source=" + key + "]");
            console.dir(c);
            if (c) {
                // console.log(data);
                let label = c.label
                c.innerText = label + " : " + data;
            } else {
                console.error("no compoment")
            }
        });

    });
}
function setAnimation(el, anime) {
    let animArr = {
        "slideLeft": function (el, transition, timing) {
            el.parentNode.style.position = "relative";
            el.parentNode.style.overflow = "hidden";
            el.style.position = "absolute";
            el.style.left = "100%";
            el.style.transition = transition;
            el.intervalAnime = setInterval(() => {
                if (el.style.left == "0px")
                    el.style.left = "100%";
                else
                    el.style.left = 0
            }, timing * 1000);
        }
    }
    animArr[anime[0]](el, anime[1], anime[2]);
}
function formatAnimTag() {
    document.querySelectorAll('[animate]').forEach(el => {
        let animAttr = el.getAttribute("animate").split(" ");
        setAnimation(el, animAttr);
    })
}
function formatTag() {
    document.querySelectorAll("[format]").forEach(el => {
        let format = el.getAttribute("format").split("/");
        let pattern = new RegExp(format[0], 'gm');
        let replace = format[1];

        const result = el.innerText.replace(pattern, (_, ...groups) => {
            // Remplace $1, $2, etc. dans la chaîne `replace`
            return replace.replace(/\$(\d+)/g, (_, index) => groups[+index - 1] || '');
        });

        el.innerText = result;

    });
}
async function getLiveData() {
    /*  let keys = ["liveName", "streamer", "jeux", "categorie"]
      fetch("../AJAX.php?info=data")
          .then(r => r.json())
          .then(result => {
              for (var k in asyncKeys) {
                  let component = document.querySelector(`[data-source=${k}]`);
                  let data = result[asyncKeys[k]];
                  component.innerText = `${data}`;
                  formatTag();
                  
              }
          })
          .catch(err => console.error(err));*/
}