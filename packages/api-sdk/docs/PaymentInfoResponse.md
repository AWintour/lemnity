# PaymentInfoResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**balance** | **number** |  | [default to undefined]
**paymentPlan** | [**Array&lt;PaymentPlanDto&gt;**](PaymentPlanDto.md) |  | [optional] [default to undefined]
**paymentPlanStartDate** | **string** |  | [default to undefined]
**paymentPlanEndDate** | **string** |  | [default to undefined]
**purchasedPaymentPlanOptions** | **string** |  | [default to undefined]
**usedTrialPeriod** | **boolean** |  | [default to undefined]

## Example

```typescript
import { PaymentInfoResponse } from './api';

const instance: PaymentInfoResponse = {
    balance,
    paymentPlan,
    paymentPlanStartDate,
    paymentPlanEndDate,
    purchasedPaymentPlanOptions,
    usedTrialPeriod,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
