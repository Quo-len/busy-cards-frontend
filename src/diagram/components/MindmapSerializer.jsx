import { getRectOfNodes, useReactFlow, getTransformForBounds } from "reactflow";
import { toast } from "react-toastify";
import { toPng } from "html-to-image";
import useCanvasStore from "../../store/useCanvasStore";
import { v4 as uuidv4 } from "uuid";
import { useRef } from "react";
import jsPDF from "jspdf";
import "../styles/MindmapSerializer.css";

const MindmapSerializer = ({ mindmap, isVisible }) => {
	const fileInputRef = useRef(null);

	const { addNode, addEdge, getNodesArray, getEdgesArray } = useCanvasStore();
	const reactFlowInstance = useReactFlow();

	const exportToPng = () => {
		const nodes = getNodesArray();

		if (nodes.length === 0) {
			toast.error("Відсутні вузли для експорту.");
			return;
		}

		reactFlowInstance.fitView({
			padding: 0.2,
			includeHiddenNodes: true,
			duration: 0,
		});

		const nodesBounds = getRectOfNodes(nodes);
		const padding = Math.max(nodesBounds.width, nodesBounds.height) * 0.1;

		const expandedBounds = {
			x: nodesBounds.x - padding,
			y: nodesBounds.y - padding,
			width: nodesBounds.width + padding * 2,
			height: nodesBounds.height + padding * 2,
		};

		const imageWidth = Math.max(expandedBounds.width, 800);
		const imageHeight = Math.max(expandedBounds.height, 600);

		const transform = getTransformForBounds(expandedBounds, imageWidth, imageHeight, 0.5, 2);

		return new Promise((resolve, reject) => {
			toPng(document.querySelector(".react-flow__viewport"), {
				backgroundColor: "#ffffff",
				width: imageWidth + 50,
				height: imageHeight + 50,
				style: {
					width: `${imageWidth}px`,
					height: `${imageHeight}px`,
					transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
				},
				filter: (node) => {
					return !node.classList || !node.classList.contains("edgebutton");
				},
				cacheBust: true,
				pixelRatio: 2,
			})
				.then((dataUrl) => {
					resolve(dataUrl);
				})
				.catch((error) => {
					console.error("Error generating image:", error);
					reject(error);
				});
		});
	};

	function downloadImage(dataUrl, fileName) {
		const a = document.createElement("a");
		const formattedName = fileName
			? `${fileName.replace(/[^\u0400-\u04FFa-zA-Z0-9\s\-_]/g, " ").replace(/\s+/g, " ")}.png`
			: "mindmap.png";
		a.setAttribute("download", formattedName);
		a.setAttribute("href", dataUrl);
		a.click();

		toast.success("Успішний ескпорт.");
	}

	const exportToJSONFile = (fileName = "mindmap.json") => {
		const currentNodes = getNodesArray();
		const currentEdges = getEdgesArray();

		if (currentNodes.length === 0) {
			toast.error("На карті відсутні вузли.");
			return;
		}

		const data = {
			nodes: currentNodes,
			edges: currentEdges,
			metadata: {
				title: mindmap?.title || "Untitled Mindmap",
				exportedAt: new Date().toISOString(),
				version: "1.0",
			},
		};

		const jsonString = JSON.stringify(data, null, 2);
		const blob = new Blob([jsonString], { type: "application/json" });
		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = fileName.endsWith(".json") ? fileName : `${fileName}.json`;
		a.click();

		URL.revokeObjectURL(url);

		toast.success("Успішний експорт у JSON.");
	};

	const exportToPdf = async (fileName = "mindmap") => {
		const nodes = getNodesArray();
		if (nodes.length === 0) {
			toast.error("Відсутні вузли для експорту.");
			return;
		}
		try {
			const dataUrl = await exportToPng(fileName);
			const pdf = new jsPDF({
				orientation: "landscape",
				unit: "mm",
				format: "a4",
			});
			pdf.addFont("/fonts/NotoSans-Regular.ttf", "NotoSans", "normal");
			pdf.addFont("/fonts/NotoSans-Bold.ttf", "NotoSans", "bold");
			pdf.setFont("NotoSans");
			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = pdf.internal.pageSize.getHeight();
			const imgProps = pdf.getImageProperties(dataUrl);
			const imgWidth = pdfWidth - 20; // 10mm margin on each side
			const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
			const yOffset = Math.max(10, (pdfHeight - imgHeight) / 2);
			pdf.addImage(dataUrl, "PNG", 10, yOffset, imgWidth, imgHeight);
			const title = mindmap?.title || "Untitled Mindmap";
			pdf.setFontSize(16);
			pdf.setTextColor(0, 0, 0);
			pdf.text(title, pdfWidth / 2, 10, { align: "center" });
			pdf.addPage("a4", "portrait");
			const contentPageWidth = pdf.internal.pageSize.getWidth();
			const contentPageHeight = pdf.internal.pageSize.getHeight();
			pdf.setFontSize(18);
			pdf.text(title, contentPageWidth / 2, 15, { align: "center" });
			pdf.setFontSize(14);
			pdf.text("Вміст вузлів", contentPageWidth / 2, 25, { align: "center" });
			pdf.setFontSize(12);
			let yPosition = 35;
			const checkAndAddPage = (height) => {
				if (yPosition + height > contentPageHeight - 15) {
					pdf.addPage("a4", "portrait");
					yPosition = 20;
				}
			};
			nodes.forEach((node, index) => {
				checkAndAddPage(15);
				pdf.setFont("NotoSans", "bold");
				pdf.text(`${index + 1}. ${node.data.label || "Unnamed Node"}`, 10, yPosition);
				yPosition += 8;
				pdf.setFont("NotoSans", "normal");
				pdf.setFontSize(8);
				pdf.setTextColor(100, 100, 100);
				pdf.text(`Ідентифікатор: ${node.id} | Тип: ${node.type || "default"}`, 15, yPosition);
				yPosition += 5;
				pdf.setFontSize(12);
				pdf.setTextColor(0, 0, 0);
				const nodeKeys = Object.keys(node).filter(
					(key) =>
						key !== "children" &&
						key !== "data" &&
						key !== "position" &&
						key !== "width" &&
						key !== "height" &&
						typeof node[key] !== "function"
				);
				if (nodeKeys.length > 0) {
					checkAndAddPage(10);
					pdf.setFontSize(9);
					pdf.setTextColor(80, 80, 80);
					const keysStr = nodeKeys
						.map((key) => {
							const value = node[key];
							if (typeof value === "object" && value !== null) {
								return `${key}: [Object]`;
							} else {
								return `${key}: ${value}`;
							}
						})
						.join(", ");
					const keyLines = pdf.splitTextToSize(`Властивості: ${keysStr}`, contentPageWidth - 30);
					pdf.text(keyLines, 15, yPosition);
					yPosition += keyLines.length * 4 + 2;
					pdf.setFontSize(12);
					pdf.setTextColor(0, 0, 0);
				}
				if (node.position) {
					checkAndAddPage(5);
					pdf.setFontSize(9);
					pdf.setTextColor(80, 80, 80);
					pdf.text(`Позиція: x=${Math.round(node.position.x)}, y=${Math.round(node.position.y)}`, 15, yPosition);
					pdf.setFontSize(12);
					pdf.setTextColor(0, 0, 0);
					yPosition += 5;
				}
				if (node.data.content) {
					checkAndAddPage(10);
					pdf.setFont("NotoSans", "normal");
					pdf.setFontSize(10);
					pdf.setFont("NotoSans", "bold");
					pdf.text("Вміст:", 15, yPosition);
					yPosition += 5;
					pdf.setFont("NotoSans", "normal");
					pdf.setFontSize(12);
					const contentLines = pdf.splitTextToSize(node.data.content, contentPageWidth - 20);
					pdf.text(contentLines, 15, yPosition);
					yPosition += contentLines.length * 6 + 5;
				} else {
					yPosition += 5;
				}
				if (node.data) {
					const dataKeys = Object.keys(node.data).filter(
						(key) => key !== "label" && key !== "content" && typeof node.data[key] !== "function"
					);
					if (dataKeys.length > 0) {
						checkAndAddPage(10);
						pdf.setFontSize(9);
						pdf.setTextColor(80, 80, 80);
						dataKeys.forEach((key) => {
							const value = node.data[key];
							let displayValue;
							if (typeof value === "object" && value !== null) {
								displayValue = JSON.stringify(value).substring(0, 50);
								if (JSON.stringify(value).length > 50) displayValue += "...";
							} else {
								displayValue = String(value);
							}
							const keyLine = `${key}: ${displayValue}`;
							const keyLineWrapped = pdf.splitTextToSize(keyLine, contentPageWidth - 30);
							pdf.text(keyLineWrapped, 15, yPosition);
							yPosition += keyLineWrapped.length * 4 + 2;
						});

						pdf.setFontSize(12);
						pdf.setTextColor(0, 0, 0);
						yPosition += 2;
					}
				}
				pdf.setDrawColor(200, 200, 200);
				checkAndAddPage(5);
				if (index < nodes.length - 1) {
					pdf.line(10, yPosition, contentPageWidth - 10, yPosition);
					yPosition += 8;
				}
			});
			const totalPages = pdf.internal.getNumberOfPages();
			for (let i = 1; i <= totalPages; i++) {
				pdf.setPage(i);
				pdf.setFontSize(8);
				pdf.setTextColor(100, 100, 100);
				const currentDate = new Date().toLocaleDateString();
				const currentPageWidth = pdf.internal.pageSize.getWidth();
				const currentPageHeight = pdf.internal.pageSize.getHeight();
				pdf.text(
					`Експортовано: ${currentDate} | Сторінка ${i} з ${totalPages}`,
					currentPageWidth / 2,
					currentPageHeight - 5,
					{ align: "center" }
				);
			}
			const formattedName = fileName
				? `${fileName.replace(/[^\u0400-\u04FFa-zA-Z0-9\s\-_]/g, " ").replace(/\s+/g, " ")}.pdf`
				: "mindmap.pdf";
			pdf.save(formattedName);
			toast.success("Успішний експорт в PDF.");
		} catch (error) {
			console.error("Error generating PDF:", error);
			toast.error("Невдача експорту інтелект-карти в PDF.");
		}
	};

	const importFromJSON = (file) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (event) => {
				try {
					const jsonData = JSON.parse(event.target.result);
					if (!jsonData.nodes || !Array.isArray(jsonData.nodes) || !jsonData.edges || !Array.isArray(jsonData.edges)) {
						toast.error("Невірний формат файлу.");
						reject(new Error("Невірний формат"));
						return;
					}
					const shouldAdd = window.confirm("Ви впевнені, що дійсно хочете виконати імпорт?");
					if (!shouldAdd) {
						return;
					}
					const nodeIdMap = new Map();
					const importedNodes = jsonData.nodes.map((node) => {
						const newId = uuidv4();
						nodeIdMap.set(node.id, newId);
						return {
							...node,
							id: newId,
						};
					});
					const importedEdges = jsonData.edges.map((edge) => {
						return {
							...edge,
							id: uuidv4(),
							source: nodeIdMap.get(edge.source),
							target: nodeIdMap.get(edge.target),
						};
					});
					importedNodes.forEach((node) => addNode(node));
					importedEdges.forEach((edge) => addEdge(edge));
					resolve({
						nodeCount: importedNodes.length,
						edgeCount: importedEdges.length,
					});
				} catch (error) {
					toast.error(`Помилка зчитування JSON: ${error.message}`);
					reject(new Error(`Failed to parse JSON: ${error.message}`));
				}
			};

			reader.onerror = () => {
				toast.error(`Помилка при читанні файлу.`);
				reject(new Error("Error reading file"));
			};

			reader.readAsText(file);
		});
	};

	const handleFileImport = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		if (file.type !== "application/json") {
			toast.error("Будь ласка, виберіть файл формату JSON!");
			return;
		}

		importFromJSON(file)
			.then((result) => {
				toast.success(`Успішно додано ${result.nodeCount} вузлів та ${result.edgeCount} зв'язків.`);
				reactFlowInstance.fitView({
					includeHiddenNodes: true,
					minZoom: 0.1,
					maxZoom: 1,
				});
			})
			.catch((error) => {
				toast.error(`Помилка імпорту: ${error.message}`);
			});

		e.target.value = null;
	};

	const triggerImportFile = () => {
		fileInputRef.current.click();
	};

	return (
		<>
			<div className={`mindmap-serializer-container ${isVisible ? "visible" : "hidden"}`}>
				<div className="mindmap-serializer-header">
					<h3>Імпорт/Експорт</h3>
					<span>{isVisible ? "▼" : "▲"}</span>
				</div>

				<div className="mindmap-serializer-content">
					<input type="file" ref={fileInputRef} accept=".json" onChange={handleFileImport} />

					<div className="mindmap-serializer-buttons">
						<button className="mindmap-serializer-button" onClick={triggerImportFile}>
							Імпорт із JSON
						</button>

						<button className="mindmap-serializer-button" onClick={() => exportToJSONFile(mindmap?.title)}>
							Експорт в JSON
						</button>

						<button
							className="mindmap-serializer-button"
							onClick={() => exportToPng().then((dataUrl) => downloadImage(dataUrl, mindmap?.title))}
						>
							Експорт в PNG
						</button>

						<button className="mindmap-serializer-button" onClick={() => exportToPdf(mindmap?.title)}>
							Експорт в PDF
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default MindmapSerializer;
