var _parcelHelpers = require("@parcel/transformer-js/lib/esmodule-helpers.js");
_parcelHelpers.defineInteropFlag(exports);
var _react = require('react');
var _propTypes = require('prop-types');
var _propTypesDefault = _parcelHelpers.interopDefault(_propTypes);
var _clsx = require('clsx');
var _clsxDefault = _parcelHelpers.interopDefault(_clsx);
var _utilsUseEventCallback = require('../utils/useEventCallback');
var _utilsUseEventCallbackDefault = _parcelHelpers.interopDefault(_utilsUseEventCallback);
var useEnhancedEffect = typeof window === 'undefined' ? _react.useEffect : _react.useLayoutEffect;
/**
* @ignore - internal component.
*/
function Ripple(props) {
  var classes = props.classes, _props$pulsate = props.pulsate, pulsate = _props$pulsate === void 0 ? false : _props$pulsate, rippleX = props.rippleX, rippleY = props.rippleY, rippleSize = props.rippleSize, inProp = props.in, _props$onExited = props.onExited, onExited = _props$onExited === void 0 ? function () {} : _props$onExited, timeout = props.timeout;
  var _React$useState = _react.useState(false), leaving = _React$useState[0], setLeaving = _React$useState[1];
  var rippleClassName = _clsxDefault.default(classes.ripple, classes.rippleVisible, pulsate && classes.ripplePulsate);
  var rippleStyles = {
    width: rippleSize,
    height: rippleSize,
    top: -(rippleSize / 2) + rippleY,
    left: -(rippleSize / 2) + rippleX
  };
  var childClassName = _clsxDefault.default(classes.child, leaving && classes.childLeaving, pulsate && classes.childPulsate);
  var handleExited = _utilsUseEventCallbackDefault.default(onExited);
  // Ripple is used for user feedback (e.g. click or press) so we want to apply styles with the highest priority
  useEnhancedEffect(function () {
    if (!inProp) {
      // react-transition-group#onExit
      setLeaving(true);
      // react-transition-group#onExited
      var timeoutId = setTimeout(handleExited, timeout);
      return function () {
        clearTimeout(timeoutId);
      };
    }
    return undefined;
  }, [handleExited, inProp, timeout]);
  return (
    /*#__PURE__*/_react.createElement("span", {
      className: rippleClassName,
      style: rippleStyles
    }, /*#__PURE__*/_react.createElement("span", {
      className: childClassName
    }))
  );
}
"development" !== "production" ? Ripple.propTypes = {
  /**
  * Override or extend the styles applied to the component.
  * See [CSS API](#css) below for more details.
  */
  classes: _propTypesDefault.default.object.isRequired,
  /**
  * @ignore - injected from TransitionGroup
  */
  in: _propTypesDefault.default.bool,
  /**
  * @ignore - injected from TransitionGroup
  */
  onExited: _propTypesDefault.default.func,
  /**
  * If `true`, the ripple pulsates, typically indicating the keyboard focus state of an element.
  */
  pulsate: _propTypesDefault.default.bool,
  /**
  * Diameter of the ripple.
  */
  rippleSize: _propTypesDefault.default.number,
  /**
  * Horizontal position of the ripple center.
  */
  rippleX: _propTypesDefault.default.number,
  /**
  * Vertical position of the ripple center.
  */
  rippleY: _propTypesDefault.default.number,
  /**
  * exit delay
  */
  timeout: _propTypesDefault.default.number.isRequired
} : void 0;
exports.default = Ripple;
