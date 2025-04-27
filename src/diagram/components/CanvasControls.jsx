import { Controls, ControlButton } from "reactflow";

import { VscSearchStop } from "react-icons/vsc";
import { VscSearch } from "react-icons/vsc";

import { FaMap } from "react-icons/fa";
import { FaRegMap } from "react-icons/fa";

import { TbLayoutSidebarFilled } from "react-icons/tb";
import { TbLayoutSidebarLeftExpandFilled } from "react-icons/tb";

import { TbLayoutSidebarRightFilled } from "react-icons/tb";
import { TbLayoutSidebarRightExpandFilled } from "react-icons/tb";

import { BiShow } from "react-icons/bi";
import { BiHide } from "react-icons/bi";

const CanvasControls = ({ isOpen, onUpdate }) => {
	const setAllFields = (value) => {
		onUpdate("leftBar", value);
		onUpdate("rightBar", value);
		onUpdate("searchBar", value);
		onUpdate("minimap", value);
	};

	return (
		<Controls
			position="bottom-center"
			style={{
				display: "flex",
				flexDirection: "row",
				transform: "scale(1.5)",
				transformOrigin: "center",
			}}
		>
			<ControlButton
				onClick={() => {
					onUpdate("minimap", !isOpen.minimap);
				}}
			>
				{isOpen.minimap ? <FaMap /> : <FaRegMap />}
			</ControlButton>
			<ControlButton
				onClick={() => {
					onUpdate("leftBar", !isOpen.leftBar);
				}}
			>
				{isOpen.leftBar ? <TbLayoutSidebarFilled /> : <TbLayoutSidebarLeftExpandFilled />}
			</ControlButton>
			<ControlButton
				onClick={() => {
					onUpdate("rightBar", !isOpen.rightBar);
				}}
			>
				{isOpen.rightBar ? <TbLayoutSidebarRightFilled /> : <TbLayoutSidebarRightExpandFilled />}
			</ControlButton>
			<ControlButton
				onClick={() => {
					onUpdate("searchBar", !isOpen.searchBar);
				}}
			>
				{isOpen.searchBar ? <VscSearch /> : <VscSearchStop />}
			</ControlButton>

			<ControlButton
				onClick={() => {
					setAllFields(!Object.values(isOpen).some((value) => value === true));
				}}
			>
				{Object.values(isOpen).some((value) => value === true) ? <BiShow /> : <BiHide />}
			</ControlButton>
		</Controls>
	);
};

export default CanvasControls;
