
/*
 * Snapp Framework v2.1.1
 * A lightweight JSX-like framework for vanilla JavaScript
 *
 * @version 2.1.1
 * @license MIT
 * @repository https://github.com/kigemmanuel/Snapp
 *
 * Features:
 * - JSX-like syntax compilation
 * - Component-based architecture
 * - Zero dependencies
 * - Lightweight and fast
;*l
 - Dynamic state
 *
 * Built with ❤️ for modern web development
 *
 * Copyright (c) 2025 kigemmanuel
 * Released under the MIT License
 */

const snapp = (() => {

  var dataId = 0;
  var dynamicId = 1;

  var DOMReady = false;
  var track_dynamic = null;

  const dynamicData = {};
  const dynamicDependencies = new Map();

  const eventListener = {};
  const elementEvent = {};

  const eventMap = {
    'onmouseenter': 'onmouseover',
    'onmouseleave': 'onmouseout',
    'ondoubleclick': 'ondblclick'
  };

  const SVG_ELEMENTS = new Set([
    'svg', 'circle', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'rect',
    'text', 'textPath', 'tspan', 'defs', 'g', 'marker', 'mask', 'pattern',
    'switch', 'symbol', 'linearGradient', 'radialGradient', 'stop', 'filter',
    'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite',
    'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight',
    'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR',
    'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology',
    'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile',
    'feTurbulence', 'image', 'use', 'foreignObject', 'animate', 'animateMotion',
    'animateTransform', 'mpath', 'set', 'clipPath', 'desc', 'metadata', 'view'
  ]);

  const create = (element, props, ...children) => {
    const flatChildren = flattenChildren(children);
    if (element != "<>" && typeof element === "string")
      return createElement(element, props, flatChildren);


    if (typeof element === 'function')
      return createComponent(element, props, flatChildren);

    if (element === "<>")
      return createFragment(flatChildren);
  }

  const render = (body, App, type, callBack) => {

    if (!document.contains(body)) {
      console.error("ERROR: Rending to a non existing/removed element", body)
      if (typeof callBack === "function") return callBack(false)
    }

    if (typeof App === 'string' || typeof App === 'number' || App instanceof Element || App instanceof DocumentFragment) {
      DOMReady = false;

      switch (true) {
        case (type === "before"):
          body.before(App);
          break;

        case (type === "prepend"):
          body.prepend(App);
          break;

        case (type === "replace"):
          body.replaceWith(App);
          break;

        case (type === "append"):
          body.append(App);
          break;

        case (type === "after"):
          body.after(App);
          break;

        default:
          body.replaceChildren(App);
          break;
      }

      DOMReady = true;
      document.dispatchEvent(new Event("DOM"))
      if (typeof callBack === "function") return callBack(true);

    } else {
      console.error("Failed to render! ", typeof App, App)
      if (typeof callBack === "function") return callBack(false)
    }
  }

  const remove = (items) => {

    items = (Array.isArray(items)) ? items : [items];

    items.forEach(item => {

      if (item instanceof Element) {
        item.remove()
      }

    })
  }

  const on = (event, callBack) => {

    if (typeof event === "string" && event.toUpperCase() === "DOM") {
      if (DOMReady === true) {
        callBack()
      } else {
        document.addEventListener(event.toUpperCase(), callBack, { once: true })
      }
    }

  }

  const select = (name) => {
    if (typeof name === 'string') {
      const element = document.querySelector(name);
      if (!element) {
        console.error(`Element with "${name}" not found`)
        return null
      }
      return element
    }

    if (Array.isArray(name)) {
      return name.map(ele => {
        const element = document.querySelector(ele)
        if (!element) {
          console.error(`Element with "${ele}" not found`);
          return null
        }
        return element
      })
    }
    console.error("Invalid selector!")
    return null;
  }

  const selectAll = (name) => {
    if (typeof name === 'string') {
      const element = document.querySelectorAll(name)

      if (element.length === 0) {
        console.error(`Element with "${name}" not found`)
        return null
      }
      return element
    }

    if (Array.isArray(name)) {
      return name.map(ele => {
        const element = document.querySelectorAll(ele)

        if (element.length === 0) {
          console.error(`Element with "${ele}" not found`)
          return null
        }
        return element;
      })
    }
    console.error("Invalid selector!")
    return null;
  }

  const createElement = (element, props, children) => {
    const ele = SVG_ELEMENTS.has(element)
      ? document.createElementNS("http://www.w3.org/2000/svg", element)
      : document.createElement(element);

    dataId++

    if (props) {
      for (let [key, value] of Object.entries(props)) {

        if (value == null || value === false) continue

        if (key === "className") key = "class";
        if (key === "htmlFor") key = "for";

        if (value === true || value === "") {
          ele.setAttribute(key, "")
          continue
        }

        if (key === 'style') {
          if (typeof value === 'object') {
            for (const [property, style] of Object.entries(value)) {
              track_dynamic = new Set()
              const mainStyle = (typeof style === "function") ? style() : style;
              const newDynamicId = [...track_dynamic]
              track_dynamic = null;

              if (newDynamicId.length > 0) {
                const subscribeData = {
                  type: "style",
                  prop: property,
                  temp: style,
                  subscribe: newDynamicId
                }

                ele.setAttribute("snapp-dynamic", dataId);
                subscribeDynamic(newDynamicId, subscribeData, ele)
              }

              if (property.includes('-')) {
                ele.style.setProperty(property, mainStyle);
              } else {
                ele.style[property] = mainStyle;
              }
            }
          }
          else {
            console.warn(`Invalid style for ${element} `, value)
            continue
          }
          continue;
        }

        if (key.startsWith("on") && key !== "on" && typeof value === "function") {
          let lowerCaseKey = key.toLowerCase();
          lowerCaseKey = eventMap[lowerCaseKey] || lowerCaseKey;

          if (lowerCaseKey in ele) {
            const eventType = lowerCaseKey.slice(2);
            ele.setAttribute("snapp-data", dataId);
            addEventListener(eventType, value, dataId);
            ele.setAttribute("snapp-e-" + eventType, "true");
          } else {
            console.warn(`Event "${lowerCaseKey}", Do not exist for `, ele)
          }
          continue;
        }

        if (typeof value === "function" && !key.startsWith("on")) {
          track_dynamic = new Set()
          ele.setAttribute(key, value())
          const newDynamicId = [...track_dynamic]
          track_dynamic = null;

          if (newDynamicId.length > 0) {
            const subscribeData = {
              type: "attr",
              attr: key,
              temp: value,
              subscribe: newDynamicId
            }

            ele.setAttribute("snapp-dynamic", dataId);
            subscribeDynamic(newDynamicId, subscribeData, ele)
          }

          continue;
        }

        // Default
        ele.setAttribute(key, value);
      }
    }

    children.forEach(node => {
      if (typeof node === 'string' || typeof node === 'number' || node instanceof Element || node instanceof DocumentFragment) {
        ele.append(node);
        return;
      }

      if (typeof node === 'function') {
        track_dynamic = new Set()
        const textNode = document.createTextNode(node())
        const newDynamicId = [...track_dynamic]
        track_dynamic = null;

        if (newDynamicId.length > 0) {
          const subscribeData = {
            type: "node",
            node: textNode,
            temp: node,
            subscribe: newDynamicId
          }

          ele.setAttribute("snapp-dynamic", dataId);
          subscribeDynamic(newDynamicId, subscribeData, ele)
        }

        ele.append(textNode)
      }
    });

    return ele;
  }

  const createFragment = (children) => {
    const frag = document.createDocumentFragment();
    children.forEach(node => {
      if (typeof node === 'string' || typeof node === 'number' || node instanceof Element || node instanceof DocumentFragment) {
        frag.append(node);
      }
    });

    return frag;
  }

  const createComponent = (element, props = {}, children) => {
    const totalProps = { ...props, children };
    const comp = element(totalProps);

    return comp;
  }

  const flattenChildren = (children) => {
    const final = []

    for (const child of children) {
      if (Array.isArray(child)) {
        final.push(...flattenChildren(child))
      } else if (child !== null && child !== undefined && child !== '' && child !== false) {
        final.push(child)
      }
    }

    return final
  }


  const applystyle = (element, styles) => {
    element = (Array.isArray(element)) ? element : [element];

    element.forEach(ele => {

      if (!(ele instanceof Element)) {
        console.error(`Error! can not apply style to "${element}", selelct a valid element`)
        return;
      }

      if (typeof styles === "object") {
        for (const [property, style] of Object.entries(styles)) {
          if (property.includes('-')) {
            ele.style.setProperty(property, style);
          } else {
            ele.style[property] = style;
          }
        }
      }
    })
  }

  const removestyle = (element, styles) => {
    element = (Array.isArray(element)) ? element : [element];

    element.forEach(ele => {
      if (!(ele instanceof Element)) {
        console.error(`Error! can not remove style from "${element}", selelct a valid element`)
        return;
      }

      if (styles === true) return ele.removeAttribute("style")
      if (typeof styles === "object") {
        for (const [property, style] of Object.entries(styles)) {
          if (property.includes('-')) {
            ele.style.removeProperty(property);
          } else {
            ele.style[property] = "";
          }
        }
      }
    })
  }


  const addEventListener = (eventType, event, elementId) => {

    const eventTemplate = (element) => {
      const target = element.target;

      if (!target || target.nodeType !== 1) {
        console.log('Target is not an element, skipping...');
        return;
      }

      const elWithAttr = target.closest(`[snapp-e-${eventType}]`);
      if (!elWithAttr) return;
      const elementDataId = elWithAttr.getAttribute("snapp-data");
      elementEvent[eventType]?.[elementDataId](element)
    }

    if (!(eventType in eventListener)) {
      elementEvent[eventType] = {}

      eventListener[eventType] = eventTemplate;
      document.addEventListener(eventType, eventListener[eventType])
    }

    elementEvent[eventType][elementId] = event;
  }


  const dynamic = (initialtValue = "") => {
    const id = `dynamic-${dynamicId++}`;
    dynamicData[id] = {
      value: initialtValue,
      subscribe: new Map()
    };

    const update = (newValue) => {
      if (dynamicData[id].value !== newValue) {
        dynamicData[id].value = newValue;
        for (const [element, items] of dynamicData[id].subscribe) {
          updateDynamicValue(element, items)
        }
      }
    }

    return {
      get value() {
        if (track_dynamic) {
          track_dynamic.add(id)
        }
        return dynamicData[id].value
      },
      update,
    }
  }

  const updateDynamicValue = (element, items) => {
    items.forEach(item => {
      const dynamic = dynamicDependencies.get(element)?.[item];
      if (dynamic) {
        const previousDynamicId = new Set(dynamic.subscribe);
        track_dynamic = new Set();
        const newTemp = dynamic.temp();
        const newTrack_dynamic = [...track_dynamic]
        track_dynamic = null;

        if (dynamic.type === "node") {
          dynamic.node.nodeValue = newTemp;
        } else if (dynamic.type === "attr") {
          element.setAttribute(dynamic.attr, newTemp)
        } else if (dynamic.type === "style") {
          if (newTemp.includes('-')) {
            element.style.setProperty(dynamic.prop, newTemp);
          } else {
            element.style[dynamic.prop] = newTemp;
          }
        }

        newTrack_dynamic.forEach(dynamicId => {
          if (previousDynamicId.has(dynamicId)) return

          if (!dynamicData[dynamicId]["subscribe"].has(element)) {
            dynamicData[dynamicId]["subscribe"].set(element, [])
          }
          dynamicData[dynamicId]["subscribe"].get(element).push(item)
          dynamicDependencies.get(element)[item].subscribe.push(dynamicId)
        })
      }

    })
  }

  const subscribeDynamic = (dynamicId, subscribeData, element) => {
    if (!dynamicDependencies.has(element)) {
      dynamicDependencies.set(element, [])
    }
    dynamicDependencies.get(element).push(subscribeData)
    const subscribeIndex = dynamicDependencies.get(element).length - 1;

    dynamicId.forEach(id => {
      if (!dynamicData[id]) return

      if (!dynamicData[id]["subscribe"].has(element)) {
        dynamicData[id]["subscribe"].set(element, [])
      }

      dynamicData[id]["subscribe"].get(element).push(subscribeIndex)
    })
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach(element => {
      element.removedNodes.forEach(node => {
        if (node instanceof Element) {
          const elementDataId = node.getAttribute("snapp-data");
          if (elementDataId) {
            for (const attrName of node.getAttributeNames()) {
              if (attrName.startsWith('snapp-e-')) {
                const eventType = attrName.replace("snapp-e-", "");

                if (elementEvent[eventType]?.[elementDataId]) {
                  delete elementEvent[eventType]?.[elementDataId]
                }

                if (Object.keys(elementEvent[eventType]).length === 0) {
                  document.removeEventListener(eventType, eventListener[eventType])
                  delete eventListener[eventType]
                  delete elementEvent[eventType]
                }
              }
            }
          };

          if (node.getAttribute("snapp-dynamic")) {
            dynamicDependencies.delete(node);
            callCleardynamicElement()
          }

        }
      })
    });
  })
  observer.observe(document, {
    childList: true,
    subtree: true
  })

  let timeOut = null;
  let callCount = 0;
  const callCleardynamicElement = (delay = 15000, threshold = 30) => {
    callCount++
    clearTimeout(timeOut);

    if (callCount >= threshold) {
      cleardynamicElement()
      callCount = 0;
    } else {
      timeOut = setTimeout(() => {
        cleardynamicElement()
        callCount = 0;
      }, delay)
    }
  }

  const cleardynamicElement = () => {
    for (const [dynamicId, items] of Object.entries(dynamicData)) {
      for (const [element, data] of items.subscribe) {
        if (!element.isConnected) {
          dynamicData[dynamicId].subscribe.delete(element)
        }
      }
    }
  }

  return {
    create, render, on, select, selectAll, applystyle, removestyle, remove, dynamic
  }

})()

export default snapp;
