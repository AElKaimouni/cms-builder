import { Editor } from "react-draft-wysiwyg";
import { Dispatch, useEffect, useState } from "react";
import { EditorState, convertToRaw, ContentState   } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import { useMainContext } from "../states";

import "../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
interface BuilderEditorProps {
    value?: string;
    onChange?: (value: string) => void,
	controller?: [any, Dispatch<any>]
}

const settings = {
	options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'emoji', 'remove'],
	inline: {
	  dropdownClassName: undefined,
	  options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'],
	  bold: { },
	  italic: { },
	  underline: { },
	  strikethrough: { },
	  monospace: { },
	},
	blockType: {
	  options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code'],
	},
	fontSize: {
	  options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96],
	},
	fontFamily: {
	  options: ['Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana'],
	},
	list: {
	},
	textAlign: {
	},
	colorPicker: {
		component: ({ expanded, onExpandEvent, onChange, currentState: { color } }) => {
			return (
				<div
					aria-haspopup="true"
					aria-expanded={expanded}
					aria-label="rdw-color-picker"
				>
					<div
						onClick={onExpandEvent}
					>
						<input style={{
							width: "30px",
							height: "25px",
							padding: 0,
							marginBottom: "5px"
						}} type="color" value={color} onChange={(e) => onChange('color', e.target.value)} />
					</div>
				</div>
			)
		}
	},
	link: {
	},
	emoji: {
	  emojis: [
		'😀', '😁', '😂', '😃', '😉', '😋', '😎', '😍', '😗', '🤗', '🤔', '😣', '😫', '😴', '😌', '🤓',
		'😛', '😜', '😠', '😇', '😷', '😈', '👻', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '🙈',
		'🙉', '🙊', '👼', '👮', '🕵', '💂', '👳', '🎅', '👸', '👰', '👲', '🙍', '🙇', '🚶', '🏃', '💃',
		'⛷', '🏂', '🏌', '🏄', '🚣', '🏊', '⛹', '🏋', '🚴', '👫', '💪', '👈', '👉', '👉', '👆', '🖕',
		'👇', '🖖', '🤘', '🖐', '👌', '👍', '👎', '✊', '👊', '👏', '🙌', '🙏', '🐵', '🐶', '🐇', '🐥',
		'🐸', '🐌', '🐛', '🐜', '🐝', '🍉', '🍄', '🍔', '🍤', '🍨', '🍪', '🎂', '🍰', '🍾', '🍷', '🍸',
		'🍺', '🌍', '🚑', '⏰', '🌙', '🌝', '🌞', '⭐', '🌟', '🌠', '🌨', '🌩', '⛄', '🔥', '🎄', '🎈',
		'🎉', '🎊', '🎁', '🎗', '🏀', '🏈', '🎲', '🔇', '🔈', '📣', '🔔', '🎵', '🎷', '💰', '🖊', '📅',
		'✅', '❎', '💯',
	  ],
	},
	remove: {  },
}

const BuilderEditor = ({ value, onChange, controller } : BuilderEditorProps) => {
	const { controller: { router: { searchParams } } } = useMainContext();
	const blocksFromHtml = htmlToDraft(value);
	const { contentBlocks, entityMap } = blocksFromHtml;
	const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
	const editorState = EditorState.createWithContent(contentState);
	const [state, setState] = controller || useState(editorState);

	useEffect(() => {
		const rawContentState = convertToRaw(state.getCurrentContent());
 
		const markup = draftToHtml(
			rawContentState, 
			{
				trigger: "#",
				separator: " ",
			}
		);

		onChange?.(markup);
	}, [state]);
  
    return (
		<Editor toolbar={settings} editorState={state} onEditorStateChange={state => setState(state)} 
			wrapperClassName="text-editor-wrapper"
			editorClassName="text-editor"
			toolbarClassName="text-editor-toolbar"
		/>
	)
}

export default BuilderEditor;