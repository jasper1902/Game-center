import React from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";

type SelectProps = {
  orientation: "vertical" | "horizontal";
  onOrientationChange: (event: SelectChangeEvent) => void;
};

const SelectOrientation = ({
  orientation,
  onOrientationChange,
}: SelectProps) => {
  return (
    <FormControl fullWidth>
      <InputLabel id="orientation-label">Orientation</InputLabel>
      <Select
        value={orientation}
        label="orientation-label"
        onChange={onOrientationChange}
      >
        <MenuItem value="vertical">Vertical</MenuItem>
        <MenuItem value="horizontal">Horizontal</MenuItem>
      </Select>
    </FormControl>
  );
};

export default SelectOrientation;
