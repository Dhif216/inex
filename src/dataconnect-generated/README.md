# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListPickupRequestsForCustomer*](#listpickuprequestsforcustomer)
  - [*ListAvailableDrivers*](#listavailabledrivers)
- [**Mutations**](#mutations)
  - [*CreatePickupRequest*](#createpickuprequest)
  - [*UpdatePickupRequestStatus*](#updatepickuprequeststatus)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListPickupRequestsForCustomer
You can execute the `ListPickupRequestsForCustomer` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listPickupRequestsForCustomer(vars: ListPickupRequestsForCustomerVariables): QueryPromise<ListPickupRequestsForCustomerData, ListPickupRequestsForCustomerVariables>;

interface ListPickupRequestsForCustomerRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListPickupRequestsForCustomerVariables): QueryRef<ListPickupRequestsForCustomerData, ListPickupRequestsForCustomerVariables>;
}
export const listPickupRequestsForCustomerRef: ListPickupRequestsForCustomerRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPickupRequestsForCustomer(dc: DataConnect, vars: ListPickupRequestsForCustomerVariables): QueryPromise<ListPickupRequestsForCustomerData, ListPickupRequestsForCustomerVariables>;

interface ListPickupRequestsForCustomerRef {
  ...
  (dc: DataConnect, vars: ListPickupRequestsForCustomerVariables): QueryRef<ListPickupRequestsForCustomerData, ListPickupRequestsForCustomerVariables>;
}
export const listPickupRequestsForCustomerRef: ListPickupRequestsForCustomerRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPickupRequestsForCustomerRef:
```typescript
const name = listPickupRequestsForCustomerRef.operationName;
console.log(name);
```

### Variables
The `ListPickupRequestsForCustomer` query requires an argument of type `ListPickupRequestsForCustomerVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListPickupRequestsForCustomerVariables {
  customerId: UUIDString;
}
```
### Return Type
Recall that executing the `ListPickupRequestsForCustomer` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPickupRequestsForCustomerData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListPickupRequestsForCustomerData {
  pickupRequests: ({
    id: UUIDString;
    desiredPickupDate: DateString;
    desiredPickupTimeWindow: string;
    pickupAddress: string;
    status: string;
  } & PickupRequest_Key)[];
}
```
### Using `ListPickupRequestsForCustomer`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPickupRequestsForCustomer, ListPickupRequestsForCustomerVariables } from '@dataconnect/generated';

// The `ListPickupRequestsForCustomer` query requires an argument of type `ListPickupRequestsForCustomerVariables`:
const listPickupRequestsForCustomerVars: ListPickupRequestsForCustomerVariables = {
  customerId: ..., 
};

// Call the `listPickupRequestsForCustomer()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPickupRequestsForCustomer(listPickupRequestsForCustomerVars);
// Variables can be defined inline as well.
const { data } = await listPickupRequestsForCustomer({ customerId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPickupRequestsForCustomer(dataConnect, listPickupRequestsForCustomerVars);

console.log(data.pickupRequests);

// Or, you can use the `Promise` API.
listPickupRequestsForCustomer(listPickupRequestsForCustomerVars).then((response) => {
  const data = response.data;
  console.log(data.pickupRequests);
});
```

### Using `ListPickupRequestsForCustomer`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPickupRequestsForCustomerRef, ListPickupRequestsForCustomerVariables } from '@dataconnect/generated';

// The `ListPickupRequestsForCustomer` query requires an argument of type `ListPickupRequestsForCustomerVariables`:
const listPickupRequestsForCustomerVars: ListPickupRequestsForCustomerVariables = {
  customerId: ..., 
};

// Call the `listPickupRequestsForCustomerRef()` function to get a reference to the query.
const ref = listPickupRequestsForCustomerRef(listPickupRequestsForCustomerVars);
// Variables can be defined inline as well.
const ref = listPickupRequestsForCustomerRef({ customerId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPickupRequestsForCustomerRef(dataConnect, listPickupRequestsForCustomerVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.pickupRequests);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.pickupRequests);
});
```

## ListAvailableDrivers
You can execute the `ListAvailableDrivers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAvailableDrivers(): QueryPromise<ListAvailableDriversData, undefined>;

interface ListAvailableDriversRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAvailableDriversData, undefined>;
}
export const listAvailableDriversRef: ListAvailableDriversRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAvailableDrivers(dc: DataConnect): QueryPromise<ListAvailableDriversData, undefined>;

interface ListAvailableDriversRef {
  ...
  (dc: DataConnect): QueryRef<ListAvailableDriversData, undefined>;
}
export const listAvailableDriversRef: ListAvailableDriversRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAvailableDriversRef:
```typescript
const name = listAvailableDriversRef.operationName;
console.log(name);
```

### Variables
The `ListAvailableDrivers` query has no variables.
### Return Type
Recall that executing the `ListAvailableDrivers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAvailableDriversData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAvailableDriversData {
  users: ({
    id: UUIDString;
    displayName: string;
    email: string;
    phoneNumber?: string | null;
  } & User_Key)[];
}
```
### Using `ListAvailableDrivers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAvailableDrivers } from '@dataconnect/generated';


// Call the `listAvailableDrivers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAvailableDrivers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAvailableDrivers(dataConnect);

console.log(data.users);

// Or, you can use the `Promise` API.
listAvailableDrivers().then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `ListAvailableDrivers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAvailableDriversRef } from '@dataconnect/generated';


// Call the `listAvailableDriversRef()` function to get a reference to the query.
const ref = listAvailableDriversRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAvailableDriversRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreatePickupRequest
You can execute the `CreatePickupRequest` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createPickupRequest(vars: CreatePickupRequestVariables): MutationPromise<CreatePickupRequestData, CreatePickupRequestVariables>;

interface CreatePickupRequestRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePickupRequestVariables): MutationRef<CreatePickupRequestData, CreatePickupRequestVariables>;
}
export const createPickupRequestRef: CreatePickupRequestRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createPickupRequest(dc: DataConnect, vars: CreatePickupRequestVariables): MutationPromise<CreatePickupRequestData, CreatePickupRequestVariables>;

interface CreatePickupRequestRef {
  ...
  (dc: DataConnect, vars: CreatePickupRequestVariables): MutationRef<CreatePickupRequestData, CreatePickupRequestVariables>;
}
export const createPickupRequestRef: CreatePickupRequestRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createPickupRequestRef:
```typescript
const name = createPickupRequestRef.operationName;
console.log(name);
```

### Variables
The `CreatePickupRequest` mutation requires an argument of type `CreatePickupRequestVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreatePickupRequestVariables {
  customerId: UUIDString;
  desiredPickupDate: DateString;
  desiredPickupTimeWindow: string;
  pickupAddress: string;
  status: string;
}
```
### Return Type
Recall that executing the `CreatePickupRequest` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreatePickupRequestData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreatePickupRequestData {
  pickupRequest_insert: PickupRequest_Key;
}
```
### Using `CreatePickupRequest`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createPickupRequest, CreatePickupRequestVariables } from '@dataconnect/generated';

// The `CreatePickupRequest` mutation requires an argument of type `CreatePickupRequestVariables`:
const createPickupRequestVars: CreatePickupRequestVariables = {
  customerId: ..., 
  desiredPickupDate: ..., 
  desiredPickupTimeWindow: ..., 
  pickupAddress: ..., 
  status: ..., 
};

// Call the `createPickupRequest()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createPickupRequest(createPickupRequestVars);
// Variables can be defined inline as well.
const { data } = await createPickupRequest({ customerId: ..., desiredPickupDate: ..., desiredPickupTimeWindow: ..., pickupAddress: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createPickupRequest(dataConnect, createPickupRequestVars);

console.log(data.pickupRequest_insert);

// Or, you can use the `Promise` API.
createPickupRequest(createPickupRequestVars).then((response) => {
  const data = response.data;
  console.log(data.pickupRequest_insert);
});
```

### Using `CreatePickupRequest`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createPickupRequestRef, CreatePickupRequestVariables } from '@dataconnect/generated';

// The `CreatePickupRequest` mutation requires an argument of type `CreatePickupRequestVariables`:
const createPickupRequestVars: CreatePickupRequestVariables = {
  customerId: ..., 
  desiredPickupDate: ..., 
  desiredPickupTimeWindow: ..., 
  pickupAddress: ..., 
  status: ..., 
};

// Call the `createPickupRequestRef()` function to get a reference to the mutation.
const ref = createPickupRequestRef(createPickupRequestVars);
// Variables can be defined inline as well.
const ref = createPickupRequestRef({ customerId: ..., desiredPickupDate: ..., desiredPickupTimeWindow: ..., pickupAddress: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createPickupRequestRef(dataConnect, createPickupRequestVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.pickupRequest_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.pickupRequest_insert);
});
```

## UpdatePickupRequestStatus
You can execute the `UpdatePickupRequestStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updatePickupRequestStatus(vars: UpdatePickupRequestStatusVariables): MutationPromise<UpdatePickupRequestStatusData, UpdatePickupRequestStatusVariables>;

interface UpdatePickupRequestStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePickupRequestStatusVariables): MutationRef<UpdatePickupRequestStatusData, UpdatePickupRequestStatusVariables>;
}
export const updatePickupRequestStatusRef: UpdatePickupRequestStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updatePickupRequestStatus(dc: DataConnect, vars: UpdatePickupRequestStatusVariables): MutationPromise<UpdatePickupRequestStatusData, UpdatePickupRequestStatusVariables>;

interface UpdatePickupRequestStatusRef {
  ...
  (dc: DataConnect, vars: UpdatePickupRequestStatusVariables): MutationRef<UpdatePickupRequestStatusData, UpdatePickupRequestStatusVariables>;
}
export const updatePickupRequestStatusRef: UpdatePickupRequestStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updatePickupRequestStatusRef:
```typescript
const name = updatePickupRequestStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdatePickupRequestStatus` mutation requires an argument of type `UpdatePickupRequestStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdatePickupRequestStatusVariables {
  id: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `UpdatePickupRequestStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdatePickupRequestStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdatePickupRequestStatusData {
  pickupRequest_update?: PickupRequest_Key | null;
}
```
### Using `UpdatePickupRequestStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updatePickupRequestStatus, UpdatePickupRequestStatusVariables } from '@dataconnect/generated';

// The `UpdatePickupRequestStatus` mutation requires an argument of type `UpdatePickupRequestStatusVariables`:
const updatePickupRequestStatusVars: UpdatePickupRequestStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updatePickupRequestStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updatePickupRequestStatus(updatePickupRequestStatusVars);
// Variables can be defined inline as well.
const { data } = await updatePickupRequestStatus({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updatePickupRequestStatus(dataConnect, updatePickupRequestStatusVars);

console.log(data.pickupRequest_update);

// Or, you can use the `Promise` API.
updatePickupRequestStatus(updatePickupRequestStatusVars).then((response) => {
  const data = response.data;
  console.log(data.pickupRequest_update);
});
```

### Using `UpdatePickupRequestStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updatePickupRequestStatusRef, UpdatePickupRequestStatusVariables } from '@dataconnect/generated';

// The `UpdatePickupRequestStatus` mutation requires an argument of type `UpdatePickupRequestStatusVariables`:
const updatePickupRequestStatusVars: UpdatePickupRequestStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updatePickupRequestStatusRef()` function to get a reference to the mutation.
const ref = updatePickupRequestStatusRef(updatePickupRequestStatusVars);
// Variables can be defined inline as well.
const ref = updatePickupRequestStatusRef({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updatePickupRequestStatusRef(dataConnect, updatePickupRequestStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.pickupRequest_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.pickupRequest_update);
});
```

