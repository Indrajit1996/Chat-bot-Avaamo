$(document).ready(function() {
  $('.submit_on_enter').keydown(function(event) {
    if (event.keyCode == 13) {
      clickSearch();
      return false;
    }
  });
});

function openSocketConnection() {
  socket = new WebSocket("wss://c6.avaamo.com/socket/websocket?web_channel_id=undefined&_se_t=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsYXllcl9pZCI6ImYwNGUzMTM1LTYwOWMtNGQ3YS05NzJhLWRmMTFjZDU3ZGY5YyIsImFjY2Vzc190b2tlbiI6IkxzaURGd0h5OWJ1VS1JLTY1RGtGcTJEUFFVWmdDcjVvIiwiaWQiOjEyMDQ3NDEsImV4cGlyZV9hdCI6MTY0NDA1OTQ3Ni45NDI2NzYzfQ.wKfcPOr5ULsCnFLH6K8BWFMjo1sDfuVIV3FvfKet758&vsn=1.0.0");

  var joinRef = 1;
  var joinPayload = {
  "topic": "messages.f04e3135-609c-4d7a-972a-df11cd57df9c",
  "event": "phx_join",
  "payload": {},
  "ref": joinRef++
  }
  socket.onopen = function(e) {
    // alert("[open] Connection established");
    console.log("Socket connection established", e);
    socket.send(JSON.stringify(joinPayload), function(error) {
      console.log("Socket Connection Error", error);
    });
    document.getElementById("card-body").style.display = "block";
    document.getElementById("open-button").style.display = "none";
  };
}

function closeSocketConnection() {
  socket.close(1000, "Work complete");
  socket.onclose = (event) => {
    console.log("Closing socket connection, Thank You for using Avaamo Robot Assistant", event);
  };
}
function deleteChat(parent) {
  while (parent[0].firstChild) {
      parent[0].removeChild(parent[0].firstChild);
  }
}

function closeForm() {
  document.getElementById("card-body").style.display = "none";
  document.getElementById("open-button").style.display = "block";
  var parentNode = document.getElementsByClassName('chat__wrapper');
  deleteChat(parentNode);
  closeSocketConnection();
}

function openForm() {
  openSocketConnection();
}

function clickSearch() {
  var input_box = document.getElementById('search-box');
  
  var data = input_box.value;
  if(data && data.trim()) {
    input_box.value = '';
    $('.chat__wrapper').prepend('<div class="chat__message chat__message-own"><div>' + data + '</div></div>');

    const jsonData = {"message":{"content": data},"conversation":{"mode":false,"uuid":"2c94cf3a91cef51ca18e9b0990cb1b1e"},"channel_type":"web"};
    $.ajax({
      "url": "https://c6.avaamo.com/web_channel/channel/0bb27887-9589-45b2-bdf2-c6f5ad41ebe5/messages.json",
      "type": 'POST',
      "dataType": 'json',
      "crossDomain": true,
      "data": JSON.stringify(jsonData),
      "headers": {
        "se-t":
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsYXllcl9pZCI6ImYwNGUzMTM1LTYwOWMtNGQ3YS05NzJhLWRmMTFjZDU3ZGY5YyIsImFjY2Vzc190b2tlbiI6IkxzaURGd0h5OWJ1VS1JLTY1RGtGcTJEUFFVWmdDcjVvIiwiaWQiOjEyMDQ3NDEsImV4cGlyZV9hdCI6MTY0NDA1OTQ3Ni45NDI2NzYzfQ.wKfcPOr5ULsCnFLH6K8BWFMjo1sDfuVIV3FvfKet758",
        "Access-Control-Allow-Origin": '*',
      },
      "contentType": 'application/json; charset=utf-8',
      "success": (result) => {
        console.log("SUCCESS" ,result);
      },
      "error": function (error) {
        console.log("API error with status code", error.status);
      }
    });
    socket.onmessage = function(event) {
      let jsonValue = JSON.parse(event.data);
      let content = jsonValue.payload.pn_native.message.content;
      let attachments = jsonValue.payload.pn_native.message.attachments;
      console.log(attachments);
      if(content) {
        $('.chat__wrapper').prepend('<div class="chat__message"><div>' + content + '</div></div>');
      } 
      if(attachments) {
        let { card_carousel: {cards} } = attachments;
        
        $('.chat__wrapper').prepend('<div class="chat__message"><div class="carousel-wrapper"><div class="carousel">' 
        +
          cards.map((card, index) => (
            `
            <div class=${index === 0 ? "item  active" : "item"}>
              <h4>${card.title}</h4>
              <img class="carousel__photo" src=${card.showcase_image_url} alt="card3" width="360" height="345">
              <p style="font-size: 16px">${card.description}</p>
              <div class="carousel-caption" style="border-top: 1px solid black; border-bottom: 1px solid black">
                <p style="color: blue"><a href=${card.links[0].url}>${card.links[0].title}</a></p>
              </div>
            </div>
            `
          )) 
        +
        '</div></div></div>');
      }
    };
    setTimeout(() => {
      $(".content").stop().animate({ scrollTop: $(".content")[0].scrollHeight}, +4000);
    }, 100);
  }
}
