var _parcelHelpers = require("@parcel/transformer-js/lib/esmodule-helpers.js");
_parcelHelpers.defineInteropFlag(exports);
_parcelHelpers.export(exports, "withThemeCreator", function () {
  return withThemeCreator;
});
var _babelRuntimeHelpersEsmExtends = require("@babel/runtime/helpers/esm/extends");
var _babelRuntimeHelpersEsmExtendsDefault = _parcelHelpers.interopDefault(_babelRuntimeHelpersEsmExtends);
var _babelRuntimeHelpersEsmObjectWithoutProperties = require("@babel/runtime/helpers/esm/objectWithoutProperties");
var _babelRuntimeHelpersEsmObjectWithoutPropertiesDefault = _parcelHelpers.interopDefault(_babelRuntimeHelpersEsmObjectWithoutProperties);
var _react = require('react');
var _reactDefault = _parcelHelpers.interopDefault(_react);
var _propTypes = require('prop-types');
var _propTypesDefault = _parcelHelpers.interopDefault(_propTypes);
var _hoistNonReactStatics = require('hoist-non-react-statics');
var _hoistNonReactStaticsDefault = _parcelHelpers.interopDefault(_hoistNonReactStatics);
var _materialUiUtils = require('@material-ui/utils');
var _useTheme = require('../useTheme');
var _useThemeDefault = _parcelHelpers.interopDefault(_useTheme);
function withThemeCreator() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var defaultTheme = options.defaultTheme;
  var withTheme = function withTheme(Component) {
    if ("development" !== 'production') {
      if (Component === undefined) {
        throw new Error(['You are calling withTheme(Component) with an undefined component.', 'You may have forgotten to import it.'].join('\n'));
      }
    }
    var WithTheme = /*#__PURE__*/_reactDefault.default.forwardRef(function WithTheme(props, ref) {
      var innerRef = props.innerRef, other = _babelRuntimeHelpersEsmObjectWithoutPropertiesDefault.default(props, ["innerRef"]);
      var theme = _useThemeDefault.default() || defaultTheme;
      return (
        /*#__PURE__*/_reactDefault.default.createElement(Component, _babelRuntimeHelpersEsmExtendsDefault.default({
          theme: theme,
          ref: innerRef || ref
        }, other))
      );
    });
    "development" !== "production" ? WithTheme.propTypes = {
      /**
      * Use that prop to pass a ref to the decorated component.
      * @deprecated
      */
      innerRef: _materialUiUtils.chainPropTypes(_propTypesDefault.default.oneOfType([_propTypesDefault.default.func, _propTypesDefault.default.object]), function (props) {
        if (props.innerRef == null) {
          return null;
        }
        return new Error('Material-UI: The `innerRef` prop is deprecated and will be removed in v5. ' + 'Refs are now automatically forwarded to the inner component.');
      })
    } : void 0;
    if ("development" !== 'production') {
      WithTheme.displayName = ("WithTheme(").concat(_materialUiUtils.getDisplayName(Component), ")");
    }
    _hoistNonReactStaticsDefault.default(WithTheme, Component);
    if ("development" !== 'production') {
      // Exposed for test purposes.
      WithTheme.Naked = Component;
    }
    return WithTheme;
  };
  return withTheme;
}
// Provide the theme object as a prop to the input component.
// It's an alternative API to useTheme().
// We encourage the usage of useTheme() where possible.
var withTheme = withThemeCreator();
exports.default = withTheme;
