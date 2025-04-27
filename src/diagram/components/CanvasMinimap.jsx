import { MiniMap } from "reactflow";

const CanvasMinimap = ({ connectionStartNodeId, invalidTargetNodes }) => {
	return (
		<MiniMap
			position="bottom-left"
			zoomStep={1}
			pannable
			zoomable
			nodeStrokeColor={(n) => {
				if (connectionStartNodeId && invalidTargetNodes.includes(n.id)) return "red";
				if (n.style?.background) return `${n.style.background}`;
				if (n.type === "custom") return "#0041d0";
				return "#eee";
			}}
			nodeColor={(n) => {
				if (n.style?.background) return `${n.style.background}`;
				return "#fff";
			}}
			nodeBorderRadius={2}
			style={{
				width: 300,
				height: 200,
				border: "1px solid black",
			}}
			maskColor="rgb(0,0,0, 0.1)"
		/>
	);
};

export default CanvasMinimap;
