import React, { useState } from "react";
import { Stage, Layer, Rect, Circle, Text } from "react-konva";
import { Button, TextField, Box, Typography } from "@mui/material";

export default function TableLayoutEditor({ tables, setTables }) {
  const [selectedTable, setSelectedTable] = useState(null);

  const handleDragEnd = (e, index) => {
    const newTables = [...tables];
    newTables[index].position = { x: e.target.x(), y: e.target.y() };
    setTables(newTables);
  };

  const handleCapacityChange = (e) => {
    if (selectedTable !== null && tables[selectedTable]) {
      const newTables = [...tables];
      newTables[selectedTable].capacity = parseInt(e.target.value) || 1;
      setTables(newTables);
    }
  };

  const addTable = () => {
    const newTable = {
      tableNumber: tables.length + 1, // internal identifier
      number: tables.length + 1, // backend expects "number"
      capacity: 2,
      shape: "circle",
      position: { x: 50, y: 50 },
      size: { width: 50, height: 50 }, // consistent size
    };
    setTables([...tables, newTable]);
    setSelectedTable(tables.length); // auto-select newly added table
  };

  const removeTable = () => {
    if (selectedTable !== null && tables[selectedTable]) {
      setTables(tables.filter((_, idx) => idx !== selectedTable));
      setSelectedTable(null);
    }
  };

  return (
    <Box>
      <Typography variant="h6">Table Layout Editor</Typography>

      <Button variant="contained" onClick={addTable} sx={{ my: 2 }}>
        Add Table
      </Button>

      <Button variant="outlined" onClick={removeTable} sx={{ my: 2, ml: 2 }}>
        Remove Selected Table
      </Button>

      {/* Capacity Input */}
      {selectedTable !== null && tables[selectedTable] && (
        <Box sx={{ my: 2 }}>
          <TextField
            label="Capacity"
            type="number"
            value={tables[selectedTable]?.capacity || ""}
            onChange={handleCapacityChange}
            size="small"
          />
        </Box>
      )}

      {/* Table Layout Canvas */}
      <Stage width={800} height={500} style={{ border: "1px solid #ccc" }}>
        <Layer>
          {tables.map((table, index) =>
            table.shape === "circle" ? (
              <Circle
                key={index}
                x={table.position.x}
                y={table.position.y}
                radius={table.size?.width / 2 || 30}
                fill={selectedTable === index ? "orange" : "green"}
                draggable
                onDragEnd={(e) => handleDragEnd(e, index)}
                onClick={() => setSelectedTable(index)}
              />
            ) : (
              <Rect
                key={index}
                x={table.position.x}
                y={table.position.y}
                width={table.size?.width || 60}
                height={table.size?.height || 40}
                fill={selectedTable === index ? "orange" : "blue"}
                draggable
                onDragEnd={(e) => handleDragEnd(e, index)}
                onClick={() => setSelectedTable(index)}
              />
            )
          )}

          {/* Capacity Labels */}
          {tables.map((table, index) => (
            <Text
              key={index + "_label"}
              x={table.position.x - 10}
              y={table.position.y - 10}
              text={String(table.capacity || "")}
              fontSize={14}
              fill="white"
            />
          ))}
        </Layer>
      </Stage>
    </Box>
  );
}
