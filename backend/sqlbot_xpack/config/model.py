from typing import Optional
try:
    from pydantic import BaseModel
except ImportError:
    BaseModel = object


class SysArgModel(BaseModel):
    """Mock system argument model"""
    pkey: Optional[str] = ''
    value: Optional[str] = ''
    pvalue: Optional[str] = ''
    
    def __init__(self, **kwargs):
        if BaseModel == object:
            # If Pydantic is not available, use simple attributes
            self.pkey = kwargs.get('pkey', '')
            self.value = kwargs.get('value', '') or kwargs.get('pvalue', '')
            self.pvalue = kwargs.get('pvalue', '') or kwargs.get('value', '')
        else:
            # Use Pydantic initialization
            super().__init__(**kwargs)
