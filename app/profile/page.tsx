import React from 'react';
import { Metadata } from 'next';
import { ProfileClient } from './ProfileClient';

export const metadata: Metadata = {
  title: 'My Profile & Registered Events | EMPIRIAL 2.0',
  description: 'View your registered prop trading tournaments, giveaways, bootcamps, and Discord passports.',
};

export default function ProfilePage() {
  return <ProfileClient />;
}
