import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'inex',
  location: 'us-east4'
};

export const createPickupRequestRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePickupRequest', inputVars);
}
createPickupRequestRef.operationName = 'CreatePickupRequest';

export function createPickupRequest(dcOrVars, vars) {
  return executeMutation(createPickupRequestRef(dcOrVars, vars));
}

export const listPickupRequestsForCustomerRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPickupRequestsForCustomer', inputVars);
}
listPickupRequestsForCustomerRef.operationName = 'ListPickupRequestsForCustomer';

export function listPickupRequestsForCustomer(dcOrVars, vars) {
  return executeQuery(listPickupRequestsForCustomerRef(dcOrVars, vars));
}

export const updatePickupRequestStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdatePickupRequestStatus', inputVars);
}
updatePickupRequestStatusRef.operationName = 'UpdatePickupRequestStatus';

export function updatePickupRequestStatus(dcOrVars, vars) {
  return executeMutation(updatePickupRequestStatusRef(dcOrVars, vars));
}

export const listAvailableDriversRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAvailableDrivers');
}
listAvailableDriversRef.operationName = 'ListAvailableDrivers';

export function listAvailableDrivers(dc) {
  return executeQuery(listAvailableDriversRef(dc));
}

