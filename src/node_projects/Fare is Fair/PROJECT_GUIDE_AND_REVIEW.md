# 📚 Fare is Fair: Comprehensive Project Guide & Code Review

Welcome! This guide was crafted specifically for you. It explains **the project as a whole**, breaks down **the exact mistakes found in the code**, demonstrates **what was improved in the styling**, and provides an **actionable roadmap** so you can master Node.js, Fastify, Server-Side Rendering (SSR), and modern web architecture.

---

## 📑 Table of Contents
1. [The Big Picture: How This Project Works](#1-the-big-picture-how-this-project-works)
2. [Deep Code Review: Mistakes Made & How to Fix Them](#2-deep-code-review-mistakes-made--how-to-fix-them)
3. [The Styling Makeover: What Changed & Why](#3-the-styling-makeover-what-changed--why)
4. [Mastery Roadmap: What You Should Do Next](#4-mastery-roadmap-what-you-should-do-next)
5. [Hands-On Practice Challenges](#5-hands-on-practice-challenges)

---

## 1. The Big Picture: How This Project Works

```
                        BROWSER (Client)
                               │
               1. HTTP GET /   │   4. Returns fully rendered HTML + CSS
                               ▼
                        FASTIFY SERVER
               ┌──────────────────────────────┐
               │  Fastify Route Handlers       │
               │  - GET /      -> index.ejs   │
               │  - GET /menu  -> menu.ejs    │
               │  - GET /hours -> hours.ejs   │
               └──────────────┬───────────────┘
                              │
               2. Injects Data into Templates
                              ▼
                        DATA & ENGINE
               ┌──────────────────────────────┐
               │  • @fastify/view (EJS)       │
               │  • @fastify/static (Assets)  │
               │  • menuItems.js              │
               │  • operatingHours.js         │
               └──────────────────────────────┘
```

### The Core Building Blocks

1. **Node.js**: The JavaScript runtime environment that allows you to run JavaScript on the server (handling files, ports, networks, and system processes) rather than just inside the browser.
2. **Fastify (`fastify`)**: A fast, low-overhead Node.js web framework. Unlike older frameworks like Express, Fastify was built from the ground up for modern JavaScript with native `async/await` support, high throughput, and a modular plugin architecture.
3. **EJS (`ejs`) & `@fastify/view`**:
   - **SSR (Server-Side Rendering)**: Instead of sending an empty HTML file that downloads a huge JavaScript bundle (like React or Vue) to render on the client, the server takes data and an HTML template, compiles the final HTML on the server, and sends lightweight, ready-to-read HTML directly to the browser.
   - **`@fastify/view`**: The official Fastify plugin that registers template engines (like EJS, Handlebars, Pug) with Fastify, giving route handlers the `reply.view()` method.
4. **`@fastify/static`**: Plugins in Fastify that map a folder on your computer (like `./public`) to a URL path (like `/public/`) so browsers can download stylesheets (`style.css`), images (`image.png`), or client scripts.
5. **Data Layer (`./data/`)**: Plain JavaScript modules exporting structured objects and arrays. In a production app, this would be replaced with a database (PostgreSQL, MongoDB, or SQLite), but static data modules are the ideal way to start learning routing and data injection.

---

## 2. Deep Code Review: Mistakes Made & How to Fix Them

Here is an honest, detailed review of every mistake identified in your project and how to fix each one like a pro.

---

### Mistake 1: Missing Stylesheet Links in `menu.ejs` and `hours.ejs`
- **What happened:** In `index.ejs`, you included `<link rel="stylesheet" href="../public/stylesheets/style.css" />`, but in `views/menu.ejs` and `views/hours.ejs`, the `<head>` section had **no stylesheet link at all**.
- **Consequence:** When you opened `/menu` or `/hours`, the browser rendered default raw unstyled HTML (Times New Roman, basic blue text, zero spacing).
- **The Fix:**
  Add the stylesheet link inside the `<head>` tag of every view:
  ```html
  <link rel="stylesheet" href="/public/stylesheets/style.css" />
  ```
- **Pro Tip:** In professional projects, don't copy-paste `<head>` into every template. Use **EJS Partials** or a **Master Layout** (explained in Section 4).

---

### Mistake 2: Brittle Path Resolution with `process.cwd()`
- **What happened in `index.js` (line 11):**
  ```javascript
  const publicpath = join(process.cwd(), "public");
  ```
- **Why this is risky:**
  - `process.cwd()` returns the *Current Working Directory*—the folder where your terminal was located when you ran `node index.js`.
  - If your terminal was at `C:\Users\behre\Documents\Node projects`, `process.cwd()` is `C:\Users\behre\Documents\Node projects`. Fastify will look for a folder at `C:\Users\behre\Documents\Node projects\public`, which does not exist!
  - As a result, all static files (`/public/style.css`, `/public/image.png`) return **404 Not Found** unless you explicitly `cd` into `src/node_projects/Fare is Fair` before running the command.
- **The Fix (Modern ES Modules):**
  Use `import.meta.dirname` (Node.js 20.11+) or the standard `fileURLToPath`:
  ```javascript
  import { fileURLToPath } from "node:url";
  import { dirname, join } from "node:path";

  // Get the directory where THIS index.js file actually lives:
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const publicpath = join(__dirname, "public");
  ```
  Now your server will work correctly regardless of what directory you launch it from!

---

### Mistake 3: Mixing `await` with Callbacks in `app.listen()`
- **What happened in `index.js` (line 50):**
  ```javascript
  await app.listen({ port }, async (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`The server is running at port ${port} .`);
  });
  ```
- **Fastify Warning Generated:**
  `[FSTWRN003] FastifyWarning: The listen method mixes async and callback styles that may lead to unhandled rejections. Please use only one of them.`
- **Why it matters:**
  `await` and callback functions are two alternative ways to handle asynchronous operations. If you `await` a function, it returns a Promise. Passing a callback at the same time can cause duplicate error handling or unhandled rejections.
- **The Modern Idiomatic Fix:**
  ```javascript
  try {
    const address = await app.listen({ port });
    console.log(`Server listening at ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
  ```

---

### Mistake 4: Typo in Route Data Array (`"wendsday"`)
- **What happened in `index.js` (line 40):**
  ```javascript
  days: [
    "monday",
    "tuesday",
    "wendsday", // <-- Typo! Should be "wednesday"
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ]
  ```
- **Consequence:**
  - Because `operatingHours.js` uses keys like `monday`, `sunday`, and `defaultHours`, `"wendsday"` fell back to `defaultHours`.
  - If you ever defined a custom schedule for Wednesday (`operatingHours.wednesday = { open: 14, closed: 20 }`), it would **never be matched** because `"wendsday" !== "wednesday"`.
  - Always verify dictionary keys against data objects.

---

### Mistake 5: Undeclared Loop Variable in EJS
- **What happened in `hours.ejs` (line 10):**
  ```ejs
  <% for (day of days){%>
  ```
- **Why it matters:**
  Notice `day` has no `let` or `const`! In JavaScript (especially strict mode), assigning to an undeclared variable attaches it to the global scope (`globalThis.day`). In `menu.ejs`, you correctly wrote `<% for (let item of menuItems) {%>`.
- **The Fix:**
  ```ejs
  <% for (const day of days) { %>
  ```

---

### Mistake 6: Inline Styles in EJS Templates
- **What happened in `hours.ejs` (line 12):**
  ```html
  <section style="display: inline-flex; flex-direction: column; padding: 5px;">
  ```
- **Why it's a bad practice:**
  - **Separation of Concerns:** HTML/EJS should define the structure and content; CSS should define the presentation.
  - **Specificity War:** Inline styles have a higher specificity than class selectors or ID selectors. If you want to change padding on mobile devices or change colors with themes, you are forced to use `!important` in CSS to override your own HTML.
- **The Fix:**
  Use a clean class name:
  ```html
  <section class="hours-card">
  ```

---

### Mistake 7: Relative vs. Root-Relative Asset Links
- **What happened in `index.ejs`:**
  ```html
  <link rel="stylesheet" href="../public/stylesheets/style.css" />
  ```
- **Why it's brittle:**
  The `../` means "go up one directory from the current URL path".
  - For `http://localhost:3000/`, it happens to resolve to `/public/...`.
  - But if you ever create a sub-route like `http://localhost:3000/menu/category/desserts`, `../public` will look for `/menu/public/...` and fail!
- **The Fix:**
  Always use root-relative paths starting with `/`:
  ```html
  <link rel="stylesheet" href="/public/stylesheets/style.css" />
  ```

---

### Mistake 8: Unused Dependency `"es"` in `package.json`
- **What happened in `package.json`:**
  ```json
  "dependencies": {
    "@fastify/static": "^10.1.12",
    "@fastify/view": "^12.0.1",
    "ejs": "^7.0.2",
    "es": "^0.8.0",     // <-- Unused!
    "fastify": "^5.12.8"
  }
  ```
- **Why:** Likely an accidental `npm install es` while typing `ejs` or `esm`.
- **The Fix:** Run `npm uninstall es` to keep dependencies clean.

---

### Mistake 9: Lack of Site Navigation & User Journey
- **What happened:**
  Each page existed as a completely isolated island. If a user arrived at `/`, there was no way to discover the menu or hours without guessing the URLs `/menu` and `/hours` in the browser address bar!
- **The Fix:**
  Add a consistent `<nav class="navbar">` component across all pages so visitors can explore the restaurant seamlessly.

---

## 3. The Styling Makeover: What Changed & Why

Here is a breakdown of how the CSS was transformed into a restaurant design:

### 1. Typography & Hierarchy
- **Headline Font (`Playfair Display`):** A high-contrast editorial serif font that communicates culinary quality, elegance, and warmth.
- **Body Font (`Plus Jakarta Sans`):** A clean, readable sans-serif typeface designed for modern digital interfaces.

### 2. Dark Bistro Palette & Depth
- **Background:** Deep luxury charcoal (`#141010`) accented with atmospheric radial gradients (`rgba(217, 107, 67, 0.12)` terracotta glow).
- **Cards & Containers:** Translucent glassmorphism (`rgba(255, 255, 255, 0.04)`) with fine borders (`1px solid rgba(255, 255, 255, 0.09)`) and `backdrop-filter: blur(14px)`.
- **Accents:** Warm culinary amber/gold (`#e5a93c`) for badges, active navigation links, and price pills.

### 3. The Food Hero Image (`image.png`)
- Your banner image (`738x249`) has dark slate wood on the left and a fresh plate of food on the right.
- In CSS, we applied a **multi-layer gradient overlay**:
  ```css
  background-image:
    linear-gradient(
      to right,
      rgba(20, 16, 16, 0.96) 0%,
      rgba(20, 16, 16, 0.88) 45%,
      rgba(20, 16, 16, 0.55) 75%,
      rgba(20, 16, 16, 0.35) 100%
    ),
    url(../image.png);
  ```
  This creates high-contrast, readable space for the text on the left while naturally fading to reveal the food on the right!

### 4. Menu Card Grid (`ol > li`)
- Transformed the plain numbered list into a responsive card grid (`grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))`).
- **Clever CSS trick:**
  ```css
  ol li > span:nth-of-type(1),
  ol li > span:nth-of-type(3) {
    display: none !important;
  }
  ```
  This cleanly hides the raw `:-` and `:` punctuation marks without modifying your EJS data output!
- Dish titles are bold and capitalized, descriptions are muted, and prices are wrapped in styled golden accent pills.

### 5. Calendar Cards for Operating Hours
- Transformed the inline flex items into a 7-day card layout.
- Days marked "Closed Today" are styled with a soft red pill badge (`rgba(239, 68, 68, 0.1)`).
- Open days display opening and closing times with clear, readable labels.

---

## 4. Mastery Roadmap: What You Should Do Next

To go from writing simple exercises to building production-ready Node.js & Fastify applications, follow these 5 milestones:

### Milestone 1: Master EJS Partials (Don't Repeat Yourself)
Instead of copying the `<nav>` and `<head>` into `index.ejs`, `menu.ejs`, and `hours.ejs`, split them into reusable components:
- `views/partials/head.ejs`
- `views/partials/navbar.ejs`
- `views/partials/footer.ejs`

Then in any page, simply write:
```ejs
<!DOCTYPE html>
<html lang="en">
  <head>
    <%- include('partials/head', { title: 'Menu' }) %>
  </head>
  <body>
    <%- include('partials/navbar', { current: 'menu' }) %>
    <main class="container">
      ...
    </main>
    <%- include('partials/footer') %>
  </body>
</html>
```

### Milestone 2: Build a Time Helper Function
Raw numbers like `11` and `22` are awkward for customers. Write a helper function in a new file `utils/formatTime.js`:
```javascript
export function formatHour(hour) {
  if (hour === null || hour === undefined) return "Closed";
  const period = hour >= 12 ? "PM" : "AM";
  const standardHour = hour % 12 || 12;
  return `${standardHour}:00 ${period}`;
}
```
Pass this function into your view data so your templates render `11:00 AM – 10:00 PM`!

### Milestone 3: Route Organization (Fastify Plugins)
As apps grow, having all routes in `index.js` gets messy. Fastify has a plugin system:
Create a `routes/` directory:
- `routes/root.js` (Home)
- `routes/menu.js` (Menu routes)
- `routes/hours.js` (Hours routes)

Register them in `index.js`:
```javascript
import menuRoutes from "./routes/menu.js";
app.register(menuRoutes, { prefix: "/menu" });
```

### Milestone 4: Add Form Handling & Interactivity (POST Request)
Add a "Book a Table" reservation form!
1. Add an HTML form in `views/reserve.ejs` with `method="POST" action="/reserve"`.
2. Add `@fastify/formbody` to parse form submissions.
3. Handle `app.post("/reserve", async (req, reply) => { ... })`.

### Milestone 5: Database Persistence
Replace the static arrays in `menuItems.js` with **SQLite** (using `better-sqlite3`) or **MongoDB**. This allows you to add an Admin Panel where you can add, edit, or delete menu items without restarting the server!

---

## 5. Hands-On Practice Challenges

Try completing these 4 challenges to test your understanding:

1. **Challenge 1 (Bug Fix):** Fix the spelling of `"wendsday"` to `"wednesday"` in `index.js` and add a custom schedule in `operatingHours.js` for Wednesday:
   ```javascript
   wednesday: { open: 12, closed: 21 },
   ```
   Verify that Wednesday now displays its custom hours!
2. **Challenge 2 (Node ESM):** Refactor `index.js` to replace `process.cwd()` with `dirname(fileURLToPath(import.meta.url))` so your app runs safely from any terminal directory.
3. **Challenge 3 (Fastify Best Practice):** Refactor `app.listen()` into a clean `try...catch` block without any callback parameters.
4. **Challenge 4 (Feature Addition):** Add a new property `isVegetarian: true/false` or `category: "Appetizer" | "Main" | "Drink"` to each item in `data/menuItems.js`, and display a green leaf badge (🌿 Vegetarian) on the card in `menu.ejs`!

---

💡 *Keep this file in your project folder as a reference guide whenever you build Fastify and Node.js applications!*
