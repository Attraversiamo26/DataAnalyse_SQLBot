import os
import subprocess
import tempfile
import time
from typing import Optional, Dict, Any

class TaskRequest:
    """任务请求类"""
    def __init__(self, code: str, input_data: str, requirement: str):
        self.code = code
        self.input_data = input_data
        self.requirement = requirement

class TaskResponse:
    """任务响应类"""
    def __init__(self, is_success: bool, execution_success_but_result_failed: bool, std_out: str, std_err: str, exception_msg: str):
        self.is_success = is_success
        self.execution_success_but_result_failed = execution_success_but_result_failed
        self.std_out = std_out
        self.std_err = std_err
        self.exception_msg = exception_msg
    
    @classmethod
    def exception(cls, msg: str) -> 'TaskResponse':
        """执行运行代码任务时发生异常"""
        return cls(False, False, None, None, f"An exception occurred while executing the task: {msg}")
    
    @classmethod
    def success(cls, std_out: str) -> 'TaskResponse':
        """执行运行代码任务成功，并且代码正常返回"""
        return cls(True, False, std_out, None, None)
    
    @classmethod
    def failure(cls, std_out: str, std_err: str) -> 'TaskResponse':
        """执行运行代码任务成功，但是代码异常返回"""
        return cls(False, True, std_out, std_err, f"StdErr: {std_err}")
    
    def __str__(self) -> str:
        return f"TaskResponse{{isSuccess={self.is_success}, stdOut='{self.std_out}', stdErr='{self.std_err}', exceptionMsg='{self.exception_msg}'}}"

class CodeExecutorService:
    """代码执行服务接口"""
    def run_task(self, request: TaskRequest) -> TaskResponse:
        """执行代码任务"""
        pass

class LocalCodeExecutorService(CodeExecutorService):
    """本地代码执行服务"""
    def __init__(self, timeout: int = 60):
        self.timeout = timeout
    
    def run_task(self, request: TaskRequest) -> TaskResponse:
        """执行代码任务"""
        with tempfile.TemporaryDirectory() as temp_dir:
            # 写入代码文件
            script_path = os.path.join(temp_dir, "script.py")
            with open(script_path, 'w', encoding='utf-8') as f:
                f.write(request.code)
            
            # 写入输入数据
            input_path = os.path.join(temp_dir, "input.txt")
            with open(input_path, 'w', encoding='utf-8') as f:
                f.write(request.input_data)
            
            # 写入依赖文件
            requirements_path = os.path.join(temp_dir, "requirements.txt")
            with open(requirements_path, 'w', encoding='utf-8') as f:
                f.write(request.requirement)
            
            # 安装依赖
            if request.requirement:
                try:
                    subprocess.run(
                        ["pip", "install", "--no-cache-dir", "-r", requirements_path],
                        cwd=temp_dir,
                        capture_output=True,
                        text=True,
                        timeout=self.timeout
                    )
                except Exception as e:
                    # 即使依赖安装失败，也尝试运行代码
                    pass
            
            # 运行代码
            try:
                result = subprocess.run(
                    ["python3", script_path],
                    cwd=temp_dir,
                    stdin=open(input_path, 'r'),
                    capture_output=True,
                    text=True,
                    timeout=self.timeout
                )
                
                if result.returncode == 0:
                    return TaskResponse.success(result.stdout)
                else:
                    return TaskResponse.failure(result.stdout, result.stderr)
            except subprocess.TimeoutExpired:
                return TaskResponse.failure("", "python code timeout, Killed.")
            except Exception as e:
                return TaskResponse.exception(str(e))

class CodeExecutorFactory:
    """代码执行服务工厂"""
    @staticmethod
    def get_executor(executor_type: str, **kwargs) -> CodeExecutorService:
        """获取代码执行服务"""
        if executor_type == "local":
            return LocalCodeExecutorService(**kwargs)
        else:
            raise ValueError(f"Unsupported executor type: {executor_type}")
