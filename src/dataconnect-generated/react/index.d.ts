import { CreatePickupRequestData, CreatePickupRequestVariables, ListPickupRequestsForCustomerData, ListPickupRequestsForCustomerVariables, UpdatePickupRequestStatusData, UpdatePickupRequestStatusVariables, ListAvailableDriversData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreatePickupRequest(options?: useDataConnectMutationOptions<CreatePickupRequestData, FirebaseError, CreatePickupRequestVariables>): UseDataConnectMutationResult<CreatePickupRequestData, CreatePickupRequestVariables>;
export function useCreatePickupRequest(dc: DataConnect, options?: useDataConnectMutationOptions<CreatePickupRequestData, FirebaseError, CreatePickupRequestVariables>): UseDataConnectMutationResult<CreatePickupRequestData, CreatePickupRequestVariables>;

export function useListPickupRequestsForCustomer(vars: ListPickupRequestsForCustomerVariables, options?: useDataConnectQueryOptions<ListPickupRequestsForCustomerData>): UseDataConnectQueryResult<ListPickupRequestsForCustomerData, ListPickupRequestsForCustomerVariables>;
export function useListPickupRequestsForCustomer(dc: DataConnect, vars: ListPickupRequestsForCustomerVariables, options?: useDataConnectQueryOptions<ListPickupRequestsForCustomerData>): UseDataConnectQueryResult<ListPickupRequestsForCustomerData, ListPickupRequestsForCustomerVariables>;

export function useUpdatePickupRequestStatus(options?: useDataConnectMutationOptions<UpdatePickupRequestStatusData, FirebaseError, UpdatePickupRequestStatusVariables>): UseDataConnectMutationResult<UpdatePickupRequestStatusData, UpdatePickupRequestStatusVariables>;
export function useUpdatePickupRequestStatus(dc: DataConnect, options?: useDataConnectMutationOptions<UpdatePickupRequestStatusData, FirebaseError, UpdatePickupRequestStatusVariables>): UseDataConnectMutationResult<UpdatePickupRequestStatusData, UpdatePickupRequestStatusVariables>;

export function useListAvailableDrivers(options?: useDataConnectQueryOptions<ListAvailableDriversData>): UseDataConnectQueryResult<ListAvailableDriversData, undefined>;
export function useListAvailableDrivers(dc: DataConnect, options?: useDataConnectQueryOptions<ListAvailableDriversData>): UseDataConnectQueryResult<ListAvailableDriversData, undefined>;
