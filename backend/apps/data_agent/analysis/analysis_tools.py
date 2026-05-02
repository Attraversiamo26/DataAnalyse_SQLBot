import pandas as pd
import numpy as np
import json
import matplotlib.pyplot as plt
import io
import base64
from typing import Dict, Any, List

# 设置matplotlib中文字体
plt.rcParams['font.sans-serif'] = ['SimHei', 'Arial Unicode MS', 'DejaVu Sans']  # 用来正常显示中文标签
plt.rcParams['axes.unicode_minus'] = False  # 用来正常显示负号

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
                    
                    # 生成图表
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
                    
                    # 生成柱状图
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
        
        # 确保只选择数值列
        numeric_columns = [col for col in columns if col in df.columns and pd.api.types.is_numeric_dtype(df[col])]
        print(f"筛选后的数值列: {numeric_columns}")
        
        if len(numeric_columns) >= 2:
            print(f"数值列数量: {len(numeric_columns)}，开始计算相关系数矩阵")
            corr_matrix = df[numeric_columns].corr()
            result["correlation_matrix"] = corr_matrix.to_dict()
            print(f"相关系数矩阵计算完成，形状: {corr_matrix.shape}")
            
            # 生成热力图
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
                    # 计算分位数
                    quantiles = df[col].quantile([0.01, 0.25, 0.5, 0.75, 0.99]).to_dict()
                    print(f"计算的分位数: {quantiles}")
                    # 计算频率分布
                    if len(df[col]) <= 100:
                        value_counts = df[col].value_counts().to_dict()
                        print(f"计算的值分布: {value_counts}")
                    else:
                        # 对于大数据集，使用分箱
                        bins = min(10, len(df[col].unique()))
                        value_counts_series = df[col].value_counts(bins=bins)
                        # 将Interval类型的键转换为字符串
                        value_counts = {str(key): value for key, value in value_counts_series.items()}
                        print(f"计算的分箱分布 (bins={bins}): {value_counts}")
                    
                    result["distributions"][col] = {
                        "quantiles": quantiles,
                        "value_counts": value_counts
                    }
                    
                    # 生成分布直方图
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
        
        # 尝试识别时间列
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
            # 按时间排序
            df_sorted = df.sort_values(time_column)
            print(f"数据按时间排序完成，共 {len(df_sorted)} 行")
            
            for col in value_columns:
                # 计算移动平均
                df_sorted[f"{col}_ma"] = df_sorted[col].rolling(window=7).mean()
                print(f"计算 {col} 的移动平均")
                
                result["trends"][col] = {
                    "time_column": time_column,
                    "values": df_sorted[[time_column, col]].to_dict(orient="records"),
                    "moving_average": df_sorted[[time_column, f"{col}_ma"]].dropna().to_dict(orient="records")
                }
                print(f"生成 {col} 的趋势数据")
                
                # 生成趋势图
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
            # 尝试导入机器学习库
            from sklearn.model_selection import train_test_split
            from sklearn.linear_model import LinearRegression
            from sklearn.metrics import mean_squared_error, r2_score
            print("成功导入scikit-learn库")
            
            # 确保只选择数值列
            numeric_columns = [col for col in columns if col in df.columns and pd.api.types.is_numeric_dtype(df[col])]
            print(f"筛选后的数值列: {numeric_columns}")
            
            if len(numeric_columns) >= 2:
                print(f"数值列数量: {len(numeric_columns)}，开始预测分析")
                # 使用最后一列作为目标变量
                target_col = numeric_columns[-1]
                feature_cols = numeric_columns[:-1]
                print(f"目标列: {target_col}, 特征列: {feature_cols}")
                
                X = df[feature_cols]
                y = df[target_col]
                print(f"特征数据形状: {X.shape}, 目标数据形状: {y.shape}")
                
                # 处理缺失值
                X = X.dropna()
                y = y.loc[X.index]
                print(f"处理缺失值后，数据形状: {X.shape}")
                
                if len(X) > 10:
                    print("数据量充足，开始模型训练")
                    # 限制数据量，提高性能
                    if len(X) > 1000:
                        print("数据量较大，限制为1000行以提高性能")
                        X = X.sample(1000, random_state=42)
                        y = y.loc[X.index]
                        print(f"限制后的数据形状: {X.shape}")
                    
                    # 分割训练集和测试集
                    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
                    print(f"训练集大小: {X_train.shape}, 测试集大小: {X_test.shape}")
                    
                    # 训练线性回归模型
                    model = LinearRegression()
                    model.fit(X_train, y_train)
                    print("模型训练完成")
                    
                    # 预测
                    y_pred = model.predict(X_test)
                    print("模型预测完成")
                    
                    # 计算评估指标
                    mse = mean_squared_error(y_test, y_pred)
                    r2 = r2_score(y_test, y_pred)
                    print(f"模型评估指标 - MSE: {mse}, R2: {r2}")
                    
                    # 准备结果数据
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
                    
                    # 生成预测结果图
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
            # 尝试导入机器学习库
            from sklearn.model_selection import train_test_split
            from sklearn.linear_model import LogisticRegression
            from sklearn.metrics import accuracy_score, classification_report
            print("成功导入scikit-learn库")
            
            # 确保只选择数值列
            numeric_columns = [col for col in columns if col in df.columns and pd.api.types.is_numeric_dtype(df[col])]
            print(f"筛选后的数值列: {numeric_columns}")
            
            if len(numeric_columns) >= 2:
                print(f"数值列数量: {len(numeric_columns)}，开始分类分析")
                # 使用最后一列作为目标变量
                target_col = numeric_columns[-1]
                feature_cols = numeric_columns[:-1]
                print(f"目标列: {target_col}, 特征列: {feature_cols}")
                
                X = df[feature_cols]
                y = df[target_col]
                print(f"特征数据形状: {X.shape}, 目标数据形状: {y.shape}")
                
                # 处理缺失值
                X = X.dropna()
                y = y.loc[X.index]
                print(f"处理缺失值后，数据形状: {X.shape}")
                
                if len(X) > 10:
                    print("数据量充足，开始模型训练")
                    # 限制数据量，提高性能
                    if len(X) > 1000:
                        print("数据量较大，限制为1000行以提高性能")
                        X = X.sample(1000, random_state=42)
                        y = y.loc[X.index]
                        print(f"限制后的数据形状: {X.shape}")
                    
                    # 分割训练集和测试集
                    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
                    print(f"训练集大小: {X_train.shape}, 测试集大小: {X_test.shape}")
                    
                    # 训练逻辑回归模型
                    model = LogisticRegression()
                    model.fit(X_train, y_train)
                    print("模型训练完成")
                    
                    # 预测
                    y_pred = model.predict(X_test)
                    print("模型预测完成")
                    
                    # 计算评估指标
                    accuracy = accuracy_score(y_test, y_pred)
                    report = classification_report(y_test, y_pred, output_dict=True)
                    print(f"模型评估指标 - 准确率: {accuracy}")
                    
                    # 准备结果数据
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
                # 使用IQR方法检测异常值
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                print(f"计算的边界值 - 下限: {lower_bound}, 上限: {upper_bound}")
                
                # 识别异常值
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
                
                # 生成异常值检测图
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
        
        # 尝试识别时间列
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
            # 按时间排序
            df_sorted = df.sort_values(time_column)
            print(f"数据按时间排序完成，共 {len(df_sorted)} 行")
            
            for col in value_columns:
                # 计算基本统计量
                mean = df_sorted[col].mean()
                std = df_sorted[col].std()
                print(f"{col} 的统计量 - 均值: {mean}, 标准差: {std}")
                
                result["time_series"][col] = {
                    "mean": float(mean),
                    "std": float(std),
                    "values": df_sorted[[time_column, col]].to_dict(orient="records")
                }
                print(f"生成 {col} 的时间序列数据")
                
                # 生成时间序列图
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
            # 尝试导入机器学习库
            from sklearn.cluster import KMeans
            from sklearn.preprocessing import StandardScaler
            print("成功导入scikit-learn库")
            
            # 确保只选择数值列
            numeric_columns = [col for col in columns if col in df.columns and pd.api.types.is_numeric_dtype(df[col])]
            print(f"筛选后的数值列: {numeric_columns}")
            
            if len(numeric_columns) >= 2:
                print(f"数值列数量: {len(numeric_columns)}，开始聚类分析")
                # 准备数据
                X = df[numeric_columns]
                X = X.dropna()
                print(f"处理缺失值后，数据形状: {X.shape}")
                
                if len(X) > 10:
                    print("数据量充足，开始聚类分析")
                    # 限制数据量，提高性能
                    if len(X) > 1000:
                        print("数据量较大，限制为1000行以提高性能")
                        X = X.sample(1000, random_state=42)
                        print(f"限制后的数据形状: {X.shape}")
                    
                    # 标准化数据
                    scaler = StandardScaler()
                    X_scaled = scaler.fit_transform(X)
                    print("数据标准化完成")
                    
                    # 执行K-means聚类
                    kmeans = KMeans(n_clusters=3, random_state=42)
                    clusters = kmeans.fit_predict(X_scaled)
                    print("K-means聚类完成")
                    
                    # 添加聚类结果到数据框
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
                    
                    # 生成聚类可视化图（仅支持二维数据）
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
            # 尝试导入机器学习库
            from sklearn.model_selection import train_test_split
            from sklearn.linear_model import LinearRegression
            from sklearn.metrics import mean_squared_error, r2_score
            print("成功导入scikit-learn库")
            
            # 确保只选择数值列
            numeric_columns = [col for col in columns if col in df.columns and pd.api.types.is_numeric_dtype(df[col])]
            print(f"筛选后的数值列: {numeric_columns}")
            
            if len(numeric_columns) >= 2:
                print(f"数值列数量: {len(numeric_columns)}，开始回归分析")
                # 使用最后一列作为目标变量
                target_col = numeric_columns[-1]
                feature_cols = numeric_columns[:-1]
                print(f"目标列: {target_col}, 特征列: {feature_cols}")
                
                X = df[feature_cols]
                y = df[target_col]
                print(f"特征数据形状: {X.shape}, 目标数据形状: {y.shape}")
                
                # 处理缺失值
                X = X.dropna()
                y = y.loc[X.index]
                print(f"处理缺失值后，数据形状: {X.shape}")
                
                if len(X) > 10:
                    print("数据量充足，开始模型训练")
                    # 分割训练集和测试集
                    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
                    print(f"训练集大小: {X_train.shape}, 测试集大小: {X_test.shape}")
                    
                    # 训练线性回归模型
                    model = LinearRegression()
                    model.fit(X_train, y_train)
                    print("模型训练完成")
                    
                    # 预测
                    y_pred = model.predict(X_test)
                    print("模型预测完成")
                    
                    # 计算评估指标
                    mse = mean_squared_error(y_test, y_pred)
                    r2 = r2_score(y_test, y_pred)
                    print(f"模型评估指标 - MSE: {mse}, R2: {r2}")
                    
                    # 准备结果数据
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
                    
                    # 生成回归结果图
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
            
            # 保存为base64
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
            
            # 保存为base64
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
            
            # 保存为base64
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
            
            # 保存为base64
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
            
            # 保存为base64
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
            
            # 保存为base64
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
            
            # 验证列是否存在
            valid_columns = [col for col in columns if col in df.columns]
            if len(valid_columns) != len(columns):
                invalid_columns = [col for col in columns if col not in df.columns]
                print(f"警告: 选择的列 {invalid_columns} 不在数据中")
                columns = valid_columns
            print(f"验证后的列: {columns}")
            
            # 自动类型推断
            print("开始类型推断...")
            for col in df.columns:
                # 先尝试转换为数值类型
                numeric_col = pd.to_numeric(df[col], errors='coerce')
                # 如果转换成功（不是全为NaN），则使用数值类型
                if not numeric_col.isna().all():
                    df[col] = numeric_col
                    print(f"列 {col} 转换为数值类型")
                else:
                    # 否则尝试转换为日期时间类型
                    try:
                        date_col = pd.to_datetime(df[col], errors='coerce')
                        if not date_col.isna().all():
                            df[col] = date_col
                            print(f"列 {col} 转换为日期时间类型")
                    except:
                        pass
            
            # 根据分析类型执行相应的分析
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
            else:
                print(f"不支持的分析类型: {analysis_type}")
                return {"error": f"不支持的分析类型: {analysis_type}"}
        except Exception as e:
            print(f"分析过程中发生错误: {str(e)}")
            return {"error": str(e)}
