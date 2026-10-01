import {
  Checkbox, ListItemText, MenuItem, TextField,
} from '@material-ui/core';
import type { TagDto } from '@server/dto';

interface Props {
  id: string;
  tags: TagDto[];
  value: number[];
  onChange: (tagIds: number[]) => void;
}

export function TagSelector({
  id, tags, value, onChange,
}: Props) {
  return (
    <TextField
      select
      fullWidth
      variant="outlined"
      id={id}
      label="标签"
      value={value}
      SelectProps={{
        multiple: true,
        onChange: (event) => {
          const { value: selected } = event.target;
          onChange(typeof selected === 'string' ? selected.split(',').map(Number) : selected as number[]);
        },
        renderValue: (selected) => {
          const selectedTagIds = selected as number[];
          if (selectedTagIds.length === 0) return '未选择标签';
          return tags.filter((tag) => selectedTagIds.includes(tag.id)).map((tag) => tag.name).join(', ');
        },
      }}
    >
      {tags.map((tag) => (
        <MenuItem key={tag.id} value={tag.id}>
          <Checkbox checked={value.includes(tag.id)} />
          <ListItemText primary={tag.name} />
        </MenuItem>
      ))}
    </TextField>
  );
}
