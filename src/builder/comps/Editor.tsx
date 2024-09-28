import { useEffect, useState } from "react";
import { AlignCenterIcon, AlignJustifyIcon, AlignleftIcon, AlignRightIcon, BoldIcon, ItalicIcon, LineThroughIcon, ListIcon, NumbredListIcon, UnderlineIcon, UnlinkIcon } from "../icons";
import { useBuilderContext } from "../states";

interface BuilderEditorProps {
    value?: string;
    onChange?: (value: string) => void
}



const BuilderEditor = ({ value, onChange } : BuilderEditorProps) => {
	const [html, setHtml] = useState<string>("");
	const [selfEdit, setSelfEdit] = useState<boolean>(false);

	const editorConfig = {
		buttons: [
			{
				name: "Bold",
				command: "bold",
				icon: <BoldIcon />
			},
			{
				name: "Italic",
				command: "italic",
				icon: <ItalicIcon />
			},
			{
				name: "Underline",
				command: "underline",
				icon: <UnderlineIcon />
			},
			{
				name: "Line Through",
				command: "strikeThrough",
				icon: <LineThroughIcon />
			},
			{
				name: "Ordered List",
				command: "insertOrderedList",
				icon: <NumbredListIcon />
			},
			{
				name: "Unordered List",
				command: "insertUnorderedList",
				icon: <ListIcon />
			},
			{
				name: "Link",
				command: "createLink",
				icon: <ListIcon />
			},
			{
				name: "Unlink",
				command: "unlink",
				icon: <UnlinkIcon />
			},
			{
				name: "Align Left",
				command: "justifyLeft",
				icon: <AlignleftIcon />
			},
			{
				name: "Align Right",
				command: "justifyRight",
				icon: <AlignRightIcon />
			},
			{
				name: "Align Center",
				command: "justifyCenter",
				icon: <AlignCenterIcon />
			},
			{
				name: "Align Justify",
				command: "justifyFull",
				icon: <AlignJustifyIcon />
			},
		],
		fontSizes: [1, 2, 3, 4, 5, 6, 7],
		defaultFontSize: 3,
		fonts: ["inherit" ,"arial", "sans-serif"],
		defaultFont: "inherit"
	};

	const onInputHandler = (e: Event) => {
		onChange?.((e.target as HTMLElement).innerHTML);
	};

	useEffect(() => {
		if(!selfEdit) setHtml(value || "");
	}, [value])
  
    return (
		<div className="__Builder-Editor">
			<div className="__Builder-Editor-Tools">
				{editorConfig.buttons.map(button => (
					<button key={button.name} aria-label={button.name} onClick={e => {						
						e.preventDefault();
						document.execCommand(button.command, false, (() => {switch(button.name) {
							case "Link": return prompt("link", "#") as string;
							default: return undefined;
						}})());
					}}>
						{button.icon}
					</button>
				))}
				<div className="__Builder-Field" style={{ width: "3.5em", fontSize: "1em" }}>
					<label>color</label>
					<input style={{ width: "100%", padding: ".2em", paddingTop: ".5em" }} type="color" defaultValue="#000" onChange={e => {
						document.execCommand("foreColor", false, e.target.value)
					}} />
				</div>
				<div className="__Builder-Field" style={{ width: "5em", fontSize: "1em" }}>
					<label>highlight</label>
					<input style={{ width: "100%", padding: ".2em", paddingTop: ".5em" }} type="color" defaultValue="#000" onChange={e => {
						document.execCommand("hiliteColor", false, e.target.value)
					}} />
				</div>
				<div className="__Builder-Field" style={{ width: "3em", fontSize: "1em" }}>
					<label>size</label>
					<select style={{ padding: ".25em" }} defaultValue={editorConfig.defaultFontSize} onChange={e => {
						document.execCommand("fontSize", false, e.target.value)
					}}>
						{editorConfig.fontSizes.map(size => (
							<option key={size} value={size}>{size}</option>
						))}
					</select>
				</div>
				<div className="__Builder-Field" style={{ width: "6em", fontSize: "1em" }}>
					<label>font</label>
					<select style={{ padding: ".25em" }} defaultValue={editorConfig.defaultFont} onChange={e => {
						document.execCommand("fontName", false, e.target.value)
					}}>
						{editorConfig.fonts.map(size => (
							<option key={size} value={size}>{size}</option>
						))}
					</select>
				</div>

			</div>
			<div 
				dangerouslySetInnerHTML={{ __html: html }} 
				className="__Builder-Editor-Root" 
				contentEditable={true} 
				onInput={e => onInputHandler(e as any)}
				onFocus={() => setSelfEdit(true)}
				onBlur={() => setSelfEdit(false)}>
			</div>
		</div>
    )
}

export default BuilderEditor;