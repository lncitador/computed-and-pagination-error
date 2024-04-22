// src/plugins/edge/plugin.ts
import { encode } from "html-entities";

// src/debug.ts
import { debuglog } from "node:util";
var debug_default = debuglog("adonisjs:inertia");

// src/plugins/edge/tags.ts
import { EdgeError } from "edge-error";

// src/plugins/edge/utils.ts
function isSubsetOf(expression, expressions, errorCallback) {
  if (!expressions.includes(expression.type)) {
    errorCallback();
  }
}

// src/plugins/edge/tags.ts
var inertiaTag = {
  block: false,
  tagName: "inertia",
  seekable: true,
  compile(parser, buffer, { filename, loc, properties }) {
    if (properties.jsArg.trim() === "") {
      buffer.writeExpression(`out += state.inertia(state.page)`, filename, loc.start.line);
      return;
    }
    properties.jsArg = `(${properties.jsArg})`;
    const parsed = parser.utils.transformAst(
      parser.utils.generateAST(properties.jsArg, loc, filename),
      filename,
      parser
    );
    isSubsetOf(parsed, ["ObjectExpression"], () => {
      const { line, col } = parser.utils.getExpressionLoc(parsed);
      throw new EdgeError(
        `"${properties.jsArg}" is not a valid argument for @inertia`,
        "E_UNALLOWED_EXPRESSION",
        { line, col, filename }
      );
    });
    const attributes = parser.utils.stringify(parsed);
    buffer.writeExpression(
      `out += state.inertia(state.page, ${attributes})`,
      filename,
      loc.start.line
    );
  }
};
var inertiaHeadTag = {
  block: false,
  tagName: "inertiaHead",
  seekable: false,
  compile(_, buffer, { filename, loc }) {
    buffer.writeExpression(`out += state.inertiaHead(state.page)`, filename, loc.start.line);
  }
};

// src/plugins/edge/plugin.ts
var edgePluginInertia = () => {
  return (edge) => {
    debug_default("sharing globals and inertia tags with edge");
    edge.global(
      "inertia",
      (page = {}, attributes = {}) => {
        if (page.ssrBody)
          return page.ssrBody;
        const className = attributes?.class ? ` class="${attributes.class}"` : "";
        const id = attributes?.id ? ` id="${attributes.id}"` : ' id="app"';
        const tag = attributes?.as || "div";
        const dataPage = encode(JSON.stringify(page));
        return `<${tag}${id}${className} data-page="${dataPage}"></${tag}>`;
      }
    );
    edge.global("inertiaHead", (page) => {
      const { ssrHead = [] } = page || {};
      return ssrHead.join("\n");
    });
    edge.registerTag(inertiaHeadTag);
    edge.registerTag(inertiaTag);
  };
};
export {
  edgePluginInertia
};