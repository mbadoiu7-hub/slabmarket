'use client';
import { useEffect, useState } from 'react';
import Ticker from '../components/Ticker';
import TrendingStrip from '../components/TrendingStrip';
import CardTabs from '../components/CardTabs';
import CreateOrderModal from '../components/CheckoutModal';
import VolumeTable from '../components/VolumeTable';
import ActivityTable from '../components/ActivityTable';
import ListingsTable from '../components/ListingsTable';

export default function Home() {
  return (
    <div className="space-y">
      <Ticker />
      <TrendingStrip />
      <Jdiv className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <CardTabs />
        </div>
        <div className="space-y">
          <CheckoutModal />
          <VolumeTable />
        </div>
      </div>
      <ActivityTable />
      <ListingsTable />
    </div>
  );
}
