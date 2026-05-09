-- Add is_pinned column to core entities
ALTER TABLE tasks ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE milestones ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;

-- Index for quick lookup of pinned items
CREATE INDEX idx_tasks_pinned ON tasks(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX idx_projects_pinned ON projects(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX idx_milestones_pinned ON milestones(is_pinned) WHERE is_pinned = TRUE;
