import React from "react";
import { Stage, Layer, Rect, Text, Group } from "react-konva";

export default function BookingTableLayout({ tables, availability }) {
  const stageWidth = 800;
  const stageHeight = 500;

  return (
    <div
      style={{
        border: "1px solid #334155",
        padding: "20px",
        borderRadius: "12px",
        background: "#1e293b",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }}
    >
      <h3 className="text-2xl font-semibold mb-6 text-white">Table Layout</h3>

      <Stage width={stageWidth} height={stageHeight}>
        <Layer>
          {/* Outer rounded container */}
          <Rect
            x={10}
            y={10}
            width={stageWidth - 20}
            height={stageHeight - 20}
            fill="#0f172a"
            stroke="#334155"
            strokeWidth={2}
            cornerRadius={15}
          />

          {/* Draw each table */}
          {tables.map((table, index) => {
            const tableAvailability = availability.find(
              (a) => String(a.tableId) === String(table._id)
            );

            const isAvailable = tableAvailability?.available ?? true;
            const availableAt = tableAvailability?.availableAt;
            const fillColor = isAvailable ? "#5eead4" : "#fda4af"; // Bright teal for available, soft pink for unavailable

            return (
              <Group key={index}>
                {/* Draw table rectangle */}
                <Rect
                  x={table.position?.x || 50 + index * 80}
                  y={table.position?.y || 50 + index * 50}
                  width={table.size?.width || 70}
                  height={table.size?.height || 50}
                  fill={fillColor}
                  cornerRadius={8}
                  shadowBlur={10}
                  shadowColor="rgba(0,0,0,0.5)"
                  shadowOffset={{ x: 2, y: 2 }}
                  stroke="#475569"
                  strokeWidth={2}
                />

                {/* Table number */}
                <Text
                  x={(table.position?.x || 50 + index * 80) + 25}
                  y={(table.position?.y || 50 + index * 50) + 15}
                  text={`T${table.number || index + 1}`}
                  fontSize={16}
                  fill="#0f172a"
                  fontStyle="bold"
                  align="center"
                />

                {/* Availability time */}
                {availableAt && !isAvailable && (
                  <Text
                    x={table.position?.x || 50 + index * 80}
                    y={(table.position?.y || 50 + index * 50) + (table.size?.height || 40) + 5}
                    text={`Free at ${new Date(availableAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`}
                    fontSize={12}
                    fill="yellow"
                  />
                )}
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
