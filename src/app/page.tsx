import { FluidBackground } from "@/components/FluidBackground";
import { Navbar } from "@/components/Navbar";
import { WaitlistForm } from "@/components/WaitlistForm";
import { HeroFlow } from "@/components/HeroFlow";

export default function Home() {
  return (
    <>
      <Navbar />

      {/*
        Layout strategy:
        - Mobile/Tablet: single column, scrollable, orbital below form
        - Desktop (xl+): two-column, locked to screen height
      */}
      <main className="relative w-full selection:bg-white/10 selection:text-nova-text
        min-h-screen xl:h-screen xl:overflow-hidden flex flex-col">

        <FluidBackground />

        <div className="relative z-10 w-full flex-1 max-w-7xl mx-auto
          flex flex-col xl:flex-row
          items-center xl:items-center
          justify-start xl:justify-between
          px-5 sm:px-8 lg:px-12
          pt-28 sm:pt-32 xl:pt-20
          pb-12 sm:pb-16 xl:pb-12
          gap-0 xl:gap-12">

          {/* ── LEFT: HERO CONTENT ── */}
          <div className="flex-1 flex flex-col items-start w-full xl:justify-center xl:-mt-16">

            {/* Headline */}
            <h1 className="font-serif tracking-tight text-nova-text mb-5 sm:mb-6
              text-[44px] leading-[1.08]
              sm:text-[56px]
              md:text-[68px]
              lg:text-[80px]
              xl:text-[88px]">
              <span className="block">Invest by Goal.</span>
              <span className="block text-nova-muted italic mt-1 sm:mt-2">
                Not by Complexity.
              </span>
            </h1>

            {/* Body copy */}
            <p className="font-sans font-light leading-[1.75] text-[rgba(245,245,243,0.5)]
              mb-8 sm:mb-10
              text-[16px] sm:text-[17px]
              max-w-[440px] sm:max-w-[460px]">
              The first Autonomous Fixed Income Operating System on Stellar. Set a
              financial goal once and Novaire automatically creates, manages,
              redeems, and reinvests yield positions on your behalf.
            </p>

            {/* Waitlist form */}
            <WaitlistForm />
          </div>

          {/* ── RIGHT: ORBITAL VISUALIZATION ── */}
          {/*
            Desktop: right column, full height
            Tablet:  centred below content, fixed height
            Mobile:  centred below content, compact height
          */}
          <div className="
            w-full xl:flex-1 xl:h-full
            flex items-center justify-center
            mt-10 sm:mt-12 xl:mt-0
            h-[300px] sm:h-[380px] md:h-[440px] xl:h-full
          ">
            <HeroFlow />
          </div>
        </div>
      </main>
    </>
  );
}
