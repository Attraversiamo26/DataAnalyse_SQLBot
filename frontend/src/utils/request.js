// src/services/request.ts
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { getLocale } from './utils';
import JSONBig from 'json-bigint';
// import { i18n } from '@/i18n'
// const t = i18n.global.t
// 延迟导入，避免在模块级别直接调用组合式API
let assistantStore;
let wsCache;
let router;
// 初始化函数，在应用启动后调用
const initRequestUtils = async () => {
    const { useCache } = await import('@/utils/useCache');
    const { useAssistantStore } = await import('@/stores/assistant');
    const { useRouter } = await import('vue-router');
    assistantStore = useAssistantStore();
    wsCache = useCache().wsCache;
    router = useRouter();
};
// 导出初始化函数
export { initRequestUtils };
class HttpService {
    constructor(config) {
        Object.defineProperty(this, "instance", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.instance = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL,
            timeout: 100000,
            headers: {
                'Content-Type': 'application/json',
                ...config?.headers,
            },
            // add transformResponse to bigint
            transformResponse: [
                function (data) {
                    try {
                        return JSONBig.parse(data); // use JSON-bigint
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    }
                    catch (e) {
                        try {
                            return JSON.parse(data);
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        }
                        catch (parseError) {
                            return data;
                        }
                    }
                },
            ],
            ...config,
        });
        this.setupInterceptors();
    }
    /* private cancelCurrentRequest(message: string) {
      this.cancelTokenSource.cancel(message)
      this.cancelTokenSource = axios.CancelToken.source()
    } */
    setupInterceptors() {
        // Request interceptor
        this.instance.interceptors.request.use(async (config) => {
            // Add auth token, except for system setting paths
            if (wsCache) {
                const token = wsCache.get('user.token');
                if (token && config.headers) {
                    // For default token, don't add Bearer prefix
                    if (token === 'default-token') {
                        config.headers['X-SQLBOT-TOKEN'] = token;
                    }
                    else {
                        config.headers['X-SQLBOT-TOKEN'] = `Bearer ${token}`;
                    }
                }
            }
            if (assistantStore && assistantStore.getToken) {
                const prefix = assistantStore.getType === 4 ? 'Embedded ' : 'Assistant ';
                config.headers['X-SQLBOT-ASSISTANT-TOKEN'] = `${prefix}${assistantStore.getToken}`;
                if (config.headers['X-SQLBOT-TOKEN'])
                    delete config.headers['X-SQLBOT-TOKEN'];
                if (assistantStore.getType &&
                    !!(assistantStore.getType % 2) &&
                    assistantStore.getCertificate) {
                    if (
                    /* (config.method?.toLowerCase() === 'get' && /\/chat\/\d+$/.test(config.url || '')) || */
                    /^\/chat/.test(config.url || '') ||
                        config.url?.includes('/system/assistant/ds')) {
                        await assistantStore.refreshCertificate(config.url || '');
                    }
                    config.headers['X-SQLBOT-ASSISTANT-CERTIFICATE'] = btoa(encodeURIComponent(assistantStore.getCertificate));
                }
                if (!assistantStore.getType || assistantStore.getType === 2) {
                    config.headers['X-SQLBOT-ASSISTANT-ONLINE'] = assistantStore.getOnline;
                }
                if (assistantStore.getHostOrigin) {
                    config.headers['X-SQLBOT-HOST-ORIGIN'] = assistantStore.getHostOrigin;
                }
            }
            const locale = getLocale();
            if (locale) {
                /* const mapping = {
                  'zh-CN': 'zh-CN',
                  en: 'en-US',
                  tw: 'zh-TW',
                } */
                /* const val = mapping[locale] || locale */
                config.headers['Accept-Language'] = locale;
            }
            if (config.url?.includes('/xpack_static/') && config.baseURL) {
                config.baseURL = config.baseURL.replace('/api/v1', '');
                // Skip auth for xpack_static requests
                return config;
            }
            /* try {
              const request_key = LicenseGenerator.generate()
              config.headers['X-SQLBOT-KEY'] = request_key
            } catch (e: any) {
              if (e?.message?.includes('offline')) {
                this.cancelCurrentRequest('license-key error detected')
                showLicenseKeyError()
              }
            } */
            // Request logging
            // console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`)
            return config;
        }, (error) => {
            return Promise.reject(error);
        });
        // Response interceptor
        this.instance.interceptors.response.use((response) => {
            // console.log(`[Response] ${response.config.url}`, response.data)
            // Return raw response if configured
            if (response.config.requestOptions?.rawResponse) {
                return response;
            }
            // Handle business logic
            /* if (response.data?.success !== true) {
              return Promise.reject(response.data)
            } */
            if (response.data?.code === 0) {
                return response.data.data;
            }
            else if (response.data?.code) {
                return Promise.reject(response.data);
            }
            return response.data;
        }, async (error) => {
            const config = error.config;
            const requestOptions = config?.requestOptions || {};
            // Retry logic for specific status codes
            const shouldRetry = error.response?.status === 502 &&
                (config.__retryCount || 0) < (requestOptions.retryCount || 3);
            if (shouldRetry) {
                config.__retryCount = (config.__retryCount || 0) + 1;
                // Exponential backoff
                await new Promise((resolve) => setTimeout(resolve, 1000 * (config.__retryCount || 1)));
                return this.instance.request(config);
            }
            // Unified error handling
            if (!requestOptions.customError && !requestOptions.silent) {
                this.handleError(error);
            }
            return Promise.reject(error);
        });
    }
    handleError(error) {
        let errorMessage = 'Request error';
        if (error.response) {
            switch (error.response.status) {
                case 400:
                    errorMessage = 'Invalid request parameters';
                    break;
                case 401:
                    errorMessage = error.response?.data
                        ? error.response.data.toString()
                        : 'Unauthorized, please login again';
                    // Redirect to login page if needed
                    if (assistantStore && assistantStore.getAssistant) {
                        if (wsCache) {
                            wsCache.delete('user.token');
                        }
                        if (router?.push) {
                            router.push(`/401?title=${encodeURIComponent(errorMessage)}`);
                        }
                        else {
                            window.location.href = `/#/401?title=${encodeURIComponent(errorMessage)}`;
                        }
                        return;
                    }
                    ElMessage({
                        message: errorMessage,
                        type: 'error',
                        showClose: true,
                    });
                    setTimeout(() => {
                        if (wsCache) {
                            wsCache.delete('user.token');
                        }
                        window.location.reload();
                    }, 2000);
                    return;
                // break
                case 403:
                    errorMessage = 'Access denied';
                    break;
                case 404:
                    errorMessage = 'Resource not found';
                    break;
                case 500:
                    errorMessage = 'Server error';
                    break;
                default:
                    errorMessage = `Server responded with error: ${error.response.status}`;
            }
            if (error?.response?.data) {
                // 安全地处理 error.response.data，可能是对象、字符串或其他类型
                const responseData = error.response.data;
                if (typeof responseData === 'string') {
                    errorMessage = responseData;
                }
                else if (responseData.detail) {
                    errorMessage = responseData.detail;
                }
                else if (responseData.message) {
                    errorMessage = responseData.message;
                }
                else {
                    try {
                        errorMessage = JSON.stringify(responseData);
                    }
                    catch {
                        errorMessage = 'Unknown error format';
                    }
                }
            }
        }
        else if (error.request) {
            errorMessage = 'No response from server';
        }
        else if (axios.isCancel(error)) {
            errorMessage = 'Request canceled';
            return; // Skip showing cancel messages
        }
        else {
            errorMessage = error['message'] || 'Unknown error';
        }
        // Show error using UI library (e.g., Element Plus, Ant Design)
        console.error(errorMessage);
        /* if (errorMessage?.includes('Invalid license key salt')) {
          showLicenseKeyError()
        } */
        // ElMessage.error(errorMessage)
        ElMessage({
            message: errorMessage,
            type: 'error',
            showClose: true,
        });
    }
    // Base request method
    request(config) {
        return this.instance.request({
            ...config,
        });
    }
    // GET request
    get(url, config) {
        return this.request({ ...config, method: 'GET', url });
    }
    // POST request
    post(url, data, config) {
        return this.request({ ...config, method: 'POST', url, data });
    }
    async fetchStream(url, data, controller) {
        const heads = {
            'Content-Type': 'application/json',
        };
        if (wsCache) {
            const token = wsCache.get('user.token');
            if (token) {
                // For default token, don't add Bearer prefix
                if (token === 'default-token') {
                    heads['X-SQLBOT-TOKEN'] = token;
                }
                else {
                    heads['X-SQLBOT-TOKEN'] = `Bearer ${token}`;
                }
            }
        }
        if (assistantStore && assistantStore.getToken) {
            const prefix = assistantStore.getType === 4 ? 'Embedded ' : 'Assistant ';
            heads['X-SQLBOT-ASSISTANT-TOKEN'] = `${prefix}${assistantStore.getToken}`;
            if (heads['X-SQLBOT-TOKEN'])
                delete heads['X-SQLBOT-TOKEN'];
            if (assistantStore.getType &&
                !!(assistantStore.getType % 2) &&
                assistantStore.getCertificate) {
                try {
                    await assistantStore.refreshCertificate(url);
                    heads['X-SQLBOT-ASSISTANT-CERTIFICATE'] = btoa(encodeURIComponent(assistantStore.getCertificate));
                }
                catch (error) {
                    console.error('Failed to refresh certificate:', error);
                }
            }
            if (assistantStore.getHostOrigin) {
                heads['X-SQLBOT-HOST-ORIGIN'] = assistantStore.getHostOrigin;
            }
            if (!assistantStore.getType || assistantStore.getType === 2) {
                heads['X-SQLBOT-ASSISTANT-ONLINE'] = assistantStore.getOnline;
            }
        }
        /* try {
          const request_key = LicenseGenerator.generate()
          heads['X-SQLBOT-KEY'] = request_key
        } catch (e: any) {
          if (e?.message?.includes('offline')) {
            controller?.abort('license-key error detected')
            showLicenseKeyError()
          }
        } */
        const real_url = import.meta.env.VITE_API_BASE_URL;
        return fetch(real_url + url, {
            method: 'POST',
            headers: heads,
            body: JSON.stringify(data),
            signal: controller?.signal,
        });
    }
    // PUT request
    put(url, data, config) {
        return this.request({ ...config, method: 'PUT', url, data });
    }
    // DELETE request
    delete(url, config) {
        return this.request({ ...config, method: 'DELETE', url });
    }
    // PATCH request
    patch(url, data, config) {
        return this.request({ ...config, method: 'PATCH', url, data });
    }
    // File upload
    upload(url, file, fieldName = 'file', config) {
        const formData = new FormData();
        formData.append(fieldName, file);
        return this.post(url, formData, {
            headers: {}, // 不要手动设置 Content-Type，让浏览器自动处理
            ...config,
        });
    }
    // Download file
    download(url, config) {
        return this.request({
            ...config,
            method: 'GET',
            url,
            responseType: 'blob',
        });
    }
    loadRemoteScript(url, id, cb) {
        if (!url) {
            return Promise.reject(new Error('URL is required to load remote script'));
        }
        if (id && document.getElementById(id)) {
            return Promise.resolve(document.getElementById(id));
        }
        if (url.startsWith('/')) {
            const real_url = import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '');
            url = real_url + url;
        }
        return new Promise((resolve, reject) => {
            // 改用传统的script标签加载方式
            const script = document.createElement('script');
            script.src = url;
            script.id = id || `remote-script-${Date.now()}`;
            script.onload = () => {
                if (cb)
                    cb();
                resolve(script);
            };
            script.onerror = (error) => {
                console.error(`Failed to load script from ${url}:`, error);
                reject(new Error(`Failed to load script from ${url}`));
            };
            document.head.appendChild(script);
        });
    }
}
// Create singleton instance
export const request = new HttpService({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});
/*
const showLicenseKeyError = (msg?: string) => {
  ElMessageBox.confirm(t('license.error_tips'), {
    confirmButtonType: 'primary',
    tip: msg || t('license.offline_tips'),
    confirmButtonText: t('common.refresh'),
    cancelButtonText: t('common.cancel'),
    customClass: 'confirm-no_icon',
    autofocus: false,
    callback: (value: string) => {
      if (value === 'confirm') {
        window.location.reload()
      }
    },
  })
}
 */
