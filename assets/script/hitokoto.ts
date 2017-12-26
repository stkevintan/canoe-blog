import U from "./domutil";
import easingFunctions, { animate } from "./animate";
const enableFlag = window["getHitokoto"];
const desc = U.get(".splash p.desc");
const url = "https://sslapi.hitokoto.cn";

function fadeOut(cb) {
  animate(
    percent => U.css(desc, "opacity", `${1 - percent}`),
    300,
    easingFunctions.easeOutCubic,
    cb
  );
}

function fadeIn() {
  animate(
    percent => U.css(desc, "opacity", `${percent}`),
    300,
    easingFunctions.easeInCubic
  );
}
export default function() {
  if (!desc || !enableFlag) return;
  U.fetch(url)
    .then(res => res.json())
    .then(data => {
      console && console.log("hitokoto detail : ", data);
      fadeOut(() => {
        desc.innerHTML = `${data.hitokoto} --- <cite>${data.from}</cite>`;
        fadeIn();
      });
    });
}
