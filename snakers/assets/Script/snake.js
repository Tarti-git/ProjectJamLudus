var col = require("collideManager");
var cInitLen = 3;
var rotMap = {
        left: 90,
        right: -90,
        up: 180,
        down: 0
    }
var hvMap = {
    left: "h",
    right: "h",
    up: "v",
    down: "v"
}

function OffsetGridByDir(x, y, dir) {
    if (dir == "left") {
        return [x - 1, y];
    } else if (dir == "right") {
        return [x + 1, y];
    } else if (dir == "up") {
        return [x, y + 1];
    } else if (dir == "down") {
        return [x, y - 1];
    }
    console.log("unknowdir", dir);
    return [x, y];
}
cc.Class({
    extends: cc.Component,

    properties: {
        bodyPrefab: {
            default: null,
            type: cc.Prefab
        },
        label: {
            default: null,
            type: cc.Label,
        }
    },

    // use this for initialization
    onLoad: function() {
        this.bodyPool = new cc.NodePool();
        let initCount = 15;
        for (let i = 0; i < initCount; i++) {
            let body = cc.instantiate(this.bodyPrefab);
            this.bodyPool.put(body);
        }
        this.BodyArr = [];
        this.initSnake();
    },
    initSnake: function() {
        for (var i = 0; i < cInitLen; i++) {
            this.grow(i == 0);
        }
        this.MoveDir = "up";
        this.setDir("left");
    },
    createBody: function(x, y, isHead) {
        let body = null;
        if (this.bodyPool.size() > 0) {
            body = this.bodyPool.get();
        } else {
            body = cc.instantiate(this.bodyPrefab);
        }
        this.node.addChild(body);
        body.getComponent("body").setPro(x, y, isHead);
        this.BodyArr.push(body);
    },
    grow: function(isHead) {
        let tail = this.getTailGrid();
        this.createBody(tail[0], tail[1], isHead);
    },
    setDir: function(dir) {
        if (hvMap[dir] == hvMap[this.MoveDir]) {
            return
        }
        this.MoveDir = dir;
        this.BodyArr[0].rotation = rotMap[this.MoveDir];
    },
    getTailGrid: function() {
        if (this.BodyArr.length === 0) {
            return [0, 0];
        }
        let tail = this.BodyArr[this.BodyArr.length - 1].getComponent("body");
        return [tail.posx, tail.posy];
    },
    setHeadGrid: function(x, y) {
        let head = this.BodyArr[0].getComponent("body");
        head.posx = x;
        head.posy = y;
    },
    getHeadGrid: function() {
        if (this.BodyArr.length === 0) {
            return [0, 0];
        }
        let head = this.BodyArr[0].getComponent("body");
        return [head.posx, head.posy];
    },
    updatePos: function() {
        let bar = this.BodyArr;
        if (bar.length === 0) {
            return
        }
        for (let i = bar.length - 1; i >= 0; i--) {
            let body = bar[i].getComponent("body");
            if (i === 0) {
                let pos = OffsetGridByDir(body.posx, body.posy, this.MoveDir);
                body.posx = pos[0];
                body.posy = pos[1];
            } else {
                let front = bar[i - 1].getComponent("body");
                body.posx = front.posx;
                body.posy = front.posy;
            }
            col.setCollide(body.posx, body.posy, { name: "body" + i, type: "body" });
            body.updatePos();
        }
    },
    blink: function(callback) {
        for (let i in this.BodyArr) {
            let b = cc.blink(3, 5);
            if (i === 0) {
                let a = cc.sequence(b, cc.callFunc(callback));
                this.BodyArr[i].runAction(a);
            } else {
                this.BodyArr[i].runAction(b);
            }
        }
    },
    kill: function() {
        for (let i in this.BodyArr) {
            this.bodyPool.put(this.BodyArr[i]);
        }
        this.BodyArr = [];
    }

});