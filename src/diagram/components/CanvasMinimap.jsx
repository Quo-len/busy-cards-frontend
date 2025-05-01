import { MiniMap } from "reactflow";
import { useEffect, useState } from "react";
import "../styles/CanvasMinimap.css";

const CanvasMinimap = ({ connectionStartNodeId, invalidTargetNodes, isVisible }) => {
	const [animationClass, setAnimationClass] = useState("");

	useEffect(() => {
		if (isVisible) {
			setAnimationClass("show");
		} else {
			setAnimationClass("hide");
		}
	}, [isVisible]);

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
				left: -14.8,
				bottom: -14.6,
				width: 300,
				height: 200,
				border: "1.5px solid black",
			}}
			maskColor="rgb(0,0,0, 0.1)"
			className={animationClass}
			ariaLabel="Minimap"
		/>
	);
};

export default CanvasMinimap;
