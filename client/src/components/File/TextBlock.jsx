import { CopyToClipboard } from "react-copy-to-clipboard";
import { useState } from "react";
import "../../styles/File/TextBlock.css";

export default function TextBlock({ label, text }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="text-block">
      <h3>{label}</h3>
      <textarea readOnly value={text} />
      <div>
        <CopyToClipboard text={text} onCopy={() => setCopied(true)}>
          <button>{copied ? "복사됨!" : "복사하기"}</button>
        </CopyToClipboard>
      </div>
    </div>
  );
}
