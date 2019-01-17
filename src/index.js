import videojs from 'video.js';
import { createDom, countDown, removeElement } from './tools';
import 'video.js/dist/video-js.min.css';
import './style.scss';
const videoUrl = require('./media/father.mp4');

export default class TCPlayer {
  constructor(options) {
    this.player = null;
    this.advertImg = null;
    this.advertVideo = null;
    this.adverNumber = 1; // 播放的广告索引
    this.adverVideoNumber  = 1; // 播放的广告索引
    this.imgFalg = true;
    this.videoFalg = true;
    this.options = options || {};
    this._imgAdverTimer = null;
    this._videoAdverTimer = null;
    this.videoRoot = createDom( 'div', {
      className:'video_container_box',
    }, this.options.root ? options.root : document.body)
    this.videoContainer = null;

    var vProp = {
      id:'myVideo',
      className:'video-js vjs-default-skin'
    };
    createDom( 'video', vProp, this.videoRoot); // 插入videoDOM
    this.initPlay();
  }

  initPlay(){
    let that = this;
    let { options } = this;
    var videoUrl = options.file || '';
    var startImg = (options.isStartImg && options.isStartImg.isShow) ? options.isStartImg.url : '';
    this.player  = videojs("myVideo", {
        autoplay: false,
        controls: true,
        width: 600,
        height: 256,
        loop: false,
        muted: true,
        preload:'none',
        playsinline:true,
        poster:'',
        sources: [{
          src: videoUrl,
          type: 'video/mp4'
        }],

      }, function(){
          that.videoContainer = document.getElementById('myVideo');
          that.insertStartAdvertImg( options );
          this.on('loadeddata',function(){
              console.log(this)
          })
          this.on("play", () => {
            // this.startPlay();
            // this.pausePlay(false);
            that.deleteAdvert();
            if( options.isStartVideo && options.isStartVideo.isShow ){
              options.isStartVideo.isShow = false;
              this.pause();
              that.insertAdvertVideo( options.isStartVideo );
            }
          });
          this.on("pause", () => {
            if(options.isStopImg && options.isStopImg.isShow){
              that.insertPauseAdvertImg( options.isStopImg );
            }
          });
          //监听时间变化
          this.on("timeupdate", () => {
            // 计算观看进度
            let currentTime = this.currentTime();
            let duration = this.duration();
            let progress = ((100 * currentTime) / duration).toFixed(0);
            let progress2 = currentTime.toFixed(0);
            if( progress2 >= 1 ){
              if( options.isInsertImg && options.isInsertImg.isShow ){
                let { adCount, intervalTime, playTime, info } = options.isInsertImg;
                let temp = progress2 / Number(intervalTime/1000)
                if( temp <= adCount ){
                  if( /(^[0-9]\d*$)/.test(temp) ){ // TODO: 有问题  that.adverNumber
                    if(that.imgFalg){
                      that.imgFalg = false;
                      let item = info[temp-1];
                      if( item.isShow ){
                        that.insertAdvertImg( item, playTime );
                        return false;
                      }
                    }
                  }
                }
              }
              if( options.isInsertVideo && options.isInsertVideo.isShow ){
                let { adCount, intervalTime, playTime, info } = options.isInsertVideo;
                let temp = progress2 / Number(intervalTime/1000)
                if( temp <= adCount ){
                  if( /(^[0-9]\d*$)/.test(temp) ){ // TODO: 有问题  that.adverNumber
                    if(that.videoFalg){
                      that.videoFalg = false;
                      let item = info[temp-1];
                      if( item.isShow ){
                        that.insertAdvertVideo( item, playTime, false );
                        return false;
                      }
                    }
                  }
                }
              }
            }
          });

          this.on('ended',function(){
               this.pause();
               // this.hide()
          })
      });
  }


  createStartAdverImg( options  ){
    var aProp = {
      id:'tk_advert_hover',
      className:'tk_advert_a_hover',
      target:'_blank',
      href: options.isStartImg.href,
      title:options.isStartImg.title
    };
    var imgProp = {
      className:'tk_advert_start_img',
      src:options.isStartImg.url,
    };

    var aAdvert = this.advertImg = createDom( 'a', aProp ); // 插入videoDOM
    createDom( 'img', imgProp, aAdvert );
    this.videoContainer.appendChild(aAdvert);
  }

  //创建广告图片
  createAdverImg ( option,playTime ){
    var that = this;
    var imgDomBox = this.advertImg = createDom('div',{
      id:'adver_img_box',
      className:'adver_img_box'
    },this.videoContainer);

    var aDom = createDom('a',{
      id:'tk_advert_hover',
      className:'tk_advert_a_hover',
      target:'_blank',
      href: option.href,
      title:option.title
    },imgDomBox);

    var imgDom = createDom('img',{
      id:'adver_img',
      className:'adver_img',
      src:option.url
    },aDom);
    //倒计时
    countDown(playTime,()=>{
      that.deleteAdvert();
      that.imgFalg = true;
    },()=>{
      that.deleteAdvert();
      that.imgFalg = true;
    },imgDomBox,that.startImg);

  }

  createAdverVideo( option, playTimer=0, isCount = true ){
    var that = this;
    var videoDom = createDom('video',{
      id:'adver_video',
      className:'video-js vjs-default-skin adver_video'
    },this.videoRoot);
    this.advertVideo = videojs('adver_video',{
      autoplay:true,
      muted:true,
      playsinline:true,
      width:600,
      height:256,
      sources: [{
        src: option.url || videoUrl,
        type: 'video/mp4'
      }],
    },function(){
      // option.isShow = false;
      var _this = this;
      let { closeType, playTime } = option;
      //倒计时
      countDown( playTimer?playTimer:playTime ,function(){
        switch (closeType) {
          case 0:
            clearInterval(this.adverTimer);
            _this.dispose();
            that.player.play();
            break;
          case 1:
            alert('请注册会员')
            break;
          default:
            return false;
        }
        that.videoFalg = true;
      },function(){
        _this.dispose();
        that.player.play();
        that.videoFalg = true;
      },document.getElementById('adver_video'),isCount,that.k_video_timer)

    })
  }

  createPauseAdverImg( option  ){
    var that = this;
    var pauseAdverBox = {
      id:'pauseAdverBox',
      className:'tk_pause_img_box'
    }
    var closeBtn = {
      className:'tk_pause_close_btn',
      title:'关闭',
    }
    var aProp = {
      id:'tk_advert_hover',
      className:'tk_advert_a_hover',
      target:'_blank',
      href: option.href,
      title:option.title
    };
    var imgProp = {
      className:'tk_advert_start_img',
      src:option.url,
    };

    var bAdvert = this.advertImg = createDom( 'div', pauseAdverBox ); // 插入videoDOM
    var closeBtn = createDom( 'button', closeBtn, bAdvert ); // 插入videoDOM
    var aAdvert =  createDom( 'a', aProp, bAdvert ); // 插入videoDOM
    createDom( 'img', imgProp, aAdvert );
    this.videoContainer.appendChild(bAdvert);
    closeBtn.onclick = function(){
      that.deleteAdvert();
    }
  }


  insertStartAdvertImg( options ){
    if( options.isStartImg && options.isStartImg.isShow ){
      this.createStartAdverImg( options );
    }
  }

  insertPauseAdvertImg( option ){
    if( option && option.isShow ){
      this.createPauseAdverImg( option );
    }
  }
  insertAdvertVideo ( options, playTime=0, isCount=true ){

    this.createAdverVideo( options, playTime, isCount);
  }
  insertAdvertImg ( options, playTime ){
    this.createAdverImg( options, playTime );
  }
  deleteAdvert(){
    let { advertImg, advertVideo } = this;
    if( advertImg ){
      removeElement( advertImg );
      this.advertImg = null;
    }
    if( advertVideo ){
      removeElement( advertVideo );
      this.advertVideo = null;
    }
  }
}

//接口返回数据
  var videoInfo = {
    root:document.getElementById('root'),
    "file": videoUrl,
    "isDownloadShow": false,
    "isDownloadUrl": "http://ddadofadfa/asdfjahsdfasdf/asdfa.mp4",
    "expireDate": "5cf33e27",

    //播放前图片广告
    isStartImg: {
      isShow: true, //是否显示
      url: "http://dxz-uat-1252753627.cosbj.myqcloud.com/resource/img/test/1_%E5%B0%81%E9%9D%A2%E5%B9%BF%E5%91%8A.jpg", //图片链接
      title: "播放前图片广告", //title
      href: "http://www.talk-cloud.com/" //跳转路径
    },
    //播放前视频广告
    isStartVideo: {
      isShow: true, //是否显示
      fileId: "5285890783952174544", //广告fileId
      title: "播放前视频广告", //title
      closeType: 0, // 0 随时，1 用户必须看完广告，如果点击关闭，提示注册会员
      playTime: 10000 //播放时长
    },
    //暂停中图片广告
    isStopImg: {
      isShow: true, //是否显示
      url: "http://dxz-uat-1252753627.cosbj.myqcloud.com/resource/img/test/4_1_%E6%92%AD%E6%94%BE%E4%B8%AD%E5%9B%BE%E7%89%87%E5%B9%BF%E5%91%8A1.png", //图片链接
      title: "暂停中图片广告", //title
    href: "http://www.talk-cloud.com/" //跳转路径
    },
    //播放中图片告
    isInsertImg: {
      isShow: true, //是否显示
      adCount: 2, //广告数量
      intervalTime: 8000, //广告间隔
      playTime: 3000, //显示时长
      info: [{
          "isShow": true,
          "url": "https://bla.gtimg.com/qqlive/201811/txspn_L1Yz_20181101113423327507.jpg",
          "title": "",
          "href": "http://www.talk-cloud.com/"
        },
        {
          "isShow": true,
          "url": "https://hk.ulifestyle.com.hk/cms/images/topic/1024/201705/20170511134350_0_32.jpg",
          "title": "",
          "href": "http://www.talk-cloud.com/"
        },
      ]
    },
    //播放中视频广告
    isInsertVideo: {
      isShow: true, //是否显示
      adCount: 2, //广告数量
      intervalTime: 16000, //广告间隔
      playTime: 8000, //显示时长
      info: [{
          "isShow": true,
          "fileId": "5285890783698505420",
          "title": "",
        },
        {
          "isShow": true,
          "fileId": "5285890783952174544",
          "title": ""
        },
      ]
    }
  }

new TCPlayer(videoInfo);