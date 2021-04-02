var _parcelHelpers = require("@parcel/transformer-js/lib/esmodule-helpers.js");
_parcelHelpers.defineInteropFlag(exports);
_parcelHelpers.export(exports, "styles", function () {
  return styles;
});
var _babelRuntimeHelpersEsmExtends = require("@babel/runtime/helpers/esm/extends");
var _babelRuntimeHelpersEsmExtendsDefault = _parcelHelpers.interopDefault(_babelRuntimeHelpersEsmExtends);
var _babelRuntimeHelpersEsmObjectWithoutProperties = require("@babel/runtime/helpers/esm/objectWithoutProperties");
var _babelRuntimeHelpersEsmObjectWithoutPropertiesDefault = _parcelHelpers.interopDefault(_babelRuntimeHelpersEsmObjectWithoutProperties);
var _react = require('react');
var _propTypes = require('prop-types');
var _propTypesDefault = _parcelHelpers.interopDefault(_propTypes);
var styles = {
  /*Styles applied to the root element.*/
  root: {
    zIndex: -1,
    position: 'fixed',
    right: 0,
    bottom: 0,
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    WebkitTapHighlightColor: 'transparent'
  },
  /*Styles applied to the root element if `invisible={true}`.*/
  invisible: {
    backgroundColor: 'transparent'
  }
};
/**
* @ignore - internal component.
*/
var SimpleBackdrop = /*#__PURE__*/_react.forwardRef(function SimpleBackdrop(props, ref) {
  var _props$invisible = props.invisible, invisible = _props$invisible === void 0 ? false : _props$invisible, open = props.open, other = _babelRuntimeHelpersEsmObjectWithoutPropertiesDefault.default(props, ["invisible", "open"]);
  return open ? /*#__PURE__*/_react.createElement("div", _babelRuntimeHelpersEsmExtendsDefault.default({
    "aria-hidden": true,
    ref: ref
  }, other, {
    style: _babelRuntimeHelpersEsmExtendsDefault.default({}, styles.root, invisible ? styles.invisible : {}, other.style)
  })) : null;
});
"development" !== "production" ? SimpleBackdrop.propTypes = {
  /**
  * If `true`, the backdrop is invisible.
  * It can be used when rendering a popover or a custom select component.
  */
  invisible: _propTypesDefault.default.bool,
  /**
  * If `true`, the backdrop is open.
  */
  open: _propTypesDefault.default.bool.isRequired
} : void 0;
exports.default = SimpleBackdrop;
