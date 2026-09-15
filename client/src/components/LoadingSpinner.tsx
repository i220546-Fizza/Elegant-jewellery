interface Props {
  fullScreen?: boolean;
  label?: string;
}

const LoadingSpinner = ({ fullScreen = false, label = 'Loading' }: Props) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-brown-light">
      <span className="relative flex h-10 w-10">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-champagne/40" />
        <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-champagne border-t-transparent animate-spin" />
      </span>
      <span className="text-xs uppercase tracking-widest2">{label}</span>
    </div>
  );

  if (fullScreen) {
    return <div className="flex min-h-[60vh] w-full items-center justify-center">{spinner}</div>;
  }
  return spinner;
};

export default LoadingSpinner;
