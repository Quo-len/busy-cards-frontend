import "../styles/GroupNode.css";
import { NodeResizer } from "reactflow";
import { useNodeResize } from "../utils/utils";

const GroupNode = ({ id, data, isConnectable, selected }) => {
	const { label, childNodeIds = [] } = data;
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
				{label || "Group Node"}
				<NodeResizer color="#ff0071" isVisible={selected} minWidth={150} minHeight={50} onResize={handleResize} />

				<div className="group-subheader">
					{childNodeIds.length} item{childNodeIds.length !== 1 ? "s" : ""}
				</div>
			</div>
		</div>
	);
};

export default GroupNode;
