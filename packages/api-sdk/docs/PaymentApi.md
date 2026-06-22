# PaymentApi

All URIs are relative to *http://localhost:3000/api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**paymentControllerCheckForPaymentUpdates**](#paymentcontrollercheckforpaymentupdates) | **GET** /api/payment/check/{id} | |
|[**paymentControllerCreateYooMoneyPayment**](#paymentcontrollercreateyoomoneypayment) | **POST** /api/payment/create | |
|[**paymentControllerDeletePayment**](#paymentcontrollerdeletepayment) | **DELETE** /api/payment/{id} | |
|[**paymentControllerGetPaymentPlan**](#paymentcontrollergetpaymentplan) | **GET** /api/payment/plans/{id} | |
|[**paymentControllerGetPromo**](#paymentcontrollergetpromo) | **GET** /api/payment/promo/{promo} | |
|[**paymentControllerGetTodaysPendingPayments**](#paymentcontrollergettodayspendingpayments) | **GET** /api/payment/pending | |
|[**paymentControllerGetUserPaymentInfo**](#paymentcontrollergetuserpaymentinfo) | **GET** /api/payment/info | |
|[**paymentControllerSelectAllEnabledPaymentPlans**](#paymentcontrollerselectallenabledpaymentplans) | **GET** /api/payment/plans | |
|[**paymentControllerUpdateUserPaymentInfo**](#paymentcontrollerupdateuserpaymentinfo) | **POST** /api/payment/update | |

# **paymentControllerCheckForPaymentUpdates**
> paymentControllerCheckForPaymentUpdates()


### Example

```typescript
import {
    PaymentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.paymentControllerCheckForPaymentUpdates(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **paymentControllerCreateYooMoneyPayment**
> paymentControllerCreateYooMoneyPayment(createYooMoneyPaymentDto)


### Example

```typescript
import {
    PaymentApi,
    Configuration,
    CreateYooMoneyPaymentDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentApi(configuration);

let createYooMoneyPaymentDto: CreateYooMoneyPaymentDto; //

const { status, data } = await apiInstance.paymentControllerCreateYooMoneyPayment(
    createYooMoneyPaymentDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createYooMoneyPaymentDto** | **CreateYooMoneyPaymentDto**|  | |


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **paymentControllerDeletePayment**
> paymentControllerDeletePayment()


### Example

```typescript
import {
    PaymentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.paymentControllerDeletePayment(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **paymentControllerGetPaymentPlan**
> PaymentPlanDto paymentControllerGetPaymentPlan()


### Example

```typescript
import {
    PaymentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.paymentControllerGetPaymentPlan(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PaymentPlanDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **paymentControllerGetPromo**
> PromoDto paymentControllerGetPromo()


### Example

```typescript
import {
    PaymentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentApi(configuration);

let promo: string; // (default to undefined)

const { status, data } = await apiInstance.paymentControllerGetPromo(
    promo
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **promo** | [**string**] |  | defaults to undefined|


### Return type

**PromoDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **paymentControllerGetTodaysPendingPayments**
> paymentControllerGetTodaysPendingPayments()


### Example

```typescript
import {
    PaymentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentApi(configuration);

const { status, data } = await apiInstance.paymentControllerGetTodaysPendingPayments();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **paymentControllerGetUserPaymentInfo**
> PaymentInfoDto paymentControllerGetUserPaymentInfo()


### Example

```typescript
import {
    PaymentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentApi(configuration);

const { status, data } = await apiInstance.paymentControllerGetUserPaymentInfo();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**PaymentInfoDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **paymentControllerSelectAllEnabledPaymentPlans**
> PaymentPlanDto paymentControllerSelectAllEnabledPaymentPlans()


### Example

```typescript
import {
    PaymentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentApi(configuration);

const { status, data } = await apiInstance.paymentControllerSelectAllEnabledPaymentPlans();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**PaymentPlanDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **paymentControllerUpdateUserPaymentInfo**
> paymentControllerUpdateUserPaymentInfo(updateUserPaymentInfoDto)


### Example

```typescript
import {
    PaymentApi,
    Configuration,
    UpdateUserPaymentInfoDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentApi(configuration);

let updateUserPaymentInfoDto: UpdateUserPaymentInfoDto; //

const { status, data } = await apiInstance.paymentControllerUpdateUserPaymentInfo(
    updateUserPaymentInfoDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateUserPaymentInfoDto** | **UpdateUserPaymentInfoDto**|  | |


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

