export type IconType = "emoji" | "lucide" | "custom";

export type DocIcon = 
  | { type: "emoji"; value: string }
  | { type: "lucide"; value: string } // Lucide icon name
  | { type: "custom"; value: string }; // URL to image

export interface IconPickerProps {
  current?: DocIcon;
  onChange: (icon: DocIcon) => void;
  onClose: () => void;
}
