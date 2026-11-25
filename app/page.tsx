import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Journey from "@/components/Journey";
import Amenities from "@/components/Amenities";
import Homes from "@/components/Homes";
import Visit from "@/components/Visit";
import ScrollGuide from "@/components/ScrollGuide";

export default function Page() {
  return (
    <>
      <Nav />
      <ScrollGuide />
      <main id="main">
        <Hero />
        <Journey />
        <Amenities />
        <Homes />
        <Visit />
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-page flex-col gap-3 px-4 py-10 text-sm text-mist md:flex-row md:items-center md:justify-between md:px-8">
          <p className="display text-xl text-bone">ALTA</p>
          <p>Sizes, floors and availability shown on this page are sample data.</p>
          <p>Images and films are artist impressions.</p>
        </div>
      </footer>
    </>
  );
}
