from .datasource import router as datasource
from .table_relation import router as table_relation
from .recommended_problem import router as recommended_problem

__all__ = ["datasource", "table_relation", "recommended_problem"]
