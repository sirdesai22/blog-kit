"use client";
import { useContext } from "react";
import { HeaderContext } from "../context/HeaderContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export default function HeaderStyle() {
  const { headerStyle, setHeaderStyle } = useContext(HeaderContext);

  const handleStyleChange = (key: string, value: any) => {
    setHeaderStyle({ ...headerStyle, [key]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-md">Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Light Mode</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Input
                type="color"
                value={headerStyle.backgroundColorLight}
                onChange={(e) =>
                  handleStyleChange("backgroundColorLight", e.target.value)
                }
              />
              <Input
                type="color"
                value={headerStyle.textColorLight}
                onChange={(e) =>
                  handleStyleChange("textColorLight", e.target.value)
                }
              />
            </div>
          </div>
          <div>
            <Label>Dark Mode</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Input
                type="color"
                value={headerStyle.backgroundColorDark}
                onChange={(e) =>
                  handleStyleChange("backgroundColorDark", e.target.value)
                }
              />
              <Input
                type="color"
                value={headerStyle.textColorDark}
                onChange={(e) =>
                  handleStyleChange("textColorDark", e.target.value)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-md">Layout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Header Height</Label>
              <span className="text-sm text-muted-foreground">
                {headerStyle.height}px
              </span>
            </div>
            <Slider
              value={[headerStyle.height]}
              onValueChange={(val) => handleStyleChange("height", val[0])}
              max={100}
              min={40}
              step={1}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Sticky Header</Label>
            <Switch
              checked={headerStyle.sticky}
              onCheckedChange={(checked) =>
                handleStyleChange("sticky", checked)
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
