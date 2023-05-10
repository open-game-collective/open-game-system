import { c as createAstro, a as createComponent, r as renderTemplate, b as addAttribute, d as renderHead, e as renderSlot, f as renderComponent, m as maybeRenderHead } from '../astro.705d8a0d.mjs';
import 'html-escaper';
/* empty css                                */
const $$Astro$2 = createAstro();
const $$Layout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title } = Astro2.props;
  return renderTemplate`<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <meta name="generator"${addAttribute(Astro2.generator, "content")}>
    <title>${title}</title>
  ${renderHead($$result)}</head>

  <body>
    ${renderSlot($$result, $$slots["default"])}
  </body></html>`;
}, "/Users/jonathanmumm/src/main/apps/explorers-game-web/src/layouts/Layout.astro");

const $$Astro$1 = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Explorers Game" }, { "default": ($$result2) => renderTemplate`
  ${maybeRenderHead($$result2)}<main>
    <div>Home</div>
  </main>
` })}`;
}, "/Users/jonathanmumm/src/main/apps/explorers-game-web/src/pages/index.astro");

const $$file$1 = "/Users/jonathanmumm/src/main/apps/explorers-game-web/src/pages/index.astro";
const $$url$1 = "";

const _page0 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file$1,
  url: $$url$1
}, Symbol.toStringTag, { value: 'Module' }));

const logoRef = "/_astro/base_logo_black_horizontal.f8f20f4f.png";

const $$Astro = createAstro();
const $$roomSlug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$roomSlug;
  const roomSlug = Astro2.params.roomSlug;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Explorers Game" }, { "default": ($$result2) => renderTemplate`
  ${maybeRenderHead($$result2)}<main>
    <img${addAttribute(logoRef, "src")} alt="Explorers Logo">
    ${renderComponent($$result2, "ApplicationProvider", null, { "client:only": true, "trpcUrl": "ws://localhost:3001", "client:component-hydration": "only", "client:component-path": "@context/ApplicationProvider", "client:component-export": "ApplicationProvider" }, { "default": ($$result3) => renderTemplate`
      ${renderComponent($$result3, "Room", null, { "client:only": true, "slug": roomSlug, "client:component-hydration": "only", "client:component-path": "@organisms/Room", "client:component-export": "Room" })}
    ` })}
  </main>
` })}`;
}, "/Users/jonathanmumm/src/main/apps/explorers-game-web/src/pages/[roomSlug].astro");

const $$file = "/Users/jonathanmumm/src/main/apps/explorers-game-web/src/pages/[roomSlug].astro";
const $$url = "/[roomSlug]";

const _page1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$roomSlug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { _page0 as _, _page1 as a };
