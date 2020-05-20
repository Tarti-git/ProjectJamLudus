var setCollide = function(x, y, event) {
    let k = makePosKey(x, y);
    if (event.hasOwnProperty("name")) {
        for (let key in Pos2EventMap) {
            if (Pos2EventMap[key].hasOwnProperty("name")) {
                if (Pos2EventMap[key].name == event.name) {
                    makeKeyPos(key);
                    delete Pos2EventMap[key];
                }
            }
        }
    }

    if (Pos2EventMap[k] != null) {
        if (Pos2EventMap[k].hasOwnProperty("name")) {
            if (event.name != "body0" && event.type == "body" && Pos2EventMap[k].type != "portal") {
                delete EmptyPos[k]
                Pos2EventMap[k] = event;
                return;
            }
        }
        return;
    }
    delete EmptyPos[k]
    Pos2EventMap[k] = event;
}

var getEventByKey = function(x, y) {
    let k = makePosKey(x, y);
    return Pos2EventMap[k];

}

var checkCollide = function(x, y) {
    return Pos2EventMap[makePosKey(x, y)]
}

var resetCollide = function() {
    Pos2EventMap = {};
}

var resetBodyCol = function() {
    for (let key in Pos2EventMap) {
        if (Pos2EventMap[key].type == "body") {
            delete Pos2EventMap[key];
            makeKeyPos[key];
        }
    }
}


function getRandom(max, min) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

var randomEmptyPos = function() {
    let keys = Object.keys(EmptyPos);
    let randomNum = getRandom(keys.length - 1, 0);
    let key = keys[randomNum];
    return EmptyPos[key];
}

var collide = {
    setCollide: setCollide,
    checkCollide: checkCollide,
    resetCollide: resetCollide,
    randomEmptyPos: randomEmptyPos,
    resetBodyCol: resetBodyCol,
    getEventByKey: getEventByKey
}
module.exports = collide;