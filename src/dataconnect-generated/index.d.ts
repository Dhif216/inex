import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreatePickupRequestData {
  pickupRequest_insert: PickupRequest_Key;
}

export interface CreatePickupRequestVariables {
  customerId: UUIDString;
  desiredPickupDate: DateString;
  desiredPickupTimeWindow: string;
  pickupAddress: string;
  status: string;
}

export interface DriverRoute_Key {
  id: UUIDString;
  __typename?: 'DriverRoute_Key';
}

export interface ListAvailableDriversData {
  users: ({
    id: UUIDString;
    displayName: string;
    email: string;
    phoneNumber?: string | null;
  } & User_Key)[];
}

export interface ListPickupRequestsForCustomerData {
  pickupRequests: ({
    id: UUIDString;
    desiredPickupDate: DateString;
    desiredPickupTimeWindow: string;
    pickupAddress: string;
    status: string;
  } & PickupRequest_Key)[];
}

export interface ListPickupRequestsForCustomerVariables {
  customerId: UUIDString;
}

export interface Package_Key {
  id: UUIDString;
  __typename?: 'Package_Key';
}

export interface PickupRequest_Key {
  id: UUIDString;
  __typename?: 'PickupRequest_Key';
}

export interface RoutePickup_Key {
  driverRouteId: UUIDString;
  pickupRequestId: UUIDString;
  __typename?: 'RoutePickup_Key';
}

export interface UpdatePickupRequestStatusData {
  pickupRequest_update?: PickupRequest_Key | null;
}

export interface UpdatePickupRequestStatusVariables {
  id: UUIDString;
  status: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreatePickupRequestRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePickupRequestVariables): MutationRef<CreatePickupRequestData, CreatePickupRequestVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreatePickupRequestVariables): MutationRef<CreatePickupRequestData, CreatePickupRequestVariables>;
  operationName: string;
}
export const createPickupRequestRef: CreatePickupRequestRef;

export function createPickupRequest(vars: CreatePickupRequestVariables): MutationPromise<CreatePickupRequestData, CreatePickupRequestVariables>;
export function createPickupRequest(dc: DataConnect, vars: CreatePickupRequestVariables): MutationPromise<CreatePickupRequestData, CreatePickupRequestVariables>;

interface ListPickupRequestsForCustomerRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListPickupRequestsForCustomerVariables): QueryRef<ListPickupRequestsForCustomerData, ListPickupRequestsForCustomerVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListPickupRequestsForCustomerVariables): QueryRef<ListPickupRequestsForCustomerData, ListPickupRequestsForCustomerVariables>;
  operationName: string;
}
export const listPickupRequestsForCustomerRef: ListPickupRequestsForCustomerRef;

export function listPickupRequestsForCustomer(vars: ListPickupRequestsForCustomerVariables): QueryPromise<ListPickupRequestsForCustomerData, ListPickupRequestsForCustomerVariables>;
export function listPickupRequestsForCustomer(dc: DataConnect, vars: ListPickupRequestsForCustomerVariables): QueryPromise<ListPickupRequestsForCustomerData, ListPickupRequestsForCustomerVariables>;

interface UpdatePickupRequestStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePickupRequestStatusVariables): MutationRef<UpdatePickupRequestStatusData, UpdatePickupRequestStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdatePickupRequestStatusVariables): MutationRef<UpdatePickupRequestStatusData, UpdatePickupRequestStatusVariables>;
  operationName: string;
}
export const updatePickupRequestStatusRef: UpdatePickupRequestStatusRef;

export function updatePickupRequestStatus(vars: UpdatePickupRequestStatusVariables): MutationPromise<UpdatePickupRequestStatusData, UpdatePickupRequestStatusVariables>;
export function updatePickupRequestStatus(dc: DataConnect, vars: UpdatePickupRequestStatusVariables): MutationPromise<UpdatePickupRequestStatusData, UpdatePickupRequestStatusVariables>;

interface ListAvailableDriversRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAvailableDriversData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAvailableDriversData, undefined>;
  operationName: string;
}
export const listAvailableDriversRef: ListAvailableDriversRef;

export function listAvailableDrivers(): QueryPromise<ListAvailableDriversData, undefined>;
export function listAvailableDrivers(dc: DataConnect): QueryPromise<ListAvailableDriversData, undefined>;

