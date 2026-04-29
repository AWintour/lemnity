# PaymentPlanDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**enabled** | **boolean** |  | [default to undefined]
**numberOfProjects** | **number** |  | [default to undefined]
**numberOfWidgets** | **number** |  | [default to undefined]
**monthlyPrice** | **string** |  | [default to undefined]
**quarterlyPrice** | **string** |  | [default to undefined]
**yearlyPrice** | **string** |  | [default to undefined]
**paymentPlanOptions** | [**Array&lt;PaymentPlanOptionDto&gt;**](PaymentPlanOptionDto.md) |  | [default to undefined]
**includedPlanOptions** | [**Array&lt;IncludedPlanOptionDto&gt;**](IncludedPlanOptionDto.md) |  | [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]

## Example

```typescript
import { PaymentPlanDto } from './api';

const instance: PaymentPlanDto = {
    id,
    name,
    enabled,
    numberOfProjects,
    numberOfWidgets,
    monthlyPrice,
    quarterlyPrice,
    yearlyPrice,
    paymentPlanOptions,
    includedPlanOptions,
    createdAt,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
