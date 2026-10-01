import { useState } from 'react';
import { Button, TextField } from '@material-ui/core';

export const DEFAULT_TAG_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
];

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export function TagColorPicker({ value, onChange }: Props) {
  const [showCustomPicker, setShowCustomPicker] = useState(!DEFAULT_TAG_COLORS.includes(value));

  return (
    <div className="tag-color-picker">
      <div className="tag-color-palette" aria-label="预设标签颜色">
        {DEFAULT_TAG_COLORS.map((color) => (
          <button
            className={`tag-color-swatch${value === color ? ' selected' : ''}`}
            type="button"
            key={color}
            aria-label={`选择颜色 ${color}`}
            style={{ backgroundColor: color }}
            onClick={() => {
              setShowCustomPicker(false);
              onChange(color);
            }}
          />
        ))}
      </div>
      <Button type="button" size="small" onClick={() => setShowCustomPicker(!showCustomPicker)}>
        自定义颜色
      </Button>
      {showCustomPicker && (
        <TextField
          label="自定义颜色"
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      )}
    </div>
  );
}
