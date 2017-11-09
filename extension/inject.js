// document.addEventListener("mousedown", function(event){
//   console.log('privetiki');
// }, false);

// chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => {
//   console.log('tab received:', message);

//   if (!message.action) return;

//   switch (message.action) {
//     case 'notify':

//     break;
//   }
// });

//-------------------------- font, positioning, image, cursor pointer http://volshebnaya-eda.ru/kollekcia-receptov/dough/pelmeni/
//chrome.extension.sendMessage({});

(function() {

    // check if we added a popup for this tab already
    if (document.querySelectorAll(".pl-popup-container").length > 0) {
      console.log('added')
      return;
    }

    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
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
      z-index: 9998;
      font-family: "Roboto", "Open Sans", Arial, sans-serif;
      font-size: 12px;
    }
    .pl-popup-container.fadeIn {
      display: flex;
      animation: fadeIn 0.5s;
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
      padding: 15px 10px 0;
      font-size: 1.4em;
      font-weight: 400;
      line-height: 24px;
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
      <div class='pl-popup' ref='popup'>
          <div class='pl-main-content'>
              <div class='pl-icon'><img src=${chrome.extension.getURL('images/alarm.svg')} class='pl-alarm'/></div>
              <div class='pl-title'>Time has come!</div>
              <div class='pl-text'>The magic shuffle suggests you opening the "<span class='pl-bookmark-title'></span>" bookmark. Do you agree? </div>
          </div>

          <div class='pl-buttons'>
              <button class='pl-accept pl-left'>Yes, open it</button>
              <button class='pl-reshuffle pl-middle'>No, reshuffle</button>
              <button class='pl-postpone pl-right'>No, postpone</button>
          </div>
      </div>
    `;

    let titleContainer = div.querySelectorAll(".pl-bookmark-title")[0],
        url = null,
        id = null;

    // get data for current popup
    chrome.storage.local.get('popupData', (result) => {

      // set bookmark name
      titleContainer.innerHTML = '<img src="chrome://favicon/'+result.popupData.url+'"/>' + result.popupData.name;
      id = result.popupData.id;
      url = result.popupData.url;
    });

    // accept button container
    var accept = div.querySelectorAll(".pl-accept")[0];

    // accept click handler
    accept.addEventListener('click', (e) => {
      chrome.runtime.sendMessage({ action: "openTab", url });
    });

    // reshuffle button container
    var reshuffle = div.querySelectorAll(".pl-reshuffle")[0];

    // reshuffle click handler
    reshuffle.addEventListener('click', (e) => {
      console.log('yee boii', e)
    });

    // postpone button container
    var postpone = div.querySelectorAll(".pl-postpone")[0];

    // postpone click handler
    postpone.addEventListener('click', (e) => {
      console.log('yee boii', e)
    });
    
    document.body.appendChild(div);
  
  })();