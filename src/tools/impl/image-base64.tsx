"use client";

import { useState } from "react";
import { FileDrop, formatBytes, Output } from "@/components/ui";

export default function ImageBase64() {
  const [data, setData] = useState("");
  const [name, setName] = useState("");
  const [size, setSize] = useState(0);

  const onFile = (f: File) => {
    const r = new FileReader();
    r.onload = () => { setData(String(r.result)); setName(f.name); setSize(f.size); };
    r.readAsDataURL(f);
  };

  return (
    <>
      <FileDrop accept="image/*" onFile={onFile} label="Choose an image" />
      {data && (
        <>
          <p className="field-hint">{name} · {formatBytes(size)} → {formatBytes(data.length)} as data URI</p>
          <img src={data} alt="" className="preview-img" style={{ maxHeight: 200 }} />
          <Output label="Data URI" value={data} rows={5} />
          <Output label="CSS" value={`background-image: url("${data}");`} rows={3} />
          <Output label="HTML" value={`<img src="${data}" alt="" />`} rows={3} />
        </>
      )}
    </>
  );
}
