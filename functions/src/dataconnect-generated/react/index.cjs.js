const { createPickupRequestRef, listPickupRequestsForCustomerRef, updatePickupRequestStatusRef, listAvailableDriversRef, connectorConfig } = require('../index.cjs.js');
const { validateArgs, CallerSdkTypeEnum } = require('firebase/data-connect');
const { useDataConnectQuery, useDataConnectMutation, validateReactArgs } = require('@tanstack-query-firebase/react/data-connect');

exports.useCreatePickupRequest = function useCreatePickupRequest(dcOrOptions, options) {
  const { dc: dcInstance, vars: inputOpts } = validateArgs(connectorConfig, dcOrOptions, options);
  function refFactory(vars) {
    return createPickupRequestRef(dcInstance, vars);
  }
  return useDataConnectMutation(refFactory, inputOpts, CallerSdkTypeEnum.GeneratedReact);
}


exports.useListPickupRequestsForCustomer = function useListPickupRequestsForCustomer(dcOrVars, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateReactArgs(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  const ref = listPickupRequestsForCustomerRef(dcInstance, inputVars);
  return useDataConnectQuery(ref, inputOpts, CallerSdkTypeEnum.GeneratedReact);
}
exports.useUpdatePickupRequestStatus = function useUpdatePickupRequestStatus(dcOrOptions, options) {
  const { dc: dcInstance, vars: inputOpts } = validateArgs(connectorConfig, dcOrOptions, options);
  function refFactory(vars) {
    return updatePickupRequestStatusRef(dcInstance, vars);
  }
  return useDataConnectMutation(refFactory, inputOpts, CallerSdkTypeEnum.GeneratedReact);
}


exports.useListAvailableDrivers = function useListAvailableDrivers(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts } = validateReactArgs(connectorConfig, dcOrOptions, options);
  const ref = listAvailableDriversRef(dcInstance);
  return useDataConnectQuery(ref, inputOpts, CallerSdkTypeEnum.GeneratedReact);
}