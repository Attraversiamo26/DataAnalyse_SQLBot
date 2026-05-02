-- 修复 sys_user_ws 表
-- 检查并删除旧的索引
DROP INDEX IF EXISTS ix_sys_user_ws_user_id;
DROP INDEX IF EXISTS ix_sys_user_ws_ws_id;

-- 重命名字段
ALTER TABLE sys_user_ws RENAME COLUMN user_id TO uid;
ALTER TABLE sys_user_ws RENAME COLUMN ws_id TO oid;

-- 添加 weight 字段
ALTER TABLE sys_user_ws ADD COLUMN IF NOT EXISTS weight INTEGER NOT NULL DEFAULT 0;

-- 创建新的索引
CREATE INDEX IF NOT EXISTS ix_sys_user_ws_uid ON sys_user_ws (uid);
CREATE INDEX IF NOT EXISTS ix_sys_user_ws_oid ON sys_user_ws (oid);

-- 修复 system_variable 表
CREATE TABLE IF NOT EXISTS system_variable (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    var_type VARCHAR(128) NOT NULL,
    type VARCHAR(128) NOT NULL,
    value JSONB,
    create_time TIMESTAMP,
    create_by BIGINT
);

-- 插入默认数据
INSERT INTO system_variable (name, var_type, type, value, create_time, create_by)
VALUES 
    ('i18n_variable.name', 'text', 'system', '["name"]'::jsonb, NULL, NULL),
    ('i18n_variable.account', 'text', 'system', '["account"]'::jsonb, NULL, NULL),
    ('i18n_variable.email', 'text', 'system', '["email"]'::jsonb, NULL, NULL)
ON CONFLICT DO NOTHING;

-- 验证修复结果
SELECT 'sys_user_ws table exists: ' || EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sys_user_ws');
SELECT 'system_variable table exists: ' || EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_variable');

SELECT 'sys_user_ws columns:';
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'sys_user_ws' ORDER BY ordinal_position;

SELECT 'system_variable columns:';
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'system_variable' ORDER BY ordinal_position;

SELECT 'system_variable data:';
SELECT * FROM system_variable;
