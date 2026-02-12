# Snapp Framework - Complete Code Explanation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Core API](#core-api)
5. [Type System](#type-system)
6. [Internal Mechanisms](#internal-mechanisms)
7. [How to Use](#how-to-use)
8. [How to Extend](#how-to-extend)

---

## Project Overview

**Snapp Framework** is a lightweight, TypeScript-based frontend framework that:

- Creates DOM elements directly (no virtual DOM)
- Provides reactive state management with `dynamic()`
- Supports component-based architecture
- Works with both TypeScript and JavaScript
- Compiles to multiple export formats (CommonJS, ES Module)

**Key Features:**

- ✅ Direct DOM manipulation
- ✅ Reactive state updates
- ✅ Component composition
- ✅ Full TypeScript support
- ✅ Zero dependencies
- ✅ Automatic memory cleanup

---

## Architecture

### High-Level Flow

```
User Code
    ↓
snapp.create()  ← Create elements/components
    ↓
snapp.dynamic() ← Create reactive state
    ↓
snapp.render()  ← Render to DOM
    ↓
Real DOM Elements
    ↓
User Interactions
    ↓
Update dynamic values
    ↓
Auto-update affected elements
```

### Core Concepts

1. **Elements**: HTML/SVG tags created with `snapp.create()`
2. **Components**: Functions that return elements
3. **Dynamic Values**: Reactive state that triggers DOM updates
4. **Event Delegation**: Single listener per event type on `document`
5. **Memory Management**: Automatic cleanup via MutationObserver

---

## File Structure

### 📁 `src/index.ts` - Main Entry Point

```typescript
import snapp from "./core";
export default snapp;
export type { DynamicValue, SnappProps, SnappComponent, SnappChild };
```

**Purpose**: Single export file that re-exports everything from `core.ts`

**What it does**:

- Imports the main `snapp` object from core
- Exports it as default (so users can `import snapp from '@snapp/core'`)
- Exports all public types for TypeScript users

---

### 📁 `src/types.ts` - Type Definitions

This file contains all TypeScript interfaces and types.

#### Key Types:

**1. SnappChild** (Line 8-17)

```typescript
export type SnappChild =
  | string // Text content
  | number // Numbers (converted to text)
  | Element // DOM elements
  | DocumentFragment // Element groups
  | SnappComponent // Components
  | SnappChild[] // Nested arrays
  | null
  | undefined // Empty slots
  | boolean; // Conditional rendering
```

**Use**: Defines what can be passed as children to elements

**2. SnappComponent** (Line 26-29)

```typescript
export type SnappComponent<P extends SnappProps = SnappProps> = (
  props: P & { children?: SnappChild[] }
) => Element | DocumentFragment;
```

**Use**: Type-safe component functions

**3. DynamicValue** (Line 44-47)

```typescript
export interface DynamicValue<T = any> {
  readonly value: T; // Get current value
  update: (newValue: T) => void; // Update value
}
```

**Use**: Reactive state container

**4. HTMLAttributes** (Line 64-200+)

```typescript
export interface HTMLAttributes<T extends Element = Element> {
  id?: string;
  className?: string;
  style?: StyleProperties | string;
  onClick?: EventHandler;
  onInput?: EventHandler;
  // ... all HTML/SVG attributes
  [key: `data-${string}`]: any; // Data attributes
  [key: `aria-${string}`]: any; // ARIA attributes
}
```

**Use**: Type-safe props for elements

**5. IntrinsicElements** (Line 207+)

```typescript
export interface IntrinsicElements {
  div: HTMLAttributes<HTMLDivElement>;
  button: HTMLAttributes<HTMLButtonElement>;
  // ... all HTML/SVG elements
}
```

**Use**: JSX type mapping

---

### 📁 `src/jsx.d.ts` - JSX Namespace

```typescript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // All HTML/SVG elements here
      a: any;
      div: any;
      button: any;
      // etc...
    }
    interface ElementAttributesProperty {
      props: any;
    }
    interface ElementChildrenAttribute {
      children: any;
    }
  }
}
```

**Purpose**: Enables JSX syntax in TypeScript (optional usage)

**How it works**:

- Declares JSX namespace that TypeScript uses
- Maps element names to attribute types
- Allows `<div>` syntax instead of `snapp.create('div')`

---

### 📁 `src/core.ts` - Framework Implementation

The main framework code. Let's break it down:

#### **1. Imports** (Line 1-18)

```typescript
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
```

Imports all type definitions from types.ts (type-only imports, removed at build time)

#### **2. Constants** (Line 20-95)

**SVG_ELEMENTS** (Line 24-72)

```typescript
const SVG_ELEMENTS = new Set([
  "svg", "circle", "path", ...
]);
```

**Purpose**: Identifies SVG elements that need `createElementNS()` instead of `createElement()`

**eventMap** (Line 77-81)

```typescript
const eventMap: Record<string, string> = {
  onmouseenter: "onmouseover",
  onmouseleave: "onmouseout",
  ondoubleclick: "ondblclick",
};
```

**Purpose**: Maps modern event names to older browser-compatible names

#### **3. Global State** (Line 84-115)

```typescript
let dataId: number = 0;              // Unique ID for each element
let dynamicId: number = 1;           // Unique ID for each dynamic value
let DOMReady: boolean = false;       // Track DOM readiness
let track_dynamic: Set<string> | null = null;  // Track dependencies during execution

const dynamicData = { ... };         // Store all dynamic values and subscriptions
const dynamicDependencies = new Map();  // Map elements to their dynamic dependencies
const eventListener = { ... };       // Store event listeners by type
const elementEvent = { ... };        // Store element-specific handlers
```

**Why global state?**

- Persists data across function calls
- Tracks element dependencies
- Manages subscriptions between dynamic values and elements

#### **4. Helper Functions**

**flattenChildren()** (Line 117-135)

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
      final.push(child); // Keep truthy values
    }
  }
  return final;
};
```

**Purpose**: Normalizes children array

- Flattens nested arrays: `[[el1], [el2]]` → `[el1, el2]`
- Removes falsy values for conditional rendering
- Allows `condition && element` pattern

**Example**:

```typescript
const items = [1, 2, 3];
const result = snapp.create(
  "div",
  null,
  items.map((i) => snapp.create("p", null, i)), // Creates array of elements
  someCondition && snapp.create("button", null, "Click") // Conditional
);
// flattenChildren handles all the nesting and false values
```

---

#### **5. createElement()** (Line 138-276)

Creates actual DOM elements with attributes and children.

**Signature**:

```typescript
const createElement = (
  element: string,        // Tag name like 'div', 'button'
  props: SnappProps | null | undefined,  // Attributes object
  children: SnappChild[]   // Child elements
): Element => { ... }
```

**Key Steps**:

1. **Create Element** (Line 143-146)

```typescript
const ele = SVG_ELEMENTS.has(element)
  ? document.createElementNS("http://www.w3.org/2000/svg", element)
  : document.createElement(element);
```

Creates either SVG or HTML element based on tag name

2. **Assign Data ID** (Line 148)

```typescript
dataId++;
```

Each element gets a unique ID for tracking

3. **Process Props** (Line 150-235)
   Loop through props and handle different types:

**a) Skip null/false** (Line 151-152)

```typescript
if (value == null || value === false) continue;
```

Skip rendering undefined, null, or false props

**b) Normalize Keys** (Line 156-157)

```typescript
attrKey = attrKey === "className" ? "class" : attrKey;
attrKey = attrKey === "htmlFor" ? "for" : attrKey;
```

Convert React-style names to HTML names

**c) Boolean Attributes** (Line 160-163)

```typescript
if (value === true || value === "") {
  ele.setAttribute(attrKey, "");
  continue;
}
```

Handle `disabled`, `required`, etc. → `<button disabled>`

**d) Style Objects** (Line 166-200)

```typescript
if (attrKey === "style") {
  for (const [property, style] of Object.entries(value)) {
    track_dynamic = new Set(); // Start tracking dependencies
    const mainStyle = typeof style === "function" ? style() : style;
    const newDynamicId = [...track_dynamic];
    track_dynamic = null;

    if (newDynamicId.length > 0) {
      // Register this style as dependent on dynamic values
      subscribeDynamic(newDynamicId, subscribeData, ele);
    }

    // Apply style
    (ele as any).style.setProperty(property, mainStyle);
  }
}
```

**How it works**:

- `track_dynamic = new Set()` starts recording which dynamic values are accessed
- When you access `count.value` inside a function, it's added to `track_dynamic`
- After execution, we know which dynamic values this element depends on
- Subscribe element to those values so it updates when they change

**e) Event Listeners** (Line 203-214)

```typescript
if (attrKey.startsWith("on") && typeof value === "function") {
  let lowerCaseKey = attrKey.toLowerCase();
  lowerCaseKey = eventMap[lowerCaseKey] || lowerCaseKey;

  if (lowerCaseKey in ele) {
    const eventType = lowerCaseKey.slice(2); // "onClick" → "click"
    addEventListener(eventType, value, dataId); // Register handler
    ele.setAttribute("snapp-e-" + eventType, "true"); // Mark element
  }
}
```

Uses **event delegation**:

- Don't attach listener to each element
- Single listener on `document` catches all events
- Check element with attribute `snapp-e-{eventType}`
- Call the registered handler

**f) Dynamic Attributes** (Line 217-234)

```typescript
if (typeof value === "function" && !attrKey.startsWith("on")) {
  track_dynamic = new Set();
  ele.setAttribute(attrKey, value()); // Call function to get value
  const newDynamicId = [...track_dynamic];

  if (newDynamicId.length > 0) {
    // Subscribe to dynamic values
    subscribeDynamic(newDynamicId, subscribeData, ele);
  }
}
```

Allows:

```typescript
snapp.create("div", {
  id: () => `item-${count.value}`, // ID updates when count changes
});
```

4. **Process Children** (Line 238-273)
   Similar to props, handle different child types:

- Strings, numbers, Elements, DocumentFragments → append directly
- Functions → call function to get content (for dynamic text)

---

#### **6. createFragment()** (Line 278-293)

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
      frag.append(node as any);
    }
  });
  return frag;
};
```

**Purpose**: Create a fragment (group of elements without wrapper)

**Use case**:

```typescript
snapp.create(
  "<>",
  null, // Fragment!
  snapp.create("h1", null, "Title"),
  snapp.create("p", null, "Content")
);
// Returns: h1 + p (no wrapper div)
```

---

#### **7. createComponent()** (Line 296-303)

```typescript
const createComponent = (
  element: SnappComponent,
  props: SnappProps = {},
  children: SnappChild[]
): Element | DocumentFragment => {
  const totalProps = { ...props, children };
  return element(totalProps); // Call component function
};
```

**Purpose**: Call component function with props and children

**Example**:

```typescript
const Button = (props) => {
  return snapp.create("button", null, props.children);
};

snapp.create(Button, {}, "Click me");
// Calls: Button({ children: ['Click me'] })
// Returns: button element
```

---

#### **8. create()** (Line 306-331)

Main entry point. Routes to correct handler:

```typescript
const create = (
  element: string | SnappComponent | "<>",
  props?: SnappProps | null,
  ...children: SnappChild[]
): Element | DocumentFragment => {
  const flatChildren = flattenChildren(children);

  // If string → HTML element
  if (element !== "<>" && typeof element === "string") {
    return createElement(element, props, flatChildren);
  }

  // If function → component
  if (typeof element === "function") {
    return createComponent(element, props || {}, flatChildren);
  }

  // If "<>" → fragment
  if (element === "<>") {
    return createFragment(flatChildren);
  }

  throw new Error(`Invalid element type...`);
};
```

**Usage**:

```typescript
snapp.create("div", { id: "app" }, "Hello"); // Element
snapp.create(MyComponent, { title: "Hi" }); // Component
snapp.create("<>", null, el1, el2); // Fragment
```

---

#### **9. render()** (Line 334-394)

Renders element to DOM:

```typescript
const render = (
  body: Element, // Target element
  App: string | number | Element | DocumentFragment, // What to render
  type: RenderType = "replace", // How to render
  callBack?: (success: boolean) => void // Success callback
): void => {
  if (!document.contains(body)) {
    console.error("ERROR: Rendering to non-existing element", body);
    callBack?.(false);
    return;
  }

  if (
    typeof App === "string" ||
    typeof App === "number" ||
    App instanceof Element ||
    App instanceof DocumentFragment
  ) {
    DOMReady = false; // Prevent DOM ready event from firing

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
    document.dispatchEvent(new Event("DOM")); // Notify DOM ready
    callBack?.(true);
  } else {
    console.error("Failed to render! Invalid App type");
    callBack?.(false);
  }
};
```

**Render Types**:

```
       [target element]
          ↑     ↑     ↑
    before|prepend|after
          |   |   |
        append|replace
          |
     replaceChildren
```

**Example**:

```typescript
const app = snapp.select("#app");
snapp.render(app, myComponent, "replace", (success) => {
  if (success) console.log("Rendered!");
});
```

---

#### **10. DOM Selection Functions** (Line 397-481)

**select()** - Find single or multiple elements

```typescript
const select = (
  name: string | string[]
): Element | (Element | null)[] | null => {
  if (typeof name === "string") {
    return document.querySelector(name);
  }
  if (Array.isArray(name)) {
    return name.map((selector) => document.querySelector(selector));
  }
};
```

**selectAll()** - Find all matching elements

```typescript
const selectAll = (name: string | string[]): NodeListOf<Element> | ... => {
  if (typeof name === "string") {
    return document.querySelectorAll(name);
  }
  if (Array.isArray(name)) {
    return name.map(selector => document.querySelectorAll(selector));
  }
};
```

**Usage**:

```typescript
const el = snapp.select("#app");
const items = snapp.selectAll(".item");
const both = snapp.select([".header", ".footer"]);
```

---

#### **11. Style Functions** (Line 484-542)

**applystyle()** - Add/change styles

```typescript
const applystyle = (
  element: Element | Element[],
  styles: Record<string, string | number>
): void => {
  const elements = Array.isArray(element) ? element : [element];
  elements.forEach((ele) => {
    for (const [property, style] of Object.entries(styles)) {
      if (property.includes("-")) {
        (ele as any).style.setProperty(property, style); // CSS variables
      } else {
        (ele as any).style[property] = style; // Direct assignment
      }
    }
  });
};
```

**removestyle()** - Remove styles

```typescript
const removestyle = (
  element: Element | Element[],
  styles?: Record<string, string | number> | boolean
): void => {
  if (styles === true) {
    ele.removeAttribute("style"); // Remove all styles
  } else {
    // Remove specific styles
    for (const [property] of Object.entries(styles)) {
      ele.style.removeProperty(property);
    }
  }
};
```

**Usage**:

```typescript
snapp.applystyle(button, { backgroundColor: "blue", fontSize: "16px" });
snapp.removestyle(button, { backgroundColor: "blue" });
snapp.removestyle(button, true); // Remove all
```

---

#### **12. remove()** (Line 397-406)

Remove elements from DOM:

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

---

#### **13. on()** (Line 409-419)

Listen to framework events:

```typescript
const on = (event: string, callBack: () => void): void => {
  if (typeof event === "string" && event.toUpperCase() === "DOM") {
    if (DOMReady === true) {
      callBack(); // Already ready
    } else {
      document.addEventListener(event.toUpperCase(), callBack, { once: true });
    }
  }
};
```

**Usage**:

```typescript
snapp.on("DOM", () => {
  console.log("DOM ready, render now!");
});
```

---

#### **14. Event Delegation** (Line 545-567)

```typescript
const addEventListener = (
  eventType: string,
  event: EventHandler,
  elementId: number
): void => {
  const eventTemplate = (element: Event) => {
    const target = element.target as Node;

    if (!target || target.nodeType !== 1) return;

    const elWithAttr = (target as Element).closest(
      `[snapp-e-${eventType}]`
    ) as Element | null;
    if (!elWithAttr) return;

    const elementDataId = elWithAttr.getAttribute("snapp-data");
    if (elementEvent[eventType]?.[Number(elementDataId)]) {
      elementEvent[eventType][Number(elementDataId)](element); // Call handler
    }
  };

  if (!(eventType in eventListener)) {
    elementEvent[eventType] = {};
    eventListener[eventType] = eventTemplate;
    document.addEventListener(eventType, eventListener[eventType]); // Single listener
  }

  elementEvent[eventType][elementId] = event; // Store handler
};
```

**How it works**:

1. First time event happens: attach listener to `document`
2. When event fires: find element with `snapp-e-{eventType}` attribute
3. Get that element's ID and call the registered handler
4. Multiple elements can reuse same listener!

**Benefits**:

- ✅ Memory efficient
- ✅ Works with dynamically added elements
- ✅ Single listener per event type

---

#### **15. dynamic()** (Line 570-594)

Create reactive state:

```typescript
const dynamic = <T = any>(initialValue: T = "" as T): DynamicValue<T> => {
  const id = `dynamic-${dynamicId++}`; // Unique ID
  dynamicData[id] = {
    value: initialValue,
    subscribe: new Map(), // Elements that depend on this
  };

  const update = (newValue: T): void => {
    if (dynamicData[id].value !== newValue) {
      // Only update if changed
      dynamicData[id].value = newValue;

      // Notify all dependent elements
      for (const [element, items] of dynamicData[id].subscribe) {
        updateDynamicValue(element, items); // Trigger updates
      }
    }
  };

  return {
    get value(): T {
      if (track_dynamic) {
        track_dynamic.add(id); // Record this dependency
      }
      return dynamicData[id].value;
    },
    update,
  };
};
```

**How tracking works**:

```typescript
// When creating element:
track_dynamic = new Set();
const style = () => `background: ${count.value}`; // Access count
style(); // Executes, track_dynamic now has count's ID
// Now element knows it depends on count

// When count updates:
count.update(5); // Calls update()
// update() finds all elements depending on count
// Calls updateDynamicValue() for each element
// Element's styles get recalculated and applied
```

---

#### **16. updateDynamicValue()** (Line 597-644)

Updates element when dynamic value changes:

```typescript
const updateDynamicValue = (element: Element, items: number[]): void => {
  items.forEach((item) => {
    const dynamic = dynamicDependencies.get(element)?.[item];
    if (dynamic) {
      const previousDynamicId = new Set(dynamic.subscribe);
      track_dynamic = new Set(); // Start new tracking
      const newTemp = dynamic.temp(); // Execute function with new values
      const newTrack_dynamic = [...track_dynamic]; // Get new dependencies
      track_dynamic = null;

      // Apply updated value
      if (dynamic.type === "node" && dynamic.node) {
        dynamic.node.nodeValue = newTemp; // Update text
      } else if (dynamic.type === "attr" && dynamic.attr) {
        element.setAttribute(dynamic.attr, newTemp); // Update attribute
      } else if (dynamic.type === "style" && dynamic.prop) {
        (element as any).style.setProperty(dynamic.prop, newTemp); // Update style
      }

      // Register new dependencies
      newTrack_dynamic.forEach((dynamicId) => {
        if (previousDynamicId.has(dynamicId)) return; // Skip if already tracked

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

**Key feature**: Handles nested dynamic values!

Example:

```typescript
const count = snapp.dynamic(0);
const doubled = snapp.dynamic(0);

snapp.create("p", null, () => {
  doubled.update(count.value * 2);
  return `Count: ${count.value}, Doubled: ${doubled.value}`;
});

// When count updates → doubled updates → text updates
// All handled automatically!
```

---

#### **17. subscribeDynamic()** (Line 647-665)

Register element as dependent on dynamic values:

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

  // Add element to each dynamic value's subscriber list
  dynamicIds.forEach((id) => {
    if (!dynamicData[id]) return;

    if (!dynamicData[id]["subscribe"].has(element)) {
      dynamicData[id]["subscribe"].set(element, []);
    }

    dynamicData[id]["subscribe"].get(element)!.push(subscribeIndex);
  });
};
```

Creates two-way link:

- Element knows which dynamic values it depends on
- Each dynamic value knows which elements depend on it

---

#### **18. Memory Management** (Line 668-747)

**cleardynamicElement()**:

```typescript
const cleardynamicElement = (): void => {
  for (const [dynamicId, items] of Object.entries(dynamicData)) {
    for (const [element, _] of items.subscribe) {
      if (!element.isConnected) {
        // Element removed from DOM
        dynamicData[dynamicId].subscribe.delete(element); // Clean up
      }
    }
  }
};
```

**MutationObserver**:

```typescript
const observer = new MutationObserver((mutations) => {
  mutations.forEach((element) => {
    element.removedNodes.forEach((node) => {
      if (node instanceof Element) {
        // Remove event listeners
        const elementDataId = node.getAttribute("snapp-data");
        for (const attrName of node.getAttributeNames()) {
          if (attrName.startsWith("snapp-e-")) {
            const eventType = attrName.replace("snapp-e-", "");
            delete elementEvent[eventType]?.[Number(elementDataId)];

            // Remove document listener if no more elements
            if (Object.keys(elementEvent[eventType] || {}).length === 0) {
              document.removeEventListener(eventType, eventListener[eventType]);
              delete eventListener[eventType];
              delete elementEvent[eventType];
            }
          }
        }

        // Clean up dynamic dependencies
        if (node.getAttribute("snapp-dynamic")) {
          dynamicDependencies.delete(node);
          callCleardynamicElement(); // Schedule cleanup
        }
      }
    });
  });
});

observer.observe(document, { childList: true, subtree: true });
```

**Purpose**: Prevent memory leaks

- Removes event listeners when elements are deleted
- Clears dynamic subscriptions for detached elements
- Runs automatically via MutationObserver

---

#### **19. Main Export** (Line 750-758)

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

Creates main object with all public APIs and exports types.

---

## Type System

### tsconfig.json Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020", // Output modern JavaScript
    "lib": ["ES2020", "DOM", "DOM.Iterable"], // Use modern APIs + DOM
    "module": "ESNext", // Use ESNext modules
    "declaration": true, // Generate .d.ts files
    "declarationMap": true, // Debug type definitions
    "sourceMap": true, // Debug compiled JavaScript
    "strict": true, // Strict type checking
    "esModuleInterop": true, // Better CommonJS compatibility
    "moduleResolution": "node" // Node.js module resolution
  },
  "include": ["src"], // Compile all TypeScript in src/
  "exclude": ["node_modules", "dist"] // Exclude build artifacts
}
```

### package.json Build Configuration

```json
{
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts --clean",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch"
  }
}
```

**What this does**:

- `tsup src/index.ts` - Bundle TypeScript file
- `--format cjs,esm` - Output CommonJS and ES Module
- `--dts` - Generate TypeScript definitions
- `--clean` - Remove old dist/ before building
- `--watch` - Re-build on file changes (dev only)

**Outputs**:

- `dist/index.js` - CommonJS version
- `dist/index.mjs` - ES Module version
- `dist/index.d.ts` - Type definitions

---

## How to Use

### Basic Element

```typescript
import snapp from "@snapp/core";

const button = snapp.create(
  "button",
  { id: "myBtn", className: "primary" },
  "Click me"
);

const app = snapp.select("#app");
snapp.render(app, button);
```

### Component

```typescript
const Greeting = (props: { name: string }) => {
  return snapp.create("h1", null, `Hello, ${props.name}!`);
};

const element = snapp.create(Greeting, { name: "Alice" });
snapp.render(app, element);
```

### Reactive State

```typescript
const count = snapp.dynamic(0);

const Counter = () => {
  return snapp.create(
    "div",
    null,
    snapp.create("p", null, () => `Count: ${count.value}`),
    snapp.create(
      "button",
      {
        onClick: () => count.update(count.value + 1),
      },
      "Increment"
    )
  );
};

snapp.render(app, Counter());

// Update happens automatically!
```

### Event Listeners

```typescript
snapp.create("button", {
  onClick: (event) => {
    console.log("Clicked!", event);
  },
  onMouseEnter: () => console.log("Entered"),
  onInput: (e) => {
    const value = (e.target as HTMLInputElement).value;
  },
});
```

### Styling

```typescript
const isActive = snapp.dynamic(false);

snapp.create("div", {
  style: {
    backgroundColor: () => (isActive.value ? "green" : "red"),
    padding: "10px", // Static style
  },
  onClick: () => isActive.update(!isActive.value),
});
```

---

## How to Extend

### Add a New API Method

1. **Create the function in `core.ts`**:

```typescript
const myNewFunction = (arg: string): void => {
  console.log("New function:", arg);
};
```

2. **Add to exports**:

```typescript
const snapp = {
  create,
  render,
  on,
  // ... other exports
  myNewFunction, // Add here
};
```

3. **Add TypeScript definition in `types.ts`**:

```typescript
export interface SnappFramework {
  // ... existing
  myNewFunction: (arg: string) => void;
}
```

4. **Export from `index.ts`** if needed:

```typescript
export { myNewFunction } from "./core";
```

### Add a New Event Type

1. **Update `eventMap` in `core.ts`**:

```typescript
const eventMap: Record<string, string> = {
  // ... existing
  onmyevent: "onmycustomevent",
};
```

2. **Update `HTMLAttributes` in `types.ts`**:

```typescript
export interface HTMLAttributes<T extends Element = Element> {
  // ... existing
  onMyEvent?: EventHandler;
}
```

### Add a New Element Type

1. **If SVG**: Add to `SVG_ELEMENTS` set in `core.ts`

2. **Add to `IntrinsicElements` in `types.ts`**:

```typescript
export interface IntrinsicElements {
  // ... existing
  mycustomelement: HTMLAttributes<HTMLElement>;
}
```

3. **Add to `jsx.d.ts`**:

```typescript
namespace JSX {
  interface IntrinsicElements {
    mycustomelement: any;
  }
}
```

---

## Common Bug Fixes

### Bug: Dynamic values not updating

**Problem**: You create a dynamic value but the element doesn't update when you call `.update()`

**Cause**: The element wasn't created with a function that accesses the dynamic value

**Fix**:

```typescript
// ❌ Wrong - value captured at creation time
const text = snapp.create("p", null, count.value);

// ✅ Correct - function called each time
const text = snapp.create("p", null, () => count.value);
```

### Bug: Event handlers not firing

**Problem**: `onClick` handler isn't being called

**Cause**: Might be a typo in event name or handler not registered

**Fix**:

```typescript
// Make sure event name starts with "on" and is correct
snapp.create("button", {
  onClick: () => console.log("Clicked"), // ✅ Correct
  // onclick: () => {},  // ❌ Wrong
});
```

### Bug: Memory leaks

**Problem**: Removing elements doesn't clean up listeners

**Cause**: MutationObserver is watching, but you're not letting it run

**Fix**: The framework handles this automatically - just remove elements normally:

```typescript
snapp.remove(element); // Cleanup happens automatically
```

---

## File Dependencies

```
index.ts
  ├── imports default from core.ts
  └── exports from core.ts and types.ts

core.ts
  └── imports from types.ts (type-only)

types.ts
  └── standalone type definitions

jsx.d.ts
  └── standalone JSX declarations

tsconfig.json
  └── controls TypeScript compilation

package.json
  └── tsup config builds everything
```

---

## Performance Notes

✅ **What's optimized**:

- Single event listener per event type (event delegation)
- Automatic memory cleanup (MutationObserver)
- Minimal re-renders (only affected elements update)
- Direct DOM manipulation (no virtual DOM overhead)

⚠️ **What to watch**:

- Large lists: Consider virtual scrolling for many items
- Frequent updates: Batch updates when possible
- Complex computations: Cache results in dynamic values

---

## Summary

**Snapp Framework**:

1. ✅ Creates real DOM elements directly
2. ✅ Manages reactive state with `dynamic()`
3. ✅ Supports component composition
4. ✅ Uses event delegation for efficiency
5. ✅ Automatically cleans up when elements are removed
6. ✅ Fully typed with TypeScript

**Key files**:

- `core.ts` - Framework implementation
- `types.ts` - Type definitions
- `jsx.d.ts` - JSX support
- `index.ts` - Main export
- `tsconfig.json` - TypeScript config
- `package.json` - Build config

**To extend**: Add functions to `core.ts`, update exports, add types to `types.ts`.

---

**Built with ❤️ for developers who want control and type safety**
