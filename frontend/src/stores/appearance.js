import { defineStore } from 'pinia';
import { store } from '@/stores/index';
// import { defaultFont, list } from '@/api/font'
import { request } from '@/utils/request';
import { setTitle, setCurrentColor } from '@/utils/utils';
const basePath = import.meta.env.VITE_API_BASE_URL;
const baseUrl = basePath + '/system/appearance/picture/';
import { isBtnShow } from '@/utils/utils';
// const { wsCache } = useCache()
export const useAppearanceStore = defineStore('appearanceStore', {
    state: () => {
        return {
            themeColor: '',
            customColor: '',
            navigateBg: '',
            navigate: '',
            mobileLogin: '',
            mobileLoginBg: '',
            help: '',
            showDoc: '0',
            showSlogan: '0',
            showAi: '0',
            showCopilot: '0',
            showAbout: '0',
            bg: '',
            login: '',
            slogan: '',
            web: '',
            name: '邮政数据分析智能体',
            foot: 'false',
            footContent: '',
            loaded: false,
            showDemoTips: false,
            demoTipsContent: '',
            fontList: [],
            pc_welcome: undefined,
            pc_welcome_desc: undefined,
        };
    },
    getters: {
        getNavigate() {
            if (this.navigate) {
                return baseUrl + this.navigate;
            }
            return null;
        },
        getMobileLogin() {
            if (this.mobileLogin) {
                return baseUrl + this.mobileLogin;
            }
            return null;
        },
        getMobileLoginBg() {
            if (this.mobileLoginBg) {
                return baseUrl + this.mobileLoginBg;
            }
            return null;
        },
        getHelp() {
            return this.help;
        },
        getThemeColor() {
            return this.themeColor;
        },
        isBlue() {
            return this.themeColor === 'blue';
        },
        getCustomColor() {
            return this.customColor;
        },
        getNavigateBg() {
            return this.navigateBg;
        },
        getBg() {
            if (this.bg) {
                return baseUrl + this.bg;
            }
            return null;
        },
        getLogin() {
            if (this.login) {
                return baseUrl + this.login;
            }
            return null;
        },
        getSlogan() {
            return this.slogan;
        },
        getWeb() {
            if (this.web) {
                return baseUrl + this.web;
            }
            return null;
        },
        getName() {
            return this.name;
        },
        getLoaded() {
            return this.loaded;
        },
        getFoot() {
            return this.foot;
        },
        getFootContent() {
            return this.footContent;
        },
        getShowDemoTips() {
            return this.showDemoTips;
        },
        getDemoTipsContent() {
            return this.demoTipsContent;
        },
        getShowAi() {
            return isBtnShow(this.showAi);
        },
        getShowCopilot() {
            return isBtnShow(this.showCopilot);
        },
        getShowSlogan() {
            return isBtnShow(this.showSlogan);
        },
        getShowDoc() {
            return isBtnShow(this.showDoc);
        },
        getShowAbout() {
            return isBtnShow(this.showAbout);
        },
    },
    actions: {
        setNavigate(data) {
            this.navigate = data;
        },
        setMobileLogin(data) {
            this.mobileLogin = data;
        },
        // async setFontList() {
        //   const res = await list()
        //   this.fontList = res || []
        // },
        // setCurrentFont(name) {
        //   const currentFont = this.fontList.find(ele => ele.name === name)
        //   if (currentFont) {
        //     let fontStyleElement = document.querySelector(`#de-custom_font${name}`)
        //     if (!fontStyleElement) {
        //       fontStyleElement = document.createElement('style')
        //       fontStyleElement.setAttribute('id', `de-custom_font${name}`)
        //       document.querySelector('head').appendChild(fontStyleElement)
        //     }
        //     fontStyleElement.innerHTML = `@font-face {
        //         font-family: '${name}';
        //         src: url(${
        //           embeddedStore.baseUrl
        //             ? (embeddedStore.baseUrl + basePath).replace('/./', '/')
        //             : basePath
        //         }/typeface/download/${currentFont.fileTransName});
        //         font-weight: normal;
        //         font-style: normal;
        //         }`
        //   }
        // },
        setMobileLoginBg(data) {
            this.mobileLoginBg = data;
        },
        setHelp(data) {
            this.help = data;
        },
        setNavigateBg(data) {
            this.navigateBg = data;
        },
        setThemeColor(data) {
            this.themeColor = data;
        },
        setCustomColor(data) {
            this.customColor = data;
        },
        setLoaded(data) {
            this.loaded = data;
        },
        async setAppearance() {
            // const desktop = wsCache.get('app.desktop')
            // if (desktop) {
            //   this.loaded = true
            //   this.community = true
            // }
            if (this.loaded) {
                return;
            }
            // defaultFont().then(res => {
            //   const [font] = res || []
            //   setDefaultFont(
            //     `${
            //       embeddedStore.baseUrl
            //         ? (embeddedStore.baseUrl + basePath).replace('/./', '/')
            //         : basePath
            //     }/typeface/download/${font?.fileTransName}`,
            //     font?.name,
            //     font?.fileTransName
            //   )
            //   function setDefaultFont(url, name, fileTransName) {
            //     let fontStyleElement = document.querySelector('#de-custom_font')
            //     if (!fontStyleElement) {
            //       fontStyleElement = document.createElement('style')
            //       fontStyleElement.setAttribute('id', 'de-custom_font')
            //       document.querySelector('head').appendChild(fontStyleElement)
            //     }
            //     fontStyleElement.innerHTML =
            //       name && fileTransName
            //         ? `@font-face {
            //           font-family: '${name}';
            //           src: url(${url});
            //           font-weight: normal;
            //           font-style: normal;
            //           }`
            //         : ''
            //     document.documentElement.style.setProperty('--de-custom_font', `${name}`)
            //     document.documentElement.style.setProperty('--van-base-font', `${name}`)
            //   }
            // })
            // if (!isDataEaseBi) {
            //   document.title = ''
            // }
            // 暂时注释掉LicenseGenerator相关代码，因为它不存在
            // const obj = LicenseGenerator.getLicense()
            // if (obj?.status !== 'valid') {
            //   setCurrentColor('#1CBA90')
            //   document.title = 'SQLBot'
            //   setLinkIcon()
            //   return
            // }
            try {
                const resData = await request.get('/system/appearance/ui');
                if (resData?.length) {
                    const data = { loaded: false };
                    resData.forEach((item) => {
                        ;
                        data[item.pkey] = item.pval;
                    });
                    this.navigate = data.navigate;
                    this.help = data.help;
                    this.showDoc = data.showDoc;
                    this.showAbout = data.showAbout;
                    this.navigateBg = data.navigateBg;
                    this.themeColor = data.themeColor;
                    this.customColor = data.customColor;
                    this.pc_welcome = data.pc_welcome;
                    this.pc_welcome_desc = data.pc_welcome_desc;
                    const currentColor = this.themeColor === 'custom' && this.customColor
                        ? this.customColor
                        : this.isBlue
                            ? '#3370ff'
                            : '#1CBA90';
                    setCurrentColor(currentColor);
                    this.bg = data.bg;
                    this.login = data.login;
                    this.slogan = data.slogan;
                    this.showSlogan = data.showSlogan;
                    this.web = data.web;
                    this.name = data.name;
                    if (this.name) {
                        document.title = this.name;
                        setTitle(this.name);
                    }
                    else {
                        document.title = '邮政数据分析智能体';
                        setTitle('邮政数据分析智能体');
                    }
                    setLinkIcon(this.web);
                }
                else {
                    setCurrentColor('#1CBA90');
                    setLinkIcon();
                }
            }
            catch (error) {
                // API不存在时使用默认值
                setCurrentColor('#1CBA90');
                setLinkIcon();
            }
            finally {
                this.loaded = true;
            }
        },
    },
});
const setLinkIcon = (linkWeb) => {
    const link = document.querySelector('link[rel="icon"]');
    if (link) {
        if (linkWeb) {
            link['href'] = baseUrl + linkWeb;
        }
        else {
            link['href'] = '/LOGO-fold.svg';
        }
    }
};
export const useAppearanceStoreWithOut = () => {
    return useAppearanceStore(store);
};
