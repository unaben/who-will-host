import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import type {
  CreateGroupInput,
  ActionResult,
  GroupView,
} from "@/features/events/events.types";
import type { Mode } from "@/types";

const useGroupHeader = (
  saveGroup: (input: CreateGroupInput) => Promise<ActionResult>,
  removeGroup: () => Promise<ActionResult>,
  group: GroupView,
) => {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("view");
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description ?? "");
  const [error, setError] = useState("");

  const startEditing = () => {
    setName(group.name);
    setDescription(group.description ?? "");
    setError("");
    setMode("edit");
  };

  const handleSave = async (e: SubmitEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Give the group a name.");
      return;
    }
    const result = await saveGroup({ name, description });
    if (result.ok) {
      setMode("view");
    } else {
      setError(result.message);
    }
  };

  const handleDelete = async () => {
    const result = await removeGroup();
    if (result.ok) {
      router.push("/");
    } else {
      setError(result.message);
    }
  };

  return {
    mode,
    setMode,
    name,
    setName,
    description,
    setDescription,
    error,
    setError,
    startEditing,
    handleSave,
    handleDelete,
  };
};

export default useGroupHeader;
