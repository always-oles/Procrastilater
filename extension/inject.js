/* global chrome */

// chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => {
//   console.log('tab received:', message);

//   if (!message.action) return;

//   switch (message.action) {
//     case 'notify':

//     break;
//   }
// });

//-------------------------- font, positioning, image, cursor pointer

(function() {

    // check if we added a popup for this tab already
    if (document.querySelectorAll('.pl-popup-container').length > 0) {
      console.log('added already');
      return;
    }

    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
    @keyframes shake {
      0% {
        transform: translateY(0);
      }
      25% {
        transform: translateY(15px);
      }
      50% {
        transform: translateY(5px);
      }
      75% {
        transform: translateY(20px);
      }
      100% {
        transform: translateY(0);
      }
    }
    @keyframes spin {
      0% {
        transform: rotate(-15deg);
      }
      25% {
        transform: rotate(15deg);
      }
      50% {
        transform: rotate(-5deg);
      }
      75% {
        transform: rotate(5deg);
      }
      100% {
        transform: rotate(-15deg);
      }
    }
    @keyframes flyIn {
      0% {
        transform: translateX(1000px);
      }
      50% {
        transform: translateX(-50px);
      }
      100% {
        transform: translateX(0px);
      }
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
    .pl-popup-container {
      position: fixed;
      display: flex;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1000;
      background: rgba(0, 0, 0, 0.7);
      align-items: flex-start;
      justify-content: flex-end;
      z-index: 9999999;
      font-family: "Roboto", "Open Sans", Arial, sans-serif;
      font-size: 12px;
      animation: fadeIn 1s 1
    }
    .pl-popup-container.fadeOut {
      animation: fadeOut 0.5s 1;
      animation-fill-mode: forwards;
    }
    .pl-popup-container .pl-popup {
      position: absolute;
      top: 0;
      right: 0;
      margin: 10px 10px 0 0;
      width: 400px;
      background: #ffffff;
      -webkit-border-radius: 7px;
      -moz-border-radius: 7px;
      -ms-border-radius: 7px;
      border-radius: 7px;
      z-index: 9999;
    }
    .pl-popup-container .pl-popup.shake{
      animation: shake 0.3s ease-out 1;
    }
    .pl-popup-container .pl-popup.flyIn {
      display: block;
      animation: flyIn 1s ease;
    }
    .pl-popup-container .pl-popup .pl-main-content {
      text-align: center;
      padding: 20px;
      color: #333333;
    }
    .pl-popup-container .pl-popup .pl-main-content .pl-icon {
      padding: 10px 0;
      text-align: center;
    }
    .pl-popup-container .pl-popup .pl-main-content .pl-icon img {
      width: 100px;
      height: 100px;
      user-select: none;
    }
    .pl-popup-container .pl-popup .pl-main-content .pl-alarm {
      animation: spin 1.2s ease-in-out infinite;
    }
    .pl-popup-container .pl-popup .pl-main-content .pl-title {
      padding: 15px 0;
      font-size: 2.2em;
      font-weight: 700;
    }
    .pl-popup-container .pl-popup .pl-main-content .pl-text {
      padding: 5px 10px 0;
      font-size: 1.3em;
      font-weight: 400;
      line-height: 24px;
    }
    .pl-popup-container .pl-popup .pl-main-content .pl-text .pl-bookmark-title {
      font-weight: 700;
      margin: 7px 0px;
      display: inline-block;
    }
    .pl-popup-container .pl-popup .pl-buttons {
      -webkit-border-bottom-right-radius: 7px;
      -webkit-border-bottom-left-radius: 7px;
      -moz-border-radius-bottomright: 7px;
      -moz-border-radius-bottomleft: 7px;
      border-bottom-right-radius: 7px;
      border-bottom-left-radius: 7px;
      display: flex;
      align-items: flex-end;
      justify-content: space-evenly;
      height: 60px;
      position: relative;
      bottom: -5px;
      width: 100%;
      color: #ffffff;
      padding: 0;
      margin: 0;
    }
    .pl-popup-container .pl-popup .pl-buttons button {
      cursor: pointer;
      box-sizing: border-box;
      width: 33.3%;
      text-align: center;
      height: 60px;
      outline: none;
      color: #ffffff;
      background: inherit;
      font-size: 1.3em;
      font-weight: 400;
      transition: transform 0.2s;
      border: 0;
      box-shadow: none;
      margin: 0;
      padding: 0;
    }
    .pl-popup-container .pl-popup .pl-buttons button.pl-left {
      -webkit-border-bottom-left-radius: 7px;
      -moz-border-radius-bottomleft: 7px;
      border-bottom-left-radius: 7px;
      border-top-right-radius: 0;
    }
    .pl-popup-container .pl-popup .pl-buttons button.pl-right {
      -webkit-border-bottom-right-radius: 7px;
      -moz-border-radius-bottomright: 7px;
      border-bottom-right-radius: 7px;
      border-top-left-radius: 0;
    }
    .pl-popup-container .pl-popup .pl-buttons button.pl-middle {
      border-radius: 0;
    }
    .pl-popup-container .pl-popup .pl-buttons button.pl-accept {
      background: #39B54A;
    }
    .pl-popup-container .pl-popup .pl-buttons button.pl-accept:hover {
      background: #4bc65c;
    }
    .pl-popup-container .pl-popup .pl-buttons button.pl-accept:active {
      background: #33a242;
      transform: translateY(1px);
    }
    .pl-popup-container .pl-popup .pl-buttons button.pl-reshuffle {
      background: #F79F1E;
    }
    .pl-popup-container .pl-popup .pl-buttons button.pl-reshuffle:hover {
      background: #f8ae40;
    }
    .pl-popup-container .pl-popup .pl-buttons button.pl-reshuffle:active {
      background: #f39409;
      transform: translateY(1px);
    }
    .pl-popup-container .pl-popup .pl-buttons button.pl-postpone {
      background: #AA0034;
    }
    .pl-popup-container .pl-popup .pl-buttons button.pl-postpone:hover {
      background: #ce003f;
    }
    .pl-popup-container .pl-popup .pl-buttons button.pl-postpone:active {
      background: #91002c;
      transform: translateY(1px);
    }      
    `;

    document.getElementsByTagName('head')[0].appendChild(style);
    var div = document.createElement('div');
    div.classList.add('pl-popup-container');

    div.innerHTML = `
      <div class='pl-popup'>
          <div class='pl-main-content'>
              <div class='pl-icon'><img src="${chrome.extension.getURL('images/alarm.svg')}" class='pl-alarm'/></div>
              <div class='pl-title'>${chrome.i18n.getMessage('popup_header')}</div>
              <div class='pl-text'>
                ${chrome.i18n.getMessage('popup_suggests')}<br/>
                <span class='pl-bookmark-title'></span><br/>
                ${chrome.i18n.getMessage('popup_agree')}
              </div>
          </div>

          <div class='pl-buttons'>
              <button class='pl-accept pl-left'>${chrome.i18n.getMessage('popup_button_yes')}</button>
              <button class='pl-reshuffle pl-middle'>${chrome.i18n.getMessage('popup_button_shuffle')}</button>
              <button class='pl-postpone pl-right'>${chrome.i18n.getMessage('popup_button_postpone')}</button>
          </div>
      </div>
    `;

    var
      popupContainer  = div;    
      popup           = div.querySelectorAll('.pl-popup')[0];
      titleContainer  = div.querySelectorAll('.pl-bookmark-title')[0],
      url             = null,
      id              = null;
      soundEnabled    = true,
      intervalHolder  = null,
      savePopupData   = null;

    /**
     * IIFE for getting + saving popup data from localstorage
     */
    (savePopupData = function(data, withoutSound = false) {


      // not passed - first call
      if (!data) {
        // get from storage
        chrome.storage.local.get('popupData', (result) => {
          // save
          save(result);
        });
      } 
      // if passed - just save
      else {
        save(data);
      }

      // save required data in global variables
      function save(result) {
        id            = result.popupData.id;
        url           = result.popupData.url;
        soundEnabled  = result.popupData.soundEnabled || true;
        titleContainer.innerHTML   = `<img class='pl-favicon' src='https://www.google.com/s2/favicons?domain=${url}'/> ${result.popupData.title}`;
        titleContainer.setAttribute('title', url);
  
        // play sound or not
        if (!withoutSound) {
          playSound('bell');
        }
      }
    })();

    /**
     * Called upon shuffle button click to wait for new popup data
     */
    function waitForNewPopup() {
      console.warn('started waiting for new data');
      intervalHolder = setInterval(() => {
        comparePopupData();
      }, 100);
    }

    /**
     * Compare old data with current data, if changed - save new
     */
    function comparePopupData() {
      chrome.storage.local.get('popupData', (result) => {
        if (result.popupData.id !== id) {
          console.warn('received new data');
          savePopupData(result, true);
          clearInterval(intervalHolder);
        }
      });
    }

    // accept button container
    var accept    = div.querySelectorAll('.pl-accept')[0];
    var reshuffle = div.querySelectorAll('.pl-reshuffle')[0];
    var postpone  = div.querySelectorAll('.pl-postpone')[0];
    
    
    /**
     * Accept click handler
     */
    accept.addEventListener('click', (e) => {
      playSound('accept');
      unmountPopup(false);
      chrome.runtime.sendMessage({ action: 'accept', data: { id, url } });
    });

    /**
     * Postpone click handler
     */
    postpone.addEventListener('click', (e) => {
      playSound('postpone');
      unmountPopup();
      chrome.runtime.sendMessage({ action: 'postpone' });
    });

    /**
     * Reshuffle click handler
     */
    reshuffle.addEventListener('click', (e) => {

      // demand a new bookmark
      chrome.runtime.sendMessage({ action: 'shuffle', data: id });

      // launch timer waiting for new data
      waitForNewPopup();

      // animate
      popup.classList.add('shake');

      // remove animation later
      setTimeout(() => {
        popup.classList.remove('shake');
      }, 1000);

      // play shake sound if possible
      try {
        var myAudio = new Audio();
        myAudio.src = chrome.extension.getURL('assets/shake_2.mp3');
        myAudio.volume = 0.5;
        myAudio.play();
      } catch(e) {}
    });


    /**
     * Fade out and then remove from page
     */
    function unmountPopup(animate = true) {
      if (animate) {
        // fade out        
        popupContainer.classList.add('fadeOut');   
        
        // remove from page
        setTimeout(() => div.parentElement.removeChild(div), 1000);
      } else {
        // just remove
        div.parentElement.removeChild(div);
      }
    }

    /**
     * Play sound on demand
     */
    function playSound(id) {
      if (soundEnabled) {
        try {
          var myAudio     = new Audio();
          myAudio.src     = chrome.extension.getURL('assets/'+id+'.mp3');
          myAudio.volume  = 0.5;
          myAudio.play();
        } catch(e) {}
      } 
    }
    
    document.body.appendChild(div);
})();