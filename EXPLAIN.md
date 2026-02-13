# Snapp Framework - Code Explanation

A comprehensive guide to understanding the Snapp Framework codebase. This document explains every file, function, and concept so contributors can easily understand and build upon the framework.

---

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [File Breakdown](#file-breakdown)
  - [src/core.ts](#srccorets)
  - [src/types.ts](#srctypests)
  - [src/jsx.d.ts](#srcjsxdts)
  - [src/index.ts](#srcindexts)
- [Core Concepts](#core-concepts)
  - [Dependency Tracking](#dependency-tracking)
  - [Dynamic State System](#dynamic-state-system)
  - [Event Delegation](#event-delegation)
  - [Memory Management](#memory-management)
- [How Everything Works Together](#how-everything-works-together)
- [Common Tasks for Contributors](#common-tasks-for-contributors)

---

## File Breakdown

### src/core.ts

**Purpose:** The heart of Snapp. Contains all framework logic for creating elements, managing state, and handling updates.

#### Global State Management

At the top of core.ts, you'll find these global variables:

```typescript
let dataId: number = 0; // Counter for unique element IDs
let dynamicId: number = 1; // Counter for dynamic value IDs
let DOMReady: boolean = false; // Tracks if DOM is rendered
let track_dynamic: Set<string> | null = null; // Tracks which dynamics are accessed

const dynamicData = {}; // Stores all dynamic values and subscribers
const dynamicDependencies = new Map(); // Maps elements to their dependencies
const eventListener = {}; // Single listener per event type
const elementEvent = {}; // Maps elements to their event handlers
```

**Why these variables?**

- `dataId` & `dynamicId` ensure unique IDs for tracking
- `track_dynamic` is crucial for the dependency tracking system (see Dependency Tracking section)
- The maps store relationships between elements and dynamic values

#### SVG_ELEMENTS Set

```typescript
const SVG_ELEMENTS = new Set([
  "svg", "circle", "ellipse", "line", "path", "polygon",
  "rect", "text", "g", "defs", "filter", "image", "use", ...
]);
```

**Why?** When creating elements, check if the tag is SVG. If yes, use `document.createElementNS()` instead of `createElement()`. This is required for proper SVG rendering.

#### flattenChildren()

```typescript
const flattenChildren = (children: SnappChild[]): SnappChild[] => {
  const final: SnappChild[] = [];

  for (const child of children) {
    if (Array.isArray(child)) {
      final.push(...flattenChildren(child)); // Recursively flatten
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
```

**What it does:** JSX can create deeply nested arrays. This function flattens them into a single array and filters out falsy values.

**Example:**

```
Input:  [<div/>, [<span/>, [<p/>]], null, false]
Output: [<div/>, <span/>, <p/>]
```

#### createElement()

**The most complex function - handles creating actual DOM elements.**

```typescript
const createElement = (
  element: string, // Tag name: "div", "button", etc.
  props: SnappProps, // Attributes and event handlers
  children: SnappChild[] // Children to append
): Element => {
  // Step 1: Create the element
  const ele = SVG_ELEMENTS.has(element)
    ? document.createElementNS("http://www.w3.org/2000/svg", element)
    : document.createElement(element);

  dataId++; // Increment for next element

  // Step 2: Process all props (attributes, styles, events)
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (value == null || value === false) continue;

      let attrKey = key;
      // Convert special prop names
      attrKey = attrKey === "className" ? "class" : attrKey;
      attrKey = attrKey === "htmlFor" ? "for" : attrKey;

      // Handle each type of prop differently:
      // - Boolean attributes (value === true)
      // - Style objects (with static or dynamic values)
      // - Event listeners (onClick, onChange, etc.)
      // - Dynamic attributes (functions)
      // - Regular attributes (strings, numbers)
    }
  }

  // Step 3: Process children
  children.forEach((node) => {
    if (typeof node === "string" || typeof node === "number") {
      ele.append(node); // Static text/number
      return;
    }

    if (node instanceof Element || node instanceof DocumentFragment) {
      ele.append(node); // Already a DOM element
      return;
    }

    if (typeof node === "function") {
      // DYNAMIC NODE - This is where reactivity happens!
      track_dynamic = new Set();
      const result = node(); // Call the function
      const textNode = document.createTextNode(String(result));
      const newDynamicId = [...track_dynamic]; // Track what it depends on
      track_dynamic = null;

      if (newDynamicId.length > 0) {
        // Subscribe this text node to dynamic value updates
        subscribeDynamic(newDynamicId, subscribeData, ele);
      }

      ele.append(textNode);
    }
  });

  return ele;
};
```

**Key insight:** When a function is passed as a child (like `{() => count.value}`), Snapp:

1. Calls it and tracks which dynamic values it accesses
2. Remembers this relationship
3. When that dynamic value updates, re-calls the function and updates the text node

#### Style Handling (inside createElement)

```typescript
if (attrKey === "style") {
  if (typeof value === "object") {
    for (const [property, style] of Object.entries(value)) {
      track_dynamic = new Set();
      const mainStyle = typeof style === "function" ? style() : style;
      const newDynamicId = [...track_dynamic];
      track_dynamic = null;

      if (newDynamicId.length > 0) {
        // This style depends on dynamic values
        subscribeDynamic(newDynamicId, subscribeData, ele);
      }

      // Apply the style
      if (property.includes("-")) {
        ele.style.setProperty(property, mainStyle); // CSS variables
      } else {
        ele.style[property] = mainStyle; // Normal properties
      }
    }
  }
}
```

**Why tracking?** If you write `<div style={{ color: () => myColor.value }} />`, Snapp tracks that the color depends on `myColor` and updates it when it changes.

#### Event Listeners (inside createElement)

```typescript
if (
  attrKey.startsWith("on") &&
  attrKey !== "on" &&
  typeof value === "function"
) {
  let lowerCaseKey = attrKey.toLowerCase();
  lowerCaseKey = eventMap[lowerCaseKey] || lowerCaseKey; // Handle aliases

  if (lowerCaseKey in ele) {
    const eventType = lowerCaseKey.slice(2); // "onclick" → "click"
    ele.setAttribute("snapp-data", dataId.toString());
    addEventListener(eventType, value, dataId);
    ele.setAttribute("snapp-e-" + eventType, "true");
  }
}
```

**Important:** Event handlers are NOT stored directly on the element. Instead, Snapp uses event delegation (see Event Delegation section).

#### createFragment()

```typescript
const createFragment = (children: SnappChild[]): DocumentFragment => {
  const frag = document.createDocumentFragment();
  children.forEach((node) => {
    if (
      typeof node === "string" ||
      typeof node === "number" ||
      node instanceof Element ||
      node instanceof DocumentFragment
    ) {
      frag.append(node);
    }
  });
  return frag;
};
```

**What it does:** Creates a document fragment (used for `<>...</>` in JSX). Fragments don't create wrapper elements - they're invisible.

#### createComponent()

```typescript
const createComponent = (
  element: SnappComponent,
  props: SnappProps = {},
  children: SnappChild[]
): Element | DocumentFragment => {
  const totalProps = { ...props, children };
  return element(totalProps);
};
```

**What it does:** Calls the component function with props and children, and returns what it renders.

#### create() - Main Entry Point

```typescript
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
```

**What it does:** Router function that decides whether to create an element, component, or fragment. This is what JSX compiles to.

#### render()

```typescript
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
        body.before(App);
        break;
      case "prepend":
        body.prepend(App);
        break;
      case "replace":
        body.replaceWith(App);
        break;
      case "append":
        body.append(App);
        break;
      case "after":
        body.after(App);
        break;
      default:
        body.replaceChildren(App);
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
```

**What it does:** Inserts rendered content into the DOM and signals that rendering is complete.

#### on()

```typescript
const on = (event: string, callBack: () => void): void => {
  if (typeof event === "string" && event.toUpperCase() === "DOM") {
    if (DOMReady === true) {
      callBack();
    } else {
      document.addEventListener(event.toUpperCase(), callBack, { once: true });
    }
  }
};
```

**What it does:** Waits for DOM to be ready. If already ready, calls immediately. Otherwise waits for the "DOM" event.

#### select() / selectAll()

```typescript
const select = (
  name: string | string[]
): Element | (Element | null)[] | null => {
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
```

**What they do:** Query the DOM. `select()` finds one element, `selectAll()` finds all matching elements. Supports single selector or array of selectors.

#### applystyle() / removestyle()

```typescript
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
          ele.style.setProperty(property, style);
        } else {
          ele.style[property] = style;
        }
      }
    }
  });
};

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
          ele.style.removeProperty(property);
        } else {
          ele.style[property] = "";
        }
      }
    }
  });
};
```

**What they do:** Programmatically add or remove CSS styles from elements.

#### remove()

```typescript
const remove = (items: Element | Element[]): void => {
  const itemsArray = Array.isArray(items) ? items : [items];

  itemsArray.forEach((item) => {
    if (item instanceof Element) {
      item.remove();
    }
  });
};
```

**What it does:** Remove elements from the DOM.

#### dynamic()

```typescript
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
      // CRUCIAL: When the value is accessed, track which dynamic accessed it
      if (track_dynamic) {
        track_dynamic.add(id);
      }
      return dynamicData[id].value;
    },
    update,
  };
};
```

**This is the magic of Snapp:**

- When `track_dynamic` is not null, accessing `.value` adds the ID to the set
- This tells Snapp: "This function depends on this dynamic value"
- When `update()` is called, it notifies all dependent elements

#### updateDynamicValue()

```typescript
const updateDynamicValue = (element: Element, items: number[]): void => {
  items.forEach((item) => {
    const dynamic = dynamicDependencies.get(element)?.[item];
    if (dynamic) {
      const previousDynamicId = new Set(dynamic.subscribe);
      track_dynamic = new Set();
      const newTemp = dynamic.temp();
      const newTrack_dynamic = [...track_dynamic];
      track_dynamic = null;

      // Update the DOM based on type
      if (dynamic.type === "node" && dynamic.node) {
        dynamic.node.nodeValue = newTemp; // Update text
      } else if (dynamic.type === "attr" && dynamic.attr) {
        element.setAttribute(dynamic.attr, newTemp); // Update attribute
      } else if (dynamic.type === "style" && dynamic.prop) {
        if (newTemp.includes("-")) {
          element.style.setProperty(dynamic.prop, newTemp);
        } else {
          element.style[dynamic.prop] = newTemp;
        }
      }

      // Handle new dependencies discovered during update
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
```

**What it does:** When a dynamic value updates, re-execute its subscription function and update the specific part of the DOM (text, attribute, or style).

#### subscribeDynamic()

```typescript
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
```

**What it does:** Connect a dynamic value to an element so that when the dynamic updates, the element knows it needs to update.

#### addEventListener()

```typescript
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
```

**What it does:** Implements event delegation. Instead of adding a listener to every element, add one listener to the document that checks which element triggered the event.

#### cleardynamicElement()

```typescript
const cleardynamicElement = (): void => {
  for (const [dynamicId, items] of Object.entries(dynamicData)) {
    for (const [element, _] of items.subscribe) {
      if (!element.isConnected) {
        dynamicData[dynamicId].subscribe.delete(element);
      }
    }
  }
};
```

**What it does:** Remove subscriptions for elements that are no longer in the DOM. Prevents memory leaks.

#### MutationObserver

```typescript
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
                document.removeEventListener(
                  eventType,
                  eventListener[eventType]
                );
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
```

**What it does:** Automatically clean up when elements are removed from the DOM:

1. Remove event listeners
2. Remove dynamic subscriptions
3. Prevent memory leaks

#### Export

```typescript
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
```

**What it does:** Bundle all public APIs into the `snapp` object and export it.

---

### src/types.ts

**Purpose:** Comprehensive TypeScript definitions for the entire framework.

#### Key Type Exports

```typescript
// What can be rendered
type SnappChild =
  | string
  | number
  | Element
  | DocumentFragment
  | SnappComponent
  | SnappChild[]
  | null
  | undefined
  | boolean;

// Props passed to components
type SnappProps = Record<string, any>;

// A component function
type SnappComponent<P extends SnappProps = SnappProps> = (
  props: P & { children?: SnappChild[] }
) => Element | DocumentFragment;

// Reactive state
interface DynamicValue<T = any> {
  readonly value: T;
  update: (newValue: T) => void;
}

// Where to render
type RenderType = "before" | "prepend" | "replace" | "append" | "after";

// For tracking dependencies
interface SubscribeData {
  type: "node" | "attr" | "style"; // What's being updated
  temp: Function; // Function to re-execute
  subscribe: string[]; // Dynamic IDs it depends on
  node?: Text; // The text node being updated
  attr?: string; // The attribute name
  prop?: string; // The style property
}
```

#### HTMLAttributes Interface

```typescript
interface HTMLAttributes<T extends Element = Element> {
  id?: string;
  className?: string;
  style?: StyleProperties | string;

  // Data attributes (allow any)
  [key: `data-${string}`]: any;

  // ARIA attributes
  [key: `aria-${string}`]: any;

  // All event handlers (50+ handlers)
  onClick?: EventHandler;
  onChange?: EventHandler;
  onSubmit?: EventHandler;
  // ... more handlers

  // Allow any other custom attributes
  [key: string]: any;
}
```

**Why so comprehensive?** This gives TypeScript full autocomplete when you write JSX.

#### IntrinsicElements Interface

```typescript
interface IntrinsicElements {
  div: HTMLAttributes<HTMLDivElement>;
  button: HTMLAttributes<HTMLButtonElement>;
  input: HTMLAttributes<HTMLInputElement>;
  // ... all 100+ HTML/SVG elements
}
```

**Purpose:** Maps JSX element tags to their allowed attributes. TypeScript uses this for autocompletion and type checking.

---

### src/jsx.d.ts

**Purpose:** Enable JSX syntax in TypeScript files.

```typescript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Same as types.ts but allows JSX syntax
      div: any;
      button: any;
      input: any;
      // ... all elements
    }

    // Tells TypeScript: component.props contains the attributes
    interface ElementAttributesProperty {
      props: any;
    }

    // Tells TypeScript: component.children contains the child elements
    interface ElementChildrenAttribute {
      children: any;
    }
  }
}
```

**Why needed?** TypeScript doesn't understand JSX by default. These declarations teach it how to interpret JSX syntax.

---

### src/index.ts

**Purpose:** Single entry point that exports the public API.

```typescript
import snapp from "./core";

export default snapp;
export type { DynamicValue, SnappProps, SnappComponent, SnappChild };
export type { RenderType, EventHandler, HTMLAttributes, IntrinsicElements };
```

**Why separate file?** Makes it clear what's part of the public API.

---

## Core Concepts

### Dependency Tracking

**The Problem:** How does Snapp know what to update when state changes?

**The Solution:** The `track_dynamic` variable acts like a spy.

```typescript
// When you create: <div>{() => count.value}</div>

// 1. Snapp starts tracking
track_dynamic = new Set();

// 2. Calls the function
const result = (() => count.value)();

// 3. Inside count.value getter:
if (track_dynamic) {
  track_dynamic.add("dynamic-1"); // Add count's ID to set
}

// 4. Now track_dynamic = Set { "dynamic-1" }
// Snapp knows: "This text node depends on dynamic-1"

// 5. When count.update(5) is called:
// Snapp finds all elements depending on "dynamic-1"
// and re-executes their functions
```

**Why functions?** Functions are **lazy**. They're not executed until needed. This is how Snapp tracks which dynamics are used.

### Dynamic State System

**How reactive updates work:**

```typescript
const count = snapp.dynamic(0);

// Under the hood:
// count = {
//   value: 0,
//   subscribe: Map {
//     [element1] → [0],    // element1 depends on dependency 0
//     [element2] → [0, 1],  // element2 depends on deps 0 and 1
//   }
// }

// When you do:
count.update(5);

// Snapp:
// 1. Sets count.value = 5
// 2. Loops through all subscribed elements
// 3. For each element, re-executes its functions
// 4. Updates only the affected text/attribute/style
```

### Event Delegation

**Traditional approach (BAD):**

```typescript
elements.forEach((el) => {
  el.addEventListener("click", handler); // Listener on EVERY element
});
```

If you have 1000 buttons, you have 1000 listeners (memory waste!).

**Snapp's approach (GOOD):**

```typescript
// Single listener on document
document.addEventListener("click", (e) => {
  const button = e.target.closest("[snapp-e-click]");
  if (button) {
    const id = button.getAttribute("snapp-data");
    eventEvent["click"][id](e);
  }
});
```

Now 1000 buttons = 1 listener. Much more efficient!

### Memory Management

**The Problem:** When elements are removed, their listeners and tracking data stay in memory (memory leak).

**The Solution:** MutationObserver watches for removed elements:

```typescript
// When an element is removed:
// 1. Remove it from dynamicDependencies map
// 2. Remove its event listeners from eventEvent
// 3. If no more listeners for an event type, remove document listener
// 4. Call cleardynamicElement() to clean up dynamic data
```

---

## How Everything Works Together

### Example: Simple Counter

```jsx
const Counter = () => {
  const count = snapp.dynamic(0);

  return (
    <>
      <h2>Count: {() => count.value}</h2>
      <button onClick={() => count.update(count.value + 1)}>+</button>
    </>
  );
};

snapp.render(document.body, Counter());
```

**Step by step:**

1. **Create Counter component:**

   - `snapp.create(Counter, {}, [])`
   - Calls `Counter({})`
   - Creates `count = { value: 0, subscribe: Map {} }`

2. **Create h2 element:**

   - `snapp.create("h2", {}, [() => count.value])`
   - Creates `<h2></h2>`
   - For the function child `() => count.value`:
     - Sets `track_dynamic = new Set()`
     - Calls function, which accesses `count.value`
     - That adds "dynamic-0" to `track_dynamic`
     - Creates TextNode with "Count: 0"
     - Subscribes TextNode to updates from "dynamic-0"

3. **Create button:**

   - Creates `<button snapp-e-click snapp-data="2"></button>`
   - Handler stored in `elementEvent["click"][2]`

4. **Render to DOM:**

   - Inserts all elements
   - Sets `DOMReady = true`
   - Dispatches "DOM" event

5. **User clicks button:**

   - Event bubbles to document
   - Document listener catches it
   - Finds closest `[snapp-e-click]` element (the button)
   - Gets element's ID (2)
   - Calls `elementEvent["click"][2](event)`
   - That calls `count.update(count.value + 1)`
   - Updates count to 1

6. **Update happens:**
   - `dynamicData["dynamic-0"].subscribe` has Map with h2 element
   - Calls `updateDynamicValue(h2, [0])`
   - Re-executes the function `() => count.value` (which now returns 1)
   - Updates TextNode.nodeValue to "Count: 1"
   - DOM updates instantly, no re-render!

**Result:** Only the text updates. Nothing else changes. Super efficient!

---

## Common Tasks for Contributors

### Adding a New Method to Snapp

**Goal:** Add `snapp.getAll()` to select multiple elements.

1. **Add function to core.ts:**

   ```typescript
   const getAll = (selector: string): Element[] => {
     return Array.from(document.querySelectorAll(selector));
   };
   ```

2. **Add to the snapp export:**

   ```typescript
   const snapp = {
     create,
     render,
     on,
     select,
     selectAll,
     getAll, // ← Add here
     // ...
   };
   ```

3. **Add type definition to types.ts:**
   ```typescript
   declare function getAll(selector: string): Element[];
   ```

### Adding Support for New HTML Element

**Goal:** Support custom elements like `<my-component>`.

JSX already supports it! Just use:

```jsx
<my-component attr="value">Content</my-component>
```

Snapp will create it as a custom element automatically.

### Adding Event Handler Support

**Goal:** Support `onWheelScroll` event.

1. **Add to types.ts HTMLAttributes:**

   ```typescript
   onWheelScroll?: EventHandler;
   ```

2. Done! The event will automatically work because the core handles all events generically.

### Adding Dynamic State Feature

**Goal:** Add `count.previous` to get previous value.

1. **Modify types.ts:**

   ```typescript
   interface DynamicValue<T = any> {
     readonly value: T;
     readonly previous?: T; // ← Add
     update: (newValue: T) => void;
   }
   ```

2. **Modify core.ts dynamic():**

   ```typescript
   let previousValue = initialValue;

   const update = (newValue: T): void => {
     if (dynamicData[id].value !== newValue) {
       previousValue = dynamicData[id].value; // ← Store old value
       dynamicData[id].value = newValue;
       // ...notify subscribers
     }
   };

   return {
     get value(): T {
       /* ... */
     },
     get previous(): T {
       return previousValue;
     }, // ← Add getter
     update,
   };
   ```

---

## Testing & Building

### Build the project:

```bash
npm run build
# Creates dist/index.js (CommonJS)
# Creates dist/index.mjs (ES Module)
# Creates dist/index.d.ts (TypeScript definitions)
```

### Develop with watch mode:

```bash
npm run dev
# Rebuilds automatically when you change src files
```

### Check for errors:

```bash
npx tsc --noEmit
# TypeScript checks without building
```

---

## Key Takeaways

1. **No Virtual DOM** → Direct DOM manipulation is fast and predictable
2. **Smart Tracking** → Dependency system knows exactly what to update
3. **Efficient Updates** → Only changed text/attributes/styles are updated
4. **Event Delegation** → Single document listener for all events
5. **Memory Safe** → MutationObserver cleans up automatically
6. **Type Safe** → Full TypeScript support with JSX
7. **Simple Code** → No complex abstractions, just vanilla DOM APIs

---

## Questions?

- 📖 See README.md for usage examples
- 💬 Open a GitHub issue
- 🤝 Submit a PR with improvements

Happy contributing! 🚀
