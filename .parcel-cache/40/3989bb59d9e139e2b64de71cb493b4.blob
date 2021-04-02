var _parcelHelpers = require("@parcel/transformer-js/lib/esmodule-helpers.js");
_parcelHelpers.defineInteropFlag(exports);
var _babelRuntimeHelpersEsmObjectWithoutProperties = require("@babel/runtime/helpers/esm/objectWithoutProperties");
var _babelRuntimeHelpersEsmObjectWithoutPropertiesDefault = _parcelHelpers.interopDefault(_babelRuntimeHelpersEsmObjectWithoutProperties);
var _babelRuntimeHelpersEsmExtends = require("@babel/runtime/helpers/esm/extends");
var _babelRuntimeHelpersEsmExtendsDefault = _parcelHelpers.interopDefault(_babelRuntimeHelpersEsmExtends);
var _react = require('react');
var _reactDefault = _parcelHelpers.interopDefault(_react);
var _jss = require('jss');
var _mergeClasses = require('../mergeClasses');
var _mergeClassesDefault = _parcelHelpers.interopDefault(_mergeClasses);
var _multiKeyStore = require('./multiKeyStore');
var _multiKeyStoreDefault = _parcelHelpers.interopDefault(_multiKeyStore);
var _useTheme = require('../useTheme');
var _useThemeDefault = _parcelHelpers.interopDefault(_useTheme);
var _StylesProvider = require('../StylesProvider');
var _indexCounter = require('./indexCounter');
var _getStylesCreator = require('../getStylesCreator');
var _getStylesCreatorDefault = _parcelHelpers.interopDefault(_getStylesCreator);
var _getStylesCreatorNoopTheme = require('../getStylesCreator/noopTheme');
var _getStylesCreatorNoopThemeDefault = _parcelHelpers.interopDefault(_getStylesCreatorNoopTheme);
function getClasses(_ref, classes, Component) {
  var state = _ref.state, stylesOptions = _ref.stylesOptions;
  if (stylesOptions.disableGeneration) {
    return classes || ({});
  }
  if (!state.cacheClasses) {
    state.cacheClasses = {
      // Cache for the finalized classes value.
      value: null,
      // Cache for the last used classes prop pointer.
      lastProp: null,
      // Cache for the last used rendered classes pointer.
      lastJSS: {}
    };
  }
  // Tracks if either the rendered classes or classes prop has changed,
  // requiring the generation of a new finalized classes object.
  var generate = false;
  if (state.classes !== state.cacheClasses.lastJSS) {
    state.cacheClasses.lastJSS = state.classes;
    generate = true;
  }
  if (classes !== state.cacheClasses.lastProp) {
    state.cacheClasses.lastProp = classes;
    generate = true;
  }
  if (generate) {
    state.cacheClasses.value = _mergeClassesDefault.default({
      baseClasses: state.cacheClasses.lastJSS,
      newClasses: classes,
      Component: Component
    });
  }
  return state.cacheClasses.value;
}
function attach(_ref2, props) {
  var state = _ref2.state, theme = _ref2.theme, stylesOptions = _ref2.stylesOptions, stylesCreator = _ref2.stylesCreator, name = _ref2.name;
  if (stylesOptions.disableGeneration) {
    return;
  }
  var sheetManager = _multiKeyStoreDefault.default.get(stylesOptions.sheetsManager, stylesCreator, theme);
  if (!sheetManager) {
    sheetManager = {
      refs: 0,
      staticSheet: null,
      dynamicStyles: null
    };
    _multiKeyStoreDefault.default.set(stylesOptions.sheetsManager, stylesCreator, theme, sheetManager);
  }
  var options = _babelRuntimeHelpersEsmExtendsDefault.default({}, stylesCreator.options, stylesOptions, {
    theme: theme,
    flip: typeof stylesOptions.flip === 'boolean' ? stylesOptions.flip : theme.direction === 'rtl'
  });
  options.generateId = options.serverGenerateClassName || options.generateClassName;
  var sheetsRegistry = stylesOptions.sheetsRegistry;
  if (sheetManager.refs === 0) {
    var staticSheet;
    if (stylesOptions.sheetsCache) {
      staticSheet = _multiKeyStoreDefault.default.get(stylesOptions.sheetsCache, stylesCreator, theme);
    }
    var styles = stylesCreator.create(theme, name);
    if (!staticSheet) {
      staticSheet = stylesOptions.jss.createStyleSheet(styles, _babelRuntimeHelpersEsmExtendsDefault.default({
        link: false
      }, options));
      staticSheet.attach();
      if (stylesOptions.sheetsCache) {
        _multiKeyStoreDefault.default.set(stylesOptions.sheetsCache, stylesCreator, theme, staticSheet);
      }
    }
    if (sheetsRegistry) {
      sheetsRegistry.add(staticSheet);
    }
    sheetManager.staticSheet = staticSheet;
    sheetManager.dynamicStyles = _jss.getDynamicStyles(styles);
  }
  if (sheetManager.dynamicStyles) {
    var dynamicSheet = stylesOptions.jss.createStyleSheet(sheetManager.dynamicStyles, _babelRuntimeHelpersEsmExtendsDefault.default({
      link: true
    }, options));
    dynamicSheet.update(props);
    dynamicSheet.attach();
    state.dynamicSheet = dynamicSheet;
    state.classes = _mergeClassesDefault.default({
      baseClasses: sheetManager.staticSheet.classes,
      newClasses: dynamicSheet.classes
    });
    if (sheetsRegistry) {
      sheetsRegistry.add(dynamicSheet);
    }
  } else {
    state.classes = sheetManager.staticSheet.classes;
  }
  sheetManager.refs += 1;
}
function update(_ref3, props) {
  var state = _ref3.state;
  if (state.dynamicSheet) {
    state.dynamicSheet.update(props);
  }
}
function detach(_ref4) {
  var state = _ref4.state, theme = _ref4.theme, stylesOptions = _ref4.stylesOptions, stylesCreator = _ref4.stylesCreator;
  if (stylesOptions.disableGeneration) {
    return;
  }
  var sheetManager = _multiKeyStoreDefault.default.get(stylesOptions.sheetsManager, stylesCreator, theme);
  sheetManager.refs -= 1;
  var sheetsRegistry = stylesOptions.sheetsRegistry;
  if (sheetManager.refs === 0) {
    _multiKeyStoreDefault.default.delete(stylesOptions.sheetsManager, stylesCreator, theme);
    stylesOptions.jss.removeStyleSheet(sheetManager.staticSheet);
    if (sheetsRegistry) {
      sheetsRegistry.remove(sheetManager.staticSheet);
    }
  }
  if (state.dynamicSheet) {
    stylesOptions.jss.removeStyleSheet(state.dynamicSheet);
    if (sheetsRegistry) {
      sheetsRegistry.remove(state.dynamicSheet);
    }
  }
}
function useSynchronousEffect(func, values) {
  var key = _reactDefault.default.useRef([]);
  var output;
  // Store "generation" key. Just returns a new object every time
  var currentKey = _reactDefault.default.useMemo(function () {
    return {};
  }, values);
  // eslint-disable-line react-hooks/exhaustive-deps
  // "the first render", or "memo dropped the value"
  if (key.current !== currentKey) {
    key.current = currentKey;
    output = func();
  }
  _reactDefault.default.useEffect(function () {
    return function () {
      if (output) {
        output();
      }
    };
  }, [currentKey]);
}
function makeStyles(stylesOrCreator) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var name = options.name, classNamePrefixOption = options.classNamePrefix, Component = options.Component, _options$defaultTheme = options.defaultTheme, defaultTheme = _options$defaultTheme === void 0 ? _getStylesCreatorNoopThemeDefault.default : _options$defaultTheme, stylesOptions2 = _babelRuntimeHelpersEsmObjectWithoutPropertiesDefault.default(options, ["name", "classNamePrefix", "Component", "defaultTheme"]);
  var stylesCreator = _getStylesCreatorDefault.default(stylesOrCreator);
  var classNamePrefix = name || classNamePrefixOption || 'makeStyles';
  stylesCreator.options = {
    index: _indexCounter.increment(),
    name: name,
    meta: classNamePrefix,
    classNamePrefix: classNamePrefix
  };
  var useStyles = function useStyles() {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var theme = _useThemeDefault.default() || defaultTheme;
    var stylesOptions = _babelRuntimeHelpersEsmExtendsDefault.default({}, _reactDefault.default.useContext(_StylesProvider.StylesContext), stylesOptions2);
    var instance = _reactDefault.default.useRef();
    var shouldUpdate = _reactDefault.default.useRef();
    useSynchronousEffect(function () {
      var current = {
        name: name,
        state: {},
        stylesCreator: stylesCreator,
        stylesOptions: stylesOptions,
        theme: theme
      };
      attach(current, props);
      shouldUpdate.current = false;
      instance.current = current;
      return function () {
        detach(current);
      };
    }, [theme, stylesCreator]);
    _reactDefault.default.useEffect(function () {
      if (shouldUpdate.current) {
        update(instance.current, props);
      }
      shouldUpdate.current = true;
    });
    var classes = getClasses(instance.current, props.classes, Component);
    if ("development" !== 'production') {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      _reactDefault.default.useDebugValue(classes);
    }
    return classes;
  };
  return useStyles;
}
exports.default = makeStyles;
