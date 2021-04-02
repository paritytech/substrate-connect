var _parcelHelpers = require("@parcel/transformer-js/lib/esmodule-helpers.js");
_parcelHelpers.defineInteropFlag(exports);
var _jssPluginRuleValueFunction = require('jss-plugin-rule-value-function');
var _jssPluginRuleValueFunctionDefault = _parcelHelpers.interopDefault(_jssPluginRuleValueFunction);
var _jssPluginGlobal = require('jss-plugin-global');
var _jssPluginGlobalDefault = _parcelHelpers.interopDefault(_jssPluginGlobal);
var _jssPluginNested = require('jss-plugin-nested');
var _jssPluginNestedDefault = _parcelHelpers.interopDefault(_jssPluginNested);
var _jssPluginCamelCase = require('jss-plugin-camel-case');
var _jssPluginCamelCaseDefault = _parcelHelpers.interopDefault(_jssPluginCamelCase);
var _jssPluginDefaultUnit = require('jss-plugin-default-unit');
var _jssPluginDefaultUnitDefault = _parcelHelpers.interopDefault(_jssPluginDefaultUnit);
var _jssPluginVendorPrefixer = require('jss-plugin-vendor-prefixer');
var _jssPluginVendorPrefixerDefault = _parcelHelpers.interopDefault(_jssPluginVendorPrefixer);
var _jssPluginPropsSort = require('jss-plugin-props-sort');
var _jssPluginPropsSortDefault = _parcelHelpers.interopDefault(_jssPluginPropsSort);
function jssPreset() {
  return {
    plugins: [_jssPluginRuleValueFunctionDefault.default(), _jssPluginGlobalDefault.default(), _jssPluginNestedDefault.default(), _jssPluginCamelCaseDefault.default(), _jssPluginDefaultUnitDefault.default(), // Disable the vendor prefixer server-side, it does nothing.
    // This way, we can get a performance boost.
    // In the documentation, we are using `autoprefixer` to solve this problem.
    typeof window === 'undefined' ? null : _jssPluginVendorPrefixerDefault.default(), _jssPluginPropsSortDefault.default()]
  };
}
exports.default = jssPreset;
