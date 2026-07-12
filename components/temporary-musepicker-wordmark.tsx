type TemporaryMusePickerWordmarkProps = {
  text: string;
};

export default function TemporaryMusePickerWordmark({
  text,
}: TemporaryMusePickerWordmarkProps) {
  return (
    <div
      aria-hidden="true"
      className="flex w-full max-w-[34rem] flex-col justify-center"
    >
      <span className="break-words font-nacelle text-[clamp(2.75rem,14vw,6.5rem)] font-semibold leading-none tracking-[-0.065em] text-ivory">
        {text}
      </span>
      <span className="mt-4 flex items-center gap-3">
        <span className="h-2 w-2 shrink-0 bg-signal" />
        <span className="h-px grow bg-signal/70" />
        <span className="font-mono text-[0.625rem] tracking-[0.16em] text-ivory/50">
          TYPOGRAPHY / PRE-LAUNCH
        </span>
      </span>
    </div>
  );
}
