var _parcelHelpers = require("@parcel/transformer-js/lib/esmodule-helpers.js");
_parcelHelpers.defineInteropFlag(exports);
_parcelHelpers.export(exports, "sheetsManager", function () {
  return sheetsManager;
});
_parcelHelpers.export(exports, "StylesContext", function () {
  return StylesContext;
});
var _babelRuntimeHelpersEsmExtends = require("@babel/runtime/helpers/esm/extends");
var _babelRuntimeHelpersEsmExtendsDefault = _parcelHelpers.interopDefault(_babelRuntimeHelpersEsmExtends);
var _babelRuntimeHelpersEsmObjectWithoutProperties = require("@babel/runtime/helpers/esm/objectWithoutProperties");
var _babelRuntimeHelpersEsmObjectWithoutPropertiesDefault = _parcelHelpers.interopDefault(_babelRuntimeHelpersEsmObjectWithoutProperties);
var _react = require('react');
var _reactDefault = _parcelHelpers.interopDefault(_react);
var _propTypes = require('prop-types');
var _propTypesDefault = _parcelHelpers.interopDefault(_propTypes);
var _materialUiUtils = require('@material-ui/utils');
var _createGenerateClassName = require('../createGenerateClassName');
var _createGenerateClassNameDefault = _parcelHelpers.interopDefault(_createGenerateClassName);
var _jss = require('jss');
var _jssPreset = require('../jssPreset');
var _jssPresetDefault = _parcelHelpers.interopDefault(_jssPreset);
// Default JSS instance.
var jss = _jss.create(_jssPresetDefault.default());
// Use a singleton or the provided one by the context.
// 
// The counter-based approach doesn't tolerate any mistake.
// It's much safer to use the same counter everywhere.
var generateClassName = _createGenerateClassNameDefault.default();
var sheetsManager = new Map();
var defaultOptions = {
  disableGeneration: false,
  generateClassName: generateClassName,
  jss: jss,
  sheetsCache: null,
  sheetsManager: sheetsManager,
  sheetsRegistry: null
};
var StylesContext = _reactDefault.default.createContext(defaultOptions);
if ("development" !== 'production') {
  StylesContext.displayName = 'StylesContext';
}
var injectFirstNode;
function StylesProvider(props) {
  var children = props.children, _props$injectFirst = props.injectFirst, injectFirst = _props$injectFirst === void 0 ? false : _props$injectFirst, _props$disableGenerat = props.disableGeneration, disableGeneration = _props$disableGenerat === void 0 ? false : _props$disableGenerat, localOptions = _babelRuntimeHelpersEsmObjectWithoutPropertiesDefault.default(props, ["children", "injectFirst", "disableGeneration"]);
  var outerOptions = _reactDefault.default.useContext(StylesContext);
  var context = _babelRuntimeHelpersEsmExtendsDefault.default({}, outerOptions, {
    disableGeneration: disableGeneration
  }, localOptions);
  if ("development" !== 'production') {
    if (typeof window === 'undefined' && !context.sheetsManager) {
      console.error('Material-UI: You need to use the ServerStyleSheets API when rendering on the server.');
    }
  }
  if ("development" !== 'production') {
    if (context.jss.options.insertionPoint && injectFirst) {
      console.error('Material-UI: You cannot use a custom insertionPoint and <StylesContext injectFirst> at the same time.');
    }
  }
  if ("development" !== 'production') {
    if (injectFirst && localOptions.jss) {
      console.error('Material-UI: You cannot use the jss and injectFirst props at the same time.');
    }
  }
  if (!context.jss.options.insertionPoint && injectFirst && typeof window !== 'undefined') {
    if (!injectFirstNode) {
      var head = document.head;
      injectFirstNode = document.createComment('mui-inject-first');
      head.insertBefore(injectFirstNode, head.firstChild);
    }
    context.jss = _jss.create({
      plugins: _jssPresetDefault.default().plugins,
      insertionPoint: injectFirstNode
    });
  }
  return (
    /*#__PURE__*/_reactDefault.default.createElement(StylesContext.Provider, {
      value: context
    }, children)
  );
}
exports.default = StylesProvider;
"development" !== "production" ? StylesProvider.propTypes = {
  /**
  * Your component tree.
  */
  children: _propTypesDefault.default.node.isRequired,
  /**
  * You can disable the generation of the styles with this option.
  * It can be useful when traversing the React tree outside of the HTML
  * rendering step on the server.
  * Let's say you are using react-apollo to extract all
  * the queries made by the interface server-side - you can significantly speed up the traversal with this prop.
  */
  disableGeneration: _propTypesDefault.default.bool,
  /**
  * JSS's class name generator.
  */
  generateClassName: _propTypesDefault.default.func,
  /**
  * By default, the styles are injected last in the <head> element of the page.
  * As a result, they gain more specificity than any other style sheet.
  * If you want to override Material-UI's styles, set this prop.
  */
  injectFirst: _propTypesDefault.default.bool,
  /**
  * JSS's instance.
  */
  jss: _propTypesDefault.default.object,
  /**
  * @ignore
  */
  serverGenerateClassName: _propTypesDefault.default.func,
  /**
  * @ignore
  *
  * Beta feature.
  *
  * Cache for the sheets.
  */
  sheetsCache: _propTypesDefault.default.object,
  /**
  * @ignore
  *
  * The sheetsManager is used to deduplicate style sheet injection in the page.
  * It's deduplicating using the (theme, styles) couple.
  * On the server, you should provide a new instance for each request.
  */
  sheetsManager: _propTypesDefault.default.object,
  /**
  * @ignore
  *
  * Collect the sheets.
  */
  sheetsRegistry: _propTypesDefault.default.object
} : void 0;
if ("development" !== 'production') {
  "development" !== "production" ? StylesProvider.propTypes = _materialUiUtils.exactProp(StylesProvider.propTypes) : void 0;
}
