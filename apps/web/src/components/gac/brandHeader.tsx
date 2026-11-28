import Image from "next/image";

export const BrandHeader = () => (
  <header className="relative z-10 flex items-center gap-3">
    <Image
      src="/logo.svg"
      alt=""
      width={51}
      height={48}
      className="h-12 w-auto"
      priority
      unoptimized
    />
    <div className="h-12 w-px bg-gold/55" />
    <div className="leading-[1.05]">
      <span className="mb-0.5 block text-[10px] font-medium tracking-[2px] text-gold">
        GRUPO
      </span>
      <strong className="block text-lg font-medium tracking-[0.5px] uppercase">
        Adriano
        <br />
        Cobuccio
      </strong>
    </div>
  </header>
);
