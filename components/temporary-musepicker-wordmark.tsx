type TemporaryMusePickerWordmarkProps = {
  headingId: string;
  text: string;
};

export default function TemporaryMusePickerWordmark({
  headingId,
  text,
}: TemporaryMusePickerWordmarkProps) {
  return (
    <div className="flex w-full max-w-[32rem] flex-col justify-center">
      <h4
        id={headingId}
        className="break-words font-nacelle text-[clamp(2.75rem,12vw,5rem)] font-semibold leading-none tracking-[-0.06em] text-ivory"
      >
        {text}
      </h4>
      <span aria-hidden="true" className="mt-4 flex items-center gap-3">
        <span className="h-2 w-2 shrink-0 bg-signal" />
        <span className="h-px grow bg-signal/70" />
        <span className="font-mono text-[0.625rem] tracking-[0.16em] text-ivory/50">
          TYPOGRAPHY / PRE-LAUNCH
        </span>
      </span>
    </div>
  );
}
