# PaymentInfoDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**balance** | **string** |  | [default to undefined]
**paymentPlan** | [**PaymentPlanDto**](PaymentPlanDto.md) |  | [optional] [default to undefined]
**paymentPlanStartDate** | **string** |  | [default to undefined]
**paymentPlanEndDate** | **string** |  | [default to undefined]
**purchasedPaymentPlanOptions** | [**Array&lt;PaymentInfoPaymentOptionDto&gt;**](PaymentInfoPaymentOptionDto.md) |  | [default to undefined]
**usedTrialPeriod** | **boolean** |  | [default to undefined]

## Example

```typescript
import { PaymentInfoDto } from './api';

const instance: PaymentInfoDto = {
    balance,
    paymentPlan,
    paymentPlanStartDate,
    paymentPlanEndDate,
    purchasedPaymentPlanOptions,
    usedTrialPeriod,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
