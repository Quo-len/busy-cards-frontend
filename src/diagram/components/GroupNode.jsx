import "../styles/GroupNode.css";
import { NodeResizer } from "reactflow";
import { useNodeResize } from "../utils/utils";

const GroupNode = ({ id, data, selected }) => {
	const { label } = data;
	const handleResize = useNodeResize(id);

	return (
		<div
			className={`group-node ${selected ? "selected" : ""}`}
			style={{
				width: data.width,
				height: data.height,
			}}
		>
			<div className="group-header">
				{data.label || "Група"}
				<NodeResizer color="#ff0071" isVisible={selected} minWidth={150} minHeight={50} onResize={handleResize} />
			</div>
		</div>
	);
};

export default GroupNode;
