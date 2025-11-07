
<p align="center">
  <img src="snapp.png" alt="snapp Framework Logo" width="200">
</p>

# Snapp Framework

> A modern JavaScript framework that renders components **directly to the browser DOM** with **zero virtual DOM overhead**.
>
Build **fast, multi-page applications** using the familiar **JSX syntax** you already know.


[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with JavaScript](https://img.shields.io/badge/Built%20with-JavaScript-yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## 📋 Table of Contents

- [Introduction](#introduction)
- [Real-World Examples](#real-world-examples)
- [Installation & Project Structure](#project-structure--kit)
- [Tutorial Section](#tutorial-section)
- [Creator & Support](#creator--support)

---

## Snapp v2
Snapp v2 is **optimized** and **faster** than v1.  
It offers improved performance and efficiency compared to the previous version.

## Introduction

### What Makes Snapp Different?

Snapp bridges modern JSX/TSX development with traditional DOM manipulation. It's for developers who want component-based architecture while keeping direct browser DOM control.

- **🎯 Direct DOM Control** - JSX/TSX compiles to native DOM operations
- **📄 Multi-Page Native** - Traditional HTML enhanced with modern tooling
- **⚡ Zero Abstraction Overhead** - No virtual DOM, just compiled JavaScript
- **🧹 Memory Efficient** - Snapp automatic cleanup of events and elements
- **🚀 Predictable Performance** - You decide when and how updates happen
- **🔧 esbuild Integration** - Handles `.js`, `.jsx`, `.ts`, `.tsx` compilation
- **✨ Dynamic State** - Update individual elements without re-rendering (NEW in v2!)

**JSX/TSX Compilation** → **Native DOM Code** → **Traditional HTML Architecture**

Snapp gives you **manual DOM power** with **modern component convenience**. Know JavaScript and HTML? You already know Snapp.

### Simple Counter Example

```jsx
// Create dynamic state
const counter = snapp.dynamic(0);

return (
<>
  <h2>Count: {() => counter.value}</h2>
  <button
    onclick={() => counter.update(counter.value + 1)}>
  Click To Increase
  </button>
  <button
    onclick={() => counter.update(counter.value - 1)}>
  Click To Decrease
  </button>
</>
);
```

The `{() => counter.value}` syntax makes the text update instantly without re-rendering the entire component!

---

## Real-World Examples

### Example: Dynamic User Profile

**HTML Template:**
```html
<!-- user.html -->
<!DOCTYPE html>
<html>
<head>
    <title>User Profile</title>
    <meta name="description" content="View profile and latest activity">
</head>
<body id="snapp-app">
  <div>
    <h1>User Profile</h1>
    <p>Loading user data...</p>
  </div>
  <script type="module" src="src/user.js"></script>
</body>
</html>
```

**Reusable Component:**
```jsx
// views/components/UserDetails.jsx
export default const UserDetails = (props) => {
  return (
    <>
      <div>
        <h2>Welcome, {props.data?.username || "Guest"}</h2>
        <p>Age: {props.data?.age || "Loading..."}</p>
        <p>Email: {props.data?.email || "Loading..."}</p>
        <p>Joined: {props.data?.joinDate || "Loading..."}</p>
      </div>
    </>
  )
}
```

**Main Application Logic:**
```jsx
// views/user.jsx
import snapp from "../src/snapp.js"
import UserDetails from './components/UserDetails.jsx';

const snappBody = document.querySelector("#snapp-app");

const App = () => {

    // Fetch user data and render when ready
    fetch('/api/user/123')
      .then(response => response.json())
      .then(data => {
        // Replace loading content with actual data
        snapp.render(snappBody, <UserDetails data={data} />);
    })
    .catch(error => {
      snapp.render(snappBody, (
        <div>
          <h2>Error Loading Profile</h2>
          <p>Please try again later.</p>
        </div>
      ));
    });

    // Return initial loading state
    return <UserDetails data={null} />;
}

snapp.render(snappBody, App());
```

### Example 3: Dynamic Login Form

**HTML Template:**
```html
<!-- login.html -->
<body>
  <div id="snapp-app">
    <h1>Account Access</h1>
    <p>Click login to access your account</p>
  </div>
  <script type="module" src="src/login.js"></script>
</body>
```

**Interactive Component:**
```jsx
// views/login.jsx
import snapp from "../src/snapp.js"

const App = () => {
  const showLoginForm = () => {
    // Get form ID from backend
    fetch('/api/auth/form')
      .then(response => response.json())
      .then(data => {
         const formContainer = snapp.select("#formContainer");
         snapp.render(formContainer, <LoginForm formId={data.id} />);
      });
  });
    
  return (
    <>
      <div id="formContainer">
        <p>Ready to login?</p>
      </div>
        
      <button onclick={() => showLoginForm()}>Login</button>
    </>
  );
}

const LoginForm = (props) => {
  const handleLogin = (e) => {
    e.preventDefault();
    // Handle login logic
    console.log("Login with form ID:", props.formId);
  });

  return (
    <form event={(e) => LoginForm(e)}>
      <h3>Login (Form: {props.formId})</h3>
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  );
}

const snappBody = document.querySelector("#snapp-app");
snapp.render(snappBody, App());
```

---

## Project Structure & Kit

**Read more about snapp-kit on:**
- [GitHub](https://github.com/kigemmanuel/Snapp/tree/main/snapp-kit)
- [npm](https://www.npmjs.com/package/snapp-kit)

### Creating a New Project

```bash
# Create new Snapp project
npm create snapp-app my-awesome-app
cd my-awesome-app

# Start development with hot reload
npm run snapp
```

### Project Structure

```
my-snapp-app/
├── views/           # 🎯 Source JSX/TSX components
│   ├── index.jsx    # Main page component
│   ├── about.jsx    # About page component  
│   ├── user.jsx     # User profile component
│   └── components/  # Reusable components
│       ├── Header.jsx
│       ├── Footer.jsx
│       └── UserCard.jsx
|
├── src/ # 📦 Built JS files (snapp build)
│   ├── snapp.js   # Snapp runtime
|   ├── index.js
│   ├── about.js
│   └── user.js
|
├── index.html       # 📄 Homepage template
├── about.html       # 📄 About page template
├── user.html        # 📄 User page template
└── 
```

### How Building Works

1. **Write Components** - Create `.jsx`/`.tsx` files in the `views/` folder
2. **Auto-Build** - `snapp build` watches and compiles files to the `src/` folder
3. **HTML Templates** - Each page has its own HTML file for SEO optimization
4. **Link Together** - HTML files import the built JavaScript from the `src/` folder

**Snapp build will compile and auto-generate `myNewPage.html`, `views/myNewPage.js` and `src/myNewPage.js`**

---

## Tutorial Section
**Note: This Tutorial contain only what is avaliable in snapp V2**

### Getting Started - Two Ways to Initialize

#### Method 1: Separate Import
```html
<!-- index.html -->
<div id="snapp-body"></div>
<script type="module">
    import snapp from './src/snapp.js'
    import App from './src/index.js'

    const snappBody = document.querySelector("#snapp-body");
    snapp.render(snappBody, App());
</script>
```

```jsx
// views/index.jsx
export default const App = () => {
   return <h2>Hello Snapp</h2>
}
```

#### Method 2: Direct Import 
```html
<!-- index.html -->
<div id="snapp-body"></div>
<script type="module" src="src/index.js"></script>
```

```jsx
// views/index.jsx
import snapp from "../src/snapp.js"

const App = () => {
    return <h2>Hello Snapp</h2>
}

const snappBody = document.querySelector("#snapp-body");
snapp.render(snappBody, App());
```

You can even use the body element:
```html
<body id="snapp-body"></body>
```

### snapp.dynamic Examples

#### Creating and Using Dynamic State

```jsx
// Create dynamic state
const message = snapp.dynamic("Hello World");
const count = snapp.dynamic(0);
const isVisible = snapp.dynamic(true);

// Use in JSX (note the arrow function syntax)
<div>
  <h1>{() => message.value}</h1>
  <p>Count: {() => count.value}</p>
  <button style={{ display: () => isVisible.value ? 'block' : 'none' }}>
    Click me
  </button>
</div>

// Update values
message.update("New message!");
count.update(count.value + 1);
isVisible.update(false);
```

#### Dynamic State Syntax Rules

```jsx
// ✅ Regular variables (static)
const staticText = "Hello";
<div>{staticText}</div>

// ✅ Dynamic state variables
const dynamicText = snapp.dynamic("Hello");
<div>{() => dynamicText.value}</div>

// ✅ Mixed usage
<div>
  Static: {staticText}; // won't update
  Static: {dynamicText.value}; // won't update
  Dynamic: {() => dynamicText.value}; // will update
  Dynamic: {() => dynamicText.value + staticText}; // will update
</div>

// Use {() => } for dynaminc
```

#### How Dynamic State Works

**Snapp Dynamic State** lets you change element text content, attributes, and styles dynamically without re-rendering your component/element!

```jsx
// Create dynamic state
const message = snapp.dynamic("Hello World");

// Use in JSX with arrow function syntax
<div>Message: {() => message.value}</div>

// Update the state
message.update("New Message");
// Only the text node updates!
// Only "Hello World" will update to "New Message"
```

#### Key Dynamic State Features

- **Fast Updates**: When you update a state, Snapp only updates the specific textNode/attribute/style property that changed, not the entire element.
- **Smart Syntax**: Regular variables use `{variable}`, dynamic state uses `{() => dynamicState.value}`
- **Automatic Cleanup**: When you delete an element, Snapp automatically cleans up all reference data to the state!

#### Dynamic State Usage Examples

**Text Content:**
```jsx
const username = snapp.dynamic("John Doe");
<h1>Welcome, {() => username.value}!</h1>
```

**Attributes:**
```jsx
const itemId = snapp.dynamic("item-1");
<div id={() => itemId.value}>Dynamic ID</div>
```

**Styles:**
```jsx
const color = snapp.dynamic("blue");
<p style={{ color: () => color.value }}>Colorful text</p>
```

**Note:** For regular variables you can still use `{variable}` but for dynamic state variables use `{() => variable.value}`

### snapp.render Examples

```jsx
snapp.render(parentElement, component, type) // Render a component with specified type
snapp.render(parentElement, component, 'append') // Will append to existing content
snapp.render(parentElement, component) // Default behavior - replaces existing content
snapp.render(parentElement, component, undefined, callBack)

snapp.render(parentElement, component, undefined, (e) => console.log(e))
//Return true if successful and false if not
```

Other available types: `'prepend'`, `'after'`, `'before'`, `'replace'`

### snapp.on Example

Use `snapp.on("DOM", callback)` when you need to access DOM elements after they're rendered:

```jsx
snapp.on("DOM", () => {
    // This runs once the elements have been rendered to the DOM
    // This is useful when you need to access the elements!
})
```

**Why do you need snapp.on("DOM")?**

JavaScript runs before elements are rendered to the DOM, so you need `snapp.on("DOM")` to ensure elements exist before accessing them:

```jsx
const App = () => {
    snapp.select("#hello") // This runs first, before element is in DOM - returns null
    
    snapp.on("DOM", () => {
        // Runs once when elements are rendered to DOM
        snapp.select("#hello") // This works because it runs after element is in DOM
    })
    
    const someFunction = () => {
        snapp.select("#hello") // This works because the function runs when user interacts,
                              // which can only happen after element is in DOM
    }
    
    return <h2 onclick={() => someFunction()} id="hello">Hello Snapp</h2>
}
```

### snapp.select Examples

```jsx
snapp.select("#element") // Select single element
snapp.select(["#el1", "#el2"]) // Select multiple elements, returns array
snapp.selectAll(".class") // Select all elements with same class/selector
snapp.selectAll([".class1", ".class2"]) // Returns arrays of arrays of elements
```

**Event Delegation:** Snapp uses event delegation - it adds one event listener to the document. This is optimal for applications with many interactive elements!

### onClick / onclick Event Examples

```jsx
<button onclick={() => alert("Hello Snapp")}>Call Hello Snapp</button>
<button onClick={() => login()}>Login</button>
<button onclick={() => {
    // Perform multiple actions
    // Handle complex logic  
    // Execute additional functions
}}>Login</button>

// Snapp Attribute Naming
// Snapp follows HTML attribute naming conventions:

<button ondblclick={() => alert("Hi!")}>Double Click</button> // ✅ Will work
<button onDoubleClick={() => alert("Hi!")}>Double Click</button> // ✅ Will work
<button ondoubleclick={() => alert("Hi!")}>Double Click</button> // ✅ Will work
```

Snapp uses HTML attribute naming and converts everything to lowercase. `onClick` is treated the same as `onclick`.

**Note:** Attribute names like `"className"` or `"class"` will work, `"htmlFor"` or `"for"` will work.

`"onDoubleClick"` or `"ondblclick"` will both work, but every other event name must match HTML event name. [See Event Attributes](https://www.w3schools.com/tags/ref_eventattributes.asp)

### snapp.applystyle Examples

```jsx
snapp.on("DOM", () => {
    const [hello, wow] = snapp.select(["#hello", "#wow"])
    
    snapp.applystyle([hello, wow], {
        fontSize: "50px"
    })
})

<p id="hello">Hello World</p>
<p id="wow">Hello World</p>
```

### snapp.removestyle Examples

```jsx
snapp.on("DOM", () => {
    const [hello, wow] = snapp.select(["#hello", "#wow"])
    
    // Remove specific styles by setting them to empty string
    snapp.removestyle([hello, wow], {
        fontSize: ""
    })
})

<p id="hello">Hello World</p>
<p id="wow">Hello World</p>
```

### Style Object Examples

```jsx
// Style objects accept both camelCase and CSS property names
const myStyle = {
  fontSize: "50px",
  "background-color": "red" // accept both camelCase and js base css
}

snapp.on("DOM", () => {
    const [hello, wow] = snapp.select(["#hello", "#wow"])
    
    // Apply the styles
    snapp.applystyle([hello, wow], myStyle)
    
    // Later remove the same styles
    snapp.removestyle([hello, wow], myStyle)
})
```

### Remove All Inline Styles

```jsx
snapp.on("DOM", () => {
    const [hello, wow] = snapp.select(["#hello", "#wow"])
    
    // Remove all inline styles from elements
    snapp.applystyle([hello, wow], true) // To remove all inline style
})
```

### snapp.remove Examples

```jsx
const [msgBody, feedBody] = snapp.select(["#msgBody", "#feedBody"])
snapp.remove(msgBody) // Remove msgBody from the DOM

snapp.remove([msgBody, feedBody]) // Remove elements from DOM
```
**Snapp Cleanup:** Snapp tracks each element and its event listeners! When an element is removed from the DOM, Snapp automatically removes all event listeners attached to that element!

---

### Support

- 🐛 **Report Issues**: [GitHub Issues](https://github.com/kigemmanuel/snapp/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/kigemmanuel/snapp/discussions)
- 📧 **Direct Contact**: Feel free to reach out with questions or suggestions
- ⭐ **Show Support**: Star the project on GitHub if Snapp helps you build better web applications!

### Contributing

We welcome contributions from the community! Whether it's:
- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🎯 Example applications
- 🧪 Testing and feedback

Every contribution helps make Snapp better for everyone.

---

<div align="center">

**⚡ Built with Snapp Framework - Fast, Simple, Powerful**

[🚀 Get Started](#introduction) • [📖 Tutorial](#tutorial-section) • [💻 GitHub](https://github.com/kigemmanuel/snapp)

*"Snapp: Where modern development meets traditional web architecture"*

</div>
