const GroupNode = ({ data, isConnectable, selected }) => {
	const { label, childNodeIds = [] } = data;

	return (
		<div className={`group-node ${selected ? "selected" : ""}`}>
			<div className="group-header">
				{label || "Group Node"}
				<div className="group-subheader">
					{childNodeIds.length} item{childNodeIds.length !== 1 ? "s" : ""}
				</div>
			</div>
		</div>
	);
};

export default GroupNode;
