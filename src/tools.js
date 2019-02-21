const createDom = (ele , prop, target) => {
    var oEle = document.createElement(ele);
    for (var o in prop) {
      if (prop.hasOwnProperty(o)) {
        oEle[o] = prop[o]
      }
    }
    if( target ){
      target.appendChild(oEle);
    }
    return oEle;
}
const removeElement = (_element) =>{
   var _parentElement = _element.parentNode;
   if(_parentElement){
      _parentElement.removeChild(_element);
   }
}
const countDown  = ( playTime, clickCallback, callback, rootDom, isCount=true, tk_adverTime) => {
    clearInterval(tk_adverTime);
    var timerCloseBox = createDom('div',{
      className:'timer_close_box',
    },rootDom);

    if(isCount){
      timerCloseBox.style.display = 'block';
    }else{
      timerCloseBox.style.display = 'none';
    }

    var timerText = createDom('span',{
      className:'timer_close_text'
    },timerCloseBox);

    var timerCloseBtn = createDom('a',{
      className:'timer_close_btn'
    },timerCloseBox);
    timerCloseBtn.innerHTML = '&times;';
    timerCloseBox.onclick = clickCallback || function(){};

    timerText.innerText = ( playTime / 1000 ) + 's关闭广告';
    tk_adverTime = setInterval(()=>{
      playTime -= 1000;
      timerText.innerText = ( playTime / 1000 ) + 's关闭广告';
      if( playTime <= 0 ){
        clearInterval(tk_adverTime);
        callback && callback();
        removeElement(timerCloseBox);
      }
    },1000);
    return timerCloseBox;
  }


export {
  createDom,
  countDown,
  removeElement
}
