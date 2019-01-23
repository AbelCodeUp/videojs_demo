import "whatwg-fetch";
import "es6-promise/auto";
import videojs from "video.js";
import "video.js/dist/alt/video-js-cdn.min.css";

videojs.options.flash.swf = "videojs/video-js.swf";//flash路径，有一些html播放不了的视频，就需要用到flash播放。这一句话要加在在videojs.js引入之后使用

export default class TKPlayer {
    constructor(eleId, options, videoOpts = {}, ready) {
        let { fileId } = videoOpts;
        if (!fileId) throw ("The fileId field is null or undefined.");
        if (!eleId) throw ("The eleId field is null or undefined.");
        if (!(options instanceof Object)) {
            try {
                if (typeof options === "string") {
                    JSON.parse(options);
                }
            } catch (error) {
                throw ("The options field must be an object.");
            }
        }
        const videoId = `TKPlayer_${Math.round(new Date())}`;

        /* create video element */
        let doc = document;
        let videoEle = doc.createElement("video");
        videoEle.id = videoId;
        videoEle.className += "video-js vjs-default-skin vjs-big-play-centered";
        videoEle.setAttribute("controls", true);
        doc.querySelector("#" + eleId).appendChild(videoEle);
        /* End create video element */

        this._player = videojs(videoId, options, typeof ready === "function" ? ready : () => {});

        fetch(`http://192.168.0.155:3000/videoInfo/${fileId}`).then(res => {
            return res.json();
        }).then(res => {
            this._player.src(res.data);
            this._player.load();
        });
    }

    get player() {
        return this._player || {};
    }

}
