import pandas as pd
import numpy as np
import json
import matplotlib.pyplot as plt
import io
import base64
import re
from typing import Dict, Any, List, Optional, Set

plt.rcParams['font.sans-serif'] = ['SimHei', 'Arial Unicode MS', 'DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False

class AnalysisTools:
    """数据分析工具类"""
    
    @staticmethod
    def descriptive_analysis(df: pd.DataFrame, columns: List[str]) -> Dict[str, Any]:
        """描述性统计分析"""
        print(f"执行描述性统计分析，列: {columns}")
        result = {
            "analysis_type": "descriptive",
            "columns": columns,
            "stats": {},
            "charts": {}
        }
        
        for col in columns:
            if col in df.columns:
                print(f"分析列: {col}")
                if pd.api.types.is_numeric_dtype(df[col]):
                    print(f"列 {col} 是数值类型")
                    stats = df[col].describe().to_dict()
                    result["stats"][col] = stats
                    print(f"生成的统计信息: {stats.keys()}")
                    
                    chart_data = AnalysisTools._generate_histogram(df[col], col)
                    if chart_data:
                        result["charts"][col] = chart_data
                        print(f"生成了直方图图表")
                else:
                    print(f"列 {col} 是非数值类型")
                    result["stats"][col] = {
                        "count": df[col].count(),
                        "unique": df[col].nunique(),
                        "top": df[col].mode().iloc[0] if not df[col].mode().empty else None,
                        "freq": df[col].value_counts().max() if not df[col].value_counts().empty else 0
                    }
                    print(f"生成的统计信息: count={result['stats'][col]['count']}, unique={result['stats'][col]['unique']}")
                    
                    if df[col].nunique() <= 20:
                        chart_data = AnalysisTools._generate_bar_chart(df[col], col)
                        if chart_data:
                            result["charts"][col] = chart_data
                            print(f"生成了柱状图图表")
                    else:
                        print(f"列 {col} 的唯一值数量过多，跳过生成柱状图")
            else:
                print(f"列 {col} 不在数据框中")
        
        print("描述性统计分析完成")
        return result
    
    @staticmethod
    def correlation_analysis(df: pd.DataFrame, columns: List[str]) -> Dict[str, Any]:
        """相关性分析"""
        print(f"执行相关性分析，列: {columns}")
        result = {
            "analysis_type": "correlation",
            "columns": columns,
            "correlation_matrix": {},
            "charts": {}
        }
        
        numeric_columns = [col for col in columns if col in df.columns and pd.api.types.is_numeric_dtype(df[col])]
        print(f"筛选后的数值列: {numeric_columns}")
        
        if len(numeric_columns) >= 2:
            print(f"数值列数量: {len(numeric_columns)}，开始计算相关系数矩阵")
            corr_matrix = df[numeric_columns].corr()
            result["correlation_matrix"] = corr_matrix.to_dict()
            print(f"相关系数矩阵计算完成，形状: {corr_matrix.shape}")
            
            chart_data = AnalysisTools._generate_heatmap(corr_matrix, "相关性矩阵")
            if chart_data:
                result["charts"]["correlation_matrix"] = chart_data
                print(f"生成了热力图图表")
        else:
            print(f"数值列数量不足，需要至少2列，实际有: {len(numeric_columns)}")
            result["error"] = f"数值列数量不足，需要至少2列，实际有: {len(numeric_columns)}"
        
        print("相关性分析完成")
        return result
    
    @staticmethod
    def distribution_analysis(df: pd.DataFrame, columns: List[str]) -> Dict[str, Any]:
        """分布分析"""
        print(f"执行分布分析，列: {columns}")
        result = {
            "analysis_type": "distribution",
            "columns": columns,
            "distributions": {},
            "charts": {}
        }
        
        for col in columns:
            if col in df.columns:
                print(f"分析列: {col}")
                if pd.api.types.is_numeric_dtype(df[col]):
                    print(f"列 {col} 是数值类型")
                    quantiles = df[col].quantile([0.01, 0.25, 0.5, 0.75, 0.99]).to_dict()
                    print(f"计算的分位数: {quantiles}")
                    
                    if len(df[col]) <= 100:
                        value_counts = df[col].value_counts().to_dict()
                        print(f"计算的值分布: {value_counts}")
                    else:
                        bins = min(10, len(df[col].unique()))
                        value_counts_series = df[col].value_counts(bins=bins)
                        value_counts = {str(key): value for key, value in value_counts_series.items()}
                        print(f"计算的分箱分布 (bins={bins}): {value_counts}")
                    
                    result["distributions"][col] = {
                        "quantiles": quantiles,
                        "value_counts": value_counts
                    }
                    
                    chart_data = AnalysisTools._generate_histogram(df[col], col)
                    if chart_data:
                        result["charts"][col] = chart_data
                        print(f"生成了分布直方图图表")
                else:
                    print(f"列 {col} 是非数值类型，跳过分布分析")
            else:
                print(f"列 {col} 不在数据框中")
        
        print("分布分析完成")
        return result
    
    @staticmethod
    def trend_analysis(df: pd.DataFrame, columns: List[str]) -> Dict[str, Any]:
        """趋势分析"""
        print(f"执行趋势分析，列: {columns}")
        result = {
            "analysis_type": "trend",
            "columns": columns,
            "trends": {},
            "charts": {}
        }
        
        time_column = None
        value_columns = []
        
        for col in columns:
            if col in df.columns:
                print(f"分析列: {col}")
                if pd.api.types.is_datetime64_any_dtype(df[col]):
                    time_column = col
                    print(f"识别到时间列: {time_column}")
                elif pd.api.types.is_numeric_dtype(df[col]):
                    value_columns.append(col)
                    print(f"识别到值列: {col}")
            else:
                print(f"列 {col} 不在数据框中")
        
        if time_column and value_columns:
            print(f"时间列: {time_column}, 值列: {value_columns}")
            df_sorted = df.sort_values(time_column)
            print(f"数据按时间排序完成，共 {len(df_sorted)} 行")
            
            for col in value_columns:
                df_sorted[f"{col}_ma"] = df_sorted[col].rolling(window=7).mean()
                print(f"计算 {col} 的移动平均")
                
                result["trends"][col] = {
                    "time_column": time_column,
                    "values": df_sorted[[time_column, col]].to_dict(orient="records"),
                    "moving_average": df_sorted[[time_column, f"{col}_ma"]].dropna().to_dict(orient="records")
                }
                print(f"生成 {col} 的趋势数据")
                
                chart_data = AnalysisTools._generate_line_chart(df_sorted, time_column, col, f"{col}_ma")
                if chart_data:
                    result["charts"][col] = chart_data
                    print(f"生成了 {col} 的趋势图")
        else:
            print(f"未找到有效的时间列和值列组合，时间列: {time_column}, 值列数量: {len(value_columns)}")
            result["error"] = f"未找到有效的时间列和值列组合，时间列: {time_column}, 值列数量: {len(value_columns)}"
        
        print("趋势分析完成")
        return result
    
    @staticmethod
    def prediction_analysis(df: pd.DataFrame, columns: List[str]) -> Dict[str, Any]:
        """机器学习预测分析"""
        print(f"执行机器学习预测分析，列: {columns}")
        result = {
            "analysis_type": "prediction",
            "columns": columns,
            "predictions": {},
            "charts": {}
        }
        
        try:
            from sklearn.model_selection import train_test_split
            from sklearn.linear_model import LinearRegression
            from sklearn.metrics import mean_squared_error, r2_score
            print("成功导入scikit-learn库")
            
            numeric_columns = [col for col in columns if col in df.columns and pd.api.types.is_numeric_dtype(df[col])]
            print(f"筛选后的数值列: {numeric_columns}")
            
            if len(numeric_columns) >= 2:
                print(f"数值列数量: {len(numeric_columns)}，开始预测分析")
                target_col = numeric_columns[-1]
                feature_cols = numeric_columns[:-1]
                print(f"目标列: {target_col}, 特征列: {feature_cols}")
                
                X = df[feature_cols]
                y = df[target_col]
                print(f"特征数据形状: {X.shape}, 目标数据形状: {y.shape}")
                
                X = X.dropna()
                y = y.loc[X.index]
                print(f"处理缺失值后，数据形状: {X.shape}")
                
                if len(X) > 10:
                    print("数据量充足，开始模型训练")
                    if len(X) > 1000:
                        print("数据量较大，限制为1000行以提高性能")
                        X = X.sample(1000, random_state=42)
                        y = y.loc[X.index]
                        print(f"限制后的数据形状: {X.shape}")
                    
                    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
                    print(f"训练集大小: {X_train.shape}, 测试集大小: {X_test.shape}")
                    
                    model = LinearRegression()
                    model.fit(X_train, y_train)
                    print("模型训练完成")
                    
                    y_pred = model.predict(X_test)
                    print("模型预测完成")
                    
                    mse = mean_squared_error(y_test, y_pred)
                    r2 = r2_score(y_test, y_pred)
                    print(f"模型评估指标 - MSE: {mse}, R2: {r2}")
                    
                    result["predictions"] = {
                        "model": "Linear Regression",
                        "target_column": target_col,
                        "feature_columns": feature_cols,
                        "mse": float(mse),
                        "r2": float(r2),
                        "predictions": y_pred.tolist(),
                        "actual": y_test.tolist()
                    }
                    print("生成预测结果数据")
                    
                    chart_data = AnalysisTools._generate_scatter_chart(
                        y_test,
                        y_pred,
                        "实际值",
                        "预测值"
                    )
                    if chart_data:
                        result["charts"]["prediction"] = chart_data
                        print("生成了预测结果图")
                else:
                    print(f"数据量不足，需要至少10行数据，实际有: {len(X)}行")
                    result["predictions"] = {
                        "error": f"数据量不足，需要至少10行数据，实际有: {len(X)}行"
                    }
            else:
                print(f"数值列数量不足，需要至少2列，实际有: {len(numeric_columns)}列")
                result["predictions"] = {
                    "error": f"数值列数量不足，需要至少2列，实际有: {len(numeric_columns)}列"
                }
        except ImportError:
            print("scikit-learn库不可用")
            result["predictions"] = {
                "error": "scikit-learn library not available"
            }
        except Exception as e:
            print(f"预测分析过程中发生错误: {str(e)}")
            result["predictions"] = {
                "error": str(e)
            }
        
        print("预测分析完成")
        return result
    
    @staticmethod
    def classification_analysis(df: pd.DataFrame, columns: List[str]) -> Dict[str, Any]:
        """分类分析"""
        print(f"执行分类分析，列: {columns}")
        result = {
            "analysis_type": "classification",
            "columns": columns,
            "classification": {},
            "charts": {}
        }
        
        try:
            from sklearn.model_selection import train_test_split
            from sklearn.linear_model import LogisticRegression
            from sklearn.metrics import accuracy_score, classification_report
            print("成功导入scikit-learn库")
            
            numeric_columns = [col for col in columns if col in df.columns and pd.api.types.is_numeric_dtype(df[col])]
            print(f"筛选后的数值列: {numeric_columns}")
            
            if len(numeric_columns) >= 2:
                print(f"数值列数量: {len(numeric_columns)}，开始分类分析")
                target_col = numeric_columns[-1]
                feature_cols = numeric_columns[:-1]
                print(f"目标列: {target_col}, 特征列: {feature_cols}")
                
                X = df[feature_cols]
                y = df[target_col]
                print(f"特征数据形状: {X.shape}, 目标数据形状: {y.shape}")
                
                X = X.dropna()
                y = y.loc[X.index]
                print(f"处理缺失值后，数据形状: {X.shape}")
                
                if len(X) > 10:
                    print("数据量充足，开始模型训练")
                    if len(X) > 1000:
                        print("数据量较大，限制为1000行以提高性能")
                        X = X.sample(1000, random_state=42)
                        y = y.loc[X.index]
                        print(f"限制后的数据形状: {X.shape}")
                    
                    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
                    print(f"训练集大小: {X_train.shape}, 测试集大小: {X_test.shape}")
                    
                    model = LogisticRegression()
                    model.fit(X_train, y_train)
                    print("模型训练完成")
                    
                    y_pred = model.predict(X_test)
                    print("模型预测完成")
                    
                    accuracy = accuracy_score(y_test, y_pred)
                    report = classification_report(y_test, y_pred, output_dict=True)
                    print(f"模型评估指标 - 准确率: {accuracy}")
                    
                    result["classification"] = {
                        "model": "Logistic Regression",
                        "target_column": target_col,
                        "feature_columns": feature_cols,
                        "accuracy": float(accuracy),
                        "report": report
                    }
                    print("生成分类结果数据")
                else:
                    print(f"数据量不足，需要至少10行数据，实际有: {len(X)}行")
                    result["classification"] = {
                        "error": f"数据量不足，需要至少10行数据，实际有: {len(X)}行"
                    }
            else:
                print(f"数值列数量不足，需要至少2列，实际有: {len(numeric_columns)}列")
                result["classification"] = {
                    "error": f"数值列数量不足，需要至少2列，实际有: {len(numeric_columns)}列"
                }
        except ImportError:
            print("scikit-learn库不可用")
            result["classification"] = {
                "error": "scikit-learn library not available"
            }
        except Exception as e:
            print(f"分类分析过程中发生错误: {str(e)}")
            result["classification"] = {
                "error": str(e)
            }
        
        print("分类分析完成")
        return result
    
    @staticmethod
    def anomaly_detection(df: pd.DataFrame, columns: List[str]) -> Dict[str, Any]:
        """异常检测"""
        print(f"执行异常检测，列: {columns}")
        result = {
            "analysis_type": "anomaly",
            "columns": columns,
            "anomalies": {},
            "charts": {}
        }
        
        for col in columns:
            if col in df.columns and pd.api.types.is_numeric_dtype(df[col]):
                print(f"分析列: {col}")
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                print(f"计算的边界值 - 下限: {lower_bound}, 上限: {upper_bound}")
                
                outliers = df[(df[col] < lower_bound) | (df[col] > upper_bound)][col]
                print(f"检测到的异常值数量: {len(outliers)}")
                print(f"异常值: {outliers.tolist()}")
                
                result["anomalies"][col] = {
                    "lower_bound": float(lower_bound),
                    "upper_bound": float(upper_bound),
                    "outlier_count": len(outliers),
                    "outliers": outliers.tolist()
                }
                print(f"生成 {col} 的异常值数据")
                
                chart_data = AnalysisTools._generate_box_plot(df[col], col)
                if chart_data:
                    result["charts"][col] = chart_data
                    print(f"生成了 {col} 的箱线图")
            elif col in df.columns:
                print(f"列 {col} 不是数值类型，跳过异常检测")
            else:
                print(f"列 {col} 不在数据框中")
        
        print("异常检测完成")
        return result
    
    @staticmethod
    def time_series_analysis(df: pd.DataFrame, columns: List[str]) -> Dict[str, Any]:
        """时间序列分析"""
        print(f"执行时间序列分析，列: {columns}")
        result = {
            "analysis_type": "time_series",
            "columns": columns,
            "time_series": {},
            "charts": {}
        }
        
        time_column = None
        value_columns = []
        
        for col in columns:
            if col in df.columns:
                print(f"分析列: {col}")
                if pd.api.types.is_datetime64_any_dtype(df[col]):
                    time_column = col
                    print(f"识别到时间列: {time_column}")
                elif pd.api.types.is_numeric_dtype(df[col]):
                    value_columns.append(col)
                    print(f"识别到值列: {col}")
            else:
                print(f"列 {col} 不在数据框中")
        
        if time_column and value_columns:
            print(f"时间列: {time_column}, 值列: {value_columns}")
            df_sorted = df.sort_values(time_column)
            print(f"数据按时间排序完成，共 {len(df_sorted)} 行")
            
            for col in value_columns:
                mean = df_sorted[col].mean()
                std = df_sorted[col].std()
                print(f"{col} 的统计量 - 均值: {mean}, 标准差: {std}")
                
                result["time_series"][col] = {
                    "mean": float(mean),
                    "std": float(std),
                    "values": df_sorted[[time_column, col]].to_dict(orient="records")
                }
                print(f"生成 {col} 的时间序列数据")
                
                chart_data = AnalysisTools._generate_line_chart(df_sorted, time_column, col)
                if chart_data:
                    result["charts"][col] = chart_data
                    print(f"生成了 {col} 的时间序列图")
        else:
            print(f"未找到有效的时间列和值列组合，时间列: {time_column}, 值列数量: {len(value_columns)}")
            result["error"] = f"未找到有效的时间列和值列组合，时间列: {time_column}, 值列数量: {len(value_columns)}"
        
        print("时间序列分析完成")
        return result
    
    @staticmethod
    def clustering_analysis(df: pd.DataFrame, columns: List[str]) -> Dict[str, Any]:
        """聚类分析"""
        print(f"执行聚类分析，列: {columns}")
        result = {
            "analysis_type": "clustering",
            "columns": columns,
            "clusters": {},
            "charts": {}
        }
        
        try:
            from sklearn.cluster import KMeans
            from sklearn.preprocessing import StandardScaler
            print("成功导入scikit-learn库")
            
            numeric_columns = [col for col in columns if col in df.columns and pd.api.types.is_numeric_dtype(df[col])]
            print(f"筛选后的数值列: {numeric_columns}")
            
            if len(numeric_columns) >= 2:
                print(f"数值列数量: {len(numeric_columns)}，开始聚类分析")
                X = df[numeric_columns]
                X = X.dropna()
                print(f"处理缺失值后，数据形状: {X.shape}")
                
                if len(X) > 10:
                    print("数据量充足，开始聚类分析")
                    if len(X) > 1000:
                        print("数据量较大，限制为1000行以提高性能")
                        X = X.sample(1000, random_state=42)
                        print(f"限制后的数据形状: {X.shape}")
                    
                    scaler = StandardScaler()
                    X_scaled = scaler.fit_transform(X)
                    print("数据标准化完成")
                    
                    kmeans = KMeans(n_clusters=3, random_state=42)
                    clusters = kmeans.fit_predict(X_scaled)
                    print("K-means聚类完成")
                    
                    X_with_clusters = X.copy()
                    X_with_clusters['cluster'] = clusters
                    print(f"聚类结果: {X_with_clusters['cluster'].value_counts().to_dict()}")
                    
                    result["clusters"] = {
                        "model": "K-means",
                        "n_clusters": 3,
                        "cluster_columns": numeric_columns,
                        "cluster_centers": kmeans.cluster_centers_.tolist(),
                        "cluster_counts": X_with_clusters['cluster'].value_counts().to_dict()
                    }
                    print("生成聚类结果数据")
                    
                    if len(numeric_columns) == 2:
                        print("生成二维聚类可视化图")
                        chart_data = AnalysisTools._generate_scatter_chart(
                            X_with_clusters[numeric_columns[0]],
                            X_with_clusters[numeric_columns[1]],
                            numeric_columns[0],
                            numeric_columns[1],
                            X_with_clusters['cluster']
                        )
                        if chart_data:
                            result["charts"]["clustering"] = chart_data
                            print("生成了聚类散点图")
                    else:
                        print(f"数据维度为 {len(numeric_columns)}，不支持可视化")
                else:
                    print(f"数据量不足，需要至少10行数据，实际有: {len(X)}行")
                    result["clusters"] = {
                        "error": f"数据量不足，需要至少10行数据，实际有: {len(X)}行"
                    }
            else:
                print(f"数值列数量不足，需要至少2列，实际有: {len(numeric_columns)}列")
                result["clusters"] = {
                    "error": f"数值列数量不足，需要至少2列，实际有: {len(numeric_columns)}列"
                }
        except ImportError:
            print("scikit-learn库不可用")
            result["clusters"] = {
                "error": "scikit-learn library not available"
            }
        except Exception as e:
            print(f"聚类分析过程中发生错误: {str(e)}")
            result["clusters"] = {
                "error": str(e)
            }
        
        print("聚类分析完成")
        return result
    
    @staticmethod
    def regression_analysis(df: pd.DataFrame, columns: List[str]) -> Dict[str, Any]:
        """回归分析"""
        print(f"执行回归分析，列: {columns}")
        result = {
            "analysis_type": "regression",
            "columns": columns,
            "regression": {},
            "charts": {}
        }
        
        try:
            from sklearn.model_selection import train_test_split
            from sklearn.linear_model import LinearRegression
            from sklearn.metrics import mean_squared_error, r2_score
            print("成功导入scikit-learn库")
            
            numeric_columns = [col for col in columns if col in df.columns and pd.api.types.is_numeric_dtype(df[col])]
            print(f"筛选后的数值列: {numeric_columns}")
            
            if len(numeric_columns) >= 2:
                print(f"数值列数量: {len(numeric_columns)}，开始回归分析")
                target_col = numeric_columns[-1]
                feature_cols = numeric_columns[:-1]
                print(f"目标列: {target_col}, 特征列: {feature_cols}")
                
                X = df[feature_cols]
                y = df[target_col]
                print(f"特征数据形状: {X.shape}, 目标数据形状: {y.shape}")
                
                X = X.dropna()
                y = y.loc[X.index]
                print(f"处理缺失值后，数据形状: {X.shape}")
                
                if len(X) > 10:
                    print("数据量充足，开始模型训练")
                    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
                    print(f"训练集大小: {X_train.shape}, 测试集大小: {X_test.shape}")
                    
                    model = LinearRegression()
                    model.fit(X_train, y_train)
                    print("模型训练完成")
                    
                    y_pred = model.predict(X_test)
                    print("模型预测完成")
                    
                    mse = mean_squared_error(y_test, y_pred)
                    r2 = r2_score(y_test, y_pred)
                    print(f"模型评估指标 - MSE: {mse}, R2: {r2}")
                    
                    result["regression"] = {
                        "model": "Linear Regression",
                        "target_column": target_col,
                        "feature_columns": feature_cols,
                        "mse": float(mse),
                        "r2": float(r2),
                        "coefficients": model.coef_.tolist(),
                        "intercept": float(model.intercept_)
                    }
                    print("生成回归结果数据")
                    
                    chart_data = AnalysisTools._generate_scatter_chart(
                        y_test,
                        y_pred,
                        "实际值",
                        "预测值"
                    )
                    if chart_data:
                        result["charts"]["regression"] = chart_data
                        print("生成了回归结果图")
                else:
                    print(f"数据量不足，需要至少10行数据，实际有: {len(X)}行")
                    result["regression"] = {
                        "error": f"数据量不足，需要至少10行数据，实际有: {len(X)}行"
                    }
            else:
                print(f"数值列数量不足，需要至少2列，实际有: {len(numeric_columns)}列")
                result["regression"] = {
                    "error": f"数值列数量不足，需要至少2列，实际有: {len(numeric_columns)}列"
                }
        except ImportError:
            print("scikit-learn库不可用")
            result["regression"] = {
                "error": "scikit-learn library not available"
            }
        except Exception as e:
            print(f"回归分析过程中发生错误: {str(e)}")
            result["regression"] = {
                "error": str(e)
            }
        
        print("回归分析完成")
        return result
    
    @staticmethod
    def _generate_histogram(data: pd.Series, title: str) -> str:
        """生成直方图并返回base64编码的图片"""
        try:
            plt.figure(figsize=(10, 6))
            plt.hist(data.dropna(), bins=20, alpha=0.7, color='blue')
            plt.title(title)
            plt.xlabel('值')
            plt.ylabel('频率')
            plt.grid(True, alpha=0.3)
            
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
            plt.close()
            
            return f"data:image/png;base64,{image_base64}"
        except Exception:
            return ""
    
    @staticmethod
    def _generate_bar_chart(data: pd.Series, title: str) -> str:
        """生成柱状图并返回base64编码的图片"""
        try:
            plt.figure(figsize=(10, 6))
            value_counts = data.value_counts()
            plt.bar(value_counts.index.astype(str), value_counts.values)
            plt.title(title)
            plt.xlabel('类别')
            plt.ylabel('计数')
            plt.xticks(rotation=45)
            plt.tight_layout()
            
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
            plt.close()
            
            return f"data:image/png;base64,{image_base64}"
        except Exception:
            return ""
    
    @staticmethod
    def _generate_line_chart(df: pd.DataFrame, x_col: str, y_col: str, ma_col: str = None) -> str:
        """生成折线图并返回base64编码的图片"""
        try:
            plt.figure(figsize=(10, 6))
            plt.plot(df[x_col], df[y_col], label=y_col)
            if ma_col and ma_col in df.columns:
                plt.plot(df[x_col], df[ma_col], label='移动平均', linestyle='--')
            plt.title(f"{y_col} 趋势")
            plt.xlabel(x_col)
            plt.ylabel(y_col)
            plt.legend()
            plt.grid(True, alpha=0.3)
            plt.xticks(rotation=45)
            plt.tight_layout()
            
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
            plt.close()
            
            return f"data:image/png;base64,{image_base64}"
        except Exception:
            return ""
    
    @staticmethod
    def _generate_scatter_chart(x_data: pd.Series, y_data: pd.Series, x_label: str, y_label: str, color_data: pd.Series = None) -> str:
        """生成散点图并返回base64编码的图片"""
        try:
            plt.figure(figsize=(10, 6))
            if color_data is not None:
                plt.scatter(x_data, y_data, c=color_data, cmap='viridis', alpha=0.7)
                plt.colorbar(label='聚类')
            else:
                plt.scatter(x_data, y_data, alpha=0.7)
            plt.title(f"{x_label} vs {y_label}")
            plt.xlabel(x_label)
            plt.ylabel(y_label)
            plt.grid(True, alpha=0.3)
            plt.tight_layout()
            
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
            plt.close()
            
            return f"data:image/png;base64,{image_base64}"
        except Exception:
            return ""
    
    @staticmethod
    def _generate_heatmap(data: pd.DataFrame, title: str) -> str:
        """生成热力图并返回base64编码的图片"""
        try:
            plt.figure(figsize=(10, 8))
            plt.imshow(data, cmap='coolwarm', aspect='auto')
            plt.title(title)
            plt.colorbar()
            plt.xticks(range(len(data.columns)), data.columns, rotation=45)
            plt.yticks(range(len(data.index)), data.index)
            plt.tight_layout()
            
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
            plt.close()
            
            return f"data:image/png;base64,{image_base64}"
        except Exception:
            return ""
    
    @staticmethod
    def _generate_box_plot(data: pd.Series, title: str) -> str:
        """生成箱线图并返回base64编码的图片"""
        try:
            plt.figure(figsize=(10, 6))
            plt.boxplot(data.dropna())
            plt.title(title)
            plt.ylabel('值')
            plt.grid(True, alpha=0.3)
            plt.tight_layout()
            
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
            plt.close()
            
            return f"data:image/png;base64,{image_base64}"
        except Exception:
            return ""
    
    @staticmethod
    def analyze_data(df: pd.DataFrame, analysis_type: str, columns: List[str]) -> Dict[str, Any]:
        """执行数据分析"""
        try:
            print(f"\n=== 开始执行数据分析 ===")
            print(f"分析类型: {analysis_type}")
            print(f"选择的列: {columns}")
            print(f"数据形状: {df.shape}")
            print(f"数据列: {list(df.columns)}")
            
            valid_columns = [col for col in columns if col in df.columns]
            if len(valid_columns) != len(columns):
                invalid_columns = [col for col in columns if col not in df.columns]
                print(f"警告: 选择的列 {invalid_columns} 不在数据中")
                columns = valid_columns
            print(f"验证后的列: {columns}")
            
            print("开始类型推断...")
            for col in df.columns:
                numeric_col = pd.to_numeric(df[col], errors='coerce')
                if not numeric_col.isna().all():
                    df[col] = numeric_col
                    print(f"列 {col} 转换为数值类型")
                else:
                    try:
                        date_col = pd.to_datetime(df[col], errors='coerce')
                        if not date_col.isna().all():
                            df[col] = date_col
                            print(f"列 {col} 转换为日期时间类型")
                    except:
                        pass
            
            if analysis_type == "descriptive":
                return AnalysisTools.descriptive_analysis(df, columns)
            elif analysis_type == "correlation":
                return AnalysisTools.correlation_analysis(df, columns)
            elif analysis_type == "distribution":
                return AnalysisTools.distribution_analysis(df, columns)
            elif analysis_type == "trend":
                return AnalysisTools.trend_analysis(df, columns)
            elif analysis_type == "prediction":
                return AnalysisTools.prediction_analysis(df, columns)
            elif analysis_type == "classification":
                return AnalysisTools.classification_analysis(df, columns)
            elif analysis_type == "anomaly":
                return AnalysisTools.anomaly_detection(df, columns)
            elif analysis_type == "time_series":
                return AnalysisTools.time_series_analysis(df, columns)
            elif analysis_type == "clustering":
                return AnalysisTools.clustering_analysis(df, columns)
            elif analysis_type == "regression":
                return AnalysisTools.regression_analysis(df, columns)
            elif analysis_type == "comparison":
                return IntelligentComparisonAnalyzer.comparison_analysis(df, columns)
            elif analysis_type == "competitive":
                return IntelligentComparisonAnalyzer.comparison_analysis(df, columns)
            elif analysis_type == "direct_analysis":
                return {"analysis_type": "direct_analysis", "message": "需要大模型直接分析数据"}
            else:
                print(f"不支持的分析类型: {analysis_type}")
                return {"error": f"不支持的分析类型: {analysis_type}"}
        except Exception as e:
            print(f"分析过程中发生错误: {str(e)}")
            return {"error": str(e)}


class IntelligentComparisonAnalyzer:
    """智能对比分析器 - 不硬编码维度，智能识别分组"""
    
    @staticmethod
    def comparison_analysis(
        df: pd.DataFrame,
        query_or_columns: Any,
        primary_metrics: Any = None,
        secondary_metrics: Any = None
    ) -> Dict[str, Any]:
        """
        对比分析 - 智能识别分组维度并计算差异
        
        Args:
            df: 数据集
            query_or_columns: 用户查询字符串或列名列表
            primary_metrics: 主要对比指标列表（如次日递率）
            secondary_metrics: 次要指标列表（如行业对比）
        
        Returns:
            包含分组统计和差异计算的完整结果
        """
        print(f"执行智能对比分析")
        
        # 处理不同的调用方式
        query = ""
        columns = []
        
        if isinstance(query_or_columns, str):
            query = query_or_columns
            columns = primary_metrics if primary_metrics else []
        elif isinstance(query_or_columns, list):
            columns = query_or_columns
            primary_metrics = primary_metrics if primary_metrics else columns
        else:
            columns = []
        
        print(f"用户查询: {query}")
        print(f"主要指标: {primary_metrics}")
        print(f"数据形状: {df.shape}")
        
        result = {
            "analysis_type": "comparison",
            "query": query,
            "primary_metrics": primary_metrics or [],
            "secondary_metrics": secondary_metrics or [],
            "results": {},
            "conclusions": [],
            "charts": {}
        }
        
        # 1. 从查询中提取分组维度（智能识别，不硬编码）
        group_dimensions = IntelligentComparisonAnalyzer._extract_group_dimensions(query, df)
        print(f"识别到的分组维度: {group_dimensions}")
        
        if not group_dimensions:
            print("警告：未能识别到分组维度，尝试自动检测")
            group_dimensions = IntelligentComparisonAnalyzer._detect_group_dimensions(df)
            print(f"自动检测到的分组维度: {group_dimensions}")
        
        if not group_dimensions:
            print("警告：无法找到任何分组维度，对比分析无法执行")
            result["error"] = "无法识别分组维度"
            return result
        
        # 2. 对每个维度进行分组统计
        metrics_list = (primary_metrics or []) + (secondary_metrics or [])
        
        for dimension in group_dimensions:
            print(f"\n分析维度: {dimension}")
            dimension_stats = IntelligentComparisonAnalyzer._calculate_group_statistics(
                df, dimension, metrics_list
            )
            
            # 3. 计算类别间差异
            differences = IntelligentComparisonAnalyzer._calculate_pairwise_differences(
                dimension_stats, metrics_list
            )
            
            # 4. 识别关键差异
            summary = IntelligentComparisonAnalyzer._identify_key_differences(
                differences, metrics_list
            )
            
            # 5. 生成对比结论
            conclusions = IntelligentComparisonAnalyzer._generate_comparison_conclusions(
                dimension, differences, summary, metrics_list
            )
            
            result["results"][dimension] = {
                "categories": dimension_stats["categories"],
                "statistics": dimension_stats["statistics"],
                "differences": differences,
                "summary": summary,
                "conclusions": conclusions
            }
            result["conclusions"].extend(conclusions)
            
            # 6. 生成对比图表
            chart_data = IntelligentComparisonAnalyzer._generate_comparison_chart(
                df, dimension, metrics_list
            )
            if chart_data:
                result["charts"][dimension] = chart_data
        
        print(f"\n智能对比分析完成，生成 {len(result['conclusions'])} 条结论")
        return result
    
    @staticmethod
    def _extract_group_dimensions(query: str, df: pd.DataFrame) -> List[str]:
        """
        从查询中智能提取分组维度
        
        不硬编码维度，而是：
        1. 识别查询中提到的具体类别
        2. 找到包含这些类别的列作为分组维度
        """
        print(f"从查询中提取分组维度，查询: {query[:100]}...")
        
        found_categories = set()
        
        region_keywords = [
            '长三角', '珠三角', '环渤海', '京津冀', '粤港澳',
            '成渝', '中部地区', '西部地区', '东北地区', '华东地区',
            '华南地区', '华北地区', '华中地区', '西南地区', '西北地区'
        ]
        
        for keyword in region_keywords:
            if keyword in query:
                found_categories.add(keyword)
                print(f"找到区域类别: {keyword}")
        
        product_keywords = ['特快', '普快', '经济', '标准', '次日', '隔日']
        for keyword in product_keywords:
            if keyword in query:
                found_categories.add(keyword)
                print(f"找到产品类别: {keyword}")
        
        quoted_patterns = re.findall(r"['\"]([^'\"]+)['\"]", query)
        found_categories.update(quoted_patterns)
        if quoted_patterns:
            print(f"从引号中找到类别: {quoted_patterns}")
        
        year_patterns = re.findall(r'\d{4}年', query)
        found_categories.update(year_patterns)
        if year_patterns:
            print(f"找到年份类别: {year_patterns}")
        
        potential_dimensions = []
        
        if found_categories:
            print(f"找到的类别: {found_categories}")
            
            for col in df.columns:
                if df[col].dtype == 'object':
                    try:
                        col_categories = set(df[col].astype(str).unique())
                        matching = col_categories & found_categories
                        
                        if matching:
                            print(f"列 '{col}' 包含匹配类别: {matching}")
                            potential_dimensions.append(col)
                    except:
                        continue
        
        return potential_dimensions
    
    @staticmethod
    def _detect_group_dimensions(df: pd.DataFrame) -> List[str]:
        """
        自动检测适合分组的维度
        
        选择：
        - 类别数量适中（2-20个）的文本列
        - 具有明确分组意义的列
        """
        print("自动检测分组维度...")
        
        potential = []
        
        for col in df.columns:
            if df[col].dtype == 'object':
                unique_count = df[col].nunique()
                
                if 'id' in col.lower() or 'time' in col.lower() or 'date' in col.lower():
                    continue
                
                if 2 <= unique_count <= 20:
                    potential.append((col, unique_count))
                    print(f"候选列: {col}, 类别数: {unique_count}")
        
        potential.sort(key=lambda x: x[1])
        
        return [col for col, _ in potential[:3]]
    
    @staticmethod
    def _calculate_group_statistics(
        df: pd.DataFrame,
        dimension: str,
        metrics: List[str]
    ) -> Dict[str, Any]:
        """对指定维度计算分组统计"""
        print(f"计算 '{dimension}' 维度的分组统计")
        
        categories = df[dimension].unique().tolist()
        print(f"类别数量: {len(categories)}")
        print(f"类别列表: {categories[:5]}...")
        
        statistics = {
            "categories": categories,
            "statistics": {}
        }
        
        for metric in metrics:
            if metric not in df.columns:
                print(f"警告: 指标 '{metric}' 不在数据中")
                continue
            
            if not pd.api.types.is_numeric_dtype(df[metric]):
                print(f"警告: 指标 '{metric}' 不是数值类型")
                continue
            
            metric_stats = {}
            
            for category in categories:
                category_data = df[df[dimension] == category][metric]
                
                if len(category_data) > 0:
                    metric_stats[category] = {
                        'count': int(len(category_data)),
                        'mean': float(category_data.mean()),
                        'std': float(category_data.std()) if len(category_data) > 1 else 0.0,
                        'min': float(category_data.min()),
                        'max': float(category_data.max()),
                        'median': float(category_data.median()),
                        'q25': float(category_data.quantile(0.25)),
                        'q75': float(category_data.quantile(0.75))
                    }
            
            if metric_stats:
                statistics["statistics"][metric] = metric_stats
        
        print(f"统计计算完成，指标数: {len(statistics['statistics'])}")
        return statistics
    
    @staticmethod
    def _calculate_pairwise_differences(
        stats: Dict,
        metrics: List[str]
    ) -> Dict[str, Any]:
        """
        计算两两之间的差异
        
        支持多种差异计算方式
        """
        print(f"计算两两之间的差异，指标: {metrics}")
        
        differences = {}
        
        if not stats.get("categories") or not metrics:
            return differences
        
        first_metric = metrics[0] if metrics else None
        
        if not first_metric or first_metric not in stats.get("statistics", {}):
            return differences
        
        category_values = stats["statistics"][first_metric]
        category_list = list(category_values.keys())
        
        for i, cat1 in enumerate(category_list):
            for j, cat2 in enumerate(category_list):
                if i >= j:
                    continue
                
                pair_key = f"{cat1}_vs_{cat2}"
                differences[pair_key] = {
                    "category_pair": (cat1, cat2),
                    "metrics": {}
                }
                
                for metric in metrics:
                    if metric not in stats["statistics"]:
                        continue
                    
                    cat1_data = stats["statistics"][metric].get(cat1, {})
                    cat2_data = stats["statistics"][metric].get(cat2, {})
                    
                    val1 = cat1_data.get('mean', 0)
                    val2 = cat2_data.get('mean', 0)
                    
                    absolute_diff = abs(val1 - val2)
                    max_val = max(abs(val1), abs(val2), 0.001)
                    relative_diff = (absolute_diff / max_val) * 100 if max_val > 0 else 0
                    
                    differences[pair_key]["metrics"][metric] = {
                        'absolute_diff': float(absolute_diff),
                        'relative_diff_percent': float(relative_diff),
                        'cat1_value': float(val1),
                        'cat2_value': float(val2),
                        'winner': cat1 if val1 > val2 else cat2,
                        'diff_direction': 'higher' if val1 > val2 else 'lower'
                    }
        
        print(f"计算完成，共 {len(differences)} 对差异")
        return differences
    
    @staticmethod
    def _identify_key_differences(
        differences: Dict,
        metrics: List[str]
    ) -> Dict[str, Any]:
        """识别关键差异"""
        print("识别关键差异...")
        
        summary = {
            "max_difference_pairs": [],
            "min_difference_pairs": [],
            "rankings": {}
        }
        
        for metric in metrics:
            metric_diffs = []
            
            for pair_key, diff_info in differences.items():
                if "metrics" in diff_info and metric in diff_info["metrics"]:
                    diff_data = diff_info["metrics"][metric]
                    metric_diffs.append({
                        'pair': pair_key,
                        'categories': diff_info.get('category_pair'),
                        'absolute_diff': diff_data.get('absolute_diff', 0),
                        'relative_diff_percent': diff_data.get('relative_diff_percent', 0),
                        'winner': diff_data.get('winner'),
                        'values': (diff_data.get('cat1_value'), diff_data.get('cat2_value'))
                    })
            
            metric_diffs.sort(key=lambda x: x['absolute_diff'], reverse=True)
            summary["rankings"][metric] = metric_diffs
            
            if metric_diffs:
                summary["max_difference_pairs"].append(metric_diffs[0])
                summary["min_difference_pairs"].append(metric_diffs[-1])
        
        print(f"识别完成，最大差异: {len(summary['max_difference_pairs'])} 对")
        return summary
    
    @staticmethod
    def _generate_comparison_conclusions(
        dimension: str,
        differences: Dict,
        summary: Dict,
        metrics: List[str]
    ) -> List[str]:
        """生成对比分析结论"""
        print(f"生成对比分析结论，维度: {dimension}")
        
        conclusions = []
        
        max_diffs = summary.get("max_difference_pairs", [])
        
        for diff_info in max_diffs[:3]:
            pair = diff_info.get('pair', '')
            categories = diff_info.get('categories', ('', ''))
            absolute = diff_info.get('absolute_diff', 0)
            relative = diff_info.get('relative_diff_percent', 0)
            winner = diff_info.get('winner', '')
            
            if pair and categories:
                cat1, cat2 = categories
                
                conclusion = (
                    f"在【{dimension}】维度，{cat1}与{cat2}的差异最为显著。"
                    f"{cat1}均值为{diff_info.get('values', (0, 0))[0]:.2f}，"
                    f"{cat2}均值为{diff_info.get('values', (0, 0))[1]:.2f}，"
                    f"绝对差异为{absolute:.2f}，"
                    f"相对差异为{relative:.1f}%。"
                    f"{winner}表现相对较好。"
                )
                
                conclusions.append(conclusion)
                print(f"结论: {conclusion}")
        
        for metric in metrics:
            rankings = summary.get("rankings", {}).get(metric, [])
            
            if rankings:
                best = rankings[0]
                worst = rankings[-1]
                
                if best.get('winner'):
                    conclusion = (
                        f"就【{metric}】指标而言，"
                        f"{best.get('winner')}表现最佳（均值{best.get('values', (0, 0))[0]:.2f}），"
                        f"{worst.get('categories', ['', ''])[0] if worst.get('categories') else ''}表现较弱（均值{worst.get('values', (0, 0))[1]:.2f}）。"
                    )
                    
                    if conclusion not in conclusions:
                        conclusions.append(conclusion)
                        print(f"排名结论: {conclusion}")
        
        return conclusions
    
    @staticmethod
    def _generate_comparison_chart(
        df: pd.DataFrame,
        dimension: str,
        metrics: List[str]
    ) -> Optional[str]:
        """生成对比图表"""
        try:
            print(f"生成对比图表，维度: {dimension}")
            
            metric = metrics[0] if metrics else None
            if not metric or metric not in df.columns:
                return None
            
            categories = df[dimension].unique()[:10]
            
            if len(categories) < 2:
                print("类别太少，跳过图表生成")
                return None
            
            means = []
            for cat in categories:
                cat_data = df[df[dimension] == cat][metric]
                means.append(cat_data.mean() if len(cat_data) > 0 else 0)
            
            plt.figure(figsize=(12, 6))
            x_pos = range(len(categories))
            bars = plt.bar(x_pos, means, alpha=0.7, color='steelblue')
            
            plt.xlabel(dimension)
            plt.ylabel(metric)
            plt.title(f"{metric} 在不同 {dimension} 的对比")
            plt.xticks(x_pos, categories, rotation=45, ha='right')
            plt.grid(True, alpha=0.3)
            plt.tight_layout()
            
            for i, (bar, mean) in enumerate(zip(bars, means)):
                plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5,
                        f'{mean:.2f}', ha='center', va='bottom', fontsize=9)
            
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=100)
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
            plt.close()
            
            print("图表生成成功")
            return f"data:image/png;base64,{image_base64}"
            
        except Exception as e:
            print(f"图表生成失败: {str(e)}")
            return None
