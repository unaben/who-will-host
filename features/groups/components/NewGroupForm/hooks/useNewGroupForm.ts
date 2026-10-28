import { useState, type SubmitEvent } from "react";
import { useCreateGroupMutation } from "@/store/groupApi";
import { GROUP_COLORS } from "@/constants";

const useNewGroupForm = () => {
  const [createGroup, { isLoading }] = useCreateGroupMutation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(GROUP_COLORS[0]!);
  const [error, setError] = useState("");

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Give the group a name.");
      return;
    }
    setError("");
    try {
      await createGroup({ name, description, color }).unwrap();
      setName("");
      setDescription("");
    } catch (err) {
      const message = (err as { data?: { message?: string } })?.data?.message;
      setError(message ?? "We could not create the group. Try again.");
    }
  };

  return {
    createGroup,
    name,
    setName,
    description,
    setDescription,
    color,
    setColor,
    error,
    setError,
    handleSubmit,
    isLoading,
    GROUP_COLORS,
  };
};

export default useNewGroupForm;
