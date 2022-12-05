// const URL = "http://localhost:9696";
// const socket = io(URL, {autoConnect: false});
// socket.onAny((event, ...args) => {
//     console.log(event, args);
// });
// socket.auth = "stejs";
// socket.connect();

window.addEventListener("load", () => {
    const diameter = 20;

    const space = 6;
    const hexW = 50;

    const hexH = 58;

    const developer = checkDeveloper()

    if (developer) document.getElementsByClassName("grid")[0].setAttribute("style", "visibility: visible;")

    function checkDeveloper() {
        let name = "developer=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return (c.substring(name.length, c.length) === 'true');
            }
        }
        return "";
    }

    function newHex({q, r}) {
        const [x, y] = QRtoXY({q, r});

        const hex = document.createElement("div");

        hex.style.setProperty("--x", x + "px");
        hex.style.setProperty("--y", y + "px");
        // hex.style.setProperty("background", '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
        hex.dataset.q = q;
        hex.dataset.r = r;
        if (developer) u(hex).append(u(document.createElement("div")).addClass("hex-center").text(q + ";" + r))

        hex.classList.add("hex");
        u(".unclaimed").append(u(hex))
    }

    function randomHex() {
        const randomCoords = Math.round(Math.random() * Object.keys(hexesByCoords).length)
        return hexesByCoords[Object.keys(hexesByCoords)[randomCoords]]
    }

    function hexesAround(hexElement) {
        const q = Number(hexElement.dataset.q), r = Number(hexElement.dataset.r)
        return [
            hexesByCoords[q + ";" + (r - 1)],
            hexesByCoords[(q + 1) + ";" + (r - 1)],
            hexesByCoords[(q + 1) + ";" + r],
            hexesByCoords[q + ";" + (r + 1)],
            hexesByCoords[(q - 1) + ";" + (r + 1)],
            hexesByCoords[(q - 1) + ";" + r],
        ]
    }

    function getPossibilities(diameter) {
        let possibilities = []
        for (let x = 0; x < diameter; x++) {
            possibilities.push([diameter * (-1), x])
            possibilities.push([diameter * (-1) + x, diameter])
            possibilities.push([diameter, x * (-1)])
            possibilities.push([x, diameter - x])
            possibilities.push([diameter - x, diameter * (-1)])
            if (x !== 0) {
                possibilities.push([diameter * (-1) + x, x * (-1)])
            }
        }
        possibilities.push([0, diameter * (-1)])
        return possibilities
    }

    function QRtoXY({q, r}) {
        return [
            q * (hexH + space) * 0.75, // X
            r * (-hexW - space) + (q / -2) * (hexW + space) // Y HAHA trvalo mi to 1 sekundu
        ]
    }

    function playerFactory({id, name, color}) {
        // Player Spawn
        const playerHex = randomHex();
        playerHex.style.setProperty("background", color)
        hexesAround(playerHex).map((item) => {
            if (typeof item === "undefined") {
                return;
            }

            item.style.setProperty("background", color)

        })


        const [x, y] = QRtoXY({
            q: playerHex.dataset.q,
            r: playerHex.dataset.r,
        });

        const player = document.createElement("div")
        player.dataset.q = playerHex.dataset.q;
        player.dataset.r = playerHex.dataset.r;
        player.dataset.facing = "1";
        player.innerText = developer ? player.dataset.facing : "";
        player.classList.add("player")
        player.id = id;
        player.style.setProperty("--x", x + "px");
        player.style.setProperty("--y", y + "px");

        const update = () => {
            const [x, y] = QRtoXY({
                q: player.dataset.q,
                r: player.dataset.r,
            });

            player.style.setProperty("--x", x + "px");
            player.style.setProperty("--y", y + "px");
        }

        const setFacing = (facing) => {
            if (Number(player.dataset.facing) + facing >= 1 && Number(player.dataset.facing) + facing <= 6) {
                player.dataset.facing = String(Number(player.dataset.facing) + facing)
            }else{
                if(facing < 1) player.dataset.facing = String(Number(player.dataset.facing) + facing + 6)
                else player.dataset.facing = String(Number(player.dataset.facing) + facing - 6)
            }
            
            player.innerText = developer ? player.dataset.facing : "";

        }

        let prev = false;
        document.addEventListener("keydown", (e) => {
            if (prev) {
                return;
            }
            console.log(e)

            switch (e.key) {
                case 'a':
                    if (e.shiftKey) {
                        setFacing(-2)
                        break;
                    }
                    setFacing(-1)
                    break;

                case 'd':
                    if (e.shiftKey) {
                        setFacing(-2)
                        break;
                    }
                    setFacing(1)
                    break;

            }
            prev = true;
        })

        document.addEventListener("keyup", (e) => {
            prev = false;
        })

        u("#players").append(u(player))
    }

    function calculateNextPosition({q, r}, facing) {
        let nextPos = [0, 0]
        switch (facing) {
            case 1:
                nextPos = [q, (r - 1)]
                break;
            case 2:
                nextPos = [(q + 1), (r - 1)]
                break;
            case 3:
                nextPos = [(q + 1), r]
                break;
            case 4:
                nextPos = [q, (r + 1)]
                break;
            case 5:
                nextPos = [(q - 1), (r + 1)]
                break;
            case 6:
                nextPos = [(q - 1), r]
                break;
        }

        if (typeof hexesByCoords[nextPos[0] + ";" + nextPos[1]] === "undefined") {
            return [q, r]
        }

        return nextPos

    }

    /***
     * Generate map
     */
    u(".map #hexes").append(u(document.createElement("div")).addClass("unclaimed"))
    newHex({q: 0, r: 0})
    for (let i = 1; i < diameter + 1; i++) {
        getPossibilities(i).map((item) => {
            newHex({
                q: item[0], r: item[1],
            })
        })
    }

    /***
     * Generate map objects
     */
    const hexes = u(".map #hexes").nodes[0].children[0].children;
    let hexesByCoords = {}
    for (let hex of hexes) {
        hexesByCoords[hex.dataset.q + ";" + hex.dataset.r] = hex;
    }
    let hexesByGroup = {
        unclaimed: hexes
    }

    const playerData = {id: 1, name: "stejs", color: "#F3EFE0"}

    playerFactory(playerData);


    setInterval(() => {
        const player = document.getElementById(playerData.id);
        const [q, r] = calculateNextPosition({
            q: Number(player.dataset.q),
            r: Number(player.dataset.r),
        }, Number(player.dataset.facing));
        const [x, y] = QRtoXY({q, r});
        player.dataset.q = q;
        player.dataset.r = r;
        player.style.setProperty("--x", x + "px");
        player.style.setProperty("--y", y + "px");

    }, 200)


})

