import { createPickupRequestRef, listPickupRequestsForCustomerRef, updatePickupRequestStatusRef, listAvailableDriversRef, connectorConfig } from '../../esm/index.esm.js';
import { validateArgs, CallerSdkTypeEnum } from 'firebase/data-connect';
import { useDataConnectQuery, useDataConnectMutation, validateReactArgs } from '@tanstack-query-firebase/react/data-connect';

export function useCreatePickupRequest(dcOrOptions, options) {
  const { dc: dcInstance, vars: inputOpts } = validateArgs(connectorConfig, dcOrOptions, options);
  function refFactory(vars) {
    return createPickupRequestRef(dcInstance, vars);
  }
  return useDataConnectMutation(refFactory, inputOpts, CallerSdkTypeEnum.GeneratedReact);
}


export function useListPickupRequestsForCustomer(dcOrVars, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateReactArgs(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  const ref = listPickupRequestsForCustomerRef(dcInstance, inputVars);
  return useDataConnectQuery(ref, inputOpts, CallerSdkTypeEnum.GeneratedReact);
}
export function useUpdatePickupRequestStatus(dcOrOptions, options) {
  const { dc: dcInstance, vars: inputOpts } = validateArgs(connectorConfig, dcOrOptions, options);
  function refFactory(vars) {
    return updatePickupRequestStatusRef(dcInstance, vars);
  }
  return useDataConnectMutation(refFactory, inputOpts, CallerSdkTypeEnum.GeneratedReact);
}


export function useListAvailableDrivers(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts } = validateReactArgs(connectorConfig, dcOrOptions, options);
  const ref = listAvailableDriversRef(dcInstance);
  return useDataConnectQuery(ref, inputOpts, CallerSdkTypeEnum.GeneratedReact);
}