import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css';
import App from './App.vue';
import router from './router';
import { i18n } from './i18n';
import VueDOMPurifyHTML from 'vue-dompurify-html';
import { initRequestUtils } from './utils/request';
// 为 LicenseGenerator 提供一个默认值
window.LicenseGenerator = window.LicenseGenerator || {
    generate: () => '',
    sqlbotEncrypt: (str) => {
        // 提供一个能够产生 256 字节长度密文的实现
        try {
            // 首先对字符串进行 base64 编码
            let encoded = btoa(encodeURIComponent(str));
            // 确保编码后的字符串是有效的 base64 格式
            while (encoded.length % 4 !== 0) {
                encoded += '=';
            }
            // 然后填充到 256 字节长度
            while (encoded.length < 256) {
                // 使用固定的填充字符串，确保每次生成的都是有效的 base64 编码
                encoded += btoa('padding');
            }
            // 截取前 256 个字符
            return encoded.substring(0, 256);
        }
        catch (e) {
            // 如果出错，返回一个固定长度的有效的 base64 编码字符串
            let fixedEncoded = btoa('default');
            while (fixedEncoded.length % 4 !== 0) {
                fixedEncoded += '=';
            }
            while (fixedEncoded.length < 256) {
                fixedEncoded += btoa('padding');
            }
            return fixedEncoded.substring(0, 256);
        }
    },
    getLicense: () => ({}),
    generateRouters: () => { },
};
// import 'element-plus/dist/index.css'
const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(i18n);
app.use(VueDOMPurifyHTML);
// 立即挂载应用
app.mount('#app');
// 异步初始化请求工具，不阻塞应用挂载
initRequestUtils();
