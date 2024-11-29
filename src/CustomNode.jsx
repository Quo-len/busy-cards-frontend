import React from "react";

const CustomNode = ({ data }) => {
  return (
    <div style={{ padding: 10, border: "1px solid #ddd", borderRadius: 4 }}>
      <input
        type="text"
        value={data.label}
        onChange={(e) =>
          data.onChange({ ...data, label: e.target.value }) // Оновлення вузла
        }
        style={{ width: "100%" }}
      />
    </div>
  );
};

export default CustomNode;
