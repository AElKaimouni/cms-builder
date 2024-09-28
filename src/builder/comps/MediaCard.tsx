import { ReactNode } from "react";
import { FileType, BuilderMedia as MediaType } from "../types";
import { DeleteIcon, EditIcon } from "../icons";

export interface MediaProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    media: FileType | { preview: string } | MediaType | any;
    onDelete?: () => void;
    onEdit?: () => void;
    onSelect?: () => void;
    info?: boolean;
    selected?: boolean;
    children?: ReactNode; 
}

const MediaCard = ({ media, onDelete, onEdit, onSelect, info, selected, children, ...props } : MediaProps) => {
    const type = media.type ? media.type.split("/")[0] : null;
    const format = media.format || (media.type ? media.type.split("/")[1] : null) ;
    const source = media.preview ? media.preview : media.url;
    const infoCond = (info === undefined || media === true);
                             
    return(
        <div {...props} className={`__Builder-Media-Card ${selected ? "__Builder-Checked" : ""} ${props.className}`} >
            <div className="__Builder-Media-Card-Img-Cnt" onClick={() => {if(onSelect) onSelect()}}>
                {(type === "image" || !media.type) && 
                    <img src={source} alt="" />
                }
                {type === "video" && <video controls>
                    <source src={source} type={media.type} />
                </video>}


                {onSelect && <div className="__Builder-Media-Card-Checkbox">
                    <input type="checkbox" checked={selected} onChange={() => {}} />
                </div>}
            </div>
            
            {infoCond && 
                <span>{type}</span>
            }
            {children}
            <div className="__Builder-Media-Card-Buttons">
                {onEdit && 
                    <button className="__Builder-Media-Card-edit-btn" onClick={onEdit}>
                        <EditIcon />
                    </button>}
                {onDelete && 
                    <button className="__Builder-Media-Card-Delete-btn" onClick={onDelete}>
                        <DeleteIcon />
                    </button>}
            </div>
        </div>
    )
}

export default MediaCard;