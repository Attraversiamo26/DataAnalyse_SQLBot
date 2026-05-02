import pandas as pd
import math
import numpy as np

FIELD_TYPE_MAP = {
    'int64': 'int',
    'int32': 'int',
    'float64': 'float',
    'float32': 'float',
    'datetime64': 'datetime',
    'datetime64[ns]': 'datetime',
    'object': 'string',
    'string': 'string',
    'bool': 'string',
}

USER_TYPE_TO_PANDAS = {
    'int': 'int64',
    'float': 'float64',
    'datetime': 'datetime64[ns]',
    'string': 'string',
}


def infer_field_type(dtype) -> str:
    dtype_str = str(dtype)
    return FIELD_TYPE_MAP.get(dtype_str, 'string')


def sanitize_for_json(obj):
    """
    处理数据以兼容 JSON 序列化
    """
    if isinstance(obj, float):
        if math.isinf(obj) or math.isnan(obj):
            return None
        return obj
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        if math.isinf(obj) or math.isnan(obj):
            return None
        return float(obj)
    elif pd.isna(obj):
        return None
    return obj


def parse_excel_preview(save_path: str, max_rows: int = 10):
    sheets_data = []
    if save_path.endswith(".csv"):
        df = pd.read_csv(save_path, engine='c')
        fields = []
        for col in df.columns:
            fields.append({
                "fieldName": col,
                "fieldType": infer_field_type(df[col].dtype)
            })
        # 转换数据并清理
        preview_data = []
        for _, row in df.head(max_rows).iterrows():
            cleaned_row = {}
            for col in df.columns:
                cleaned_row[col] = sanitize_for_json(row[col])
            preview_data.append(cleaned_row)
        sheets_data.append({
            "sheetName": "Sheet1",
            "fields": fields,
            "data": preview_data,
            "rows": len(df)
        })
    else:
        sheet_names = pd.ExcelFile(save_path).sheet_names
        for sheet_name in sheet_names:
            df = pd.read_excel(save_path, sheet_name=sheet_name, engine='calamine')
            fields = []
            for col in df.columns:
                fields.append({
                    "fieldName": col,
                    "fieldType": infer_field_type(df[col].dtype)
                })
            # 转换数据并清理
            preview_data = []
            for _, row in df.head(max_rows).iterrows():
                cleaned_row = {}
                for col in df.columns:
                    cleaned_row[col] = sanitize_for_json(row[col])
                preview_data.append(cleaned_row)
            sheets_data.append({
                "sheetName": sheet_name,
                "fields": fields,
                "data": preview_data,
                "rows": len(df)
            })
    return sheets_data
