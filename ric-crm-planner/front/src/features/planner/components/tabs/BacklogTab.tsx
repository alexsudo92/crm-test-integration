import { useState, type Dispatch, type SetStateAction, type MouseEvent } from "react";
import type { PlannerParentTask, PlannerSubtask, PlannerTeam } from "../../../../types/planner";
import type { ParentEditDraft, SubtaskEditDraft } from "../../planner.types";
import { Badge, Button, Card, DatePicker, Empty, Flex, Input, Popconfirm, Select, Space, Statistic, Tag, Tooltip, Typography } from "antd";
import {
  CalendarOutlined,
  CaretDownFilled,
  CaretRightFilled,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

const { Text, Title } = Typography;

type BacklogTabProps = {
  activeTeamName: string;
  parentTitle: string;
  parentAssigneeId: string;
  parentStart: Dayjs | undefined;
  parentEnd: Dayjs | undefined;
  onParentTitleChange: (value: string) => void;
  onParentAssigneeChange: (value: string) => void;
  onParentStartChange: (value: Dayjs | undefined) => void;
  onParentEndChange: (value: Dayjs | undefined) => void;
  onAddParentTask: () => void;
  activeTeamMembers: number[];
  filteredParents: PlannerParentTask[];
  selectedParentId: number | null;
  onSelectParent: (parentId: number) => void;
  editingParentId: number | null;
  editingParentDraft: ParentEditDraft | null;
  setEditingParentDraft: Dispatch<SetStateAction<ParentEditDraft | null>>;
  onOpenTaskCard: (type: "parent" | "subtask", id: number) => void;
  onStartEditParent: (parentId: number) => void;
  onSaveEditedParent: () => void;
  onCancelEditParent: () => void;
  onDeleteParent: (parentId: number) => void;
  canEditTeam: (teamId: number) => boolean;
  selectedParent?: PlannerParentTask;
  selectedTeamMembers: number[];
  subAssigneeId: string;
  subTitle: string;
  subStart: Dayjs | undefined;
  subEnd: Dayjs | undefined;
  subInSprint: boolean;
  onSubAssigneeChange: (value: string) => void;
  onSubTitleChange: (value: string) => void;
  onSubStartChange: (value: Dayjs | undefined) => void;
  onSubEndChange: (value: Dayjs | undefined) => void;
  onSubInSprintChange: (value: boolean) => void;
  onAddSubtask: () => void;
  filteredSubtasks: PlannerSubtask[];
  assigneeFilter: string;
  assigneeFilterOptions: Array<{ value: string; label: string; disabled?: boolean }>;
  onAssigneeFilterChange: (value: string) => void;
  editingSubtaskId: number | null;
  editingSubtaskDraft: SubtaskEditDraft | null;
  setEditingSubtaskDraft: Dispatch<SetStateAction<SubtaskEditDraft | null>>;
  getTeamMemberIds: (teamId: number) => number[];
  displayAssigneeLabel: (id: number) => string;
  onStartEditSubtask: (subtaskId: number) => void;
  onSaveEditedSubtask: () => void;
  onCancelEditSubtask: () => void;
  onDeleteSubtask: (subtaskId: number) => void;

  visibleTeams: PlannerTeam[];
  teamFilter: string;
  onTeamFilterChange: (value: string) => void;
};

const formatAssigneeName = (label: string) => {
  const namePart = label.split(" - ")[0]?.trim() || label.trim();
  const parts = namePart.split(/\s+/).filter(Boolean);
  return parts.length > 2 ? parts.slice(0, 2).join(" ") : namePart;
};

const getSubtaskAssignee = (subtask: PlannerSubtask, displayAssigneeLabel: (id: number) => string) => {
  if (subtask.assigneeId) return formatAssigneeName(displayAssigneeLabel(subtask.assigneeId));
  return subtask.role || "Исполнитель не назначен";
};

export default function BacklogTab({
  activeTeamName,
  parentTitle,
  parentAssigneeId,
  parentStart,
  parentEnd,
  onParentTitleChange,
  onParentAssigneeChange,
  onParentStartChange,
  onParentEndChange,
  onAddParentTask,
  activeTeamMembers,
  filteredParents,
  selectedParentId,
  onSelectParent,
  editingParentId,
  editingParentDraft,
  setEditingParentDraft,
  onOpenTaskCard,
  onStartEditParent,
  onSaveEditedParent,
  onCancelEditParent,
  onDeleteParent,
  canEditTeam,
  selectedTeamMembers,
  subAssigneeId,
  subTitle,
  subStart,
  subEnd,
  onSubAssigneeChange,
  onSubTitleChange,
  onSubStartChange,
  onSubEndChange,
  onAddSubtask,
  filteredSubtasks,
  assigneeFilter,
  assigneeFilterOptions,
  onAssigneeFilterChange,
  editingSubtaskId,
  editingSubtaskDraft,
  setEditingSubtaskDraft,
  getTeamMemberIds,
  displayAssigneeLabel,
  onStartEditSubtask,
  onSaveEditedSubtask,
  onCancelEditSubtask,
  onDeleteSubtask,
  visibleTeams,
  teamFilter,
  onTeamFilterChange,
}: BacklogTabProps) {
  const [openParentById, setOpenParentById] = useState<Record<number, boolean>>({});

  const getParentSubtasks = (parentId: number) => filteredSubtasks.filter((subtask) => Number(subtask.parentTaskId) === Number(parentId));

  const toggleParent = (parentId: number) => {
    const fallbackOpen = Number(selectedParentId) === Number(parentId);
    setOpenParentById((prev) => ({ ...prev, [parentId]: !(prev[parentId] ?? fallbackOpen) }));
    onSelectParent(parentId);
  };

  const runHeaderAction = (event: MouseEvent, action: () => void) => {
    event.preventDefault();
    event.stopPropagation();
    action();
  };

  const formatDate = (date: Dayjs | undefined): string => (date ? dayjs(date).format("DD.MM.YYYY") : "Нет срока");
  const memberOptions = (ids: number[]) => ids.map((id) => ({ value: String(id), label: formatAssigneeName(displayAssigneeLabel(Number(id))) }));

  const renderParentEditor = (parent: PlannerParentTask) => (
    <div className="backlog-edit-grid backlog-edit-grid--parent" onClick={(event) => event.stopPropagation()}>
      <Input value={editingParentDraft?.title ?? ""} onChange={(event) => setEditingParentDraft((prev) => (prev ? { ...prev, title: event.target.value } : prev))} placeholder="Название большой задачи" />
      <Select value={editingParentDraft?.assigneeId != null ? String(editingParentDraft.assigneeId) : ""} onChange={(value) => setEditingParentDraft((prev) => (prev ? { ...prev, assigneeId: value ? Number(value) : undefined } : prev))} options={[{ value: "", label: "Без ответственного" }, ...memberOptions(getTeamMemberIds(parent.teamId))]} />
      <DatePicker format="DD.MM.YYYY" value={editingParentDraft?.startDate} onChange={(startDate) => setEditingParentDraft((state) => (state ? { ...state, startDate: startDate ?? undefined } : null))} />
      <DatePicker format="DD.MM.YYYY" value={editingParentDraft?.endDate} onChange={(endDate) => setEditingParentDraft((state) => (state ? { ...state, endDate: endDate ?? undefined } : null))} />
    </div>
  );

  const renderSubtaskEditor = (subtask: PlannerSubtask) => (
    <div className="backlog-edit-grid">
      <Input value={editingSubtaskDraft?.title ?? ""} onChange={(event) => setEditingSubtaskDraft((prev) => (prev ? { ...prev, title: event.target.value } : prev))} placeholder="Название подзадачи" />
      <Select value={editingSubtaskDraft?.assigneeId != null ? String(editingSubtaskDraft.assigneeId) : "0"} onChange={(value) => setEditingSubtaskDraft((prev) => (prev ? { ...prev, assigneeId: Number(value) } : prev))} options={[{ value: "0", label: "Без ответственного" }, ...memberOptions(getTeamMemberIds(subtask.teamId))]} />
      <DatePicker format="DD.MM.YYYY" value={editingSubtaskDraft?.startDate} onChange={(startDate) => setEditingSubtaskDraft((state) => (state ? { ...state, startDate: startDate ?? undefined } : null))} />
      <DatePicker format="DD.MM.YYYY" value={editingSubtaskDraft?.endDate} onChange={(endDate) => setEditingSubtaskDraft((state) => (state ? { ...state, endDate: endDate ?? undefined } : null))} />
    </div>
  );

  const renderSubtaskRow = (subtask: PlannerSubtask) => {
    const assigneeLabel = getSubtaskAssignee(subtask, displayAssigneeLabel);
    const subtaskEditable = canEditTeam(subtask.teamId);
    const isEditing = editingSubtaskId === subtask.id && editingSubtaskDraft;

    return (
      <Card key={subtask.id} className="backlog-subtask-card" size="small">
        <Flex justify="space-between" align="flex-start" gap={12} wrap="wrap">
          {isEditing ? (
            renderSubtaskEditor(subtask)
          ) : (
            <div className="backlog-task-copy">
              <Button type="link" className="backlog-title-link" onClick={() => onOpenTaskCard("subtask", subtask.id)}>
                {subtask.title}
              </Button>
              <Space size={[6, 6]} wrap>
                <Tag icon={<CalendarOutlined />}>{formatDate(subtask.startDate)} — {formatDate(subtask.endDate)}</Tag>
                <Tag icon={<UserOutlined />} color={subtask.assigneeId ? "blue" : "default"}>{assigneeLabel}</Tag>
                <Tag color={subtask.inSprint ? "green" : "gold"}>{subtask.inSprint ? "В спринте" : "Бэклог"}</Tag>
                <Tag>{subtask.status}</Tag>
              </Space>
            </div>
          )}

          {subtaskEditable && (
            isEditing ? (
              <Space>
                <Tooltip title="Сохранить"><Button type="primary" icon={<CheckOutlined />} onClick={onSaveEditedSubtask} /></Tooltip>
                <Tooltip title="Отменить"><Button icon={<CloseOutlined />} onClick={onCancelEditSubtask} /></Tooltip>
              </Space>
            ) : (
              <Space>
                <Tooltip title="Редактировать"><Button icon={<EditOutlined />} onClick={() => onStartEditSubtask(subtask.id)} /></Tooltip>
                <Popconfirm title="Вы уверены, что хотите удалить эту подзадачу?" onConfirm={() => onDeleteSubtask(subtask.id)} okText="Да" cancelText="Нет">
                  <Tooltip title="Удалить"><Button danger icon={<DeleteOutlined />} /></Tooltip>
                </Popconfirm>
              </Space>
            )
          )}
        </Flex>
      </Card>
    );
  };

  return (
    <div className="planner-stack backlog-tab">
      <Card className="planner-card backlog-hero">
        <Flex justify="space-between" gap={16} wrap="wrap" align="center">
          <Space direction="vertical" size={4}>
            <Text className="teams-eyebrow">Бэклог команды</Text>
            <Title level={3} className="backlog-title">{activeTeamName || "Выберите команду"}</Title>
          </Space>
          <Space size={[12, 12]} wrap>
            <Statistic title="Большие задачи" value={filteredParents.length} />
            <Statistic title="Подзадачи" value={filteredSubtasks.length} />
          </Space>
        </Flex>
        <div className="backlog-toolbar">
          <label className="planner-label"><span><TeamOutlined /> Команда</span><Select size="large" value={teamFilter || ""} onChange={(value) => onTeamFilterChange(String(value))} options={visibleTeams.length === 0 ? [{ value: "", label: "Нет команд" }] : visibleTeams.map((team) => ({ value: String(team.id), label: team.name }))} /></label>
          <label className="planner-label"><span><FilterOutlined /> Исполнитель</span><Select size="large" value={assigneeFilter} onChange={(value) => onAssigneeFilterChange(String(value))} options={assigneeFilterOptions} /></label>
        </div>
      </Card>

      <div className="backlog-list">
        {filteredParents.length === 0 && <Empty className="planner-card" image={Empty.PRESENTED_IMAGE_SIMPLE} description="Пока нет больших задач для выбранной команды" />}

        {filteredParents.map((parent) => {
          const parentSubtasks = getParentSubtasks(parent.id);
          const isOpen = Boolean(openParentById[parent.id] ?? Number(selectedParentId) === Number(parent.id)) || editingParentId === parent.id;
          const editable = canEditTeam(parent.teamId);
          const parentAssignee = parent.assigneeId ? formatAssigneeName(displayAssigneeLabel(parent.assigneeId)) : "Исполнитель не назначен";

          return (
            <Card key={parent.id} className={`backlog-parent-card ${isOpen ? "is-open" : ""}`}>
              <Flex justify="space-between" gap={12} align="flex-start" wrap="wrap">
                <button className="backlog-parent-summary" type="button" onClick={() => toggleParent(parent.id)}>
                  <span className="backlog-expander">{isOpen ? <CaretDownFilled /> : <CaretRightFilled />}</span>
                  <span className="backlog-task-copy">
                    <Text strong className="backlog-parent-title" onClick={(event) => runHeaderAction(event, () => onOpenTaskCard("parent", parent.id))}>{parent.title}</Text>
                    <Space size={[6, 6]} wrap>
                      <Badge count={parentSubtasks.length} overflowCount={99} color="#2563eb" />
                      <Tag icon={<CalendarOutlined />}>{formatDate(parent.startDate)} — {formatDate(parent.endDate)}</Tag>
                      <Tag icon={<UserOutlined />} color={parent.assigneeId ? "blue" : "default"}>{parentAssignee}</Tag>
                    </Space>
                  </span>
                </button>

                {editable && (
                  editingParentId === parent.id ? (
                    <Space>
                      <Tooltip title="Сохранить"><Button type="primary" icon={<CheckOutlined />} onClick={(event) => runHeaderAction(event, onSaveEditedParent)} /></Tooltip>
                      <Tooltip title="Отменить"><Button icon={<CloseOutlined />} onClick={(event) => runHeaderAction(event, onCancelEditParent)} /></Tooltip>
                    </Space>
                  ) : (
                    <Space>
                      <Tooltip title="Редактировать"><Button icon={<EditOutlined />} onClick={() => onStartEditParent(parent.id)} /></Tooltip>
                      <Popconfirm title="Вы уверены, что хотите удалить эту задачу?" onConfirm={() => onDeleteParent(parent.id)} okText="Да" cancelText="Нет">
                        <Tooltip title="Удалить"><Button danger icon={<DeleteOutlined />} /></Tooltip>
                      </Popconfirm>
                    </Space>
                  )
                )}
              </Flex>

              {isOpen && (
                <div className="backlog-parent-content">
                  {editingParentId === parent.id && editingParentDraft && renderParentEditor(parent)}
                  <Space direction="vertical" size={10} className="backlog-subtask-list">
                    {parentSubtasks.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Подзадач пока нет" /> : parentSubtasks.map(renderSubtaskRow)}
                  </Space>
                  <Card size="small" className="backlog-create-card" title={<Space><PlusOutlined />Новая подзадача</Space>}>
                    <div className="backlog-create-grid">
                      <Input value={subTitle} onChange={(event) => onSubTitleChange(event.target.value)} placeholder="Название подзадачи" />
                      <Select value={subAssigneeId || "0"} onChange={(value) => onSubAssigneeChange(String(value))} options={[{ value: "0", label: "Без ответственного" }, ...memberOptions(selectedTeamMembers)]} />
                      <DatePicker format="DD.MM.YYYY" value={subStart} onChange={(date) => onSubStartChange(date ? date : undefined)} placeholder="Начало" />
                      <DatePicker format="DD.MM.YYYY" value={subEnd} onChange={(date) => onSubEndChange(date ? date : undefined)} placeholder="Срок" />
                      <Button type="primary" icon={<PlusOutlined />} onClick={onAddSubtask}>Создать</Button>
                    </div>
                  </Card>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="planner-card backlog-create-card" title={<Space><FolderOpenOutlined />Новая большая задача</Space>}>
        <div className="backlog-create-grid backlog-create-grid--parent">
          <Input value={parentTitle} onChange={(event) => onParentTitleChange(event.target.value)} placeholder="Название большой задачи" />
          <Select value={parentAssigneeId || "0"} onChange={(value) => onParentAssigneeChange(String(value))} options={[{ value: "0", label: "Без ответственного" }, ...memberOptions(activeTeamMembers)]} />
          <DatePicker format="DD.MM.YYYY" value={parentStart} onChange={(date) => onParentStartChange(date ? date : undefined)} placeholder="Начало" />
          <DatePicker format="DD.MM.YYYY" value={parentEnd} onChange={(date) => onParentEndChange(date ? date : undefined)} placeholder="Срок" />
          <Button type="primary" icon={<PlusOutlined />} onClick={onAddParentTask}>Создать задачу</Button>
        </div>
      </Card>
    </div>
  );
}
