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
            Bringing the heart of home cooking to your table.
          </p>
        </div>
      </section>

      <section className="container py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg">
            <Image
              src="https://placehold.co/600x600.png"
              alt="Happy people sharing a meal"
              fill
              className="object-cover"
              data-ai-hint="people eating"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-headline">Our Story</h2>
            <p className="text-muted-foreground text-lg">
              Homecooked was born from a simple idea: food tastes better when it's made with love. We saw a world full of passionate home cooks and neighbors craving authentic, soulful meals. Our mission is to connect them.
            </p>
            <p className="text-muted-foreground text-lg">
              We believe that every dish has a story, and the best ones are shared. By empowering local chefs to share their culinary talents, we're building a community that celebrates diversity, tradition, and the simple joy of a delicious, home-cooked meal.
            </p>
            <p className="text-muted-foreground text-lg">
              Whether you're a cook looking to share your passion or a neighbor looking for a taste of home, you've found your place at the table.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
