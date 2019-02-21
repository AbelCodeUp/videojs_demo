import videojs from 'video.js';
import "whatwg-fetch";
import "es6-promise/auto";
import _ from 'lodash';
import { createDom, countDown, removeElement } from './tools';
import './css/video.scss';
import './css/style.scss';


export default class TkPlayer {
  constructor(options) {
    this.player = null;
    this.advertImg = null;
    this.advertStartImg = null;
    this.advertPauseImg = null;
    this.k_video_timer = null;
    this.advertVideo = null;
    this.timeFlag = true;
    this.imgFalg = true;
    this.videoFalg = true;

    this.options = options || {};
    this._expireDate = options.expireDate || 0;
    this.adverType = 1; //1 暂停广告 2 图片和视频中间广告
    this.videoType = 1; //1 主视频  2 开头广告 3 普通广告
    this.videoContainer = null;

    this.startVideo = false, //开始广告
    this.adverVideo=false, // 中间视频广告
    this.adverRightImg=false, //右下角广告
    this.adverStopImg=false, //暂停广告
    this.mainVideo=false, //正片

    this.isStartLoad = false;

    this.AdverVideoItem = 0; //插入广告当前是第几个

    this.videoRoot = createDom( 'div', {
      className:'video_container_box',
    }, options.root ? options.root : document.body);


    var vProp = {
      id:'myVideo',
      className:'video-js vjs-default-skin adver_video'
    };
    let vDom = createDom( 'video', vProp, this.videoRoot); // 插入videoDOM
    vDom.setAttribute('playsinline','playsinline');
    vDom.setAttribute('webkit-playsinline','webkit-playsinline');
    this.initPlay(options);
  }

  initPlay(options){
    let that = this;
    var startImg = (options.isStartImg && options.isStartImg.isShow) ? options.isStartImg.url : '';
    let showVideo = {
      fileid:'',
    }
    this.player  = videojs("myVideo", {
        controls: true,
        loop: false,
        muted: false,
        preload:'none',
        playsinline:true,
        poster:'',
        language: 'zh-CN',
        control : {
            captionsButton : false,
            chaptersButton: false,
            subtitlesButton:false,
            liveDisplay:false,
            playbackRateMenuButton:false
        }
      }, function(){
          that.videoContainer = document.getElementById('myVideo');
          let _this = this;
          if( options.isStartImg && options.isStartImg.isShow ){
            that.createStartAdverImg( options );
          }
          this.on('loadeddata',function(){
            that.isStartLoad = true;
            // console.log(this.cache_);
          })
          this.on("play", () => {
            that.deleteStartImgAdvert();
            that.deletePauseImgAdvert();
          });

          this.on("pause", () => {
            if(that.adverStopImg && options.isStopImg && options.isStopImg.isShow){
              that.insertPauseAdvertImg( options.isStopImg );
            }
          });
          if( that.mainVideo || that.adverVideo ){
            this.autoplay(true);
          }
          // 视频进度
          let hdButton = videojs.createEl('button', {
            className:  'tk_timeout',
            'role': 'button'
          });
          this.controlBar.addChild('button', {
            'el':hdButton
          });
          this.controlBar.el_.insertBefore(hdButton,this.controlBar.fullscreenToggle.el_);

          let editVideo = function( fileid ){
            that.getVideoUrl(Object.assign({
              expirdate: that._expireDate
            },{fileid}),that.player);
          }

          //监听时间变化
          this.on("timeupdate",_.throttle(() => {
            // 计算观看进度
            let currentTime = this.currentTime();
            let duration = this.duration();
            let progress = ((100 * currentTime) / duration).toFixed(0);
            let progress2 = currentTime.toFixed(0);

            if( that.adverRightImg ){
              if( options.isInsertImg && options.isInsertImg.isShow ){
                let { adCount, intervalTime, playTime, info } = options.isInsertImg;
                let temp = progress2 / Number(intervalTime/1000);
                if( temp > 0 && temp <= adCount &&  info.length > 0 ){
                  if( /(^[0-9]\d*$)/.test(temp) ){
                    if(that.imgFalg){
                      that.imgFalg = false;

                      let item = info[temp-1];

                      if( item && item.isShow ){
                        // clearTimeout(that._imgTimer);
                        // that._imgTimer = setTimeout(()=>{
                        that.insertAdvertImg( item, playTime );
                        // },1000);
                        return false;
                      }
                    }
                  }
                }
              }
            }

            if( that.adverVideo ){
              that.adverRightImg = false; //关闭图片广告
              that.adverStopImg = false;


              let startTime = options.isInsertVideo.playTime;
              if( currentTime.toFixed(0) == (startTime/1000) ){
                that.mainVideo = true;
                that.adverVideo = false;
                showVideo.fileid = options.fileid;
                let mainUrl = localStorage.getItem('mainUrl');
                if( mainUrl ){
                  that.player.src(mainUrl);
                  that.player.load();
                  this.autoplay(true);
                  this.controls(true);
                }
                if(that.timeFlag){
                  let mainPlayTime = localStorage.getItem('mainPlayTime');
                  if( mainPlayTime && mainPlayTime ){
                    if( that.isStartLoad ){
                      setTimeout(()=>{
                        this.currentTime(Number(mainPlayTime)+0.5);
                        // this.seeking(Number(mainPlayTime)+0.5);
                      },500);
                    }
                    that.timeFlag = false;
                  }
                }

                return false;
              }
            }
            if( that.mainVideo ){
              that.adverRightImg = true; //打开图片广告
              that.adverStopImg = true; //开启暂停广告
              hdButton.innerHTML = '已观看: '+progress + '%';
              if( options.isInsertVideo && options.isInsertVideo.isShow ) {
                let { adCount, intervalTime, playTime, info } = options.isInsertVideo;
                let temp = progress2 / Number(intervalTime/1000);
                if( temp > 0 && temp <= adCount && info.length > 0 ){
                  if( /(^[0-9]\d*$)/.test(temp) ){ // TODO: 有问题  that.adverNumber
                      that.AdverVideoItem = temp-1;
                      let item = info[temp-1];
                      if( item && item.isShow ){
                        that.adverVideo = true;
                        that.timeFlag = true;
                        that.mainVideo = false;
                        showVideo.fileid = item.fileid;
                        that.getVideoUrl(Object.assign({
                          expirdate: that._expireDate
                        },showVideo),that.player,'adverVideo');
                        this.controls(false);
                        localStorage.setItem('mainPlayTime', currentTime.toFixed(0) );
                      }
                  }
                }
              }
            }
            if( that.startVideo ){
              that.adverRightImg = false; //关闭图片广告
              that.adverStopImg = false;
              let startTime = options.isStartVideo.playTime;
              if( currentTime.toFixed(0) == (startTime/1000) ){
                that.startVideo = false;
                //开始播放正片
                that.mainVideo = true;
                showVideo.fileid = options.fileid;
                that.getVideoUrl(Object.assign({
                  expirdate: that._expireDate
                },showVideo),that.player,'mainVideo');

              }
            }

          },1000));

          this.on('ended',function(){
               this.pause();
               // localStorage.clear();
               // this.hide()
          })
      });

    let videoType = '';
    if( options && options.isStartVideo && options.isStartVideo.isShow ){
      showVideo.fileid = options.isStartVideo.fileid;
      that.startVideo = true;
      videoType = 'startVideo';
    } else {
      showVideo.fileid = options.fileid;
      that.mainVideo = true;
      videoType = 'mainVideo';
    }
    this.getVideoUrl(Object.assign({
      expirdate: that._expireDate
    },showVideo),this.player, videoType);



  }

  getVideoUrl( { fileid, expirdate }, player, type = '' ){
    let that = this;
    let options = that.options;
    fetch(`http://vtest.sharenb.com/home/index/getsafechain?fileid=${fileid}&expirdate=${expirdate}`).then(res => {
        return res.json();
    }).then(res => {
        let MediaUrl = res.MediaInfoSet[0].BasicInfo.MediaUrl;
        player.src(MediaUrl);
        player.load();
        if( type == 'mainVideo' ){
          player.controls(true);
          localStorage.setItem('mainUrl',MediaUrl);
          player.autoplay(true);
        }
        if( type == 'adverVideo' || type == 'startVideo' ){
          if( this.videoFalg ){
            this.videoFalg = false;
            let closeType = 3; //关闭类型
            let playTimer = 0; //播放时间

            let isStartCount = true;
            if( type == 'adverVideo' ){
              player.controls(false);
            }
            player.one('play',()=>{
              if( type == 'startVideo' ){
                player.controls(false);
                closeType = options.isStartVideo.closeType;
                playTimer = options.isStartVideo.playTime;
                //倒计时
                let countDom = countDown( playTimer ,function(){
                  switch (closeType) {
                    case 0:
                      //开始播放正片
                      let showVideo = {
                        fileid:''
                      }
                      that.mainVideo = true;
                      that.startVideo = false;
                      showVideo.fileid = options.fileid;
                      that.getVideoUrl(Object.assign({
                        expirdate: that._expireDate
                      },showVideo),player,'mainVideo');
                      // 移除倒倒计时
                      removeElement(countDom);
                      break;
                    case 1:
                      alert('请注册会员')
                      break;
                    default:
                      return false;
                  }
                  that.videoFalg = true;
                },function(){
                  that.videoFalg = true;
                },that.videoContainer,  true ,that.k_video_timer);
              }

            })
          }
        }
    });
  }

  insertAdvertImg ( options, playTime ){
    this.createAdverImg( options, playTime );
  }
  insertPauseAdvertImg( option ){
    if( option && option.isShow ){
      this.createPauseAdverImg( option );
    }
  }

  createPauseAdverImg( option  ){
    var that = this;
    var pauseAdverBox = {
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

    var bAdvert = this.advertPauseImg = createDom( 'div', pauseAdverBox ); // 插入videoDOM
    var closeBtn = createDom( 'button', closeBtn, bAdvert ); // 插入videoDOM
    var aAdvert =  createDom( 'a', aProp, bAdvert ); // 插入videoDOM
    createDom( 'img', imgProp, aAdvert );
    this.videoContainer.appendChild(bAdvert);

    closeBtn.onclick = function(){
      that.deletePauseImgAdvert();
    }
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
      that.deleteImgAdvert();
      that.imgFalg = true;
    },()=>{
      that.deleteImgAdvert();
      that.imgFalg = true;
    },imgDomBox,that.startImg);

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

    var aAdvert = this.advertStartImg = createDom( 'a', aProp ); // 插入videoDOM
    createDom( 'img', imgProp, aAdvert );
    this.videoContainer.appendChild(aAdvert);
  }

  deleteImgAdvert(){
    let { advertImg } = this;
    if( advertImg ){
      removeElement( advertImg );
      this.advertImg = null;
    }
  }

  deleteVideoAdvert(){
    let {  advertVideo } = this;
    if( advertVideo ){
      removeElement( advertVideo );
      this.advertVideo = null;
    }
    this.player.play(); //恢复播放
  }

  deleteStartImgAdvert(){
    let { advertStartImg } = this;
    if( advertStartImg ){
      removeElement( advertStartImg );
      this.advertStartImg = null;
    }
  }
  deletePauseImgAdvert(){
    let { advertPauseImg } = this;
    if( advertPauseImg ){
      removeElement( advertPauseImg );
      this.advertPauseImg = null;
    }
  }
}
