import { SetStateAction } from "react";
import type { Mode } from "@/types";

export type EditGroupFormProps = {
  handleSave: (e: React.SubmitEvent<Element>) => Promise<void>;
  error: string;
  name: string;
  description: string;
  setDescription: (value: SetStateAction<string>) => void;
  isSaving: boolean;
  setMode: (value: SetStateAction<Mode>) => void;
  setName: (value: SetStateAction<string>) => void
};
