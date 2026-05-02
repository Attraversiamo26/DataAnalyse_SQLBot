import requests
import json

# API 端点
url = "http://localhost:8002/api/v1/datasource/batchUpdateFieldComments"

# 字段注释映射
field_comments = {
    "loc_from_prov": "收寄省",
    "loc_from": "收寄市",
    "loc_to_prov": "寄达省",
    "loc_to": "寄达市",
    "xl": "线路",
    "gdlc": "高德里程",
    "thismonth_fllx_new": "四象限线路类型",
    "sjjd_flag": "线路类别",
    "tkbz": "特快标准（T+N）",
    "sxj_td_flag_80": "行业时效产品80%时限水平（T+N）",
    "tkbz_td_flag_80": "特快标准对比行业80%邮件时限水平",
    "tkbz_sfall_mode_tdflag": "特快标准对比行业时限众数",
    "kbbz": "快包标准（T+N）",
    "jjj_td_flag_80": "行业非时效产品80%时限水平（T+N）",
    "kbbz_jjj_td_flag_80": "快包标准对比行业非时效80%邮件时限水平",
    "kbbz_sfall_mode_tdflag": "快包标准对比行业时限众数",
    "sfall_mode_tdflag": "行业线路时限众数",
    "tk_zzjds": "特快经转节点数",
    "sf_zzjg": "行业经转节点数",
    "tk_zzjds_sf_diff": "经转次数差异",
    "item_num_bk": "特快专递样本量（件）",
    "tk_route": "特快主要轨迹",
    "sf_route": "行业主要轨迹",
    "td_flag_diff": "投递天数差（特快-行业）",
    "spend_time_bk": "特快专递全程时限（小时）",
    "diff_spendtime_bk": "特快专递全程时限环比（11月-10月）（小时）",
    "spend_time_sf_all": "行业全程时限（小时）",
    "diff_spendtime_sf": "行业全程时限环比（11月-10月）（小时）",
    "crd_rate_bk": "特快专递次日递率",
    "diff_crdrate_bk": "特快专递次日递率环比（11月-10月）",
    "crd_rate_sf_all": "行业次日递率",
    "diff_crdrate_sf": "行业次日递率环比（11月-10月）",
    "td_flag_bk": "特快专递平均天数T+N（天）",
    "diff_tdflag_bk": "特快专递平均天数T+N环比（11月-10月）（天）",
    "td_flag_sf_all": "行业平均天数T+N（天）",
    "diff_tdflag_sf": "行业平均天数T+N环比（11月-10月）（天）",
    "sj_timespend_bk": "特快专递收寄时限（小时）",
    "diff_sjtime_bk": "特快专递收寄时限环比（11月-10月）（小时）",
    "ck_timespend_bk": "特快专递出口段时限（小时）",
    "diff_cktime_bk": "特快专递出口段时限环比（11月-10月）（小时）",
    "zz_timespend_bk": "特快专递中转段时限（小时）",
    "diff_zztime_bk": "特快专递中转段时限环比（11月-10月）（小时）",
    "jk_timespend_bk": "特快专递进口段时限（小时）",
    "diff_jktime_bk": "特快专递进口段时限环比（11月-10月）（小时）",
    "td_timespend_bk": "特快专递投递时限（小时）",
    "diff_tdtime_bk": "特快专递投递时限环比（11月-10月）（小时）",
    "item_num_sf_all": "行业样本量（件）",
    "sj_timespend_sf_all": "行业收寄时限（小时）",
    "ck_timespend_sf_all": "行业出口段时限（小时）",
    "zz_timespend_sf_all": "行业中转段时限（小时）",
    "jk_timespend_sf_all": "行业进口段时限（小时）",
    "td_timespend_sf_all": "行业投递时限（小时）",
    "crd_diff": "次日递率差（排序时限）（特快-行业）",
    "50_flag": "国家邮政局50重点城市",
    "csj_flag": "长三角",
    "zsj_flag": "珠三角",
    "hbh_flag": "环渤海",
    "czhj_flag": "长珠互寄",
    "dss_flag": "东三省",
    "zbss_flag": "中部四省",
    "cy_flag": "川渝",
    "item_all_rou": "行业2025年9月日均业务量估算值（件）",
    "item_num_yz": "邮政日均业务量",
    "gouliang_sjyy": "是否够量市场线路"
}

# 表 ID - 请根据实际情况修改
table_id = 1

# 请求数据
data = {
    "table_id": table_id,
    "field_comments": field_comments
}

# 发送请求
response = requests.post(url, json=data)

# 打印响应
print("Status Code:", response.status_code)
print("Response:", response.json())
