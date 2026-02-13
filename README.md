# Snapp Framework

> A lightweight JSX/TSX framework for building fast, reactive web applications with **direct DOM manipulation** - no virtual DOM overhead.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@snappjs/core)](https://www.npmjs.com/package/@snappjs/core)

---

## 📋 Table of Contents

- [What is Snapp?](#what-is-snapp)
- [Core Concepts](#core-concepts)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [snapp.create()](#snappcreate)
  - [snapp.render()](#snapprender)
  - [snapp.dynamic()](#snappdynamic)
  - [snapp.on()](#snappon)
  - [snapp.select() / snapp.selectAll()](#snappselect--snappselect-all)
  - [snapp.applystyle() / snapp.removestyle()](#snappapplystyle--snappremovestyle)
  - [snapp.remove()](#snappremove)
- [Type Definitions](#type-definitions)
- [Core Architecture](#core-architecture)
- [Contributing](#contributing)

---

## What is Snapp?

Snapp is a **lightweight JavaScript framework** that compiles JSX/TSX directly to native DOM operations. It's designed for developers who want:

- ✅ **JSX/TSX syntax** you already know
- ✅ **Direct DOM control** without abstraction layers
- ✅ **Reactive state** that updates elements individually
- ✅ **Zero virtual DOM** - just compiled JavaScript
- ✅ **TypeScript support** out of the box
- ✅ **Automatic memory management** with built-in cleanup

### Why Snapp?

| Feature        | Snapp             | Virtual DOM Frameworks    |
| -------------- | ----------------- | ------------------------- |
| Learning Curve | Native DOM skills | New abstractions          |
| Performance    | Direct DOM        | Reconciliation overhead   |
| Debugging      | Browser DevTools  | Framework DevTools needed |
| Memory         | Efficient cleanup | GC dependent              |

---

## Core Concepts

### 1. JSX Compiles to DOM Operations

```jsx
// What you write:
<button onClick={() => alert("Hi")}>Click me</button>;

// Gets compiled to:
snapp.create("button", { onClick: () => alert("Hi") }, "Click me");
```

### 2. Dynamic State with Arrow Functions

The key difference in Snapp is how you handle reactive values:

```jsx
const count = snapp.dynamic(0);

// ❌ WRONG - accesses value once at render time
<p>{count.value}</p>

// ✅ CORRECT - wrapped in arrow function for reactivity
<p>{() => count.value}</p>

// When count updates, ONLY this text updates:
count.update(5);
```

**Why arrow functions?** Snapp tracks dynamic value access inside the function. When you call `count.update()`, it re-executes that function and updates just that specific text node, attribute, or style.

### 3. Regular Variables Stay Static

```jsx
const staticText = "Hello";
const dynamicText = snapp.dynamic("World");

<div>
  {staticText} {/* Static - never changes */}
  {() => dynamicText.value} {/* Dynamic - updates when dynamicText changes */}
</div>;
```

---

## Installation

```bash
npm install @snappjs/core
```

### Basic Setup

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Snapp App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="src/index.js"></script>
  </body>
</html>
```

```jsx
// src/index.jsx
import snapp from "@snappjs/core";

const App = () => {
  return <h1>Hello Snapp!</h1>;
};

const app = document.getElementById("app");
snapp.render(app, App());
```

---

## Quick Start

### Example 1: Simple Counter

```jsx
import snapp from "@snappjs/core";

const Counter = () => {
  const count = snapp.dynamic(0);

  return (
    <>
      <h2>Count: {() => count.value}</h2>
      <button onClick={() => count.update(count.value + 1)}>Increment</button>
    </>
  );
};

snapp.render(document.body, Counter());
```

### Example 2: Todo List

```jsx
import snapp from "@snappjs/core";

const TodoApp = () => {
  const todos = snapp.dynamic([]);
  const input = snapp.dynamic("");

  const addTodo = () => {
    const newTodos = [...todos.value, input.value];
    todos.update(newTodos);
    input.update("");
  };

  return (
    <div>
      <h1>Todos</h1>
      <input
        value={() => input.value}
        onInput={(e) => input.update(e.target.value)}
        placeholder="Add a todo..."
      />
      <button onClick={addTodo}>Add</button>
      <ul>{() => todos.value.map((todo) => <li>{todo}</li>)}</ul>
    </div>
  );
};

snapp.render(document.body, TodoApp());
```
---

## API Reference

### snapp.create()

Creates a DOM element, component, or fragment.

```typescript
create(
    element: string | Component | "<>",
    props?: SnappProps,
    ...children: SnappChild[]
): Element | DocumentFragment
```

**Usage:**

```jsx
// HTML element
snapp.create("div", { id: "main" }, "Hello");

// Component
const MyComponent = (props) => <div>{props.children}</div>;
snapp.create(MyComponent, {}, "Hello");

// Fragment
snapp.create("<>", null, <div>A</div>, <div>B</div>);

// In JSX, you use the angle brackets directly:
<div id="main">Hello</div>
<MyComponent>Hello</MyComponent>
<>
    <div>A</div>
    <div>B</div>
</>
```

---

### snapp.render()

Renders a component or element to the DOM.

```typescript
render(
    target: Element,
    component: Element | DocumentFragment | string | number,
    type?: "replace" | "append" | "prepend" | "before" | "after",
    callback?: (success: boolean) => void
): void
```

**Parameters:**

| Parameter   | Type                                            | Default     | Description                               |
| ----------- | ----------------------------------------------- | ----------- | ----------------------------------------- |
| `target`    | Element                                         | required    | The DOM element to render to              |
| `component` | Element \| DocumentFragment \| string \| number | required    | What to render                            |
| `type`      | string                                          | `"replace"` | Where/how to render                       |
| `callback`  | Function                                        | optional    | Called with true/false on success/failure |

**Render Types:**

```jsx
const content = <div>New content</div>;
const target = document.getElementById("app");

// Replace target's children
snapp.render(target, content, "replace"); // Default

// Add as first child
snapp.render(target, content, "prepend");

// Add as last child
snapp.render(target, content, "append");

// Insert before target
snapp.render(target, content, "before");

// Insert after target
snapp.render(target, content, "after");

// With callback
snapp.render(target, content, "replace", (success) => {
  if (success) console.log("Rendered!");
});
```

---

### snapp.dynamic()

Creates a reactive state value.

```typescript
dynamic<T = any>(initialValue?: T): DynamicValue<T>
```

**Properties:**

```typescript
interface DynamicValue<T> {
  readonly value: T; // Get current value
  update: (newValue: T) => void; // Set new value
}
```

**Usage:**

```jsx
// Create dynamic state
const count = snapp.dynamic(0);
const user = snapp.dynamic({ name: "John", age: 30 });
const isVisible = snapp.dynamic(true);

// Use in JSX with arrow function
<div>
  Count: {() => count.value}
  Name: {() => user.value.name}
  Visible: {() => (isVisible.value ? "Yes" : "No")}
</div>;

// Update state
count.update(5);
user.update({ name: "Jane", age: 25 });
isVisible.update(false);

// Update based on previous value
count.update(count.value + 1);
```

**Dynamic State in Different Contexts:**

```jsx
// Text Content
const message = snapp.dynamic("Hello");
<p>{() => message.value}</p>;

// Attributes
const id = snapp.dynamic("item-1");
<div id={() => id.value}></div>;

// Styles
const color = snapp.dynamic("blue");
<p style={{ color: () => color.value }}>Colored text</p>;

// Event Handlers (regular functions)
const handleClick = () => alert("clicked");
<button onClick={handleClick}>Click</button>;

// Conditional Rendering
const showHeader = snapp.dynamic(true);
<>{() => (showHeader.value ? <header>Title</header> : null)}</>;
```

---

### snapp.on()

Listens for DOM ready events.

```typescript
on(event: string, callback: () => void): void
```

**Usage:**

```jsx
// Wait for DOM to be ready before accessing elements
snapp.on("DOM", () => {
  const element = snapp.select("#myElement");
  console.log("Element is in DOM:", element);
});

// snapp.on("DOM") is called after snapp.render() completes
const App = () => {
  return <h2 id="myElement">Title</h2>;
};

snapp.render(document.body, App(), "replace", () => {
  // At this point, the DOM is ready
  snapp.on("DOM", () => {
    console.log("Now we can access #myElement");
  });
});
```

---

### snapp.select() / snapp.selectAll()

Query DOM elements using CSS selectors.

```typescript
select(selector: string | string[]): Element | Element[] | null
selectAll(selector: string | string[]): NodeListOf<Element> | NodeListOf<Element>[] | null
```

**Usage:**

```jsx
// Single selector
const element = snapp.select("#myId");
const element = snapp.select(".myClass");

// Multiple selectors (returns array)
const elements = snapp.select(["#id1", "#id2"]);

// Select all matching
const items = snapp.selectAll(".item");
const items = snapp.selectAll(".item, .product");

// Multiple selectors for selectAll
const results = snapp.selectAll([".class1", ".class2"]);
// Returns array of NodeLists

// Returns null if not found
const missing = snapp.select("#doesNotExist"); // null
```

---

### snapp.applystyle() / snapp.removestyle()

Manage element styles programmatically.

```typescript
applystyle(
    element: Element | Element[],
    styles: Record<string, string | number>
): void

removestyle(
    element: Element | Element[],
    styles?: Record<string, string | number> | boolean
): void
```

**Usage:**

```jsx
const box = snapp.select("#box");

// Apply styles
snapp.applystyle(box, {
  backgroundColor: "blue",
  padding: "20px",
  "border-radius": "8px", // CSS property names with hyphens work
});

// Remove specific styles
snapp.removestyle(box, {
  backgroundColor: "blue",
  padding: "20px",
});

// Remove all styles
snapp.removestyle(box, true);

// Multiple elements
const boxes = snapp.selectAll(".box");
snapp.applystyle(boxes, { color: "red" });
snapp.removestyle(boxes, { color: "red" });
```

---

### snapp.remove()

Remove elements from the DOM.

```typescript
remove(items: Element | Element[]): void
```

**Usage:**

```jsx
const element = snapp.select("#myElement");
snapp.remove(element);

// Remove multiple
const items = snapp.selectAll(".item");
snapp.remove(items);
```

---

## Type Definitions

### SnappChild

```typescript
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
```

Represents anything that can be rendered as a child element.

### SnappProps

```typescript
type SnappProps = Record<string, any>;
```

Props object for components. Can contain any key-value pairs.

### SnappComponent

```typescript
type SnappComponent<P extends SnappProps = SnappProps> = (
  props: P & { children?: SnappChild[] }
) => Element | DocumentFragment;
```

A component function that takes props and returns a DOM element or fragment.

**Example:**

```typescript
interface ButtonProps {
  label: string;
  onClick?: (e: Event) => void;
}

const MyButton: SnappComponent<ButtonProps> = (props) => {
  return <button onClick={props.onClick}>{props.label}</button>;
};
```

### DynamicValue

```typescript
interface DynamicValue<T = any> {
  readonly value: T;
  update: (newValue: T) => void;
}
```

Reactive state container that notifies subscribers when updated.

### RenderType

```typescript
type RenderType = "before" | "prepend" | "replace" | "append" | "after";
```

Determines where elements are rendered relative to the target.

### EventHandler

```typescript
type EventHandler = (event: Event) => void;
```

Function called when an event fires.

### HTMLAttributes

Comprehensive attribute interface supporting:

- Global attributes: `id`, `class`, `style`, `title`, etc.
- Data attributes: `data-*`
- ARIA attributes: `aria-*`
- All event handlers: `onClick`, `onSubmit`, `onChange`, etc.

---

## Core Architecture

### How Snapp Works

1. **JSX Compilation** → TypeScript/Babel compiles JSX to `snapp.create()` calls
2. **Element Creation** → `snapp.create()` builds native DOM elements
3. **Dynamic Tracking** → When you use `() => dynamicValue.value`, Snapp tracks dependencies
4. **Subscriptions** → Each dynamic value tracks which elements depend on it
5. **Updates** → When you call `update()`, only affected text nodes/attributes/styles change
6. **Cleanup** → MutationObserver automatically cleans up when elements are removed

### Internal Files

#### src/core.ts (Main Implementation)

The heart of Snapp framework containing:

**Key Functions:**

- **`create(element, props, ...children)`** - Creates DOM elements or components
- **`render(target, component, type, callback)`** - Renders to DOM
- **`dynamic(initialValue)`** - Creates reactive state
- **`on(event, callback)`** - Listens for DOM events
- **`select(selector)` / `selectAll(selector)`** - DOM queries
- **`applystyle(element, styles)`** - Apply CSS styles
- **`removestyle(element, styles)`** - Remove CSS styles
- **`remove(items)`** - Remove elements from DOM

**Internal State Management:**

```typescript
// Counter for unique element IDs
let dataId: number = 0;

// Counter for dynamic state IDs
let dynamicId: number = 1;

// Tracks if DOM is ready
let DOMReady: boolean = false;

// Tracks which dynamic values are being accessed
let track_dynamic: Set<string> | null = null;

// Stores all dynamic values and their subscribers
const dynamicData: Record<
  string,
  {
    value: any;
    subscribe: Map<Element, number[]>;
  }
> = {};

// Maps elements to their dependent dynamic values
const dynamicDependencies = new Map<Element, SubscribeData[]>();

// Event delegation system
const eventListener: Record<string, EventHandler> = {};
const elementEvent: Record<string, Record<number, EventHandler>> = {};
```

**SVG Support:**

Snapp automatically detects SVG elements and uses `createElementNS()` instead of `createElement()`:

```typescript
const SVG_ELEMENTS = new Set([
    "svg", "circle", "ellipse", "line", "path", "polygon", "polyline",
    "rect", "text", "g", "defs", "filter", "image", "use", "mask", "pattern",
    "linearGradient", "radialGradient", "stop", "animate", "animateTransform", ...
]);
```

**Event Delegation:**

Rather than adding listeners to every element, Snapp uses event delegation:

```typescript
// Single listener per event type
document.addEventListener("click", eventTemplate);

// Template checks if target has snapp-e-click attribute
const elWithAttr = target.closest("[snapp-e-click]");
if (elWithAttr) {
  // Get element's ID and call its handler
  const elementDataId = elWithAttr.getAttribute("snapp-data");
  elementEvent["click"][elementDataId](event);
}
```

This is more efficient than listeners on every element.

**Memory Management:**

MutationObserver watches for removed elements:

```typescript
const observer = new MutationObserver((mutations) => {
  mutations.forEach((element) => {
    element.removedNodes.forEach((node) => {
      // Clean up event listeners
      if (node.getAttribute("snapp-e-click")) {
        delete eventEvent["click"][elementDataId];
      }
      // Clean up dynamic dependencies
      if (node.getAttribute("snapp-dynamic")) {
        dynamicDependencies.delete(node);
      }
    });
  });
});
```

#### src/types.ts (Type Definitions)

Comprehensive TypeScript types for:

- **Component types:** `SnappComponent`, `SnappChild`, `SnappProps`
- **State types:** `DynamicValue`, `SubscribeData`
- **Attribute types:** `HTMLAttributes`, `IntrinsicElements`
- **Handler types:** `EventHandler`, `RenderType`

**SubscribeData Interface:**

```typescript
interface SubscribeData {
  type: "node" | "attr" | "style"; // What's being updated
  temp: Function; // Function to re-execute
  subscribe: string[]; // Dynamic IDs this depends on
  node?: Text; // Text node being updated
  attr?: string; // Attribute name being updated
  prop?: string; // Style property being updated
}
```

This tracks what type of update happens when a dynamic value changes.

#### src/jsx.d.ts (JSX Support)

Ambient type declarations for JSX:

```typescript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // All HTML/SVG elements with their attributes
      div: HTMLAttributes<HTMLDivElement>;
      button: HTMLAttributes<HTMLButtonElement>;
      svg: HTMLAttributes<SVGSVGElement>;
      // ... etc
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

This enables TypeScript to recognize JSX syntax and provide autocomplete for elements and attributes.

#### src/index.ts (Entry Point)

```typescript
import snapp from "./core";
export default snapp;
export type { DynamicValue, SnappProps, SnappComponent, SnappChild };
```

Single entry point that re-exports the framework and types.

### Dependency Tracking Algorithm

When you write:

```jsx
const count = snapp.dynamic(0);
<p>{() => count.value}</p>;
```

Snapp does the following:

1. **Start tracking:** Set `track_dynamic = new Set()`
2. **Execute function:** Call `() => count.value`, which accesses the `value` getter
3. **Track access:** Inside `value` getter, add ID to `track_dynamic`
4. **Create subscription:** Store the function and which dynamic values it depends on
5. **On update:** When `count.update(5)` is called, re-execute the function and update the text node

This is why arrow functions are essential - they defer execution so Snapp can track what's accessed.

---

## Contributing

We welcome contributions! Here's how to get involved:

### Development Setup

```bash
# Install dependencies
npm install

# Start development watch mode
npm run dev

# Build for production
npm run build
```

### Code Style

- Use TypeScript for type safety
- Follow existing code patterns in `src/core.ts`
- Add JSDoc comments for public APIs
- Test with JSX examples

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commit messages
4. Ensure code compiles: `npm run build`
5. Submit PR with description

---

## License

MIT - See LICENSE file for details

---

## Support

- 🐛 [Report Issues](https://github.com/SnappJS/snapp/issues)
- 💬 [Discussions](https://github.com/SnappJS/snapp/discussions)
- 📦 [NPM Package](https://www.npmjs.com/package/@snappjs/core)
