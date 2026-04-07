import { PrismaClient } from '@prisma/client';
import { CardPlatform } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create some pokemon cards
  const cards = [
    {
      name: 'Mew',
      set: 'Mew Ex',
      number: '232',
      year: 2001,
      edition: '1st Edition',
      variant: 'Holo',
      imageUrl: 'https://images.pokemontcg.io/images/cards/large/card.png',
      slug: 'mew-ex-232',
    },
    {
      name: 'Charizard',
      set: 'Base Set',
      number: '4',
      year: 1999,
      edition: 'Unlimited',
      variant: 'Holo',
      imageUrl: 'https://images.pokemontcg.io/images/cards/large/card.png',
      slug: 'charizard-4',
    },
    {
      name: 'Blastoise',
      set: 'Base Set',
      number: '2',
      year: 1999,
      edition: 'Unlimited',
      variant: 'Holo',
      imageUrl: 'https://images.pokemontcg.io/images/cards/large/card.png',
      slug: 'blastoise-2',
    },
    {
      name: 'Lugia',
      set: 'Neo Genesis',
      number: '9',
      year: 2001,
      edition: '1st Edition',
      variant: 'Holo',
      imageUrl: 'https://images.pokemontcg.io/images/cards/large/card.png',
      slug: 'lugia-9',
    },
    {
      name: 'Pikachu',
      set: 'Base Set',
      number: '58',
      year: 1999,
      edition: 'Shadowless',
      variant: 'Holo',
      imageUrl: 'https://images.pokemontcg.io/images/cards/large/card.png',
      slug: 'pikachu-58',
    },
    {
      name: 'Mewtwo',
      set: 'Base Set',
      number: '10',
      year: 1999,
      edition: 'Unlimited',
      variant: 'Holo',
      imageUrl: 'https://images.pokemontcg.io/images/cards/large/card.png',
      slug: 'mewtwo-10',
    },
    {
      name: 'Mega Charizard X',
      set: 'Phantasmal Flames',
      number: '125',
      year: 2004,
      edition: '1st Edition',
      variant: 'Ex',
      imageUrl: 'https://images.pokemontcg.io/images/cards/large/card.png',
      slug: 'mega-charizard-x',
    },
    {
      name: 'Team Rocket's Mewtwo Ex',
      set: 'Destined Rivals',
      number: '231',
      year: 2000,
      edition: '1st Edition',
      variant: 'Ex',
      imageUrl: 'https://images.pokemontcg.io/images/cards/large/card.png',
      slug: 'team-rockets-mewtwo-ex',
    },
  ];

  for (const card in cards) {
    const createdCard = await prisma.card.create({
      data: card,
    });

    // Add diverse listings for this card
    const listings = [
      constructListing('SlabGrader', 5, 125.01, card.slug),
      constructListing('ebay', 4, 114.4, card.slug),
      constructListing('PSA', 16, 145.00, card.slug),
      constructListing('CardMarket', 30, 139.99, card.slug),
      constructListing('PWCC', 8, 129.99, card.slug),
      constructListing('SlabGrades', 11, 128.99, card.slug),
    ];

    for const listing of listings) {
      await prisma.listing.create({
        data: listing,
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

function constructListing(platform: string, count: number, price: number, cardSlug: string) {
  return {
    card: {
      connect: {
        slug: cardSlug,
      },
    },
    platform,
    price,
    priceEUR: price,
    url: `https://example.com/${cardSlug}`,
    cert: `PSA 10`,
    grade: `PSA 10`,
    edition: `Unlimited`,
    buyerFee: `0%`,
    sellerFee: `1%`,
  };
}
