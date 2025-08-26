"use client";
import { Switch } from "@/components/ui/switch";
import { ImageIcon } from "lucide-react";
import { useState } from "react";
import { ChromePicker } from "react-color";
import { Dialog } from "@/components/ui/dialog";
import { DialogContent, DialogTrigger } from "@/components/ui/dialog";
import FontSettings from "./components/font-setting-row";

function ColorSwatch({
  hex,
  onChange,
  disabled = false,
}: {
  hex: string;
  onChange: (newHex: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`flex flex-col items-start gap-y-1  ${
        disabled ? "opacity-50  cursor-not-allowed " : ""
      }`}
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            disabled={disabled}
            className="h-18 w-18  border cursor-pointer disabled:cursor-not-allowed"
            style={{ backgroundColor: hex }}
          />
        </DialogTrigger>
        {!disabled && (
          <DialogContent className="w-fit p-0 m-0 rounded-xl overflow-hidden">
            <ChromePicker color={hex} onChange={(c) => onChange(c.hex)} />
          </DialogContent>
        )}
      </Dialog>
      <p className="text-small ml-[12px]">{hex}</p>
    </div>
  );
}

const ImageUploadPlaceholder = ({
  label,
  className = "w-24 h-16",
  disabled = false,
}: {
  label?: string;
  className?: string;
  disabled?: boolean;
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div
      className={`flex flex-col items-center gap-y-2 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {label && <p className="text-normal">{label}</p>}

      <label
        className={`relative flex items-center justify-center bg-secondary ${className}  overflow-hidden cursor-pointer ${
          disabled ? "pointer-events-none" : ""
        }`}
      >
        {preview ? (
          <img
            src={preview}
            alt="Uploaded"
            className="object-cover w-full h-full"
          />
        ) : (
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        )}

        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={disabled}
          onChange={handleChange}
        />
      </label>
    </div>
  );
};

const SettingsSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="grid grid-cols-1 gap-8 border-t py-md md:grid-cols-[400px_1fr]">
    <div>
      <h3 className="text-main">{title}</h3>
      <p className="text-small">{description}</p>
    </div>
    <div className="flex items-start mt-1">{children}</div>
  </div>
);

function CornerRadiusSelector() {
  const [selected, setSelected] = useState("Curved");

  const options = [
    { label: "Curved", className: "rounded-tl-md" },
    { label: "Rounded", className: "rounded-tl-2xl" },
    { label: "Sharp", className: "rounded-none" },
  ];

  return (
    <div className="flex gap-x-4">
      {options.map(({ label, className }) => (
        <button
          key={label}
          onClick={() => setSelected(label)}
          className="flex flex-col items-center gap-y-2 focus:outline-none"
        >
          <p
            className={`text-normal ${
              selected === label ? "text-normal" : "text-normal-muted"
            }`}
          >
            {label}
          </p>

          {/* outer box */}
          <div
            className={`flex h-[80px] w-[80px] items-start justify-start cursor-pointer p-2 transition rounded-xl 
              ${
                selected === label
                  ? "border-2 border-primary/50"
                  : "border-2 border-secondary"
              }`}
          >
            {/* inner corner stroke */}
            <div
              className={`h-[90%] w-[90%] border-t-2 border-l-2 border-foreground ${className}`}
            />
          </div>
        </button>
      ))}
    </div>
  );
}

function BrandColors({ darkModeDisabled }: { darkModeDisabled: boolean }) {
  const [brandColors, setBrandColors] = useState([
    { label: "Primary Color", lightHex: "#FF9F4D", darkHex: "#FF9F4D" },
    { label: "Secondary Color", lightHex: "#B8B8B8", darkHex: "#D9D9D9" },
    { label: "Background Color", lightHex: "#FFFFFF", darkHex: "#000000" },
    { label: "Heading Text Color", lightHex: "#000000", darkHex: "#FFFFFF" },
    { label: "Body Text Color", lightHex: "#6E6E6E", darkHex: "#D1D1D1" },
    { label: "Button Color", lightHex: "#FF9F4D", darkHex: "#FF9F4D" },
    { label: "Button Text Color", lightHex: "#FFFFFF", darkHex: "#FFFFFF" },
  ]);

  const updateColor = (
    label: string,
    mode: "lightHex" | "darkHex",
    value: string
  ) => {
    setBrandColors((prev) =>
      prev.map((c) => (c.label === label ? { ...c, [mode]: value } : c))
    );
  };

  return (
    <div>
      <div className="grid grid-cols-1 border-t py-md md:grid-cols-[200px_1fr]">
        <div className="flex flex-col gap-y-6">
          {/* Header Row */}
          <div className="grid grid-cols-[400px_100px_100px] items-center gap-x-4">
            <h3 className="text-main">Brand Colors</h3>
            <p className="text-normal text-center  mt-1 ml-2">Light Mode</p>
            <p
              className={`text-normal text-center mt-1 ml-2 ${
                !darkModeDisabled ? "text-muted-foreground" : "text-foreground"
              }`}
            >
              Dark Mode
            </p>
          </div>

          {/* Colors */}
          {brandColors.map((color) => (
            <div
              key={color.label}
              className="grid grid-cols-[420px_100px_100px] items-start gap-x-4"
            >
              <div>
                <p className="text-normal">{color.label}</p>
                <p className="text-small">Used for Buttons, XYZ, XYZ and XYZ</p>
              </div>

              {/* Light */}
              <ColorSwatch
                hex={color.lightHex}
                onChange={(val) => updateColor(color.label, "lightHex", val)}
              />

              {/* Dark */}
              <ColorSwatch
                hex={color.darkHex}
                onChange={(val) => updateColor(color.label, "darkHex", val)}
                disabled={!darkModeDisabled}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BrandSettings() {
  const [darkModeDisabled, setDarkModeDisabled] = useState(true);
  return (
    <div className="h-full p-4 sm:p-6">
      <header className="mb-md">
        <h1 className="text-header">Brand Settings</h1>
        <p className="text-normal-muted">Manage your brand</p>
      </header>

      <main>
        <SettingsSection
          title="Dark Mode"
          description="Supported formats (JPG, PNG, WebP) Minimum size: 100px"
        >
          <div className="flex items-center gap-x-2">
            <Switch
              id="dark-mode"
              checked={darkModeDisabled}
              onCheckedChange={setDarkModeDisabled}
            />
            <label htmlFor="dark-mode" className="text-normal ">
              Disabled
            </label>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Brand Logo"
          description="Supported formats (JPG, PNG, WebP) Minimum size: 100px"
        >
          <div className="flex gap-x-4">
            <ImageUploadPlaceholder className="w-28 h-16" label="Light Mode" />
            <ImageUploadPlaceholder
              disabled={!darkModeDisabled}
              className="w-28 h-16"
              label="Dark Mode"
            />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Favicon"
          description="Supported formats (JPG, PNG, WebP) Recommended size: 100px x 100px"
        >
          <ImageUploadPlaceholder className="w-18 h-18" />
        </SettingsSection>

        <BrandColors darkModeDisabled={darkModeDisabled} />

        <SettingsSection
          title="Corner Radius"
          description="Recommended size: 100px x 100px"
        >
          <CornerRadiusSelector />
        </SettingsSection>

        <SettingsSection
          title="Fonts"
          description="Supported formats (JPG, PNG, WebP) Recommended size: 100px x 100px"
        >
          <FontSettings />
        </SettingsSection>
      </main>
    </div>
  );
}
