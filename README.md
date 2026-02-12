# Snapp Framework - Code Explanation

## 📋 Table of Contents

1. [Overview](#overview)
2. [NPM Scripts Explained](#npm-scripts-explained)
   - [npm run build](#npm-run-build)
   - [npm run dev](#npm-run-dev)
3. [File Structure & Responsibilities](#file-structure--responsibilities)
   - [src/index.ts - Main Entry Point](#srcindexts---main-entry-point)
   - [src/types.ts - Type Definitions](#srctypests---type-definitions)
   - [src/jsx.d.ts - JSX Support](#srjsxdts---jsx-support)
   - [src/core.ts - Framework Implementation](#srccorects---framework-implementation)
4. [Architecture & Data Flow](#architecture--data-flow)
5. [Usage Examples](#usage-examples)
   - [Basic Counter](#basic-counter)
   - [Todo List](#todo-list)
   - [Nested Components](#nested-components)
6. [How to Extend](#how-to-extend)
7. [Troubleshooting](#troubleshooting)
8. [Performance Considerations](#performance-considerations)
9. [File Dependencies](#file-dependencies)
10. [Summary](#summary)

---

## Overview

**Snapp** is a lightweight TypeScript framework for building web UIs with:

- Direct DOM creation (no virtual DOM)
- Reactive state management
- Component composition
- Full TypeScript support
- Zero dependencies

---

## NPM Scripts Explained

Located in `package.json`, these are the main scripts for development:

### `npm run build` {#npm-run-build}

**Purpose**: Compile TypeScript for production

**What it does:**

- Compiles `src/index.ts` to JavaScript
- Creates CommonJS format (`dist/index.js`)
- Creates ES Module format (`dist/index.mjs`)
- Generates TypeScript definitions (`dist/index.d.ts`)
- Removes old build files (`--clean`)

**Use when:** Ready to publish or deploy

---

### `npm run dev` {#npm-run-dev}

**Purpose**: Development mode with automatic rebuilding

**What it does:**

- Watches `src/` folder for changes
- Auto-compiles TypeScript when files change
- Creates all output formats automatically
- Keeps running in background

**Use when:** Actively developing - run this and leave it open

**How to use:**

```bash
npm run dev
# Keep this running while you code
# Changes auto-compile in real-time
```

---

## File Structure & Responsibilities {#file-structure--responsibilities}

### 📁 `src/index.ts` - Main Entry Point {#srcindexts---main-entry-point}

**What it does:**

- Imports the main `snapp` object from `core.ts`
- Re-exports it as the default export
- Re-exports all public types for TypeScript users

**Why it exists:**

- Single entry point for the entire library
- Users only need one import statement
- Keeps `core.ts` focused on implementation

**How to use:**

```typescript
import snapp from "@snappjs/core";

// Now you have access to:
// - snapp.create()
// - snapp.render()
// - snapp.dynamic()
// - and all other methods
```

---

### 📁 `src/types.ts` - Type Definitions {#srctypests---type-definitions}

**Purpose**: Central place for all TypeScript type definitions

**Key Types**:

**SnappChild**: Defines what can be passed as children

- Strings, numbers, Elements, DocumentFragments
- Components, nested arrays
- null, undefined, false (for conditionals)

**SnappComponent**: Type for component functions

- Takes props and children
- Returns Element or DocumentFragment

**SnappProps**: Generic object for component props

- Any key-value pairs

**DynamicValue**: Interface for reactive state

- `value`: Get current value (triggers dependency tracking)
- `update()`: Set new value and notify dependents

**EventHandler**: Type for event callback functions

- Receives Event object

**HTMLAttributes**: All HTML/SVG attributes and event handlers

- Global attributes: id, class, style, title, etc.
- Data attributes: data-\*
- ARIA attributes: aria-\*
- Event handlers: onClick, onInput, onChange, etc.

**IntrinsicElements**: JSX element type mapping

- Maps tag names to their attribute types
- Enables JSX syntax support

**RenderType**: How to position rendered content

- "before", "prepend", "append", "replace", "after"

**SubscribeData**: Internal tracking of dependencies

- Links between dynamic values and DOM elements

---

### 📁 `src/jsx.d.ts` - JSX Support {#srjsxdts---jsx-support}

**Purpose**: Enable JSX syntax in TypeScript

**What it does:**

- Declares the global `JSX` namespace
- Maps element names to attribute types
- Allows `<div>` syntax instead of `snapp.create('div')`

**How it works:**

- TypeScript uses this file to type-check JSX
- Not executed at runtime
- Enables IDE autocomplete for JSX

**When to use it:**

```typescript
// With jsx.d.ts, you can write:
const button = <button onClick={handleClick}>Click</button>;

// Without it, you'd have to use:
const button = snapp.create("button", { onClick: handleClick }, "Click");
```

---

### 📁 `src/core.ts` - Framework Implementation {#srccorects---framework-implementation}

**The main file** that implements all Snapp functionality.

#### Core Concepts

**1. SVG_ELEMENTS Set**

- Identifies which elements are SVG (svg, path, circle, etc.)
- Used to call `createElementNS()` instead of `createElement()`
- Ensures SVG elements render correctly

**2. Global State**

- `dataId`: Counter to give each element a unique ID
- `dynamicId`: Counter for unique dynamic value IDs
- `DOMReady`: Flag indicating if DOM is ready for rendering
- `dynamicData`: Storage for all dynamic values and their subscribers
- `dynamicDependencies`: Maps elements to their dynamic dependencies
- `eventListener`: Stores event listeners by type
- `elementEvent`: Maps element IDs to their event handlers

**Why global?** Framework needs to track dependencies across the entire application

---

#### Main Functions

**create(element, props, ...children)**

Creates DOM elements, components, or fragments.

How it works:

1. If `element` is a string ("div", "button", etc.):
   - Creates actual HTML/SVG element
   - Processes props (attributes, styles, events)
   - Processes children
2. If `element` is a function (component):
   - Calls the function with props and children
   - Returns what the component returns
3. If `element` is "<>" (fragment):
   - Creates DocumentFragment
   - Groups children without wrapper

Usage:

```typescript
// HTML element
snapp.create("button", { onClick: handleClick }, "Click me");

// Component
snapp.create(MyButton, { label: "Click" });

// Fragment (multiple elements without wrapper)
snapp.create(
  "<>",
  null,
  snapp.create("h1", null, "Title"),
  snapp.create("p", null, "Content")
);
```

**How props work:**

- If prop is null/undefined/false: skip it
- If prop is true: set as boolean attribute (`disabled=""`)
- If prop is a string/number: set as attribute value
- If prop is an object (for style): apply each style
- If prop name starts with "on" and value is function: register as event handler
- If prop is a function (not event): call it to get value and track dependencies

**How children work:**

- Strings, numbers, Elements, Fragments: append directly
- Functions: call function to get content (for dynamic text)
- Nested arrays: flatten recursively
- false, null, undefined: skip (for conditionals)

**Track dependencies:**
When creating props/children with functions, the framework tracks which dynamic values are accessed:

```typescript
snapp.create("p", null, () => {
  // Accessing count.value here adds count to this element's dependencies
  return `Count: ${count.value}`;
});
// Now when count updates, this text auto-updates
```

---

**render(target, content, type, callback)**

Renders content to a target DOM element.

Parameters:

- `target`: The element where content goes
- `content`: What to render (Element, Fragment, string, number)
- `type`: How to position it (before, prepend, append, replace, after)
- `callback`: Called with success/failure boolean

Render types:

```
       [target]
         ↑↑↑
     ↓↓↓ | ↓↓↓
before|prepend|after
     ↓↓↓ | ↓↓↓
       append
       ↓
    replace
```

Usage:

```typescript
const app = snapp.select("#app");
const component = snapp.create(MyComponent, {});
snapp.render(app, component, "replace");
```

---

**dynamic(initialValue)**

Creates reactive state that triggers DOM updates.

How it works:

1. Create a dynamic value: `const count = snapp.dynamic(0);`
2. Use it in a function: `() => count.value`
3. Framework tracks the dependency
4. Update the value: `count.update(5)`
5. All dependent elements automatically update

Key feature: Accesses to `count.value` are tracked automatically

```typescript
const count = snapp.dynamic(0);
const doubled = snapp.dynamic(0);

snapp.create("p", null, () => {
  doubled.update(count.value * 2);
  return `Count: ${count.value}, Doubled: ${doubled.value}`;
});

count.update(3); // Triggers:
// 1. doubled updates to 6
// 2. Text recalculates
// 3. DOM updates automatically
```

---

**select(selector) / selectAll(selector)**

Find elements in the DOM.

Usage:

```typescript
// Single element
const app = snapp.select("#app");
const button = snapp.select(".btn");

// Multiple selectors
const elements = snapp.select([".item", ".card"]);

// All matching elements
const items = snapp.selectAll(".item");
```

---

**applystyle(element, styles) / removestyle(element, styles)**

Manage element styles.

Usage:

```typescript
// Add/change styles
snapp.applystyle(button, {
  backgroundColor: "blue",
  fontSize: "16px",
});

// Remove specific styles
snapp.removestyle(button, {
  backgroundColor: "blue",
});

// Remove all styles
snapp.removestyle(button, true);
```

---

**remove(elements)**

Remove elements from DOM (cleans up automatically).

Usage:

```typescript
snapp.remove(element);
snapp.remove([el1, el2, el3]);
```

Cleanup:

- Event listeners are removed
- Dynamic dependencies are cleaned up
- MutationObserver handles all of this automatically

---

**on(event, callback)**

Listen to framework events.

Currently supports: "DOM" event

```typescript
snapp.on("DOM", () => {
  console.log("DOM ready for rendering");
});
```

---

#### How Events Work (Event Delegation)

**The Problem**: Attaching listeners to every element wastes memory

**The Solution**: Single listener per event type on document

**How it works:**

1. When creating element with `onClick` handler, don't attach listener yet
2. Mark element with `snapp-e-click` attribute
3. First time "click" event happens: attach listener to document
4. When click happens: find element with `snapp-e-click`
5. Call the registered handler for that element
6. Multiple elements reuse the same listener!

**Benefits:**

- Less memory usage
- Works with dynamically added elements
- Automatic cleanup when elements removed

---

#### How Reactivity Works

**Dependency Tracking System**:

1. **Creation Phase**:

   - Create element with function: `() => count.value`
   - Set `track_dynamic = new Set()`
   - Call the function
   - During execution, accesses to `count.value` add ID to `track_dynamic`
   - Now framework knows this element depends on `count`

2. **Subscription Phase**:

   - Element is added to `count`'s subscriber list
   - `count` knows which elements depend on it

3. **Update Phase**:

   - Call `count.update(newValue)`
   - `count` finds all dependent elements
   - For each element, recalculate the function
   - Apply new value to DOM

4. **Change Tracking**:
   - If new value hasn't changed, don't update
   - If new dependencies appear, subscribe to them
   - If old dependencies disappear, unsubscribe

**Example**:

```typescript
const count = snapp.dynamic(0);

snapp.create("p", null, () => `Count: ${count.value}`);
// During creation:
// 1. Function executes: track_dynamic records 'count' dependency
// 2. Element subscribes to count updates
// 3. When count updates, function re-runs with new value
// 4. DOM text updates automatically
```

---

#### Memory Management

**Problem**: Elements removed from DOM leave behind listeners and subscriptions

**Solution**: MutationObserver watches DOM changes

**How it works**:

1. MutationObserver watches for removed elements
2. When element is removed:
   - Delete its event listeners
   - Remove document listener if no more elements need it
   - Clean up dynamic subscriptions
3. Periodic cleanup via `cleardynamicElement()`
   - Finds elements no longer in DOM
   - Removes their subscriptions

**Result**: No memory leaks when removing elements

---

#### Architecture Summary

**Data Flow**:

```
create()
  ├─ Create actual DOM element
  ├─ Attach attributes and styles
  ├─ Register event handlers (with delegation)
  └─ Track dependencies on dynamic values

dynamic(value)
  └─ Create reactive state object

Element depends on dynamic?
  ├─ Yes: Subscribe element to updates
  └─ No: Just create normally

User updates dynamic value?
  ├─ Get all dependent elements
  ├─ Recalculate their functions
  └─ Apply new values to DOM

User removes element?
  └─ MutationObserver cleans up everything
```

---

## Architecture & Data Flow {#architecture--data-flow}

### High-Level Overview

```
Developer Code
    ↓
snapp.create() ← Define elements/components
    ↓
snapp.dynamic() ← Define reactive state
    ↓
snapp.render() ← Put it in DOM
    ↓
Real DOM Elements
    ↓
User Interacts
    ↓
Call dynamic.update()
    ↓
Auto-update dependent elements ← Dependency tracking
```

### Key Design Patterns

**1. Direct DOM Manipulation**

- No virtual DOM overhead
- Create real elements immediately
- Update them in place

**2. Component Functions**

- Just regular functions that return elements
- Can take props and children
- Compose freely

**3. Reactive with Tracking**

- Accesses to dynamic values are tracked automatically
- No manual dependency lists needed
- Updates propagate reactively

**4. Event Delegation**

- Single listener per event type
- Scales efficiently even with many elements
- Automatic cleanup

**5. Automatic Memory Management**

- MutationObserver watches for removed elements
- Listeners and subscriptions cleaned automatically
- No memory leaks

---

## Usage Examples {#usage-examples}

### Basic Counter {#basic-counter}

```typescript
import snapp from "@snappjs/core";

const count = snapp.dynamic(0);

const Counter = () => {
  return snapp.create(
    "div",
    { style: { padding: "20px" } },
    snapp.create("p", null, () => `Count: ${count.value}`),
    snapp.create(
      "button",
      {
        onClick: () => count.update(count.value + 1),
        style: { padding: "10px", cursor: "pointer" },
      },
      "Increment"
    )
  );
};

const app = snapp.select("#app");
snapp.render(app, Counter(), "replace");
```

### Todo List {#todo-list}

```typescript
const todos = snapp.dynamic([]);

const TodoApp = () => {
  const inputValue = snapp.dynamic("");

  return snapp.create(
    "div",
    null,
    snapp.create("input", {
      onInput: (e) => inputValue.update(e.target.value),
      value: () => inputValue.value,
    }),
    snapp.create(
      "button",
      {
        onClick: () => {
          todos.update([...todos.value, inputValue.value]);
          inputValue.update("");
        },
      },
      "Add"
    ),
    snapp.create("ul", null, () =>
      todos.value.map((todo) => snapp.create("li", null, todo))
    )
  );
};

snapp.render(snapp.select("#app"), TodoApp());
```

### Nested Components {#nested-components}

```typescript
const Button = (props) => {
  return snapp.create(
    "button",
    {
      onClick: props.onClick,
      style: { padding: "10px", margin: "5px" },
    },
    props.children
  );
};

const Form = () => {
  const name = snapp.dynamic("");

  return snapp.create(
    "form",
    null,
    snapp.create("input", {
      onInput: (e) => name.update(e.target.value),
      placeholder: "Enter name",
    }),
    snapp.create(
      Button,
      {
        onClick: () => console.log(name.value),
      },
      "Submit"
    )
  );
};
```

---

## How to Extend {#how-to-extend}

### Adding a New Method

1. **Add function to `core.ts`**:

```typescript
const myFunction = (arg: string): void => {
  // Implementation
};
```

2. **Add to snapp object**:

```typescript
const snapp = {
  create,
  render,
  // ... existing
  myFunction, // Add here
};
```

3. **Add type to `types.ts`** (if needed):

```typescript
export interface SnappFramework {
  myFunction: (arg: string) => void;
}
```

### Adding a New Event Type

1. **Add to `eventMap` in `core.ts`** (if needed for compatibility):

```typescript
const eventMap = {
  onmycustomevent: "onmycustomevent",
};
```

2. **Add to `HTMLAttributes` in `types.ts`**:

```typescript
export interface HTMLAttributes {
  onMyCustomEvent?: EventHandler;
}
```

### Adding SVG Support

Already built-in! Just use SVG element names and they'll be created with `createElementNS()` automatically.

---

## Troubleshooting {#troubleshooting}

### Problem: Dynamic values not updating DOM

**Cause**: Element not created with a function that accesses the value

**Fix**:

```typescript
// ❌ Wrong - value captured at creation time
const text = snapp.create("p", null, count.value);

// ✅ Correct - function called each update
const text = snapp.create("p", null, () => count.value);
```

### Problem: Event handlers not firing

**Cause**: Typo in event name or handler not attached correctly

**Debug**:

```typescript
// Check in browser DevTools:
// 1. Element should have snapp-e-eventname attribute
// 2. Event name should start with lowercase "on"
// 3. Value should be a function

snapp.create("button", {
  onClick: () => console.log("works"),
  onClick2: () => {}, // ❌ Not an event - ignored
});
```

### Problem: Memory usage grows after removing elements

**This shouldn't happen!** MutationObserver automatically cleans up.

**If it does**:

- Check browser DevTools Memory tab
- Make sure elements are actually being removed from DOM
- Use `snapp.remove()` to ensure proper cleanup

---

## Performance Considerations {#performance-considerations}

**Optimized:**

- Single event listener per event type
- Direct DOM manipulation (no virtual DOM)
- Dependency tracking prevents unnecessary updates
- Automatic memory cleanup

**Watch out for:**

- Large lists: Consider pagination or virtual scrolling
- Frequent updates: Batch updates in single `dynamic.update()`
- Complex computations: Cache in dynamic values

---

## File Dependencies

```
package.json (build config)
    ↓
tsconfig.json (TypeScript config)
    ↓
src/index.ts (entry point)
    ├─ imports from src/core.ts
    ├─ imports types from src/types.ts
    └─ re-exports everything

src/core.ts (implementation)
    └─ imports types from src/types.ts (type-only)

src/types.ts (type definitions)
    └─ standalone

src/jsx.d.ts (JSX support)
    └─ standalone ambient declarations
```

---

## Summary

**What Snapp Does:**

1. Creates real DOM elements with props, attributes, events
2. Manages reactive state via `dynamic()`
3. Tracks dependencies automatically
4. Updates elements when state changes
5. Cleans up memory automatically

**Key Files:**

- `core.ts` - All framework logic
- `types.ts` - All type definitions
- `index.ts` - Single export point
- `jsx.d.ts` - JSX support (optional)

**Core Concepts:**

- Direct DOM (no virtual DOM)
- Automatic dependency tracking
- Event delegation
- Reactive updates
- Memory management

**Built for developers who want control, type safety, and simplicity.**
