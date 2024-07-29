"use client";
import React from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useBattleshipStore } from "@/store/battleship";

export type ShipType = {
  name: string;
  size: number;
};

type SelectShipProps = {
  onSelectShip: (event: SelectChangeEvent) => void;
};

const SelectShip = ({ onSelectShip }: SelectShipProps) => {
  const { ships, selectedShip } = useBattleshipStore();
  return (
    <FormControl sx={{ minWidth: 200 }} fullWidth>
      <InputLabel id="select-ship-label">Select Ship</InputLabel>
      <Select
        value={selectedShip?.name ?? ""}
        label="Select Ship"
        onChange={onSelectShip}
      >
        {ships.map((ship: ShipType) => (
          <MenuItem key={ship.name} value={ship.name}>
            {ship.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectShip;
