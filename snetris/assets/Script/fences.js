var col = require("collideManager");
cc.Class({
    extends: cc.Component,

    properties: {
        fence: {
            default: null,
            type: cc.Prefab
        }
    },

    // use this for initialization
    onLoad: function() {
        this.fenceSpArr = [];
        this.fencePool = new cc.NodePool();
        let initCount = cBound * 4;
        for (let i = 0; i < initCount; ++i) {
            let fence = cc.instantiate(this.fence);
            this.fencePool.put(fence);
        }
        this.fencesInit();
    },
    createFence: function(x, y) {
        let fence = null;
        if (this.fencePool.size() > 0) {
            fence = this.fencePool.get();
        } else {
            fence = cc.instantiate(this.fence);
        }
        fence.setPosition(x * cGridSize, y * cGridSize);
        this.fenceSpArr.push(fence);
        fence.parent = this.node;
    },
    fenceGenerator: function(bound, fun) {
        for (let i = -bound; i < bound + 1; i++) {
            let pos = fun(i);
            this.createFence(pos[0], pos[1]);
        }
    },
    fencesInit: function() {
        this.fenceGenerator(cBound, function(i) {
            col.setCollide(cBound, i, { type: "fence" });
            return [cBound, i];
        });
        this.fenceGenerator(cBound, function(i) {
            col.setCollide(-cBound, i, { type: "fence" });
            return [-cBound, i];
        });
        this.fenceGenerator(cBound, function(i) {
            col.setCollide(i, cBound, { type: "fence" });
            return [i, cBound];
        });
        this.fenceGenerator(cBound, function(i) {
            col.setCollide(i, -cBound, { type: "fence" });
            return [i, -cBound];
        });
    },
    reset: function() {
            this.node.removeAllChildren();
        }
});