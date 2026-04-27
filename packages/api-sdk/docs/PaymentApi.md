# PaymentApi

All URIs are relative to *http://localhost:3000/api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**paymentControllerGetUserBalanceAndPaymentPlan**](#paymentcontrollergetuserbalanceandpaymentplan) | **GET** /api/payment/info | |
|[**paymentControllerUpdateUserPaymentPlanAndBalance**](#paymentcontrollerupdateuserpaymentplanandbalance) | **PATCH** /api/payment/info | |

# **paymentControllerGetUserBalanceAndPaymentPlan**
> PaymentInfoResponse paymentControllerGetUserBalanceAndPaymentPlan()


### Example

```typescript
import {
    PaymentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentApi(configuration);

const { status, data } = await apiInstance.paymentControllerGetUserBalanceAndPaymentPlan();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**PaymentInfoResponse**

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

# **paymentControllerUpdateUserPaymentPlanAndBalance**
> paymentControllerUpdateUserPaymentPlanAndBalance(body)


### Example

```typescript
import {
    PaymentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentApi(configuration);

let body: object; //

const { status, data } = await apiInstance.paymentControllerUpdateUserPaymentPlanAndBalance(
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **object**|  | |


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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

