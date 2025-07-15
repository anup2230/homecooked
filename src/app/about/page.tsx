import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="bg-background">
      <section className="py-12 md:py-20 bg-secondary/50">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tight">
            About Homecooked
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-foreground/80">
            Connecting communities through the love of authentic food.
          </p>
        </div>
      </section>

      <section className="container py-16 md:py-24">
        <div className="max-w-4xl mx-auto space-y-6">
          <p className="text-muted-foreground text-lg text-center">
            Homecooked was born from a simple idea: there's a world full of passionate home cooks and neighbors craving authentic, soulful meals. Our mission is to be the bridge that connects them.
          </p>
          <p className="text-muted-foreground text-lg text-center">
            We provide a platform for independent home chefs to turn their kitchens into a business and share their culinary talents. We believe that every dish has a story, and the best ones are shared. By empowering local cooks, we're building a community that celebrates diversity, tradition, and the simple joy of a delicious meal made with love.
          </p>
          <p className="text-muted-foreground text-lg text-center">
            Whether you're an independent cook looking to share your passion or a neighbor looking for a taste of home, Homecooked is your place at the table.
          </p>
        </div>
      </section>
    </div>
  );
}
