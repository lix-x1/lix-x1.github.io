var $app = $app || {};
var $loader = $loader || {};
var $toaster = $toaster || {};
var $chart = $chart || {};

$app.rotateReq = 0;
$app.lerp = function lerp(a, b, t) {
    return a + (b - a) * t;
}
$app.distanceVector = function (v1, v2, flip) {
    var dx = v1.x - v2.x;
    var dy = v1.y - v2.y;
    var dz = v1.z - v2.z;
    var fl = v1.x < v2.x && flip? -1: 1;
    fl *= v1.y < v2.y && flip? -1: 1;
    return Math.sqrt(dx * dx + dy * dy + dz * dz)*fl;
}
$app.nft_image = { elem: document.getElementById('nft_image') };
$app.figurea0 = { elem: document.getElementById('figurea0'), address: document.getElementById('nft_address') };
$app.figurea1 = { elem: document.getElementById('figurea1'), image: document.getElementById('nft_image') };
$app.figurea2 = { elem: document.getElementById('figurea2') };
$app.figurea3 = { elem: document.getElementById('figurea3') };

$(window).resize(function (event) {
    $app.onresize();
});

var orientMode = false;
$(window).mousemove(function (event) {
    tilt([event.pageY - 25, event.pageX - 25, 0]);
    if (orientMode) return;
    window.removeEventListener("deviceorientation", $app.tiltfunc, true);
    window.removeEventListener("devicemotion", $app.tiltfunc, true);
    window.removeEventListener("MozOrientation", $app.tiltfunc, true);
    orientMode = true;
});
$(window).mousedown(function(event){
    orientMode = false;
});
report_card = document.getElementById('report_card');
report_ball = document.getElementById('report_ball');

var corners = [100, 100, 300, 100, 100, 300, 300, 300];
var center_distances = [0, 0, 0, 0];
var card = document.getElementById("card");
var results = document.getElementById("results");
var parentPerspective = 1300; // Match this to the parent's perspective CSS value
function adjustblurcard(card) {
    matrix3dArray = getMatrix3DArrayFromElement(card);
    corners = matrix3DToCorners(matrix3dArray, card.clientWidth, card.clientHeight, parentPerspective);
    for (var i = 0; i != 8; i += 2) {
        var elt = document.getElementById("marker" + i);
        elt.style.left = corners[i] + "px";
        elt.style.top = corners[i + 1] + "px";
        center_distances[i/2 >> 0] = $app.distanceVector(screenhalfv, {x: corners[i], y: corners[i + 1], z: 0}, true) / screenhalfv.x;
    }
    console.clear();
    console.log(center_distances);
    return corners;
}

function tilt(arr) {
    report = "Width: " + $app.onsize.width + "<br>";
    report += "Height: " + $app.onsize.height + "<br>";
    report += "X-axis Angle Velocity: " + arr[0] + "<br>";
    report += "Y-axis Angle Velocity: " + arr[1] + "<br>";
    report += "Z-axis Angle Velocity: " + arr[2] + "<br>";
    report_card.innerHTML = report;
    report_ball.style.left = (arr[1]) + "px";
    report_ball.style.top = (arr[0]) + "px";
    report_ball.style.transform = "rotate(" + arr[2] + "deg)";
    $app.arr = arr;
    if ($app.rotateReq == 0)
        $app.rotateElement();
    // $app.figurea2.elem.style.transform = "rotateX("+arr[0]+"deg rotateY("+arr[1]+"deg) rotateZ("+arr[2]+"deg)";
}

var gyrospeed = { wide: 7, tall: 14, x: 0, y: 0, z: 0 };
var gyroinit;
$app.tiltfunc = function (event) {
    if (report_ball.offsetTop < report_ball.offsetHeight * -1 || report_ball.offsetLeft < report_ball.offsetWidth * -1) {
        $app.onresize();
        window.removeEventListener("deviceorientation", $app.tiltfunc, false); // Slow it down.
        window.removeEventListener("devicemotion", $app.tiltfunc, false); // Slow it down.
        window.removeEventListener("MozOrientation", $app.tiltfunc, false); // Slow it down.
        gyrospeed.wide *= -1;
        gyrospeed.tall *= -1;
        report_ball.style.left = ($app.onsize.width * 0.5) + "px";
        report_ball.style.top = ($app.onsize.height * 0.5) + "px";
        // for three seconds
        clearTimeout(gyroinit);
        gyroinit = setTimeout(function () { window.addEventListener("deviceorientation", $app.tiltfunc, true); }, 3000);
    }

    if ($app.onsize.height > $app.onsize.width) {
        tilt([
            event.beta * gyrospeed.tall,
            event.gamma * gyrospeed.tall + ($app.onsize.width * 0.5),
            event.alpha
        ]);
    } else {
        tilt([
            event.gamma * gyrospeed.wide,
            event.beta * (gyrospeed.wide * -1) + ($app.onsize.width * 0.5),
            event.alpha
        ]);
    }
}

var $width = $app.nft_image.elem.clientWidth;
var $height = $app.nft_image.elem.clientHeight;
var screenhalfv = {
    x: $width/2 >> 0,
    y: $height/2 >> 0,
    z: 0
};
$app.onresponse.push(function () {
    window.removeEventListener("deviceorientation", $app.tiltfunc, false); // Slow it down.
    window.removeEventListener("devicemotion", $app.tiltfunc, false); // Slow it down.
    window.removeEventListener("MozOrientation", $app.tiltfunc, false); // Slow it down.
    $width = $app.nft_image.elem.clientWidth;
    $height = $app.nft_image.elem.clientHeight;
    screenhalf = {
        x: $width/2 >> 0,
        y: $height/2 >> 0,
        z: 0
    };
    $app.nft_image.elem.style.backgroundSize = $width + 'px';
    var $thick = 5;
    var $round = 40;
    var clipPathStr = "path('" +
        // Outer TL
        "M " + (0) + " " + ($round) +
        " C " + (0) + " " + (0) + " " + (0) + " " + (0) + " " + ($round) + " " + (0) +
        " L " + ($width - $round) + " " + (0) +
        // Outer TR
        " C " + ($width) + " " + (0) + " " + ($width) + " " + (0) + " " + ($width) + " " + ($round);
        
        // Inner Cut
        var clipPathStrCut = clipPathStr+" L " + ($width) + " " + ($height*0.7) +
        " L " + (0) + " " + ($height*0.7) +
        " L " + (0) + " " + ($height*0.85) +
        " L " + ($width) + " " + ($height*0.85);
        
        
        var inner = " L " + ($width) + " " + ($height - $round) +
        // Outer BR
        " C " + ($width) + " " + ($height) + " " + ($width) + " " + ($height) + " " + ($width - $round) + " " + ($height) +
        " L " + ($round) + " " + ($height) +
        // Outer BL
        " C " + (0) + " " + ($height) + " " + (0) + " " + ($height) + " " + (0) + " " + ($height - $round) +
        " L " + (0) + " " + ($round) +
        "')";

    $app.figurea0.elem.style.clipPath = clipPathStr+inner;
    $app.figurea1.elem.style.clipPath = clipPathStrCut+inner;
    if (typeof event != "undefined") {
        if (window.DeviceOrientationEvent) {
            gyrospeed.x = event.beta;
            gyrospeed.y = event.gamma;
            gyrospeed.z = event.alpha;
            window.addEventListener("deviceorientation", $app.tiltfunc, true);
        } else if (window.DeviceMotionEvent) {
            gyrospeed.x = event.acceleration.x * 2;
            gyrospeed.y = event.acceleration.y * 2;
            gyrospeed.z = event.acceleration.z * 2;
            window.addEventListener("devicemotion", $app.tiltfunc, true);
        } else {
            gyrospeed.x = orientation.x * 50;
            gyrospeed.y = orientation.y * 50;
            gyrospeed.z = orientation.z * 50;
            window.addEventListener("MozOrientation", $app.tiltfunc, true);
        }
        orientMode = false;
    }
}
)

var delta_rotateX = 0;
var delta_rotateY = 0;
var delta_rotateZ = 0;
var v1 = {
    x: 0,
    y: 0,
    z: 0
};
var v2 = {
    x: 0,
    y: 0,
    z: 0
    };
var clipMode = {set: 'clip-path', open: 'polygon(', close: ')' }
$app.thick = 4;
function rotate_step() {
    rotateX = $app.lerp(delta_rotateX, $app.arr[0], 0.05);
    rotateY = $app.lerp(delta_rotateY, $app.arr[1], 0.05);
    rotateZ = $app.lerp(delta_rotateZ, $app.arr[2], 0.05);
    var $width = $app.figurea1.elem.clientWidth;
    var $height = $app.figurea1.elem.clientHeight;
    $thick = $app.thick;
    if (rotateX % 360 > 90 && rotateX % 360 < 270) {
        var clipPathStr = 
        $app.figurea2.elem.style.setProperty(clipMode.set, clipMode.open+'0px 0px, ' +
            $width + 'px 0px, ' +
            $width + 'px ' + $height + 'px, ' +
            '0px ' + $height + 'px, ' +
            '0px ' + $thick + 'px, ' +
            $thick + 'px ' + $thick + 'px, ' +
            $thick + 'px ' + ($height - $thick) + 'px, ' +
            ($width - $thick) + 'px ' + ($height - $thick) + 'px, ' +
            ($width - $thick) + 'px ' + $thick + 'px, ' +
            '0px ' + $thick + 'px'+clipMode.close);
        // $app.nft_image.elem.style.opacity = 1;
    } else {
        var clipPathStr = 
        $app.figurea2.elem.style.setProperty(clipMode.set, clipMode.open+'0px 0px, ' +
        $width + 'px 0px, ' +
        $width + 'px ' + $height + 'px, ' +
        '0px ' + $height + 'px, ' +
        '0px ' + $thick + 'px, ' +
        ($thick + $width*0.70) + 'px ' + $thick + 'px, ' +
        ($thick + $width*0.70) + 'px ' + ($height - $thick) + 'px, ' +
        ($width*0.85 - $thick) + 'px ' + ($height - $thick) + 'px, ' +
        ($width*0.85 - $thick) + 'px ' + $thick + 'px, ' +
        '0px ' + $thick + 'px'+clipMode.close);
        // if (rotateY % 360 > 90 && rotateY % 360 < 270){
        //     //$app.figurea1.elem.style.opacity = 1;
        //     $app.nft_image.elem.style.opacity = 0.0;
        // } else {
        //     $app.nft_image.elem.style.opacity = 0.0;
        // }
    }

    var v1 = {
        x: delta_rotateX,
        y: delta_rotateY,
        z: delta_rotateZ
    };
    var v2 = {
        x: rotateX,
        y: rotateY,
        z: rotateZ
    };

    $app.figurea0.elem.style.transform = $app.figurea1.elem.style.transform = "rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) rotateZ(" + rotateZ + "deg)";
    $app.figurea1.elem.style.backgroundPosition = (rotateX*4)+"px "+(rotateY*6)+"px"

    adjustblurcard($app.figurea1.elem);

    $app.figurea2.elem.style.setProperty(clipMode.set, clipMode.open+`
        ${corners[0]}px ${corners[1]}px, 
        ${corners[2]}px ${corners[3]}px, 
        ${corners[6]}px ${corners[7]}px, 
        ${corners[4]}px ${corners[5]}px
        `+clipMode.close);

    if ($app.custom !== undefined)
        $app.custom[0]();
    else
        if (center_distances[0] < center_distances[1]) {
            $app.figurea1.elem.style.zIndex = 1;
        } else {
            $app.figurea1.elem.style.zIndex = 2;
            $app.figurea3.elem.style.setProperty(clipMode.set, clipMode.open+`
                ${corners[0]+($thick*center_distances[0])}px ${corners[1]-($thick*center_distances[0])}px, 
                ${corners[2]-($thick*center_distances[1])}px ${corners[3]+($thick*center_distances[1])}px, 
                ${corners[6]-($thick*center_distances[2])}px ${corners[7]-($thick*center_distances[2])}px, 
                ${corners[4]+($thick*center_distances[3])}px ${corners[5]+($thick*center_distances[3])}px
                `+clipMode.close);
        }

    //console.log(center_distances[0] < center_distances[1]);
    //console.log(corners[5]+" < "+(corners[5]-($thick*center_distances[3])));
    
    disvec = $app.distanceVector(v1, v2, false);
    if (disvec < 1) {
        cancelAnimationFrame($app.rotateReq);
        $app.rotateReq = 0;
        if (typeof ($app.rotateFunc) != "undefined") {
            $app.rotateFunc();
            $app.rotateFunc = undefined;
        }
        return;
    }
    delta_rotateX = rotateX;
    delta_rotateY = rotateY;
    delta_rotateZ = rotateZ;
    $app.rotateReq = requestAnimationFrame(rotate_step);
}
$app.rotateElement = function (func) {
    $app.rotateFunc = func;
    $app.rotateReq = requestAnimationFrame(rotate_step);
}

$app.onresize();
tilt([15, 40, 0]);

if (CSS.paintWorklet) {              
    CSS.paintWorklet.addModule('./scripts/pen.js');
    clipMode = {set: '--path', open: '', close: '' }
} else {
    alert("Consider Chrome or Edge for better GFX.")
    $app.figurea3.elem.style.setProperty("mask", "paint()")
    $app.figurea2.elem.style.setProperty("mask", "paint()")
}
// Creating elements tags above.
function channelSplit(elem) {
    if (elem) {
        const inner = elem.innerHTML;
        elem.innerHTML = "";

        const spanHidden = document.createElement("span");
        spanHidden.classList.add("channel_split_static");
        spanHidden.innerHTML = inner;
        elem.appendChild(spanHidden);

        ["red", "green", "blue"].forEach(x => {
            const span = document.createElement("span");
            span.classList.add("channel_split");
            span.classList.add(`channel_split_${x}`);
            span.innerHTML = inner;
            elem.appendChild(span);
        });
    }
}
channelSplit(document.getElementById("disspurse"));//Diss the purses, LOL ?