import { useTags } from "../utils"

interface TagsProps {
    controller: ReturnType<typeof useTags>;
}

export default ({ controller } : TagsProps) => {
    return (
        <div className="app-tags">
            <ul className="tags-list">
                {controller.tags.map(tag => (
                    <li onClick={() => controller.delete(tag)} key={tag} className="tag-item">
                        {tag}
                    </li>
                ))}
            </ul>
            <input className="app-tags-input" type="text" placeholder="Type new tag" onKeyDown={e => {
                if(e.key === "Enter" && e.target instanceof HTMLInputElement && e.target.value) {
                    controller.add(e.target.value);
                    e.target.value = "";
                }
            }} />
        </div>
    )
}