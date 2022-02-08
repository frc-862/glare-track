
var parentMap = document.getElementById("drawOnForm")
var c = parentMap.getContext("2d")
var rect = parentMap.getBoundingClientRect();

var backImage = undefined;
var imageSettings = {};

var working = false;
var touching = false;

var lastTouchPoint = [];

document.getElementById('selection_start').addEventListener('click', function(evt){
    working = true;
    data = {
        "all":{
          "sets":[]
        }
      }

});

document.getElementById("draw_finish").addEventListener('click', function(evt){
    working = false;
    
})


c.beginPath();
parentMap.width = window.innerWidth;
parentMap.height = window.innerHeight;
c.lineWidth = 2;
c.strokeStyle = "#4400FF"
c.globalCompositeOperation="source-over";
var x = 0;
var y = 0;
var tool = "draw";
var color = "all";
var data = {
  "all":{
    "sets":[]
  }
}


var prevX = window.innerWidth;
var prevY = window.innerHeight;

var currentPoints = [];
var erasedPoints = [];
var tempLines = [];


document.addEventListener('mousemove', onMouseMove, false)

function onMouseMove(e){
  e.preventDefault();
  e.stopPropagation();
  if(e.type == "touchmove"){
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
  }else{
    x = e.clientX;
    y = e.clientY;
  }
  
  if(tool == "draw" && tracking){
    if(color != "erase"){
      currentPoints.push([x-rect.left,y-rect.top])
    }else{
      erasedPoints.push([x-rect.left,y-rect.top])
    }
    
  }
  
    
}

function onMouseDown(e){
  if(!tracking){
    currentPoints = [];
    erasedPoints = [];
    //c.strokeStyle = "#FFFFFF";
    c.moveTo(x-rect.left,y-rect.top);
    //console.log("moved");
  }
  tracking = true;
  touching = false;
}
function onMouseUp(e){
  if(color != "none" && color != "yellow" && color != "erase" && tool == "draw"){
    data[color]["sets"].push(currentPoints.map((x) => x));
  }else if(tool == "draw" && color == "yellow"){
    tempLines.push(currentPoints.map((x) => x));
  }
  tracking = false;
  queuedToRedo = [];
  touching = false;
}

function getMouseX() {
    return x;
}

function getMouseY() {
    return y;
}

var tracking = false;
parentMap.addEventListener("mousedown", onMouseDown, false);
parentMap.addEventListener("mouseup", onMouseUp, false);

parentMap.addEventListener("touchstart", onMouseDown, false)
  parentMap.addEventListener("touchend", onMouseUp, false)
  parentMap.addEventListener("touchmove", onMouseMove, false);
/*parentMap.addEventListener("touchmove", function (e) {
  var touch = e.touches[0];
  var mouseEvent = new MouseEvent("mousemove", {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  parentMap.dispatchEvent(mouseEvent);
}, false);*/

function closeToErase(p){
  var found = false;
  erasedPoints.forEach(ep => {
    if(Math.abs(ep[0]-p[0]) < 50 && Math.abs(ep[1] - p[1]) < 50){
      //console.log("Too Close")
      found = true;
      return false;
    }else{
      return true;
      //console.log((ep[0]-p[0]) + ', ' + (ep[1] - p[1]))
    }
  })
  return found;
}

function reUpdateLines(){
  var saveColor = c.strokeStyle;
  var saveWidth = c.lineWidth;
  var saveComposite = c.globalCompositeOperation;
  var i = 0;

  
  data["all"]["sets"].forEach(rSet => {
    try{
      var erased = false;
      c.lineWidth = 2;
      c.globalCompositeOperation="source-over";
      c.beginPath();
      c.moveTo(rSet[0][0], rSet[0][1])
      rSet.forEach(p => {
        if(closeToErase(p)){
          erased = true;
          return false
        }
        c.lineTo(p[0], p[1]);
        return true;
      });
      if(erased){
        console.log("Removed")
        data["all"]["sets"].splice(i, 1);
      }else{
        if(erased){
          //console.log("What")
        }
        c.stroke();
      } 
    }catch(e){
      
    }
    i += 1;
    
  });
  
  c.strokeStyle = saveColor;
  c.lineWidth = saveWidth;
  c.globalCompositeOperation = saveComposite;
}


var count = 0;
setInterval(function(){
    if(working){
    if(tracking){
        if(tool == "draw"){
          //console.log("drawn")
          c.lineTo(x-rect.left, y-rect.top);
          
          c.stroke();
          //c.strokeStyle = "#FF0000";
          
        }
        
    }
    if(!tracking){
        c.clearRect(0, 0, parentMap.width, parentMap.height);
        if(backImage != undefined){
            
            c.drawImage(backImage, 0,0, backImage.width, backImage.height,
                imageSettings["csX"],imageSettings["csY"],backImage.width*imageSettings["ratio"], backImage.height*imageSettings["ratio"]);
        }

        reUpdateLines();
        reUpdatePositions();
    }else if(count % 10 == 0){
        reUpdatePositions();
    }
    
    count += 1
    }
}, 5)

var queuedToRedo = [];

document.getElementById("draw_undo").addEventListener("click", function(){
    queuedToRedo.push(data[color]["sets"].splice(data[color]["sets"].length-1, 1)[0]);

    if(backImage != undefined){
        
        c.drawImage(backImage, 0,0, backImage.width, backImage.height,
            imageSettings["csX"],imageSettings["csY"],backImage.width*imageSettings["ratio"], backImage.height*imageSettings["ratio"]);
    }

    reUpdateLines();
    reUpdatePositions();
    
});

document.getElementById("draw_redo").addEventListener("click", function(){
    if(queuedToRedo.length > 0){
        data[color]["sets"].push(queuedToRedo.splice(queuedToRedo.length-1, 1)[0]);

        if(backImage != undefined){
            
            c.drawImage(backImage, 0,0, backImage.width, backImage.height,
                imageSettings["csX"],imageSettings["csY"],backImage.width*imageSettings["ratio"], backImage.height*imageSettings["ratio"]);
        }

        reUpdateLines();
        reUpdatePositions();
    }
    
});

function reUpdatePositions(){
    var saveColor = c.strokeStyle;
    var saveWidth = c.lineWidth;
    var saveComposite = c.globalCompositeOperation;
    
    c.globalCompositeOperation="source-over";
    c.lineWidth = "10";
    
    if(data["all"]["start"] != undefined){
      c.strokeStyle = "#4400FF";
      c.beginPath();
      c.arc(data["all"]["start"][0], data["all"]["start"][1], 12, 0, 2 * Math.PI)
      c.stroke();
    }

  
    if(data["all"]["end"] != undefined){
      c.strokeStyle = "#4400FF";
      c.beginPath();
      c.rect(data["all"]["end"][0], data["all"]["end"][1], 24,24)
      c.stroke();
    }

    c.strokeStyle = saveColor;
    c.lineWidth = saveWidth;
    c.globalCompositeOperation = saveComposite;
    c.beginPath();
    c.moveTo(x-rect.left, y-rect.top);
    
  }

setInterval(function(){
    var img = new Image();
    img.src = "./images/formimages/"+document.getElementById("settings_form").value;
    img.onload = function(){
        var hRatio = parentMap.width  / img.width    ;
        var vRatio =  parentMap.height / img.height  ;
        var ratio  = Math.min ( hRatio, vRatio );
        var centerShift_x = ( parentMap.width - img.width*ratio ) / 2;
        var centerShift_y = ( parentMap.height - img.height*ratio ) / 2;
        imageSettings["csX"] = centerShift_x;
        imageSettings["csY"] = centerShift_y;
        imageSettings["ratio"] = ratio;

        backImage = img;
    }

}, 2000);


/*document.getElementById("eraseo").addEventListener("click", function(){
  color = "erase";
  c.lineWidth = 100;
  c.globalCompositeOperation="destination-out";
  document.getElementById("redo").style.backgroundColor = null
  document.getElementById("blueo").style.backgroundColor = null
  document.getElementById("greeno").style.backgroundColor = null
  document.getElementById("yellowo").style.backgroundColor = null
  c.beginPath();
});
*/
