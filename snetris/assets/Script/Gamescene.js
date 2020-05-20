var col = require("collideManager");

cc.Class({
    extends: cc.Component,
    properties: {
        snake: {
            default: null,
            type: cc.Node
        },
        apple: {
            default: null,
            type: cc.Sprite
        },
        score: {
            default: null,
            type: cc.Label
        },
        scoreNum: {
            default: 0,
            type: cc.Integer
        },
        portalController: {
            default: null,
            type: cc.Node
        },
        mission: {
            default: null,
            type: cc.Node
        },
    },

    // use this for initialization
    onLoad: function() {
        let me = this;
        me.initData();
        console.log("init done");


        me.createApple();
        me.sk = me.snake.getComponent("snake");
        me.pc = me.portalController.getComponent("portal");
        me.pc.createPort();
        me.schedule(me.startGame, me.snakeSpeed);
        me.touchEnable = true;
        me.node.on("touchstart", function(event) {
            if (me.touchEnable && me.pressEnable) {
                let headpos = me.sk.getHeadGrid();
                let loc = event.getLocation();
                let vis = cc.director.getVisibleSize();
                let ori = cc.director.getVisibleOrigin();
                let finalX = loc.x - (ori.x + vis.width / 2 + headpos[0] * cBound);
                let finalY = loc.y - (ori.y + vis.height / 2 + headpos[1] * cBound);
                let dir = Vector2Dir(finalX, finalY);
                if (dir != me.sk.MoveDir) {
                    me.touchEnable = false;
                }
                me.sk.setDir(dir);
            }
        });
        me.pressEnable = true;
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },
    destroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    onKeyDown: function(event) {
        let me = this;
        if (me.touchEnable && me.pressEnable) {
            let dir = me.sk.MoveDir;
            switch (event.keyCode) {
                case cc.KEY.left:
                    dir = "left";
                    // console.log("left");
                    me.pressEnable = false;
                    if (dir != me.sk.MoveDir) {
                        me.touchEnable = false;
                    }
                    me.sk.setDir(dir);
                    break;
                case cc.KEY.right:
                    dir = "right";
                    // console.log("right");
                    me.pressEnable = false;
                    if (dir != me.sk.MoveDir) {
                        me.touchEnable = false;
                    }
                    me.sk.setDir(dir);
                    break;
                case cc.KEY.up:
                    dir = "up";
                    //console.log("up");
                    me.pressEnable = false;
                    if (dir != me.sk.MoveDir) {
                        me.touchEnable = false;
                    }
                    me.sk.setDir(dir);
                    break;
                case cc.KEY.down:
                    dir = "down";
                    // console.log("down");
                    me.pressEnable = false;
                    if (dir != me.sk.MoveDir) {
                        me.touchEnable = false;
                    }
                    me.sk.setDir(dir);
                    break;
            }
        }
    },

    onKeyUp: function(event) {
        let me = this;
        switch (event.keyCode) {
            case cc.KEY.left:
                me.pressEnable = true;
                break;
            case cc.KEY.right:
                me.pressEnable = true;
                break;
            case cc.KEY.up:
                me.pressEnable = true;
                break;
            case cc.KEY.down:
                me.pressEnable = true;
                break;
        }
    },
    setScore: function() {
        this.score.string = this.scoreNum;
    },
    startGame: function() {
        let me = this;
        me.sk.updatePos();
        me.touchEnable = true;
        me.collideListener();


    },
    collideListener: function() {
        let me = this;
        let headpos = me.sk.getHeadGrid();
        let event = col.checkCollide(headpos[0], headpos[1]);
        if (event !== null) {
            if (event.hasOwnProperty("name")) {
                if (event.name != "body0") {
                    if (event.name == "apple") {
                        me.createApple();
                        me.sk.grow();
                        me.scoreNum += 1;
                        if (!me.isSuper) {
                            me.superNum += 1;
                        }
                        me.speederNum += 1;
                        me.setData();
                        if (me.superNum == 5 && !me.isSuper) {
                            me.isSuper = true;
                            this.mission.getChildByName("super_num").runAction(cc.blink(8, 12));
                            me.restNum = 8;
                            me.setMissionLabel("rest_num", me.restNum, 8);
                            let f = function() {
                                me.restNum -= 1;
                                me.setMissionLabel("rest_num", me.restNum, 8);
                                if (me.restNum <= 0) {
                                    me.unschedule(f);
                                    me.superNum = 0;
                                    me.restNum = 0;
                                    me.setMissionLabel("rest_num", me.restNum, 8);
                                    me.isSuper = false;
                                }
                            }
                            me.schedule(f, 1);
                        }
                        if (me.speederNum == 5) {
                            me.snakeSpeed -= 0.05;
                            me.unschedule(me.startGame);
                            me.schedule(me.startGame, me.snakeSpeed);
                            me.speederNum = 0;
                            me.setMissionLabel("speeder_num", me.speederNum, 5);

                        }
                    } else if (event.type == "body" && !me.isSuper) {
                        me.unschedule(me.startGame);
                        me.touchEnable = false;
                        me.sk.blink(function() {
                            me.reset();
                        });
                    } else if (event.type == "portal") {
                        me.sk.setHeadGrid(event.link[0], event.link[1]);
                    }
                }
            } else if (event.type == "fence") {
                me.unschedule(me.startGame);
                me.touchEnable = false;
                me.sk.blink(function() {
                    me.reset();
                });
            } else if (event.type == "block" && !me.isSuper) {
                me.unschedule(me.startGame);
                me.touchEnable = false;
                me.sk.blink(function() {
                    me.reset();
                });
            }
        }
    },
    initData: function() {
        let me = this;
        me.scoreNum = 0;
        me.snakeSpeed = 0.4

        me.superNum = 0;
        me.isSuper = false;
        me.speederNum = 0;
        me.restNum = 0;

        me.setData();
    },
    setData: function() {
        let me = this;
        me.setScore();
        me.setMissionLabel("super_num", me.superNum, 5);
        me.setMissionLabel("speeder_num", me.speederNum, 5);
        me.setMissionLabel("rest_num", me.restNum, 8);
    },
    reset: function() {
        let me = this;
        me.initData();
        col.resetBodyCol();
        me.sk.kill();
        me.sk.initSnake();
        me.createApple();
        me.pc.createPort();
        me.schedule(me.startGame, me.snakeSpeed);
    },
    createApple: function() {
        let app = this.apple.node;
        app.opacity = 0;
        let appPos = col.randomEmptyPos();
        let px = appPos[0];
        let py = appPos[1];
        col.setCollide(px, py, { name: "apple" });
        app.setPosition(px * cGridSize, py * cGridSize);
        app.opacity = 255;
    },
    setMissionLabel: function(name, num, max) {
        let label = this.mission.getChildByName(name).getComponent(cc.Label);
        label.string = num + "/" + max;
    }
});