import s from "./formatnumber.js";

export default class {
    constructor(t) {
        this.scene = t;
        this.stage = t.game.stage;
        this.build_interface();
    }
    container = null
    cached = !1
    scene = null
    state = null
    offset = {
        y: 0,
        x: 0
    }
    build_interface() {
        var t = this.scene
            , e = t.game.pixelRatio
            , i = t.settings
            , s = new createjs.Container
            , n = "helsinki"
            , r = new createjs.Text("00:00.00","40px " + n, window.lite &&  window.lite.getVar("dark") ? "#fdfdfd" : "#000000")
            , o = new createjs.Text("TIME:","20px " + n, window.lite &&  window.lite.getVar("dark") ? "#666666" : "#999999")
            , a = this.get_timer_sprite()
            , h = new createjs.Text(" -- : --.--","35px " + n, window.lite &&  window.lite.getVar("dark") ? "#666666" : "#999999")
            , l = new createjs.Text("BEST:","20px " + n, window.lite &&  window.lite.getVar("dark") ? "#666666" : "#999999")
            , c = new createjs.Text("0/0","40px " + n, window.lite &&  window.lite.getVar("dark") ? "#fdfdfd" : "#000000")
            , u = new createjs.Bitmap(t.assets.getResult("targets_icon"))
          , p = e / 2.5;
        i.mobile && (p = e / 2.5),
        r.y = 18,
        r.x = 57,
        o.y = 3,
        o.x = 59,
        a.y = 0,
        a.x = 0,
        h.x = 237,
        h.y = 21,
        l.x = 240,
        l.y = 3,
        c.y = 15,
        c.x = 460,
        u.y = 0,
        u.x = 400,
        s.addChild(r),
        s.addChild(o),
        s.addChild(a),
        s.addChild(h),
        s.addChild(l),
        s.addChild(c),
        s.addChild(u),
        s.scaleX = s.scaleY = p,
        s.y = (10 + this.offset.y) * p,
        s.x = 10 * p,
        this.best_time_title = l,
        this.time_title = o,
        this.container = s,
        this.time = r,
        this.goals = c,
        this.best_time = h,
        this.stage.addChild(s)
    }
    update() {
        var t = this.scene
            , e = t.ticks
            , i = t.settings
            , n = t.track
            , r = t.playerManager.firstPlayer;
        this.cached === !1 && e > 50 && (this.cached = !0,
        this.cache_fixed_text());
        var o = e / i.drawFPS;
        this.time.text = s(1e3 * o);
        this.time.color = window.lite.getVar("dark") ? "#fdfdfd" : "#000";
        var a = n.targetCount
            , h = r.getTargetsHit();
        this.goals.text = h + "/" + a;
        this.goals.color = window.lite.getVar("dark") ? "#fdfdfd" : "#000";
        var l = " -- : --.--";
        i.isCampaign && i.campaignData.user.best_time ? l = i.campaignData.user.best_time : i.userTrackStats && i.userTrackStats.best_time && (l = i.userTrackStats.best_time),
        this.best_time.text = l,
        i.mobile && this.center_container();
        this.best_time_title.color = window.lite.getVar("dark") ? "#666" : "#999";
        this.best_time.color = window.lite.getVar("dark") ? "#666" : "#999"
    }
    center_container() {
        var t = this.container
            , e = t.getBounds()
            , i = this.scene.screen
            , s = this.scene.game.pixelRatio;
        t.x = i.width / 2 - e.width / 2 * t.scaleY,
        t.y = 10 * s
    }
    cache_fixed_text() {
        var t, e = this.best_time_title, i = this.time_title, s = 10;
        t = e.getBounds(),
        e.cache(t.x, t.y, t.width, t.height + s),
        t = i.getBounds(),
        i.cache(t.x, t.y, t.width, t.height + s)
    }
    get_timer_sprite() {
        var t = this.scene.assets.getResult("time_icon")
            , e = {
                images: [t],
                frames: {
                    width: 60,
                    height: 60
                }
            }
            , i = new createjs.SpriteSheet(e)
            , s = new createjs.Sprite(i);
        return s
    }
}