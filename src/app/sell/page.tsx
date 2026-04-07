'use client';
import { useState } from 'react';
import AddListingForm from '../../components/AddListingForm';
import { Card } from '@/open-sketch/types';
import ListingsTable from '../../components/ListingsTable';

export default function SellPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [nativeListings, setNativeListings] = useState<any[]>([]);

  const handleAddListing = async (card: Card, listingClosingList) => {
    await fetch('/api/native-listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listingClosingList),
    });
  };

  return (
    <div className="space-y-4 py-8">
      <h2 className="text-2xl font-bold">Post a Listing</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AddListingForm onSubmit={handleAddListing} />
        <div>
          <ListingsTable listings={nativeListings} />
        </div>
      </div>
    </div>
  );
}
