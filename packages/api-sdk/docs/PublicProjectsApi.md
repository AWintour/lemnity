# PublicProjectsApi

All URIs are relative to *http://localhost:3000/api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**publicProjectControllerFindProjectWidgetIds**](#publicprojectcontrollerfindprojectwidgetids) | **GET** /api/public/projects/{id} | |

# **publicProjectControllerFindProjectWidgetIds**
> publicProjectControllerFindProjectWidgetIds()


### Example

```typescript
import {
    PublicProjectsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PublicProjectsApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.publicProjectControllerFindProjectWidgetIds(
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

