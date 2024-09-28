import { useState } from "react";
import { Data, Field, Props } from "../../classes";
import { CompStyleProps, FieldTypes } from "../../types";
import { getTransformStyle, setTransformStyle } from "../../utils";
import { BooleanInput } from "./Boolean";
import { ModelInput } from "./Model";
import { NumberInput } from "./Number";
import { StringField, StringInput } from "./String";

interface StyleFieldProps {
    data: Data;
    styles: CompStyleProps;
}

export const StyleField = ({ data, styles } : StyleFieldProps) => {
    const dstyles = data.__style;
    return (
        <>
            {Object.keys(styles).map(styleName => {
                switch(styleName) {
                    case "typography": {
                        const style = styles[styleName];

                        return (
                            <div className="__Builder-Font-Style-Field __Builder-Field __Builder-Fields-Group">
                                <div className="__Builder-Fields-Group-Label">
                                    <label>Typography</label>
                                </div>
                                <div className="__Builder-Fields-Group-List">
                                    {style?.font && <StringInput 
                                        args={{ type: "enum", enums: style.font.fontsList }}
                                        label={"Font Family"}
                                        setValue={value => data.__edit(value, undefined, true, false, "fontFamily")}
                                        value={dstyles.fontFamily}
                                        defaultValue={style.font.default || "inherit"}
                                    />}
                                    {style?.color && <StringInput 
                                        args={{ type: "color" }}
                                        label={"Text Color"}
                                        setValue={value => data.__edit(value, undefined, true, false, "color")}
                                        value={dstyles.color}
                                        defaultValue={style.color.default || "inherit"}
                                    />}
                                    {style?.weight && <StringInput 
                                        args={{ type: "enum", enums: ["normal", "bold", "light"] }}
                                        label={"Font Weight"}
                                        setValue={value => data.__edit(value, undefined, true, false, "fontWeight")}
                                        value={dstyles.fontFamily}
                                        defaultValue={style.weight.default || "inherit"}
                                    />}
                                    {style?.size && <NumberInput 
                                        args={{ type: "float" }}
                                        label={"Font Size"}
                                        setValue={value => data.__edit(value, undefined, true, false, "fontSize")}
                                        value={dstyles.fontSize}
                                        defaultValue={style.size.default || "inherit" as any}
                                        placeholder="Auto"
                                    />}
                                    {style?.spacing && <NumberInput 
                                        args={{ type: "float" }}
                                        label={"Letter Spacing"}
                                        setValue={value => data.__edit(value, undefined, true, false, "letterSpacing")}
                                        value={dstyles.letterSpacing}
                                        defaultValue={style?.spacing.default || "inherit" as any}
                                        placeholder="Auto"
                                    />}
                                    {style?.height && <NumberInput 
                                        args={{ type: "float" }}
                                        label={"Line Height"}
                                        setValue={value => data.__edit(value, undefined, true, false, "lineHeight")}
                                        value={dstyles.lineHeight}
                                        defaultValue={style?.height.default || "inherit" as any}
                                        placeholder="Auto"
                                    />}
                                    {style?.align && <StringInput 
                                        args={{ type: "enum", enums: ["left", "center", "right", "justify"] }}
                                        label={"Text Align"}
                                        setValue={value => data.__edit(value, undefined, true, false, "textAlign")}
                                        value={dstyles.textAlign}
                                        defaultValue={style.align.default || "inherit"}
                                    />}
                                    {style?.style && <>
                                        {style.style.capitalize && <StringInput 
                                            args={{ type: "enum", enums: ["none","capitalize", "lowercase", "uppercase"] }}
                                            label={"Text Align"}
                                            setValue={value => data.__edit(value, undefined, true, false, "textTransform")}
                                            value={dstyles.textTransform}
                                            defaultValue={style.style.capitalize.default || "inherit"}
                                        />}
                                        {style.style.decoration && <StringInput 
                                            args={{ type: "enum", enums: ["none","line-through", "overline", "underline"] }}
                                            label={"Text Decoration"}
                                            setValue={value => data.__edit(value, undefined, true, false, "textDecoration")}
                                            value={dstyles.textDecoration}
                                            defaultValue={style.style.decoration.default || "inherit"}
                                        />}
                                        {style.style.italicize && <BooleanInput 
                                            args={{  }}
                                            label={"Italic Style"}
                                            setValue={value => data.__edit(value ? "italic" : "normal", undefined, true, false, "fontStyle")}
                                            value={dstyles.fontStyle === "italic"}
                                            defaultVal={style.style.italicize.default === "italic" || false}
                                        />}
                                    </>}
                                </div>
                            </div>
                        )
                    };
                    case "background": {
                        const style = styles[styleName];
                        const types = style ? Object.keys(style).filter(key => key !== "default") : [];

                        
                        if(style && types.length) return (
                            <div className="__Builder-Background-Style-Field __Builder-Field __Builder-Fields-Group">
                                <div className="__Builder-Fields-Group-Label">
                                    <label>Background</label>
                                </div>
                                <div className="__Builder-Fields-Group-List">
                                    {style.image && <ModelInput
                                        args={{ model: "media" }}
                                        label={"Background Image"}
                                        setValue={value => data.__edit(`url(${value.url})`, undefined, true, false, "background")}
                                        value={{ url: dstyles?.background?.match(/url\((.*)\)/)?.[1] }}
                                        defaultValue={style.default || "inherit"}
                                    />}
                                    {(style.solid || style.gradient) && <StringInput 
                                        args={{ type: "color", gradient: true }}
                                        label={"Background Color"}
                                        setValue={value => data.__edit(value, undefined, true, false, "background")}
                                        value={dstyles.background}
                                        defaultValue={style.default || "inherit"}
                                    />}
                                </div>
                            </div>
                        ); else return <></>
                    };
                    case "border" : {
                        const style = styles[styleName];

                        
                        if(style) return (
                            <div className="__Builder-Border-Style-Field __Builder-Field __Builder-Fields-Group">
                                <div className="__Builder-Fields-Group-Label">
                                    <label>Border</label>
                                </div>
                                <div className="__Builder-Fields-Group-List">
                                    <NumberInput 
                                        args={{ type: "float" }}
                                        label={"Border Size"}
                                        setValue={value => data.__edit(value, undefined, true, false, "borderWidth")}
                                        value={dstyles.borderWidth}
                                        defaultValue={style.default || "inherit" as any}
                                        placeholder="Auto"
                                    />
                                    <StringInput 
                                        args={{ type: "enum", enums: ["solid", "dashed", "dotted", "double"] }}
                                        label={"Border Type"}
                                        setValue={value => data.__edit(value, undefined, true, false, "borderStyle")}
                                        value={dstyles.borderStyle}
                                        defaultValue={style.default || "inherit"}
                                    />
                                    <StringInput 
                                        args={{ type: "color", gradient: true }}
                                        label={"Border Color"}
                                        setValue={value => data.__edit(value, undefined, true, false, "borderColor")}
                                        value={dstyles.borderColor}
                                        defaultValue={style.default || "inherit"}
                                    />
                                </div>
                            </div>
                        ); else return <></>
                    };
                    case "spacing" : {
                        const style = styles[styleName];

                        
                        if(style) return (
                            <>
                                {style["padding"] && <div className="__Builder-Padding-Style-Field __Builder-Field __Builder-Fields-Group">
                                    <div className="__Builder-Fields-Group-Label">
                                        <label>Padding</label>
                                    </div>
                                    <div className="__Builder-Fields-Group-List">
                                        <NumberInput 
                                            args={{ type: "float" }}
                                            label={"Left"}
                                            setValue={value => data.__edit(value, undefined, true, false, "paddingLeft")}
                                            value={dstyles.paddingLeft}
                                            defaultValue={style.padding.default || "inherit" as any}
                                            placeholder="Auto"
                                        />
                                        <NumberInput 
                                            args={{ type: "float" }}
                                            label={"Right"}
                                            setValue={value => data.__edit(value, undefined, true, false, "paddingRight")}
                                            value={dstyles.paddingRight}
                                            defaultValue={style.padding.default || "inherit" as any}
                                            placeholder="Auto"
                                        />
                                        <NumberInput 
                                            args={{ type: "float" }}
                                            label={"Top"}
                                            setValue={value => data.__edit(value, undefined, true, false, "paddingTop")}
                                            value={dstyles.paddingTop}
                                            defaultValue={style.padding.default || "inherit" as any}
                                            placeholder="Auto"
                                        />
                                        <NumberInput 
                                            args={{ type: "float" }}
                                            label={"Bottom"}
                                            setValue={value => data.__edit(value, undefined, true, false, "paddingBottom")}
                                            value={dstyles.paddingBottom}
                                            defaultValue={style.padding.default || "inherit" as any}
                                            placeholder="Auto"
                                        />
                                    </div>
                                </div>}
                                {style["margin"] && <div className="__Builder-Margin-Style-Field __Builder-Field __Builder-Fields-Group">
                                    <div className="__Builder-Fields-Group-Label">
                                        <label>Margin</label>
                                    </div>
                                    <div className="__Builder-Fields-Group-List">
                                        <NumberInput 
                                            args={{ type: "float" }}
                                            label={"Left"}
                                            setValue={value => data.__edit(value, undefined, true, false, "marginLeft")}
                                            value={dstyles.marginLeft}
                                            defaultValue={style.margin.default || "inherit" as any}
                                            placeholder="Auto"
                                        />
                                        <NumberInput 
                                            args={{ type: "float" }}
                                            label={"Right"}
                                            setValue={value => data.__edit(value, undefined, true, false, "marginRight")}
                                            value={dstyles.marginRight}
                                            defaultValue={style.margin.default || "inherit" as any}
                                            placeholder="Auto"
                                        />
                                        <NumberInput 
                                            args={{ type: "float" }}
                                            label={"Top"}
                                            setValue={value => data.__edit(value, undefined, true, false, "marginTop")}
                                            value={dstyles.marginTop}
                                            defaultValue={style.margin.default || "inherit" as any}
                                            placeholder="Auto"
                                        />
                                        <NumberInput 
                                            args={{ type: "float" }}
                                            label={"Bottom"}
                                            setValue={value => data.__edit(value, undefined, true, false, "marginBottom")}
                                            value={dstyles.marginBottom}
                                            defaultValue={style.margin.default || "inherit" as any}
                                            placeholder="Auto"
                                        />
                                    </div>
                                </div>}
                            </>
                        ); else return <></>
                    };
                    case "transform" : {
                        const style = styles[styleName];

                        
                        if(style) return (
                            <>
                                {style["position"] && <div className="__Builder-Position-Style-Field __Builder-Field __Builder-Fields-Group">
                                    <div className="__Builder-Fields-Group-Label">
                                        <label>Position</label>
                                    </div>
                                    <div className="__Builder-Fields-Group-List">
                                        <div style={{ width: "100%" }}>
                                            <StringInput 
                                                args={{ type: "enum", enums: ["absolute", "relative", "static", "fixed"] }}
                                                label={"Position Type   "}
                                                setValue={value => data.__edit(value, undefined, true, false, "position")}
                                                value={dstyles.position}
                                                defaultValue={"static"}
                                            />
                                        </div>
                                        <NumberInput 
                                            args={{ type: "float" }}
                                            label={"X"}
                                            setValue={value => data.__edit(value, undefined, true, false, "left")}
                                            value={dstyles.left}
                                            defaultValue={style.position.default?.[0] || 0}
                                            placeholder="Auto"
                                            disabled={!["absolute", "relative", "fixed"].includes(dstyles.position)}
                                        />
                                        <NumberInput 
                                            args={{ type: "float" }}
                                            label={"Y"}
                                            setValue={value => data.__edit(value, undefined, true, false, "top")}
                                            value={dstyles.top}
                                            defaultValue={style.position.default?.[1] || 0}
                                            placeholder="Auto"
                                            disabled={!["absolute", "relative", "fixed"].includes(dstyles.position)}
                                        />
                                    </div>
                                </div>}
                                {style["size"] && <div className="__Builder-Size-Style-Field __Builder-Field __Builder-Fields-Group">
                                    <div className="__Builder-Fields-Group-Label">
                                        <label>Size</label>
                                    </div>
                                    <div className="__Builder-Fields-Group-List">
                                        <NumberInput 
                                            args={{ type: "float" }}
                                            label={"Width"}
                                            setValue={value => data.__edit(value, undefined, true, false, "width")}
                                            value={dstyles.width}
                                            defaultValue={style.size.default?.[0] || 0}
                                            placeholder="Auto"
                                        />
                                        <NumberInput 
                                            args={{ type: "float" }}
                                            label={"Height"}
                                            setValue={value => data.__edit(value, undefined, true, false, "height")}
                                            value={dstyles.height}
                                            defaultValue={style.size.default?.[1] || 0}
                                            placeholder="Auto"
                                        />
                                    </div>
                                </div>}
                                {style["scale"] && (() =>  {
                                    const transform = getTransformStyle(dstyles.transform);

                                    return (
                                        <div className="__Builder-Size-Style-Field __Builder-Field __Builder-Fields-Group">
                                            <div className="__Builder-Fields-Group-Label">
                                                <label>Transform</label>
                                            </div>
                                            <div className="__Builder-Fields-Group-List">
                                                <NumberInput 
                                                    args={{ type: "float" }}
                                                    label={"Scale X"}
                                                    setValue={value => data.__edit(setTransformStyle(transform, { scaleX: value / 100 }), undefined, true, false, "transform")}
                                                    value={transform.scale[0] * 100}
                                                    defaultValue={style.scale.default?.[0] || 0}
                                                    placeholder="Auto"
                                                    disabled={!["absolute", "relative", "fixed", "static"].includes(dstyles.position)}
                                                />
                                                <NumberInput 
                                                    args={{ type: "float" }}
                                                    label={"Scale Y"}
                                                    setValue={value => data.__edit(setTransformStyle(transform, { scaleY: value / 100 }), undefined, true, false, "transform")}
                                                    value={transform.scale[1] * 100}
                                                    defaultValue={style.scale.default?.[1] || 0}
                                                    placeholder="Auto"
                                                    disabled={!["absolute", "relative", "fixed", "static"].includes(dstyles.position)}
                                                />
                                                {style["rotate"]  && <NumberInput 
                                                    args={{ type: "float" }}
                                                    label={"Rotate"}
                                                    setValue={value => data.__edit(setTransformStyle(transform, { rotate: value }), undefined, true, false, "transform")}
                                                    value={transform.rotate}
                                                    defaultValue={style.rotate.default || 0}
                                                    placeholder="Auto"
                                                    disabled={!["absolute", "relative", "fixed", "static"].includes(dstyles.position)}
                                                />}
                                            </div>
                                        </div>
                                    )
                                })()}
                            </>
                        ); else return <></>
                    }; 
                    default: return <></>;
                }
            })}
        </>
    )
}