import { EditorState } from "@/store/editor-store";
import { useEditorStore } from "@/store/editor-store";

export default function HeaderBlock({ state }: { state: EditorState }) {
  const setState = useEditorStore((state) => state.setState);
  return (
    <div className="flex flex-col mb-[68px] gap-[16px]">
      {false && (
        <div>
          <img
            width={64}
            height={64}
            className="object-fit rounded-[20px]"
            src={state.data.header.image ?? ""}
          />
        </div>
      )}
      <div>
        <input
          className="text-[32px] w-[300] leading-0 font-medium outline-none placeholder:text-zinc-400"
          placeholder="Heading"
          spellCheck={false}
          value={state.data.header.heading}
          onChange={(e) =>
            setState((s) => {
              s.data.header.heading = e.target.value;
            })
          }
        />
        <input
          className="text-[32px] w-[300] leading-0 font-medium outline-none placeholder:text-zinc-400 text-zinc-500"
          placeholder="Subheading"
          value={state.data.header.subheading}
          onChange={(e) =>
            setState((s) => {
              s.data.header.subheading = e.target.value;
            })
          }
        />
      </div>
    </div>
  );
}
