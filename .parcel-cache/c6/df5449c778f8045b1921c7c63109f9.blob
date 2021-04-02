var _parcelHelpers = require("@parcel/transformer-js/lib/esmodule-helpers.js");
_parcelHelpers.defineInteropFlag(exports);
var _babelRuntimeHelpersEsmExtends = require("@babel/runtime/helpers/esm/extends");
var _babelRuntimeHelpersEsmExtendsDefault = _parcelHelpers.interopDefault(_babelRuntimeHelpersEsmExtends);
var _babelRuntimeHelpersEsmObjectWithoutProperties = require("@babel/runtime/helpers/esm/objectWithoutProperties");
var _babelRuntimeHelpersEsmObjectWithoutPropertiesDefault = _parcelHelpers.interopDefault(_babelRuntimeHelpersEsmObjectWithoutProperties);
var _react = require('react');
var _reactDefault = _parcelHelpers.interopDefault(_react);
var _clsx = require('clsx');
var _clsxDefault = _parcelHelpers.interopDefault(_clsx);
var _propTypes = require('prop-types');
var _propTypesDefault = _parcelHelpers.interopDefault(_propTypes);
var _materialUiUtils = require('@material-ui/utils');
var _hoistNonReactStatics = require('hoist-non-react-statics');
var _hoistNonReactStaticsDefault = _parcelHelpers.interopDefault(_hoistNonReactStatics);
var _makeStyles = require('../makeStyles');
var _makeStylesDefault = _parcelHelpers.interopDefault(_makeStyles);
function omit(input, fields) {
  var output = {};
  Object.keys(input).forEach(function (prop) {
    if (fields.indexOf(prop) === -1) {
      output[prop] = input[prop];
    }
  });
  return output;
}
function styled(Component) {
  var componentCreator = function componentCreator(style) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var name = options.name, stylesOptions = _babelRuntimeHelpersEsmObjectWithoutPropertiesDefault.default(options, ["name"]);
    if ("development" !== 'production' && Component === undefined) {
      throw new Error(['You are calling styled(Component)(style) with an undefined component.', 'You may have forgotten to import it.'].join('\n'));
    }
    var classNamePrefix = name;
    if ("development" !== 'production') {
      if (!name) {
        // Provide a better DX outside production.
        var displayName = _materialUiUtils.getDisplayName(Component);
        if (displayName !== undefined) {
          classNamePrefix = displayName;
        }
      }
    }
    var stylesOrCreator = typeof style === 'function' ? function (theme) {
      return {
        root: function root(props) {
          return style(_babelRuntimeHelpersEsmExtendsDefault.default({
            theme: theme
          }, props));
        }
      };
    } : {
      root: style
    };
    var useStyles = _makeStylesDefault.default(stylesOrCreator, _babelRuntimeHelpersEsmExtendsDefault.default({
      Component: Component,
      name: name || Component.displayName,
      classNamePrefix: classNamePrefix
    }, stylesOptions));
    var filterProps;
    var propTypes = {};
    if (style.filterProps) {
      filterProps = style.filterProps;
      delete style.filterProps;
    }
    /*eslint-disable react/forbid-foreign-prop-types*/
    if (style.propTypes) {
      propTypes = style.propTypes;
      delete style.propTypes;
    }
    /*eslint-enable react/forbid-foreign-prop-types*/
    var StyledComponent = /*#__PURE__*/_reactDefault.default.forwardRef(function StyledComponent(props, ref) {
      var children = props.children, classNameProp = props.className, clone = props.clone, ComponentProp = props.component, other = _babelRuntimeHelpersEsmObjectWithoutPropertiesDefault.default(props, ["children", "className", "clone", "component"]);
      var classes = useStyles(props);
      var className = _clsxDefault.default(classes.root, classNameProp);
      var spread = other;
      if (filterProps) {
        spread = omit(spread, filterProps);
      }
      if (clone) {
        return (
          /*#__PURE__*/_reactDefault.default.cloneElement(children, _babelRuntimeHelpersEsmExtendsDefault.default({
            className: _clsxDefault.default(children.props.className, className)
          }, spread))
        );
      }
      if (typeof children === 'function') {
        return children(_babelRuntimeHelpersEsmExtendsDefault.default({
          className: className
        }, spread));
      }
      var FinalComponent = ComponentProp || Component;
      return (
        /*#__PURE__*/_reactDefault.default.createElement(FinalComponent, _babelRuntimeHelpersEsmExtendsDefault.default({
          ref: ref,
          className: className
        }, spread), children)
      );
    });
    "development" !== "production" ? StyledComponent.propTypes = _babelRuntimeHelpersEsmExtendsDefault.default({
      /**
      * A render function or node.
      */
      children: _propTypesDefault.default.oneOfType([_propTypesDefault.default.node, _propTypesDefault.default.func]),
      /**
      * @ignore
      */
      className: _propTypesDefault.default.string,
      /**
      * If `true`, the component will recycle it's children HTML element.
      * It's using `React.cloneElement` internally.
      *
      * This prop will be deprecated and removed in v5
      */
      clone: _materialUiUtils.chainPropTypes(_propTypesDefault.default.bool, function (props) {
        if (props.clone && props.component) {
          return new Error('You can not use the clone and component prop at the same time.');
        }
        return null;
      }),
      /**
      * The component used for the root node.
      * Either a string to use a HTML element or a component.
      */
      component: _propTypesDefault.default./*@typescript-to-proptypes-ignore*/
      elementType
    }, propTypes) : void 0;
    if ("development" !== 'production') {
      StyledComponent.displayName = ("Styled(").concat(classNamePrefix, ")");
    }
    _hoistNonReactStaticsDefault.default(StyledComponent, Component);
    return StyledComponent;
  };
  return componentCreator;
}
exports.default = styled;
