import o from "../math/bresenham.js";
import Vector from "../math/cartesian.js";
import PhysicsLine from "../sector/physicsline.js";
import Antigravity from "../sector/powerups/antigravity.js";
import Bomb from "../sector/powerups/bomb.js";
import Boost from "../sector/powerups/boost.js";
import Checkpoint from "../sector/powerups/checkpoint.js";
import Gravity from "../sector/powerups/gravity.js";
import Slowmo from "../sector/powerups/slowmo.js";
import Target from "../sector/powerups/target.js";
import Teleport from "../sector/powerups/teleport.js";
import SceneryLine from "../sector/sceneryline.js";
import Sector from "../sector/sector.js";
import Balloon from "../sector/vehiclepowerups/balloon.js";
import Blob from "../sector/vehiclepowerups/blob.js";
import Helicopter from "../sector/vehiclepowerups/helicopter.js";
import Truck from "../sector/vehiclepowerups/truck.js";
import CanvasPool from "../utils/canvaspool.js";

let M = {
    LINE: 1,
    POWERUPS: 2  
}
let A = [];

export default class {
    constructor(t) {
        this.scene = t;
        this.game = t.game;
        this.settings = t.game.settings;
        if (!this.settings.track) {
            this.settings.track = {
                vehicle: this.settings.startVehicle
            }
        }
        this.camera = t.camera;
        this.sectors = {};
        this.sectors.drawSectors = [];
        this.sectors.physicsSectors = [];
        this.totalSectors = [];
        this.powerups = [];
        this.powerupsLookupTable = {};
        this.physicsLines = [];
        this.sceneryLines = [];
        this.targets = [];
        this.allowedVehicles = ["MTB", "BMX"];
        this.canvasPool = new CanvasPool(t);
        this.createPowerupCache();
    }
    defaultLine = {
        p1: new Vector(-40,50),
        p2: new Vector(40,50)
    }
    game = null;
    scene = null;
    camera = null;
    canvas = null;
    canvasPool = null;
    settings = null;
    physicsLines = null;
    sceneryLines = null;
    powerups = null;
    targets = null;
    targetCount = 0;
    sectors = null;
    totalSectors = null;
    allowedVehicles = null;
    dirty = !1;
    createPowerupCache() {
        A.push(new Boost(0, 0, 0, this)),
        A.push(new Slowmo(0, 0, this)),
        A.push(new Bomb(0, 0, this)),
        A.push(new Gravity(0, 0, 0, this)),
        A.push(new Checkpoint(0, 0, this)),
        A.push(new Target(0, 0, this)),
        A.push(new Antigravity(0, 0, this)),
        A.push(new Teleport(0, 0, this)),
        A.push(new Helicopter(0, 0, 0, this)),
        A.push(new Truck(0, 0, 0, this)),
        A.push(new Balloon(0, 0, 0, this)),
        A.push(new Blob(0, 0, 0, this))
    }
    recachePowerups(t) {
        for (const e of A)
            e.recache(t)
    }
    read(t) {
        let e = t.split("#")
          , s = []
          , n = [];
        if (e.length > 2)
            s = e[1].split(","),
            n = e[2].split(",");
        else if (e.length > 1)
            n = e[1].split(",");
        this.addLines(e[0].split(","), this.addPhysicsLine),
        this.addLines(s, this.addSceneryLine),
        this.addPowerups(n)
    }
    addPowerups(t) {
        for (var e = t.length, i = [], s = 0; e > s; s++)
            if (i = t[s].split(" "), i.length >= 2) {
                for (var n = [], r = i.length, o = 1; r > o; o++) {
                    var a = parseInt(i[o], 32);
                    n.push(a)
                }
                var h = Math.round(n[0])
                  , l = Math.round(n[1])
                  , p = null;
                switch (i[0]) {
                case "B":
                    p = new Boost(h,l,n[2],this),
                    this.addPowerup(p);
                    break;
                case "S":
                    p = new Slowmo(h,l,this),
                    this.addPowerup(p);
                    break;
                case "O":
                    p = new Bomb(h,l,this),
                    this.addPowerup(p);
                    break;
                case "G":
                    p = new Gravity(h,l,n[2],this),
                    this.addPowerup(p);
                    break;
                case "C":
                    p = new Checkpoint(h,l,this),
                    this.addPowerup(p);
                    break;
                case "T":
                    p = new Target(h,l,this),
                    this.addTarget(p),
                    this.addPowerup(p);
                    break;
                case "A":
                    p = new Antigravity(h,l,this),
                    this.addPowerup(p);
                    break;
                case "V":
                    var d = n[2]
                      , P = n[3]
                      , M = this.settings.vehiclePowerup.minTime
                      , A = this.settings.vehiclePowerup.maxTime;
                    P = P || M,
                    P = Math.min(P, A),
                    P = Math.max(P, M);
                    var p;
                    switch (d) {
                    case 1:
                        p = new Helicopter(h,l,P,this);
                        break;
                    case 2:
                        p = new Truck(h,l,P,this);
                        break;
                    case 3:
                        p = new Balloon(h,l,P,this);
                        break;
                    case 4:
                        p = new Blob(h,l,P,this);
                        break;
                    default:
                        continue
                    }
                    this.addPowerup(p);
                    break;
                case "W":
                    var D = n[0]
                      , I = n[1]
                      , E = n[2]
                      , O = n[3]
                      , z = new Teleport(D,I,this)
                      , j = new Teleport(E,O,this);
                    z.addOtherPortalRef(j),
                    j.addOtherPortalRef(z),
                    this.addPowerup(z),
                    this.addPowerup(j)
                }
            }
    }
    addTarget(t) {
        this.dirty = !0,
        this.targetCount++,
        this.targets.push(t)
    }
    addPowerup(t) {
        this.addRef(t.x, t.y, t, M.POWERUPS, this.sectors.physicsSectors, this.settings.physicsSectorSize);
        let a = this.addRef(t.x, t.y, t, M.POWERUPS, this.sectors.drawSectors, this.settings.drawSectorSize);
        return a !== !1 && this.totalSectors.push(a), t !== null && (this.powerups.push(t), t.id && (this.powerupsLookupTable[t.id] = t)), t
    }
    addLines(t, e) {
        for (let i = t.length, s = 0; i > s; s++) {
            let n = t[s].split(" ")
              , r = n.length;
            if (r > 3)
                for (let o = 0; r - 2 > o; o += 2) {
                    let a = parseInt(n[o], 32)
                      , h = parseInt(n[o + 1], 32)
                      , l = parseInt(n[o + 2], 32)
                      , c = parseInt(n[o + 3], 32)
                      , u = a + h + l + c;
                    isNaN(u) || e.call(this, a, h, l, c)
                }
        }
    }
    addPhysicsLine(t, e, i, s) {
        if (Math.sqrt(Math.pow(Math.round(i) - Math.round(t), 2) + Math.pow(Math.round(s) - Math.round(e), 2)) >= 2) {
            return this.addPhysicsLineToTrack(new PhysicsLine(Math.round(t), Math.round(e), Math.round(i), Math.round(s)))
        }
    }
    addPhysicsLineToTrack(t) {
        for (let l = o(t.p1.x, t.p1.y, t.p2.x, t.p2.y, this.settings.drawSectorSize), p = 0; l.length > p; p += 2) {
            let v = this.addRef(l[p], l[p + 1], t, M.LINE, this.sectors.drawSectors, this.settings.drawSectorSize);
            v !== !1 && this.totalSectors.push(v)
        }
        for (let m = o(t.p1.x, t.p1.y, t.p2.x, t.p2.y, this.settings.physicsSectorSize), p = 0; m.length > p; p += 2) {
            this.addRef(m[p], m[p + 1], t, M.LINE, this.sectors.physicsSectors, this.settings.physicsSectorSize)
        }
        return this.physicsLines.push(t), t
    }
    addSceneryLine(t, e, i, s) {
        if (Math.sqrt(Math.pow(Math.round(i) - Math.round(t), 2) + Math.pow(Math.round(s) - Math.round(e), 2)) >= 2) {
            return this.addSceneryLineToTrack(new SceneryLine(Math.round(t), Math.round(e), Math.round(i), Math.round(s)))
        }
    }
    addSceneryLineToTrack(t) {
        for (let e = this.settings.drawSectorSize, i = t.p1, s = t.p2, n = i.x, r = i.y, a = s.x, h = s.y, l = o(n, r, a, h, e), c = this.sectors.drawSectors, u = l.length, p = 0; u > p; p += 2) {
            let v = this.addRef(l[p], l[p + 1], t, M.LINE, c, e);
            v !== !1 && this.totalSectors.push(v)
        }
        return this.sceneryLines.push(t), t
    }
    addRef(t, e, i, s, n, r) {
        let o = Math.floor(t / r)
          , h = Math.floor(e / r)
          , c = !1;
        if (void 0 === n[o] && (n[o] = []), void 0 === n[o][h]) {
            let u = new Sector(o, h, this);
            n[o][h] = u,
            c = u
        }
        switch (s) {
            case M.LINE:
                n[o][h].addLine(i),
                i.addSectorReference(n[o][h]);
            break;

            case M.POWERUPS:
                n[o][h].addPowerup(i),
                i.addSectorReference(n[o][h])
        }
        return this.dirty = !0, c
    }
    cleanTrack() {
        this.cleanLines(),
        this.cleanPowerups()
    }
    cleanLines() {
        for (var t = this.physicsLines, e = this.sceneryLines, i = t.length, s = e.length, n = i - 1; n >= 0; n--)
            t[n].remove && t.splice(n, 1);
        for (var r = s - 1; r >= 0; r--)
            e[r].remove && e.splice(r, 1)
    }
    cleanPowerups() {
        for (const t in this.powerups)
            this.powerups[t].remove && this.powerups.splice(t, 1);
        for (const t in this.targets)
            this.targets[t].remove && this.targets.splice(t, 1);
        this.targetCount = this.targets.length
    }
    updatePowerupState(t) {
        this.resetPowerups();
        this.setPowerupStates(t._powerupsConsumed.targets),
        this.setPowerupStates(t._powerupsConsumed.checkpoints),
        this.setPowerupStates(t._powerupsConsumed.misc)
    }
    setPowerupStates(t) {
        for (const e of t) {
            this.powerupsLookupTable[e].remove && this.powerupsLookupTable[e].id && (delete this.powerupsLookupTable[e], delete t[e]),
            this.powerupsLookupTable[e].hit = !0,
            this.powerupsLookupTable[e].sector.powerupCanvasDrawn = !1
        }
    }
    select(a, b) {
        const segments = [];
        if (a.y < b.y) {
            for (const i of [...this.physicsLines, ...this.sceneryLines, ...this.powerups].filter(t => !t.remove)) {
                if (i.p1 || i.p2) {
                    if ((i.p1.x > a.x && i.p1.y > a.y || i.p2.x > a.x && i.p2.y > a.y) && ((i.p1.x < b.x && i.p1.y < b.y) || (i.p2.x < b.x && i.p2.y < b.y))) {
                        segments.push(i);
                    }
                } else {
                    if (i.x > a.x && i.y > a.y && i.x < b.x && i.y < b.y) {
                        segments.push(i);
                    }
                }
            }
        } else {
            for (const i of [...this.physicsLines, ...this.sceneryLines, ...this.powerups].filter(t => !t.remove)){
                if (i.p1 || i.p2) {
                    if (i.p1.x <= a.x && i.p1.y <= a.y || i.p2.x <= a.x && i.p2.y <= a.y && i.p1.x >= b.x && i.p1.y >= b.y ||
                    i.p2.x >= b.x && i.p2.y >= b.y) {
                        segments.push(i);
                    }
                } else {
                    if (i.x < a.x && i.y < a.y && i.x > b.x && i.y > b.y) {
                        segments.push(i);
                    }
                }
            }
        }
        return segments
    }
    getCode() {
        this.cleanTrack();
        return this.physicsLines.map(t => t.p1.x.toString(32) + " " + t.p1.y.toString(32) + t.getCode(this)).join(",") + "#" + this.sceneryLines.map(t => t.p1.x.toString(32) + " " + t.p1.y.toString(32) + t.getCode(this)).join(",") + "#" + this.powerups.map(t => t.getCode()).join(",")
    }
    resetPowerups() {
        for (const t of this.powerups) {
            t.hit && !t.remove && (t.hit = !1, t.sector.powerupCanvasDrawn = !1)
        }
    }
    addDefaultLine() {
        this.addPhysicsLine(this.defaultLine.p1.x, this.defaultLine.p1.y, this.defaultLine.p2.x, this.defaultLine.p2.y)
    }
    erase(t, e, i) {
        let _ = [];
        this.dirty = !0;
        for (var b = Math.floor(Math.min(t.x - e, t.x + e) / this.settings.drawSectorSize); Math.floor(Math.max(t.x - e, t.x + e) / this.settings.drawSectorSize) >= b; b++)
            for (var T = Math.floor(Math.min(t.y - e, t.y + e) / this.settings.drawSectorSize); Math.floor(Math.max(t.y - e, t.y + e) / this.settings.drawSectorSize) >= T; T++)
                this.sectors.drawSectors[b] && this.sectors.drawSectors[b][T] && _.push(this.sectors.drawSectors[b][T].erase(t, e, i));
        return _.flatMap(t => t)
    }
    drawAndCache() {
        for (var t = performance.now(), e = this.totalSectors, i = e.length, s = 0; i > s; s++) {
            !function(t) {
                setTimeout(function() {
                    t.draw(),
                    t.cacheAsImage()
                }, 250 * s)
            }(e[s])
        }
        let r = performance.now();
        console.log("Track :: Time to draw entire track : " + (r - t) + "ms")
    }
    undraw() {
        for (const t of this.totalSectors) {
            t.drawn && t.clear(!0)
        }
        this.recachePowerups(Math.max(this.camera.zoom, 1)),
        this.canvasPool.update()
    }
    collide(t) {
        let i = Math.floor(t.pos.x / this.settings.physicsSectorSize - .5),
            s = Math.floor(t.pos.y / this.settings.physicsSectorSize - .5);
        this.sectors.physicsSectors[i] && this.sectors.physicsSectors[i][s] && this.sectors.physicsSectors[i][s].resetCollided(),
        this.sectors.physicsSectors[i + 1] && this.sectors.physicsSectors[i + 1][s] && this.sectors.physicsSectors[i + 1][s].resetCollided(),
        this.sectors.physicsSectors[i + 1] && this.sectors.physicsSectors[i + 1][s + 1] && this.sectors.physicsSectors[i + 1][s + 1].resetCollided(),
        this.sectors.physicsSectors[i] && this.sectors.physicsSectors[i][s + 1] && this.sectors.physicsSectors[i][s + 1].resetCollided(),
        this.sectors.physicsSectors[i] && this.sectors.physicsSectors[i][s] && this.sectors.physicsSectors[i][s].collide(t),
        this.sectors.physicsSectors[i + 1] && this.sectors.physicsSectors[i + 1][s] && this.sectors.physicsSectors[i + 1][s].collide(t),
        this.sectors.physicsSectors[i + 1] && this.sectors.physicsSectors[i + 1][s + 1] && this.sectors.physicsSectors[i + 1][s + 1].collide(t),
        this.sectors.physicsSectors[i] && this.sectors.physicsSectors[i][s + 1] && this.sectors.physicsSectors[i][s + 1].collide(t)
    }
    getDrawSector(t, e) {
        let s = Math.floor(t / this.settings.drawSectorSize),
            n = Math.floor(e / this.settings.drawSectorSize),
            o = !1;
        return typeof this.sectors.drawSectors[s] != "undefined" && typeof this.sectors.drawSectors[s][n] != "undefined" && (o = this.sectors.drawSectors[s][n]), o
    }
    draw() {
        const ctx = this.scene.game.canvas.getContext("2d");
        let f = this.scene.camera.position.x * this.scene.camera.zoom / (this.settings.drawSectorSize * this.scene.camera.zoom) - this.scene.screen.width / (this.settings.drawSectorSize * this.scene.camera.zoom) / 2 - 1,
            v = this.scene.camera.position.y * this.scene.camera.zoom / (this.settings.drawSectorSize * this.scene.camera.zoom) - this.scene.screen.height / (this.settings.drawSectorSize * this.scene.camera.zoom) / 2 - 1,
            g = this.scene.camera.position.x * this.scene.camera.zoom / (this.settings.drawSectorSize * this.scene.camera.zoom) + this.scene.screen.width / (this.settings.drawSectorSize * this.scene.camera.zoom) / 2,
            m = this.scene.camera.position.y * this.scene.camera.zoom / (this.settings.drawSectorSize * this.scene.camera.zoom) + this.scene.screen.height / (this.settings.drawSectorSize * this.scene.camera.zoom) / 2;
        ctx.imageSmoothingEnabled = !1,
        ctx.mozImageSmoothingEnabled = !1,
        ctx.oImageSmoothingEnabled = !1,
        ctx.webkitImageSmoothingEnabled = !1;
        for (const t of this.totalSectors) {
            if (t.dirty && t.cleanSector(), t.column >= f && g >= t.column && t.row >= v && m >= t.row) {
                t.drawn === !1 && t.draw(),
                t.hasPowerups && (t.powerupCanvasDrawn || t.cachePowerupSector());
                let S = t.column * (this.settings.drawSectorSize * this.scene.camera.zoom) - (this.scene.camera.position.x * this.scene.camera.zoom / (this.settings.drawSectorSize * this.scene.camera.zoom) * (this.settings.drawSectorSize * this.scene.camera.zoom) - this.scene.screen.center.x) | 0,
                    P = t.row * (this.settings.drawSectorSize * this.scene.camera.zoom) - (this.scene.camera.position.y * this.scene.camera.zoom / (this.settings.drawSectorSize * this.scene.camera.zoom) * (this.settings.drawSectorSize * this.scene.camera.zoom) - this.scene.screen.center.y) | 0;
                ctx.drawImage(t.canvas, S, P, this.settings.drawSectorSize * this.scene.camera.zoom, this.settings.drawSectorSize * this.scene.camera.zoom);
                if (t.hasPowerups && t.powerupCanvasDrawn) {
                    ctx.drawImage(t.powerupCanvas, S - t.powerupCanvasOffset * this.scene.camera.zoom / 2, P - t.powerupCanvasOffset * this.scene.camera.zoom / 2, (this.settings.drawSectorSize * this.scene.camera.zoom) + t.powerupCanvasOffset * this.scene.camera.zoom, (this.settings.drawSectorSize * this.scene.camera.zoom) + t.powerupCanvasOffset * this.scene.camera.zoom)
                }
            } else
                t.drawn && t.clear()
        }
    }
    closeSectors() {
        for (const t of this.totalSectors) {
            t.close()
        }
    }
    close() {
        this.scene = null,
        this.closeSectors(),
        this.totalSectors = null,
        this.canvasPool = null,
        this.sectors = null,
        this.physicsLines = null,
        this.sceneryLines = null,
        this.powerups = null,
        this.camera = null
    }
}