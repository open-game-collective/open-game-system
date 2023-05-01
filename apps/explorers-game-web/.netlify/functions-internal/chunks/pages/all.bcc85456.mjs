import { c as createAstro, a as createComponent, r as renderTemplate, b as addAttribute, d as renderHead, e as renderSlot, f as renderComponent, m as maybeRenderHead } from '../astro.1de37862.mjs';
import 'html-escaper';
/* empty css                                      */
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

const $$Astro = createAstro();
const $$gameInstanceId = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$gameInstanceId;
  const { gameInstanceId } = Astro2.params;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Explorers Game" }, { "default": ($$result2) => renderTemplate`
  ${maybeRenderHead($$result2)}<main>
    <div>Hello ${gameInstanceId}</div>
  </main>
` })}`;
}, "/Users/jonathanmumm/src/main/apps/explorers-game-web/src/pages/[gameInstanceId].astro");

const $$file = "/Users/jonathanmumm/src/main/apps/explorers-game-web/src/pages/[gameInstanceId].astro";
const $$url = "/[gameInstanceId]";

const _page1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$gameInstanceId,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { _page0 as _, _page1 as a };
