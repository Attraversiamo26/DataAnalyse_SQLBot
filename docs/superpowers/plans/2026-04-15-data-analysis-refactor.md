# 数据分析工具分析相关功能重构 - 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重构数据分析工具的分析相关功能，重点参考DataAgent-main的统计分析与机器学习预测部分，实现数据基本统计、智能分析建议、图表可视化等功能。

**Architecture:** 采用前后端分离架构，后端使用FastAPI和Pandas实现数据分析功能，前端使用Vue 3和AntV G2实现界面和图表可视化。后端提供RESTful API，前端通过Axios调用API获取数据和分析结果。

**Tech Stack:** Python, FastAPI, Pandas, Scikit-learn, Vue 3, Element Plus, AntV G2

---

## 目录结构

### 后端文件
- `backend/apps/data_agent/api.py` - 数据分析相关API接口
- `backend/apps/data_agent/analysis/analysis_tools.py` - 数据分析工具实现
- `backend/apps/data_agent/analysis/machine_learning.py` - 机器学习预测功能

### 前端文件
- `frontend/src/views/data-agent/index.vue` - 数据分析主界面
- `frontend/src/components/chart/ChartComponent.vue` - 图表可视化组件
- `frontend/src/api/dataAgent.ts` - 后端API调用封装

---

## 任务分解

### 任务 1: 优化数据基本统计功能

**Files:**
- Modify: `backend/apps/data_agent/api.py`
- Test: `backend/test_data_agent_api.py`

- [ ] **步骤 1: 优化数据基本统计API**

```python
# 修改get_data_basic_stats函数，优化性能和功能
def get_data_basic_stats(request: DataBasicStatsRequest, db, current_user: User):
    """获取数据基本统计信息"""
    try:
        # 获取数据源信息
        datasource = db.query(CoreDatasource).filter(CoreDatasource.id == request.datasource_id).first()
        if not datasource:
            raise HTTPException(status_code=404, detail="数据源不存在")
        
        # 获取数据库连接
        engine = get_engine(datasource)
        if not engine:
            raise HTTPException(status_code=500, detail="无法连接到数据源")
        
        # 高效计算总行数
        count_query = f"SELECT COUNT(*) FROM {request.table_name}"
        total_rows = pd.read_sql(count_query, engine).iloc[0, 0]
        
        # 获取前5条数据作为样例
        sample_query = f"SELECT * FROM {request.table_name} LIMIT 5"
        sample_df = pd.read_sql(sample_query, engine)
        
        # 获取列信息
        columns_info = []
        for col in sample_df.columns:
            # 计算非空值数量
            non_null_count = sample_df[col].count()
            null_count = len(sample_df) - non_null_count
            null_percentage = (null_count / len(sample_df) * 100) if len(sample_df) > 0 else 0
            
            # 推断数据类型
            if pd.api.types.is_numeric_dtype(sample_df[col]):
                col_type = "numeric"
            elif pd.api.types.is_datetime64_any_dtype(sample_df[col]):
                col_type = "datetime"
            elif pd.api.types.is_bool_dtype(sample_df[col]):
                col_type = "boolean"
            else:
                col_type = "string"
            
            columns_info.append({
                "name": col,
                "type": col_type,
                "dtype": str(sample_df[col].dtype),
                "non_null_count": non_null_count,
                "null_count": null_count,
                "null_percentage": round(null_percentage, 2)
            })
        
        # 计算数据质量指标
        data_quality = {
            "total_rows": total_rows,
            "total_columns": len(sample_df.columns),
            "null_values": {
                "total_null_count": int(sample_df.isnull().sum().sum()),
                "null_percentage": round(sample_df.isnull().sum().sum() / (len(sample_df) * len(sample_df.columns) * 100), 2) if len(sample_df) > 0 else 0
            },
            "duplicate_rows": {
                "total_duplicate_count": int(sample_df.duplicated().sum()),
                "duplicate_percentage": round(sample_df.duplicated().sum() / len(sample_df) * 100, 2) if len(sample_df) > 0 else 0
            }
        }
        
        return DataBasicStatsResponse(
            success=True,
            total_rows=total_rows,
            total_columns=len(sample_df.columns),
            columns_info=columns_info,
            sample_data=sample_df.to_dict(orient='records'),
            data_quality=data_quality
        )
    except Exception as e:
        return DataBasicStatsResponse(
            success=False,
            total_rows=0,
            total_columns=0,
            columns_info=[],
            sample_data=[],
            data_quality={},
            error=str(e)
        )
```

- [ ] **步骤 2: 编写测试用例**

```python
def test_get_data_basic_stats():
    """测试数据基本统计API"""
    client = TestClient(app)
    
    # 模拟登录
    login_response = client.post("/api/v1/system/login", json={
        "username": "admin",
        "password": "password"
    })
    token = login_response.json()["access_token"]
    
    # 测试获取数据基本统计
    response = client.post("/api/v1/data-agent/basic-stats", json={
        "datasource_id": 1,
        "table_name": "test_table"
    }, headers={
        "Authorization": f"Bearer {token}"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert "total_rows" in data
    assert "total_columns" in data
    assert "columns_info" in data
    assert "sample_data" in data
    assert "data_quality" in data
```

- [ ] **步骤 3: 运行测试**

```bash
cd backend && python -m pytest test_data_agent_api.py::test_get_data_basic_stats -v
```

- [ ] **步骤 4: 提交代码**

```bash
git add backend/apps/data_agent/api.py backend/test_data_agent_api.py
git commit -m "feat: 优化数据基本统计功能"
```

---

### 任务 2: 增强分析类型和列选择功能

**Files:**
- Modify: `backend/apps/data_agent/api.py`
- Modify: `frontend/src/views/data-agent/index.vue`

- [ ] **步骤 1: 扩展分析类型定义**

```python
# 在ANALYSIS_TYPES中添加更多分析类型
ANALYSIS_TYPES = [
    {
        "id": "descriptive",
        "name": "描述性统计",
        "description": "计算数据的基本统计指标，如均值、中位数、标准差等",
        "required_columns": 1,
        "column_types": ["numeric"]
    },
    {
        "id": "correlation",
        "name": "相关性分析",
        "description": "分析两个或多个变量之间的相关性",
        "required_columns": 2,
        "column_types": ["numeric"]
    },
    {
        "id": "distribution",
        "name": "分布分析",
        "description": "分析数据的分布情况，包括直方图、分位数等",
        "required_columns": 1,
        "column_types": ["numeric"]
    },
    {
        "id": "trend",
        "name": "趋势分析",
        "description": "分析数据随时间的变化趋势",
        "required_columns": 2,
        "column_types": ["datetime", "numeric"]
    },
    {
        "id": "prediction",
        "name": "机器学习预测",
        "description": "使用机器学习模型对数据进行预测",
        "required_columns": 2,
        "column_types": ["numeric"]
    },
    {
        "id": "classification",
        "name": "分类分析",
        "description": "对数据进行分类分析",
        "required_columns": 2,
        "column_types": ["numeric"]
    },
    {
        "id": "anomaly",
        "name": "异常检测",
        "description": "检测数据中的异常值",
        "required_columns": 1,
        "column_types": ["numeric"]
    }
]
```

- [ ] **步骤 2: 优化前端分析类型和列选择界面**

```vue
<!-- 修改前端分析类型选择和列选择部分 -->
<el-form-item label="分析类型">
  <el-select v-model="analysisForm.analysis_type" placeholder="请选择分析类型" @change="handleAnalysisTypeChange">
    <el-option
      v-for="type in analysisTypes"
      :key="type.id"
      :label="type.name"
      :value="type.id"
    />
  </el-select>
</el-form-item>

<el-form-item label="选择列">
  <el-select
    v-model="analysisForm.selected_columns"
    multiple
    placeholder="请选择列"
    :disabled="!analysisForm.analysis_type"
    :multiple-limit="currentAnalysisType?.required_columns === 1 ? 1 : undefined"
  >
    <el-option
      v-for="column in filteredColumns"
      :key="column.name"
      :label="column.name"
      :value="column.name"
    />
  </el-select>
  <div v-if="currentAnalysisType" class="column-hint">
    {{ currentAnalysisType.required_columns === 1 ? '请选择一列' : '请选择至少两列' }}
  </div>
</el-form-item>
```

- [ ] **步骤 3: 添加filteredColumns计算属性**

```javascript
// 添加过滤列的计算属性
const filteredColumns = computed(() => {
  if (!currentAnalysisType || !availableColumns.value.length) {
    return availableColumns.value;
  }
  
  return availableColumns.value.filter(column => {
    return currentAnalysisType.value.column_types.includes(column.type);
  });
});
```

- [ ] **步骤 4: 测试功能**

```bash
# 启动前端服务
cd frontend && npm run dev

# 启动后端服务
cd backend && python main.py
```

- [ ] **步骤 5: 提交代码**

```bash
git add backend/apps/data_agent/api.py frontend/src/views/data-agent/index.vue
git commit -m "feat: 增强分析类型和列选择功能"
```

---

### 任务 3: 优化分析需求生成功能

**Files:**
- Modify: `backend/apps/data_agent/api.py`

- [ ] **步骤 1: 改进分析需求生成逻辑**

```python
@router.post("/generate-requirement", response_model=AnalysisRequirementResponse)
async def generate_analysis_requirement(
    request: AnalysisRequirementRequest,
    db=Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """根据选择的分析类型和列生成分析需求"""
    try:
        # 验证分析类型是否存在
        analysis_type = next((at for at in ANALYSIS_TYPES if at["id"] == request.analysis_type), None)
        if not analysis_type:
            return AnalysisRequirementResponse(
                success=False,
                requirement="",
                error="分析类型不存在"
            )
        
        # 验证列数是否符合要求
        if analysis_type["required_columns"] == 1 and len(request.selected_columns) != 1:
            return AnalysisRequirementResponse(
                success=False,
                requirement="",
                error="该分析类型需要选择一列"
            )
        elif analysis_type["required_columns"] == 2 and len(request.selected_columns) < 2:
            return AnalysisRequirementResponse(
                success=False,
                requirement="",
                error="该分析类型需要选择至少两列"
            )
        
        # 生成分析需求
        columns_str = ", ".join(request.selected_columns)
        table_name = request.table_name
        
        if request.analysis_type == "descriptive":
            requirement = f"对表 '{table_name}' 中的列 '{columns_str}' 进行描述性统计分析，包括均值、中位数、标准差、最小值、最大值等基本统计指标"
        elif request.analysis_type == "correlation":
            requirement = f"分析表 '{table_name}' 中列 '{columns_str}' 之间的相关性，计算相关系数并生成相关性矩阵"
        elif request.analysis_type == "distribution":
            requirement = f"分析表 '{table_name}' 中列 '{columns_str}' 的数据分布情况，生成直方图和分位数统计"
        elif request.analysis_type == "trend":
            requirement = f"分析表 '{table_name}' 中列 '{columns_str}' 的时间趋势变化，生成趋势图表"
        elif request.analysis_type == "prediction":
            requirement = f"使用机器学习模型对表 '{table_name}' 中列 '{columns_str}' 进行预测分析，生成预测结果和模型评估指标"
        elif request.analysis_type == "classification":
            requirement = f"对表 '{table_name}' 中列 '{columns_str}' 进行分类分析，生成分类结果和评估指标"
        elif request.analysis_type == "anomaly":
            requirement = f"检测表 '{table_name}' 中列 '{columns_str}' 的异常值，生成异常检测结果"
        else:
            requirement = f"对表 '{table_name}' 中列 '{columns_str}' 进行 {analysis_type['name']} 分析"
        
        return AnalysisRequirementResponse(
            success=True,
            requirement=requirement
        )
    except Exception as e:
        return AnalysisRequirementResponse(
            success=False,
            requirement="",
            error=str(e)
        )
```

- [ ] **步骤 2: 编写测试用例**

```python
def test_generate_analysis_requirement():
    """测试分析需求生成API"""
    client = TestClient(app)
    
    # 模拟登录
    login_response = client.post("/api/v1/system/login", json={
        "username": "admin",
        "password": "password"
    })
    token = login_response.json()["access_token"]
    
    # 测试生成分析需求
    response = client.post("/api/v1/data-agent/generate-requirement", json={
        "analysis_type": "descriptive",
        "selected_columns": ["sales"],
        "datasource_id": 1,
        "table_name": "test_table"
    }, headers={
        "Authorization": f"Bearer {token}"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert "requirement" in data
    assert "test_table" in data["requirement"]
    assert "sales" in data["requirement"]
```

- [ ] **步骤 3: 运行测试**

```bash
cd backend && python -m pytest test_data_agent_api.py::test_generate_analysis_requirement -v
```

- [ ] **步骤 4: 提交代码**

```bash
git add backend/apps/data_agent/api.py backend/test_data_agent_api.py
git commit -m "feat: 优化分析需求生成功能"
```

---

### 任务 4: 增强统计分析和机器学习预测功能

**Files:**
- Create: `backend/apps/data_agent/analysis/analysis_tools.py`
- Create: `backend/apps/data_agent/analysis/machine_learning.py`
- Modify: `backend/apps/data_agent/api.py`

- [ ] **步骤 1: 创建analysis_tools.py文件**

```python
"""数据分析工具模块"""
import pandas as pd
import json
from typing import Dict, Any, List

class AnalysisTools:
    """数据分析工具类"""
    
    @staticmethod
    def analyze_data(data_str: str, analysis_type: str, selected_columns: List[str]) -> Dict[str, Any]:
        """执行数据分析"""
        try:
            # 解析数据
            data = json.loads(data_str)
            df = pd.DataFrame(data)
            
            # 确保选择的列存在
            for col in selected_columns:
                if col not in df.columns:
                    return {"error": f"列 '{col}' 不存在"}
            
            # 根据分析类型执行不同的分析
            if analysis_type == "descriptive":
                return AnalysisTools._descriptive_analysis(df, selected_columns)
            elif analysis_type == "correlation":
                return AnalysisTools._correlation_analysis(df, selected_columns)
            elif analysis_type == "distribution":
                return AnalysisTools._distribution_analysis(df, selected_columns)
            elif analysis_type == "trend":
                return AnalysisTools._trend_analysis(df, selected_columns)
            elif analysis_type == "prediction":
                return AnalysisTools._prediction_analysis(df, selected_columns)
            elif analysis_type == "classification":
                return AnalysisTools._classification_analysis(df, selected_columns)
            elif analysis_type == "anomaly":
                return AnalysisTools._anomaly_analysis(df, selected_columns)
            else:
                return {"error": "不支持的分析类型"}
        except Exception as e:
            return {"error": str(e)}
    
    @staticmethod
    def _descriptive_analysis(df: pd.DataFrame, columns: List[str]) -> Dict[str, Any]:
        """描述性统计分析"""
        stats = {}
        for col in columns:
            if pd.api.types.is_numeric_dtype(df[col]):
                stats[col] = {
                    "mean": df[col].mean(),
                    "median": df[col].median(),
                    "std": df[col].std(),
                    "min": df[col].min(),
                    "max": df[col].max(),
                    "count": df[col].count(),
                    "missing": df[col].isnull().sum()
                }
        return {"analysis_type": "descriptive", "stats": stats}
    
    @staticmethod
    def _correlation_analysis(df: pd.DataFrame, columns: List[str]) -> Dict[str, Any]:
        """相关性分析"""
        # 确保所有列都是数值类型
        numeric_df = df[columns].select_dtypes(include=['number'])
        correlation_matrix = numeric_df.corr().to_dict()
        return {"analysis_type": "correlation", "correlation_matrix": correlation_matrix}
    
    @staticmethod
    def _distribution_analysis(df: pd.DataFrame, columns: List[str]) -> Dict[str, Any]:
        """分布分析"""
        distributions = {}
        for col in columns:
            if pd.api.types.is_numeric_dtype(df[col]):
                # 计算分位数
                quantiles = df[col].quantile([0.25, 0.5, 0.75]).to_dict()
                # 计算值的频率
                value_counts = df[col].value_counts().head(10).to_dict()
                distributions[col] = {
                    "quantiles": quantiles,
                    "value_counts": value_counts
                }
        return {"analysis_type": "distribution", "distributions": distributions}
    
    @staticmethod
    def _trend_analysis(df: pd.DataFrame, columns: List[str]) -> Dict[str, Any]:
        """趋势分析"""
        trends = {}
        # 假设第一列是时间列
        time_col = columns[0]
        value_col = columns[1]
        
        if pd.api.types.is_datetime64_any_dtype(df[time_col]):
            # 按时间排序
            df_sorted = df.sort_values(time_col)
            trends[value_col] = {
                "time_column": time_col,
                "values": df_sorted[[time_col, value_col]].to_dict('records')
            }
        return {"analysis_type": "trend", "trends": trends}
    
    @staticmethod
    def _prediction_analysis(df: pd.DataFrame, columns: List[str]) -> Dict[str, Any]:
        """预测分析"""
        from .machine_learning import MachineLearningTools
        return MachineLearningTools.predict(df, columns)
    
    @staticmethod
    def _classification_analysis(df: pd.DataFrame, columns: List[str]) -> Dict[str, Any]:
        """分类分析"""
        from .machine_learning import MachineLearningTools
        return MachineLearningTools.classify(df, columns)
    
    @staticmethod
    def _anomaly_analysis(df: pd.DataFrame, columns: List[str]) -> Dict[str, Any]:
        """异常检测"""
        from .machine_learning import MachineLearningTools
        return MachineLearningTools.detect_anomalies(df, columns)
```

- [ ] **步骤 2: 创建machine_learning.py文件**

```python
"""机器学习工具模块"""
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.tree import DecisionTreeRegressor, DecisionTreeClassifier
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, classification_report
from typing import Dict, Any, List

class MachineLearningTools:
    """机器学习工具类"""
    
    @staticmethod
    def predict(df: pd.DataFrame, columns: List[str]) -> Dict[str, Any]:
        """预测分析"""
        try:
            # 假设最后一列是目标列
            target_col = columns[-1]
            feature_cols = columns[:-1]
            
            # 准备数据
            X = df[feature_cols].select_dtypes(include=['number'])
            y = df[target_col].select_dtypes(include=['number'])
            
            # 划分训练集和测试集
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # 训练线性回归模型
            lr_model = LinearRegression()
            lr_model.fit(X_train, y_train)
            lr_predictions = lr_model.predict(X_test)
            lr_mse = mean_squared_error(y_test, lr_predictions)
            lr_r2 = r2_score(y_test, lr_predictions)
            
            # 训练决策树模型
            dt_model = DecisionTreeRegressor()
            dt_model.fit(X_train, y_train)
            dt_predictions = dt_model.predict(X_test)
            dt_mse = mean_squared_error(y_test, dt_predictions)
            dt_r2 = r2_score(y_test, dt_predictions)
            
            # 选择表现更好的模型
            if lr_r2 > dt_r2:
                best_model = "linear_regression"
                best_predictions = lr_predictions
                best_mse = lr_mse
                best_r2 = lr_r2
            else:
                best_model = "decision_tree"
                best_predictions = dt_predictions
                best_mse = dt_mse
                best_r2 = dt_r2
            
            # 生成预测结果
            predictions = []
            for actual, predicted in zip(y_test.values, best_predictions):
                predictions.append([actual[0], predicted])
            
            return {
                "analysis_type": "prediction",
                "predictions": {
                    "model": best_model,
                    "mse": best_mse,
                    "r2": best_r2,
                    "predictions": predictions
                }
            }
        except Exception as e:
            return {"error": str(e)}
    
    @staticmethod
    def classify(df: pd.DataFrame, columns: List[str]) -> Dict[str, Any]:
        """分类分析"""
        try:
            # 假设最后一列是目标列
            target_col = columns[-1]
            feature_cols = columns[:-1]
            
            # 准备数据
            X = df[feature_cols].select_dtypes(include=['number'])
            y = df[target_col]
            
            # 划分训练集和测试集
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # 训练逻辑回归模型
            lr_model = LogisticRegression()
            lr_model.fit(X_train, y_train)
            lr_predictions = lr_model.predict(X_test)
            lr_accuracy = accuracy_score(y_test, lr_predictions)
            
            # 训练决策树模型
            dt_model = DecisionTreeClassifier()
            dt_model.fit(X_train, y_train)
            dt_predictions = dt_model.predict(X_test)
            dt_accuracy = accuracy_score(y_test, dt_predictions)
            
            # 选择表现更好的模型
            if lr_accuracy > dt_accuracy:
                best_model = "logistic_regression"
                best_predictions = lr_predictions
                best_accuracy = lr_accuracy
            else:
                best_model = "decision_tree"
                best_predictions = dt_predictions
                best_accuracy = dt_accuracy
            
            return {
                "analysis_type": "classification",
                "classification": {
                    "model": best_model,
                    "accuracy": best_accuracy,
                    "report": classification_report(y_test, best_predictions, output_dict=True)
                }
            }
        except Exception as e:
            return {"error": str(e)}
    
    @staticmethod
    def detect_anomalies(df: pd.DataFrame, columns: List[str]) -> Dict[str, Any]:
        """异常检测"""
        try:
            anomalies = {}
            for col in columns:
                if pd.api.types.is_numeric_dtype(df[col]):
                    # 使用 IQR 方法检测异常值
                    Q1 = df[col].quantile(0.25)
                    Q3 = df[col].quantile(0.75)
                    IQR = Q3 - Q1
                    lower_bound = Q1 - 1.5 * IQR
                    upper_bound = Q3 + 1.5 * IQR
                    
                    # 找出异常值
                    outlier_mask = (df[col] < lower_bound) | (df[col] > upper_bound)
                    outlier_values = df[col][outlier_mask].values.tolist()
                    
                    anomalies[col] = {
                        "lower_bound": lower_bound,
                        "upper_bound": upper_bound,
                        "outlier_count": len(outlier_values),
                        "outliers": outlier_values
                    }
            
            return {
                "analysis_type": "anomaly",
                "anomalies": anomalies
            }
        except Exception as e:
            return {"error": str(e)}
```

- [ ] **步骤 3: 更新api.py文件，集成分析工具**

```python
# 导入分析工具
from apps.data_agent.analysis import AnalysisTools

# 在analyze_data函数中使用分析工具
@router.post("/analyze", response_model=DataAnalysisResponse)
async def analyze_data(
    request: DataAnalysisRequest,
    db=Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """执行数据分析"""
    try:
        # 记录开始时间
        start_time = time.time()
        
        # 获取实际数据
        data_str = ""
        if request.datasource_id and request.table_name:
            data_str = await fetch_data_from_datasource(request.datasource_id, request.table_name, db)
        elif request.data:
            data_str = request.data
        else:
            raise HTTPException(status_code=400, detail="请提供数据源和表名，或直接输入数据")
        
        # 检查是否使用分析工具
        if request.analysis_type and request.selected_columns:
            # 使用分析工具执行分析
            analysis_result = AnalysisTools.analyze_data(data_str, request.analysis_type, request.selected_columns)
            result_data = json.dumps(analysis_result, ensure_ascii=False)
            
            # 生成报告
            report = await generate_report(request.query, result_data)
            
            # 计算执行时间
            execution_time = time.time() - start_time
            
            # 存储分析结果
            analysis_create = AnalysisResultCreate(
                name=request.name or f"分析_{current_user.id}_{int(time.time())}",
                description=request.description,
                tags=request.tags,
                query=request.query,
                datasource_id=request.datasource_id,
                table_name=request.table_name,
                python_code=f"使用分析工具: {request.analysis_type}",
                execution_time=execution_time,
                status="success",
                result_data=result_data,
                result_summary=report
            )
            analysis_result_db = AnalysisResultCRUD.create(db, analysis_create, current_user.id)
            
            return DataAnalysisResponse(
                success=True,
                result=result_data,
                report=report,
                analysis_id=analysis_result_db.id
            )
        else:
            # 使用传统的代码执行方式
            # 生成Python代码（使用大模型生成）
            python_code = await generate_analysis_code(request.query, data_str)
            
            # 创建任务请求
            task_request = TaskRequest(
                code=python_code,
                input_data=data_str,
                requirement=request.requirements
            )
            
            # 执行代码
            executor = CodeExecutorFactory.get_executor("local", timeout=60)
            response = executor.run_task(task_request)
            
            # 计算执行时间
            execution_time = time.time() - start_time
            
            if response.is_success:
                # 生成报告
                report = await generate_report(request.query, response.std_out)
                
                # 存储分析结果
                analysis_create = AnalysisResultCreate(
                    name=request.name or f"分析_{current_user.id}_{int(time.time())}",
                    description=request.description,
                    tags=request.tags,
                    query=request.query,
                    datasource_id=request.datasource_id,
                    table_name=request.table_name,
                    python_code=python_code,
                    execution_time=execution_time,
                    status="success",
                    result_data=response.std_out,
                    result_summary=report
                )
                analysis_result = AnalysisResultCRUD.create(db, analysis_create, current_user.id)
                
                return DataAnalysisResponse(
                    success=True,
                    result=response.std_out,
                    report=report,
                    analysis_id=analysis_result.id
                )
            else:
                # 存储失败的分析结果
                analysis_create = AnalysisResultCreate(
                    name=request.name or f"分析_{current_user.id}_{int(time.time())}",
                    description=request.description,
                    tags=request.tags,
                    query=request.query,
                    datasource_id=request.datasource_id,
                    table_name=request.table_name,
                    python_code=python_code,
                    execution_time=execution_time,
                    status="failed",
                    error_message=response.exception_msg or response.std_err
                )
                analysis_result = AnalysisResultCRUD.create(db, analysis_create, current_user.id)
                
                return DataAnalysisResponse(
                    success=False,
                    error=response.exception_msg or response.std_err,
                    analysis_id=analysis_result.id
                )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

- [ ] **步骤 4: 编写测试用例**

```python
def test_analyze_data_with_tools():
    """测试使用分析工具执行分析"""
    client = TestClient(app)
    
    # 模拟登录
    login_response = client.post("/api/v1/system/login", json={
        "username": "admin",
        "password": "password"
    })
    token = login_response.json()["access_token"]
    
    # 准备测试数据
    test_data = [
        {"sales": 100, "revenue": 1000, "date": "2023-01-01"},
        {"sales": 200, "revenue": 2000, "date": "2023-01-02"},
        {"sales": 300, "revenue": 3000, "date": "2023-01-03"},
        {"sales": 400, "revenue": 4000, "date": "2023-01-04"},
        {"sales": 500, "revenue": 5000, "date": "2023-01-05"}
    ]
    
    # 测试描述性统计分析
    response = client.post("/api/v1/data-agent/analyze", json={
        "query": "对sales列进行描述性统计",
        "data": json.dumps(test_data),
        "analysis_type": "descriptive",
        "selected_columns": ["sales"]
    }, headers={
        "Authorization": f"Bearer {token}"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert "result" in data
    
    # 解析结果
    result = json.loads(data["result"])
    assert result["analysis_type"] == "descriptive"
    assert "stats" in result
    assert "sales" in result["stats"]
```

- [ ] **步骤 5: 运行测试**

```bash
cd backend && python -m pytest test_data_agent_api.py::test_analyze_data_with_tools -v
```

- [ ] **步骤 6: 提交代码**

```bash
git add backend/apps/data_agent/analysis/analysis_tools.py backend/apps/data_agent/analysis/machine_learning.py backend/apps/data_agent/api.py backend/test_data_agent_api.py
git commit -m "feat: 增强统计分析和机器学习预测功能"
```

---

### 任务 5: 优化图表可视化功能

**Files:**
- Modify: `frontend/src/components/chart/ChartComponent.vue`
- Modify: `frontend/src/views/data-agent/index.vue`

- [ ] **步骤 1: 增强ChartComponent组件**

```vue
<template>
  <div class="chart-container">
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import type { PropType } from 'vue';
import { Chart } from '@antv/g2';

const props = defineProps({
  data: {
    type: Array as PropType<any[]>,
    default: () => []
  },
  chartType: {
    type: String as PropType<'bar' | 'line' | 'scatter' | 'pie' | 'heatmap'>,
    default: 'bar'
  },
  xField: {
    type: String,
    default: 'x'
  },
  yField: {
    type: String,
    default: 'y'
  },
  title: {
    type: String,
    default: ''
  }
});

const chartRef = ref<HTMLElement | null>(null);
let chart: Chart | null = null;

const createChart = () => {
  if (!chartRef.value) return;
  
  // 销毁旧图表
  if (chart) {
    chart.destroy();
  }
  
  // 创建新图表
  chart = new Chart({
    container: chartRef.value,
    width: chartRef.value.clientWidth,
    height: 400
  });
  
  // 设置数据
  chart.data(props.data);
  
  // 设置标题
  if (props.title) {
    chart.title(props.title);
  }
  
  // 根据图表类型设置配置
  switch (props.chartType) {
    case 'bar':
      chart
        .interval()
        .encode('x', props.xField)
        .encode('y', props.yField)
        .encode('color', props.xField);
      break;
    case 'line':
      chart
        .line()
        .encode('x', props.xField)
        .encode('y', props.yField)
        .encode('color', props.xField)
        .point();
      break;
    case 'scatter':
      chart
        .point()
        .encode('x', props.xField)
        .encode('y', props.yField)
        .encode('color', props.xField);
      break;
    case 'pie':
      chart
        .interval()
        .encode('x', props.xField)
        .encode('y', props.yField)
        .encode('color', props.xField);
      break;
    case 'heatmap':
      chart
        .rect()
        .encode('x', props.xField)
        .encode('y', props.yField)
        .encode('color', props.yField);
      break;
  }
  
  // 渲染图表
  chart.render();
};

onMounted(() => {
  createChart();
});

watch(() => props.data, () => {
  createChart();
}, { deep: true });

watch(() => props.chartType, () => {
  createChart();
});

watch(() => props.xField, () => {
  createChart();
});

watch(() => props.yField, () => {
  createChart();
});

watch(() => props.title, () => {
  createChart();
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px;
  margin: 20px 0;
}

.chart {
  width: 100%;
  height: 100%;
}
</style>
```

- [ ] **步骤 2: 优化前端分析结果处理和图表展示**

```javascript
// 优化processAnalysisResult函数
const processAnalysisResult = (result: string) => {
  try {
    const data: any = JSON.parse(result);
    chartData.value = [];
    
    if (data.analysis_type === 'descriptive' && data.stats) {
      // 处理描述性统计数据
      for (const [column, stats] of Object.entries(data.stats)) {
        if (typeof stats === 'object' && stats !== null) {
          for (const [stat, value] of Object.entries(stats)) {
            if (typeof value === 'number') {
              chartData.value.push({
                x: `${column}_${stat}`,
                y: value
              });
            }
          }
        }
      }
      chartXField.value = 'x';
      chartYField.value = 'y';
      chartTitle.value = '描述性统计结果';
      selectedChartType.value = 'bar';
    } else if (data.analysis_type === 'correlation' && data.correlation_matrix) {
      // 处理相关性矩阵数据
      const matrix = data.correlation_matrix;
      for (const [col1, values] of Object.entries(matrix)) {
        if (typeof values === 'object' && values !== null) {
          for (const [col2, value] of Object.entries(values)) {
            if (typeof value === 'number' && col1 !== col2) {
              chartData.value.push({
                x: `${col1}-${col2}`,
                y: value
              });
            }
          }
        }
      }
      chartXField.value = 'x';
      chartYField.value = 'y';
      chartTitle.value = '相关性分析结果';
      selectedChartType.value = 'bar';
    } else if (data.analysis_type === 'distribution' && data.distributions) {
      // 处理分布分析数据
      for (const [_, distribution] of Object.entries(data.distributions)) {
        if (typeof distribution === 'object' && distribution !== null && (distribution as any).value_counts) {
          for (const [value, count] of Object.entries((distribution as any).value_counts)) {
            chartData.value.push({
              x: value,
              y: count
            });
          }
        }
      }
      chartXField.value = 'x';
      chartYField.value = 'y';
      chartTitle.value = '分布分析结果';
      selectedChartType.value = 'bar';
    } else if (data.analysis_type === 'trend' && data.trends) {
      // 处理趋势分析数据
      for (const [column, trend] of Object.entries(data.trends)) {
        if (typeof trend === 'object' && trend !== null && (trend as any).values) {
          for (const item of (trend as any).values) {
            const timeField = (trend as any).time_column;
            if (timeField && item[timeField] && item[column]) {
              chartData.value.push({
                x: item[timeField],
                y: item[column]
              });
            }
          }
        }
      }
      chartXField.value = 'x';
      chartYField.value = 'y';
      chartTitle.value = '趋势分析结果';
      selectedChartType.value = 'line';
    } else if (data.analysis_type === 'prediction' && data.predictions) {
      // 处理预测分析数据
      if (data.predictions.predictions) {
        for (let i = 0; i < data.predictions.predictions.length; i++) {
          const [actual, predicted] = data.predictions.predictions[i];
          chartData.value.push({
            x: i,
            y: actual,
            predicted: predicted
          });
        }
      }
      chartXField.value = 'x';
      chartYField.value = 'y';
      chartTitle.value = '预测分析结果';
      selectedChartType.value = 'line';
    } else if (data.analysis_type === 'classification' && data.classification) {
      // 处理分类分析数据
      const report = data.classification.report;
      if (report) {
        for (const [class_name, metrics] of Object.entries(report)) {
          if (typeof metrics === 'object' && metrics !== null && 'f1-score' in metrics) {
            chartData.value.push({
              x: class_name,
              y: metrics['f1-score']
            });
          }
        }
      }
      chartXField.value = 'x';
      chartYField.value = 'y';
      chartTitle.value = '分类分析结果';
      selectedChartType.value = 'bar';
    } else if (data.analysis_type === 'anomaly' && data.anomalies) {
      // 处理异常检测数据
      for (const [column, anomaly] of Object.entries(data.anomalies)) {
        if (typeof anomaly === 'object' && anomaly !== null) {
          chartData.value.push({
            x: column,
            y: (anomaly as any).outlier_count
          });
        }
      }
      chartXField.value = 'x';
      chartYField.value = 'y';
      chartTitle.value = '异常检测结果';
      selectedChartType.value = 'bar';
    }
  } catch (error) {
    console.error('处理分析结果失败:', error);
    chartData.value = [];
  }
};
```

- [ ] **步骤 3: 测试图表功能**

```bash
# 启动前端服务
cd frontend && npm run dev

# 启动后端服务
cd backend && python main.py
```

- [ ] **步骤 4: 提交代码**

```bash
git add frontend/src/components/chart/ChartComponent.vue frontend/src/views/data-agent/index.vue
git commit -m "feat: 优化图表可视化功能"
```

---

### 任务 6: 集成和测试

**Files:**
- Test: `backend/test_final_verification.py`

- [ ] **步骤 1: 编写端到端测试**

```python
def test_end_to_end_analysis():
    """端到端测试数据分析流程"""
    client = TestClient(app)
    
    # 模拟登录
    login_response = client.post("/api/v1/system/login", json={
        "username": "admin",
        "password": "password"
    })
    token = login_response.json()["access_token"]
    
    # 1. 获取数据基本统计
    stats_response = client.post("/api/v1/data-agent/basic-stats", json={
        "datasource_id": 1,
        "table_name": "test_table"
    }, headers={
        "Authorization": f"Bearer {token}"
    })
    assert stats_response.status_code == 200
    stats_data = stats_response.json()
    assert stats_data["success"] == True
    
    # 2. 获取分析类型
    types_response = client.get("/api/v1/data-agent/analysis-types", headers={
        "Authorization": f"Bearer {token}"
    })
    assert types_response.status_code == 200
    types_data = types_response.json()
    assert len(types_data) > 0
    
    # 3. 生成分析需求
    requirement_response = client.post("/api/v1/data-agent/generate-requirement", json={
        "analysis_type": "descriptive",
        "selected_columns": ["sales"],
        "datasource_id": 1,
        "table_name": "test_table"
    }, headers={
        "Authorization": f"Bearer {token}"
    })
    assert requirement_response.status_code == 200
    requirement_data = requirement_response.json()
    assert requirement_data["success"] == True
    
    # 4. 执行分析
    analyze_response = client.post("/api/v1/data-agent/analyze", json={
        "query": requirement_data["requirement"],
        "datasource_id": 1,
        "table_name": "test_table",
        "analysis_type": "descriptive",
        "selected_columns": ["sales"]
    }, headers={
        "Authorization": f"Bearer {token}"
    })
    assert analyze_response.status_code == 200
    analyze_data = analyze_response.json()
    assert analyze_data["success"] == True
    assert "result" in analyze_data
    assert "report" in analyze_data
    assert "analysis_id" in analyze_data
    
    # 5. 获取分析结果列表
    results_response = client.get("/api/v1/data-agent/analysis-results", headers={
        "Authorization": f"Bearer {token}"
    })
    assert results_response.status_code == 200
    results_data = results_response.json()
    assert "total" in results_data
    assert "items" in results_data
    assert results_data["total"] > 0
```

- [ ] **步骤 2: 运行端到端测试**

```bash
cd backend && python -m pytest test_final_verification.py::test_end_to_end_analysis -v
```

- [ ] **步骤 3: 性能测试**

```python
def test_performance():
    """性能测试"""
    import time
    client = TestClient(app)
    
    # 模拟登录
    login_response = client.post("/api/v1/system/login", json={
        "username": "admin",
        "password": "password"
    })
    token = login_response.json()["access_token"]
    
    # 测试数据基本统计响应时间
    start_time = time.time()
    stats_response = client.post("/api/v1/data-agent/basic-stats", json={
        "datasource_id": 1,
        "table_name": "test_table"
    }, headers={
        "Authorization": f"Bearer {token}"
    })
    end_time = time.time()
    assert stats_response.status_code == 200
    assert (end_time - start_time) < 3  # 响应时间不超过3秒
    
    # 测试分析执行响应时间
    start_time = time.time()
    analyze_response = client.post("/api/v1/data-agent/analyze", json={
        "query": "对sales列进行描述性统计",
        "datasource_id": 1,
        "table_name": "test_table",
        "analysis_type": "descriptive",
        "selected_columns": ["sales"]
    }, headers={
        "Authorization": f"Bearer {token}"
    })
    end_time = time.time()
    assert analyze_response.status_code == 200
    assert (end_time - start_time) < 30  # 执行时间不超过30秒
```

- [ ] **步骤 4: 运行性能测试**

```bash
cd backend && python -m pytest test_final_verification.py::test_performance -v
```

- [ ] **步骤 5: 提交代码**

```bash
git add backend/test_final_verification.py
git commit -m "feat: 添加端到端和性能测试"
```

---

## 执行选项

**计划已完成并保存到 `docs/superpowers/plans/2026-04-15-data-analysis-refactor.md`。执行选项：**

**1. 子代理驱动（推荐）** - 我为每个任务分派一个新的子代理，在任务之间进行审查，快速迭代

**2. 内联执行** - 使用执行计划在本次会话中执行任务，批量执行并设置检查点

**选择哪种方式？**