const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'inex',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createPickupRequestRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePickupRequest', inputVars);
}
createPickupRequestRef.operationName = 'CreatePickupRequest';
exports.createPickupRequestRef = createPickupRequestRef;

exports.createPickupRequest = function createPickupRequest(dcOrVars, vars) {
  return executeMutation(createPickupRequestRef(dcOrVars, vars));
};

const listPickupRequestsForCustomerRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPickupRequestsForCustomer', inputVars);
}
listPickupRequestsForCustomerRef.operationName = 'ListPickupRequestsForCustomer';
exports.listPickupRequestsForCustomerRef = listPickupRequestsForCustomerRef;

exports.listPickupRequestsForCustomer = function listPickupRequestsForCustomer(dcOrVars, vars) {
  return executeQuery(listPickupRequestsForCustomerRef(dcOrVars, vars));
};

const updatePickupRequestStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdatePickupRequestStatus', inputVars);
}
updatePickupRequestStatusRef.operationName = 'UpdatePickupRequestStatus';
exports.updatePickupRequestStatusRef = updatePickupRequestStatusRef;

exports.updatePickupRequestStatus = function updatePickupRequestStatus(dcOrVars, vars) {
  return executeMutation(updatePickupRequestStatusRef(dcOrVars, vars));
};

const listAvailableDriversRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAvailableDrivers');
}
listAvailableDriversRef.operationName = 'ListAvailableDrivers';
exports.listAvailableDriversRef = listAvailableDriversRef;

exports.listAvailableDrivers = function listAvailableDrivers(dc) {
  return executeQuery(listAvailableDriversRef(dc));
};
