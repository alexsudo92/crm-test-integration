import { useEffect, useState } from "react";
import dayjs from "dayjs";
import type {
  PlannerParentTask,
  PlannerSubtask,
  PlannerTeam,
} from "../../../../types/planner";
import {
  Flex,
  Input,
  Button,
  Typography,
  DatePicker,
  Modal,
  Checkbox,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Text, Title } = Typography;

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

export default function TaskCardModal({
  isOpen,
  taskCardParent,
  taskCardSubtask,
  onClose,
}: TaskCardModalProps) {
  const activeTask = taskCardSubtask || taskCardParent;
  const parentDescription = taskCardParent?.description || "";
  const startDate = taskCardSubtask?.startDate || taskCardParent?.startDate;
  const endDate = taskCardSubtask?.endDate || taskCardParent?.endDate;

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
        item.id === itemId ? { ...item, completed: !item.completed } : item,
      ),
    );
  };

  const removeChecklistItem = (itemId: number) => {
    setChecklist((items) => items.filter((item) => item.id !== itemId));
  };

  return (
    <Modal open={isOpen} onCancel={onClose} onOk={onClose}>
      {!activeTask ? (
        <Text>Задача не найдена.</Text>
      ) : (
        <Flex gap={12} vertical>
          <Flex vertical>
            <Title
              level={3}
              editable={{
                text: title,
                onChange: (newTitle) => setTitle(newTitle),
                triggerType: ["icon", "text"],
              }}
            >
              {title}
            </Title>
          </Flex>

          <Flex vertical>
            <Text>Описание</Text>
            <TextArea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Добавьте описание задачи"
              autoSize
            />
          </Flex>

          <Flex gap={8} vertical>
            <Text>Чеклист</Text>
            <Flex gap={12}>
              <Input
                value={checklistInput}
                onChange={(event) => setChecklistInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addChecklistItem();
                }}
                placeholder="Добавить пункт чеклиста"
              />
              <Button onClick={addChecklistItem}>Добавить</Button>
            </Flex>

            <Flex gap={4} vertical>
              {checklist.length !== 0 &&
                checklist.map((item) => (
                  <Flex justify="space-between" align="center" key={item.id}>
                    <Flex gap={4}>
                      <Checkbox
                        checked={item.completed}
                        onChange={() => toggleChecklistItem(item.id)}
                      />
                      <Text>{item.text}</Text>
                    </Flex>
                    <Button
                      variant="outlined"
                      color="red"
                      size="small"
                      onClick={() => removeChecklistItem(item.id)}
                      icon={<CloseOutlined />}
                    />
                  </Flex>
                ))}
            </Flex>
          </Flex>

          <Flex gap={8} vertical>
            <Text>Сроки</Text>
            <Flex gap={4} align="center">
              <Text>Начало</Text>
              <DatePicker
                format="DD.MM.YYYY"
                value={dayjs(startDate)}
                getPopupContainer={(node) => node.parentNode as HTMLElement}
              />
            </Flex>
            <Flex gap={4} align="center">
              <Text>Крайний срок</Text>
              <DatePicker
                format="DD.MM.YYYY"
                value={dayjs(endDate)}
                getPopupContainer={(node) => node.parentNode as HTMLElement}
              />
            </Flex>
          </Flex>
        </Flex>
      )}
    </Modal>
  );
}
