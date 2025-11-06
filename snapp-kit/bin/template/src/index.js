import snapp from "./snapp.js";

// views/components/Links.jsx
var Links = () => {
  return /* @__PURE__ */ snapp.create("div", { className: "link-div" }, /* @__PURE__ */ snapp.create("a", { className: "a-href", target: "_blank", href: "https://github.com/kigemmanuel/Snapp" }, "Learn Snapp"), /* @__PURE__ */ snapp.create("span", { className: "a-href", style: { color: "#0C2340" } }, "Please star and follow"));
};
var Links_default = Links;

// views/index.jsx
var App = () => {
  const count = snapp.dynamic(0);
  return /* @__PURE__ */ snapp.create("div", { className: "center-div" }, /* @__PURE__ */ snapp.create("img", { style: { width: "auto", height: "200px" }, src: "assets/snapp.png", alt: "snapp" }), /* @__PURE__ */ snapp.create("h2", null, "Welcome to snapp ", () => count.value), /* @__PURE__ */ snapp.create(
    "button",
    {
      className: "button",
      onClick: () => count.update(count.value + 1)
    },
    "Click To Count"
  ), /* @__PURE__ */ snapp.create(Links_default, null));
};
var SnappBody = document.querySelector("#snapp-body");
snapp.render(SnappBody, App());
