import { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import Modal from "../../../../components/Modal/Modal";
import type {
  PlannerParentTask,
  PlannerSubtask,
  PlannerTeam,
} from "../../../../types/planner";

type TaskCardModalProps = {
  isOpen: boolean;
  taskCardParent: PlannerParentTask | null;
  taskCardSubtask: PlannerSubtask | null;
  taskCardTeam: PlannerTeam | null;
  taskCardParentForSubtask: PlannerParentTask | null;
  taskCardSubtasksCount: number;
  displayAssigneeLabel: (id: number) => string;
  sourceLabelForTeam: (team: PlannerTeam) => string;
  onClose: () => void;
};

type ChecklistItem = {
  id: number;
  text: string;
  completed: boolean;
};

const formatDate = (date: Dayjs | undefined): string =>
  date ? dayjs(date).format("DD.MM.YYYY") : "Нет срока";

const formatInputDate = (date: Dayjs | undefined): string =>
  date ? dayjs(date).format("YYYY-MM-DD") : "";

export default function TaskCardModal({
  isOpen,
  taskCardParent,
  taskCardSubtask,
  taskCardTeam,
  taskCardParentForSubtask,
  taskCardSubtasksCount,
  displayAssigneeLabel,
  sourceLabelForTeam,
  onClose,
}: TaskCardModalProps) {
  const activeTask = taskCardSubtask || taskCardParent;
  const parentDescription = taskCardParent?.description || "";
  const startDate = taskCardSubtask?.startDate || taskCardParent?.startDate;
  const endDate = taskCardSubtask?.endDate || taskCardParent?.endDate;
  const assigneeId = taskCardSubtask?.assigneeId || taskCardParent?.assigneeId;
  const assigneeLabel = assigneeId ? displayAssigneeLabel(assigneeId) : "Не назначен";
  const sourceLabel = useMemo(
    () => (taskCardTeam ? sourceLabelForTeam(taskCardTeam) : ""),
    [sourceLabelForTeam, taskCardTeam]
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [checklistInput, setChecklistInput] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    if (!isOpen || !activeTask) return;

    setTitle(activeTask.title || "");
    setDescription(parentDescription);
    setChecklistInput("");
    setChecklist([]);
  }, [activeTask, isOpen, parentDescription]);

  const addChecklistItem = () => {
    const text = checklistInput.trim();

    if (!text) return;

    setChecklist((items) => [
      ...items,
      { id: Date.now(), text, completed: false },
    ]);
    setChecklistInput("");
  };

  const toggleChecklistItem = (itemId: number) => {
    setChecklist((items) =>
      items.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const removeChecklistItem = (itemId: number) => {
    setChecklist((items) => items.filter((item) => item.id !== itemId));
  };

  const completedChecklistItems = checklist.filter((item) => item.completed).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Задача">
      <div className="confirm-body planner-task-modal-body">
        {!activeTask ? (
          <div className="confirm-text">Задача не найдена.</div>
        ) : (
          <div className="planner-task-card planner-task-card--bitrix">
            <div className="planner-task-card__main">
              <label className="planner-task-field planner-task-field--title">
                <span className="planner-task-field__label">Название задачи</span>
                <input
                  className="planner-task-input planner-task-input--title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Введите название задачи"
                />
              </label>

              <label className="planner-task-field">
                <span className="planner-task-field__label">Описание</span>
                <textarea
                  className="planner-task-textarea"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Добавьте описание задачи"
                  rows={6}
                />
              </label>

              <section className="planner-task-checklist" aria-labelledby="task-checklist-title">
                <div className="planner-task-section-header">
                  <div>
                    <h3 id="task-checklist-title">Чеклист</h3>
                    <span>{completedChecklistItems} из {checklist.length} выполнено</span>
                  </div>
                </div>

                <div className="planner-task-checklist__add">
                  <input
                    className="planner-task-input"
                    value={checklistInput}
                    onChange={(event) => setChecklistInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") addChecklistItem();
                    }}
                    placeholder="Добавить пункт чеклиста"
                  />
                  <button type="button" onClick={addChecklistItem}>Добавить</button>
                </div>

                <div className="planner-task-checklist__items">
                  {checklist.length === 0 ? (
                    <div className="planner-task-checklist__empty">
                      Создайте первый пункт чеклиста для этой задачи.
                    </div>
                  ) : (
                    checklist.map((item) => (
                      <div className="planner-task-checklist__item" key={item.id}>
                        <label>
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => toggleChecklistItem(item.id)}
                          />
                          <span>{item.text}</span>
                        </label>
                        <button type="button" onClick={() => removeChecklistItem(item.id)} aria-label="Удалить пункт чеклиста">×</button>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            <aside className="planner-task-card__sidebar" aria-label="Параметры задачи">
              <div className="planner-task-side-panel">
                <h3>Сроки</h3>
                <label className="planner-task-field">
                  <span className="planner-task-field__label">Начало</span>
                  <input className="planner-task-input" type="date" defaultValue={formatInputDate(startDate)} />
                </label>
                <label className="planner-task-field">
                  <span className="planner-task-field__label">Крайний срок</span>
                  <input className="planner-task-input" type="date" defaultValue={formatInputDate(endDate)} />
                </label>
                <div className="planner-task-deadline-summary">
                  {formatDate(startDate)} — {formatDate(endDate)}
                </div>
              </div>

              <div className="planner-task-side-panel">
                <h3>Детали</h3>
                <div className="planner-task-meta-row"><span>Ответственный</span><strong>{assigneeLabel}</strong></div>
                <div className="planner-task-meta-row"><span>Команда</span><strong>{taskCardTeam?.name || "—"}</strong></div>
                {sourceLabel && <div className="planner-task-meta-row"><span>Источник</span><strong>{sourceLabel}</strong></div>}
                {taskCardParent && <div className="planner-task-meta-row"><span>Подзадач</span><strong>{taskCardSubtasksCount}</strong></div>}
                {taskCardSubtask && (
                  <>
                    <div className="planner-task-meta-row"><span>Статус</span><strong>{taskCardSubtask.status || "—"}</strong></div>
                    <div className="planner-task-meta-row"><span>Большая задача</span><strong>{taskCardParentForSubtask?.title || "—"}</strong></div>
                  </>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </Modal>
  );
}
