from common.core.deps import SessionDep
from ..models.datasource import CoreField, FieldObj
from sqlalchemy import or_, and_


def delete_field_by_ds_id(session: SessionDep, id: int):
    session.query(CoreField).filter(CoreField.ds_id == id).delete(synchronize_session=False)


def get_fields_by_table_id(session: SessionDep, id: int, field: FieldObj):
    if field and field.fieldName:
        return session.query(CoreField).filter(
            and_(CoreField.table_id == id, or_(CoreField.field_name.like(f'%{field.fieldName}%'),
                                               CoreField.field_name.like(f'%{field.fieldName.lower()}%'),
                                               CoreField.field_name.like(f'%{field.fieldName.upper()}%')))).order_by(
            CoreField.field_index.asc()).all()
    else:
        return session.query(CoreField).filter(CoreField.table_id == id).order_by(CoreField.field_index.asc()).all()


def update_field(session: SessionDep, item: CoreField):
    record = session.query(CoreField).filter(CoreField.id == item.id).first()
    record.checked = item.checked
    record.custom_comment = item.custom_comment
    session.add(record)
    session.commit()


def batch_update_field_comments(session: SessionDep, table_id: int, field_comments: dict):
    """
    批量更新字段的自定义注释
    :param session: 数据库会话
    :param table_id: 表ID
    :param field_comments: 字段名到自定义注释的映射
    :return: 更新的字段数量
    """
    updated_count = 0
    for field_name, custom_comment in field_comments.items():
        # 查找匹配的字段
        field = session.query(CoreField).filter(
            CoreField.table_id == table_id,
            CoreField.field_name == field_name
        ).first()
        if field:
            field.custom_comment = custom_comment
            session.add(field)
            updated_count += 1
    session.commit()
    return updated_count
