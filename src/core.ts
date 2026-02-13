/**
 * Snapp Framework Core
 * A lightweight JSX-like framework for vanilla JavaScript with TypeScript support
 *
 * @version 3.0.0
 * @license MIT
 * @repository https://github.com/SnappJS/snapp
 */

import type {
  SnappChild,
  SnappProps,
  SnappComponent,
  RenderType,
  EventHandler,
  DynamicValue,
  SubscribeData,
  StyleProperties,
} from "./types";

/**
 * SVG elements set - used to determine if createElementNS should be used
 */
import SVG_ELEMENTS from "./svg_elements";

/**
 * Event name mapping for compatibility
 */
const eventMap: Record<string, string> = {
  onmouseenter: "onmouseover",
  onmouseleave: "onmouseout",
  ondoubleclick: "ondblclick",
};

/**
 * Internal state management
 */
let dataId: number = 0;
let dynamicId: number = 1;
let DOMReady: boolean = false;
let track_dynamic: Set<string> | null = null;

const dynamicData: Record<
  string,
  {
    value: any;
    subscribe: Map<Element, number[]>;
  }
> = {};

const dynamicDependencies = new Map<Element, SubscribeData[]>();
const eventListener: Record<string, EventHandler> = {};
const elementEvent: Record<string, Record<number, EventHandler>> = {};

/**
 * Flattens nested children arrays into a single array
 */
const flattenChildren = (children: SnappChild[]): SnappChild[] => {
  const final: SnappChild[] = [];

  for (const child of children) {
    if (Array.isArray(child)) {
      final.push(...flattenChildren(child));
    } else if (
      child !== null &&
      child !== undefined &&
      child !== "" &&
      child !== false
    ) {
      final.push(child);
    }
  }

  return final;
};

/**
 * Creates a native DOM element with props and children
 */
const createElement = (
  element: string,
  props: SnappProps | null | undefined,
  children: SnappChild[]
): Element => {
  const ele = SVG_ELEMENTS.has(element)
    ? document.createElementNS("http://www.w3.org/2000/svg", element)
    : document.createElement(element);

  dataId++;

  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (value == null || value === false) continue;

      let attrKey = key;
      
      attrKey = (attrKey === "className") ? "class" : attrKey;
      attrKey = (attrKey === "htmlFor") ? "for" : attrKey;

      // Handle boolean attributes
      if (value === true || value === "") {
        ele.setAttribute(attrKey, "");
        continue;
      }

      // Handle style objects
      if (attrKey === "style") {
        if (typeof value === "object") {
          for (const [property, style] of Object.entries(
            value as StyleProperties
          )) {
            track_dynamic = new Set();
            const mainStyle =
              typeof style === "function" ? style() : style;
            const newDynamicId = [...track_dynamic];
            track_dynamic = null;

            if (newDynamicId.length > 0) {
              const subscribeData: SubscribeData = {
                type: "style",
                prop: property,
                temp: style as Function,
                subscribe: newDynamicId,
              };

              ele.setAttribute("snapp-dynamic", dataId.toString());
              subscribeDynamic(newDynamicId, subscribeData, ele as Element);
            }

            if (property.includes("-")) {
              (ele as any).style.setProperty(property, mainStyle);
            } else {
              (ele as any).style[property] = mainStyle;
            }
          }
        } else {
          console.warn(`Invalid style for ${element}`, value);
          continue;
        }
        continue;
      }

      // Handle event listeners
      if (attrKey.startsWith("on") && attrKey !== "on" && typeof value === "function") {
        let lowerCaseKey = attrKey.toLowerCase();
        lowerCaseKey = eventMap[lowerCaseKey] || lowerCaseKey;

        if (lowerCaseKey in ele) {
          const eventType = lowerCaseKey.slice(2);
          ele.setAttribute("snapp-data", dataId.toString());
          addEventListener(eventType, value as EventHandler, dataId);
          ele.setAttribute("snapp-e-" + eventType, "true");
        } else {
          console.warn(`Event "${lowerCaseKey}" does not exist for`, ele);
        }
        continue;
      }

      // Handle dynamic attributes
      if (typeof value === "function" && !attrKey.startsWith("on")) {
        track_dynamic = new Set();
        ele.setAttribute(attrKey, value());
        const newDynamicId = [...track_dynamic];
        track_dynamic = null;

        if (newDynamicId.length > 0) {
          const subscribeData: SubscribeData = {
            type: "attr",
            attr: attrKey,
            temp: value as Function,
            subscribe: newDynamicId,
          };

          ele.setAttribute("snapp-dynamic", dataId.toString());
          subscribeDynamic(newDynamicId, subscribeData, ele as Element);
        }

        continue;
      }

      // Default: set attribute
      ele.setAttribute(attrKey, String(value));
    }
  }

  // Handle children
  children.forEach((node) => {
    if (
      typeof node === "string" ||
      typeof node === "number" ||
      node instanceof Element ||
      node instanceof DocumentFragment
    ) {
      ele.append(node as any);
      return;
    }

    if (typeof node === "function") {
      track_dynamic = new Set();
      const result = (node as any)() as any;
      const textNode = document.createTextNode(String(result));
      const newDynamicId = [...track_dynamic];
      track_dynamic = null;

      if (newDynamicId.length > 0) {
        const subscribeData: SubscribeData = {
          type: "node",
          node: textNode,
          temp: node as Function,
          subscribe: newDynamicId,
        };

        ele.setAttribute("snapp-dynamic", dataId.toString());
        subscribeDynamic(newDynamicId, subscribeData, ele as Element);
      }

      ele.append(textNode);
    }
  });

  return ele as Element;
};

/**
 * Creates a document fragment from children
 */
const createFragment = (children: SnappChild[]): DocumentFragment => {
  const frag = document.createDocumentFragment();
  children.forEach((node) => {
    if (
      typeof node === "string" ||
      typeof node === "number" ||
      node instanceof Element ||
      node instanceof DocumentFragment
    ) {
      frag.append(node as any);
    }
  });

  return frag;
};

/**
 * Creates a component by calling the component function
 */
const createComponent = (
  element: SnappComponent,
  props: SnappProps = {},
  children: SnappChild[]
): Element | DocumentFragment => {
  const totalProps = { ...props, children };
  return element(totalProps);
};

/**
 * Main create function - handles elements, components, and fragments
 */
const create = (
  element: string | SnappComponent | "<>",
  props?: SnappProps | null,
  ...children: SnappChild[]
): Element | DocumentFragment => {
  const flatChildren = flattenChildren(children);

  if (element !== "<>" && typeof element === "string") {
    return createElement(element, props, flatChildren);
  }

  if (typeof element === "function") {
    return createComponent(element, props || {}, flatChildren);
  }

  if (element === "<>") {
    return createFragment(flatChildren);
  }

  throw new Error(
    `Invalid element type: ${typeof element}. Expected string, function, or "<>"`
  );
};

/**
 * Renders a component to the DOM
 */
const render = (
  body: Element,
  App: string | number | Element | DocumentFragment,
  type: RenderType = "replace",
  callBack?: (success: boolean) => void
): void => {
  if (!document.contains(body)) {
    console.error("ERROR: Rendering to a non-existing/removed element", body);
    if (typeof callBack === "function") callBack(false);
    return;
  }

  if (
    typeof App === "string" ||
    typeof App === "number" ||
    App instanceof Element ||
    App instanceof DocumentFragment
  ) {
    DOMReady = false;

    switch (type) {
      case "before":
        body.before(App as any);
        break;
      case "prepend":
        body.prepend(App as any);
        break;
      case "replace":
        body.replaceWith(App as any);
        break;
      case "append":
        body.append(App as any);
        break;
      case "after":
        body.after(App as any);
        break;
      default:
        body.replaceChildren(App as any);
        break;
    }

    DOMReady = true;
    document.dispatchEvent(new Event("DOM"));
    if (typeof callBack === "function") callBack(true);
  } else {
    console.error("Failed to render! Invalid App type:", typeof App, App);
    if (typeof callBack === "function") callBack(false);
  }
};

/**
 * Removes elements from the DOM
 */
const remove = (items: Element | Element[]): void => {
  const itemsArray = Array.isArray(items) ? items : [items];

  itemsArray.forEach((item) => {
    if (item instanceof Element) {
      item.remove();
    }
  });
};

/**
 * Listens to DOM ready event or immediately calls if DOM is ready
 */
const on = (event: string, callBack: () => void): void => {
  if (typeof event === "string" && event.toUpperCase() === "DOM") {
    if (DOMReady === true) {
      callBack();
    } else {
      document.addEventListener(event.toUpperCase(), callBack, { once: true });
    }
  }
};

/**
 * Selects a single element or multiple elements
 */
const select = (name: string | string[]): Element | (Element | null)[] | null => {
  if (typeof name === "string") {
    const element = document.querySelector(name);
    if (!element) {
      console.error(`Element with selector "${name}" not found`);
      return null;
    }
    return element;
  }

  if (Array.isArray(name)) {
    return name.map((selector) => {
      const element = document.querySelector(selector);
      if (!element) {
        console.error(`Element with selector "${selector}" not found`);
        return null;
      }
      return element;
    });
  }

  console.error("Invalid selector!");
  return null;
};

/**
 * Selects all elements matching selectors
 */
const selectAll = (
  name: string | string[]
): NodeListOf<Element> | (NodeListOf<Element> | null)[] | null => {
  if (typeof name === "string") {
    const elements = document.querySelectorAll(name);

    if (elements.length === 0) {
      console.error(`Elements with selector "${name}" not found`);
      return null;
    }
    return elements;
  }

  if (Array.isArray(name)) {
    return name.map((selector) => {
      const elements = document.querySelectorAll(selector);

      if (elements.length === 0) {
        console.error(`Elements with selector "${selector}" not found`);
        return null;
      }
      return elements;
    });
  }

  console.error("Invalid selector!");
  return null;
};

/**
 * Applies styles to elements
 */
const applystyle = (
  element: Element | Element[],
  styles: Record<string, string | number>
): void => {
  const elements = Array.isArray(element) ? element : [element];

  elements.forEach((ele) => {
    if (!(ele instanceof Element)) {
      console.error(
        `Error! Cannot apply style to "${element}", select a valid element`
      );
      return;
    }

    if (typeof styles === "object") {
      for (const [property, style] of Object.entries(styles)) {
        if (property.includes("-")) {
          (ele as any).style.setProperty(property, style);
        } else {
          (ele as any).style[property] = style;
        }
      }
    }
  });
};

/**
 * Removes styles from elements
 */
const removestyle = (
  element: Element | Element[],
  styles?: Record<string, string | number> | boolean
): void => {
  const elements = Array.isArray(element) ? element : [element];

  elements.forEach((ele) => {
    if (!(ele instanceof Element)) {
      console.error(
        `Error! Cannot remove style from "${element}", select a valid element`
      );
      return;
    }

    if (styles === true) return ele.removeAttribute("style");

    if (typeof styles === "object") {
      for (const [property, style] of Object.entries(styles)) {
        if (property.includes("-")) {
          (ele as any).style.removeProperty(property);
        } else {
          (ele as any).style[property] = "";
        }
      }
    }
  });
};

/**
 * Adds event listener to document with event delegation
 */
const addEventListener = (
  eventType: string,
  event: EventHandler,
  elementId: number
): void => {
  const eventTemplate = (element: Event) => {
    const target = element.target as Node;

    if (!target || target.nodeType !== 1) {
      console.log("Target is not an element, skipping...");
      return;
    }

    const elWithAttr = (target as Element).closest(
      `[snapp-e-${eventType}]`
    ) as Element | null;
    if (!elWithAttr) return;

    const elementDataId = elWithAttr.getAttribute("snapp-data");
    if (elementEvent[eventType]?.[Number(elementDataId)]) {
      elementEvent[eventType][Number(elementDataId)](element);
    }
  };

  if (!(eventType in eventListener)) {
    elementEvent[eventType] = {};
    eventListener[eventType] = eventTemplate;
    document.addEventListener(eventType, eventListener[eventType]);
  }

  elementEvent[eventType][elementId] = event;
};

/**
 * Creates a reactive dynamic value
 */
const dynamic = <T = any>(initialValue: T = "" as T): DynamicValue<T> => {
  const id = `dynamic-${dynamicId++}`;
  dynamicData[id] = {
    value: initialValue,
    subscribe: new Map(),
  };

  const update = (newValue: T): void => {
    if (dynamicData[id].value !== newValue) {
      dynamicData[id].value = newValue;
      for (const [element, items] of dynamicData[id].subscribe) {
        updateDynamicValue(element, items);
      }
    }
  };

  return {
    get value(): T {
      if (track_dynamic) {
        track_dynamic.add(id);
      }
      return dynamicData[id].value;
    },
    update,
  };
};

/**
 * Updates dynamic value and its subscribers
 */
const updateDynamicValue = (element: Element, items: number[]): void => {
  items.forEach((item) => {
    const dynamic = dynamicDependencies.get(element)?.[item];
    if (dynamic) {
      const previousDynamicId = new Set(dynamic.subscribe);
      track_dynamic = new Set();
      const newTemp = dynamic.temp();
      const newTrack_dynamic = [...track_dynamic];
      track_dynamic = null;

      if (dynamic.type === "node" && dynamic.node) {
        dynamic.node.nodeValue = newTemp;
      } else if (dynamic.type === "attr" && dynamic.attr) {
        element.setAttribute(dynamic.attr, newTemp);
      } else if (dynamic.type === "style" && dynamic.prop) {
        if (newTemp.includes("-")) {
          (element as any).style.setProperty(dynamic.prop, newTemp);
        } else {
          (element as any).style[dynamic.prop] = newTemp;
        }
      }

      newTrack_dynamic.forEach((dynamicId) => {
        if (previousDynamicId.has(dynamicId)) return;

        if (!dynamicData[dynamicId]["subscribe"].has(element)) {
          dynamicData[dynamicId]["subscribe"].set(element, []);
        }
        dynamicData[dynamicId]["subscribe"].get(element)!.push(item);
        (dynamicDependencies.get(element)![item] as any).subscribe.push(
          dynamicId
        );
      });
    }
  });
};

/**
 * Subscribes a dynamic value to an element
 */
const subscribeDynamic = (
  dynamicIds: string[],
  subscribeData: SubscribeData,
  element: Element
): void => {
  if (!dynamicDependencies.has(element)) {
    dynamicDependencies.set(element, []);
  }
  dynamicDependencies.get(element)!.push(subscribeData);
  const subscribeIndex = dynamicDependencies.get(element)!.length - 1;

  dynamicIds.forEach((id) => {
    if (!dynamicData[id]) return;

    if (!dynamicData[id]["subscribe"].has(element)) {
      dynamicData[id]["subscribe"].set(element, []);
    }

    dynamicData[id]["subscribe"].get(element)!.push(subscribeIndex);
  });
};

/**
 * Clears dynamic data for disconnected elements
 */
const cleardynamicElement = (): void => {
  for (const [dynamicId, items] of Object.entries(dynamicData)) {
    for (const [element, _] of items.subscribe) {
      if (!element.isConnected) {
        dynamicData[dynamicId].subscribe.delete(element);
      }
    }
  }
};

/**
 * Mutation observer for cleanup
 */
let timeOut: any = null;
let callCount = 0;

const callCleardynamicElement = (
  delay: number = 15000,
  threshold: number = 30
): void => {
  callCount++;
  if (timeOut) clearTimeout(timeOut);

  if (callCount >= threshold) {
    cleardynamicElement();
    callCount = 0;
  } else {
    timeOut = setTimeout(() => {
      cleardynamicElement();
      callCount = 0;
    }, delay);
  }
};

const observer = new MutationObserver((mutations) => {
  mutations.forEach((element) => {
    element.removedNodes.forEach((node) => {
      if (node instanceof Element) {
        const elementDataId = node.getAttribute("snapp-data");
        if (elementDataId) {
          for (const attrName of node.getAttributeNames()) {
            if (attrName.startsWith("snapp-e-")) {
              const eventType = attrName.replace("snapp-e-", "");

              if (elementEvent[eventType]?.[Number(elementDataId)]) {
                delete elementEvent[eventType]?.[Number(elementDataId)];
              }

              if (Object.keys(elementEvent[eventType] || {}).length === 0) {
                document.removeEventListener(eventType, eventListener[eventType]);
                delete eventListener[eventType];
                delete elementEvent[eventType];
              }
            }
          }
        }

        if (node.getAttribute("snapp-dynamic")) {
          dynamicDependencies.delete(node);
          callCleardynamicElement();
        }
      }
    });
  });
});

observer.observe(document, {
  childList: true,
  subtree: true,
});

/**
 * Main Snapp object exported as default
 */
const snapp = {
  create,
  render,
  on,
  select,
  selectAll,
  applystyle,
  removestyle,
  remove,
  dynamic,
};

export default snapp;
export type { DynamicValue, SnappProps, SnappComponent, SnappChild };
