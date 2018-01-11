import U from "./util";
import animate, { easeOutCubic, easeInCubic } from "./animate";
const enableFlag = window["getHitokoto"];
const desc = U.get(".splash p.desc");
const url = "https://sslapi.hitokoto.cn";

function fadeOut(cb) {
  animate.exec(
    percent => U.css(desc, "opacity", `${1 - percent}`),
    300,
    easeOutCubic,
    cb
  );
}

function fadeIn() {
  animate.exec(
    percent => U.css(desc, "opacity", `${percent}`),
    300,
    easeInCubic
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
