# PaymentApi

All URIs are relative to *http://localhost:3000/api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**paymentControllerGetUserPaymentInfo**](#paymentcontrollergetuserpaymentinfo) | **GET** /api/payment/info | |
|[**paymentControllerSelectAllEnabledPaymentPlans**](#paymentcontrollerselectallenabledpaymentplans) | **GET** /api/payment/plans | |

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

