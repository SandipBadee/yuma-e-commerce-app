"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import { UserRound, Phone, MapPinHouse, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function ProfileEditorCard({ initialUser }) {
  const { data: session } = useSession();
  const [name, setName] = React.useState(initialUser?.name || '');
  const [phone, setPhone] = React.useState(initialUser?.profile?.phone || '');
  const [address, setAddress] = React.useState(initialUser?.profile?.address || '');
  const [isSaving, setIsSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');

  async function onSubmit(event) {
    event.preventDefault();
    if (!session?.accessToken) {
      setError('Please login again to update your profile.');
      return;
    }

    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.message || 'Failed to update profile');
        return;
      }

      setMessage('Profile updated successfully.');
    } catch (_err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
      <h2 className="text-lg font-bold text-stone-900 mb-6">Edit Profile</h2>

      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1 block">Name</span>
          <div className="flex items-center gap-2 border border-stone-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-red-200">
            <UserRound size={16} className="text-stone-400" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              className="w-full outline-none text-stone-800 bg-transparent"
              placeholder="Your full name"
              required
              minLength={2}
            />
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1 block">Phone Number</span>
          <div className="flex items-center gap-2 border border-stone-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-red-200">
            <Phone size={16} className="text-stone-400" />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              className="w-full outline-none text-stone-800 bg-transparent"
              placeholder="e.g. +358 40 123 4567"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1 block">Address</span>
          <div className="flex items-center gap-2 border border-stone-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-red-200">
            <MapPinHouse size={16} className="text-stone-400" />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              type="text"
              className="w-full outline-none text-stone-800 bg-transparent"
              placeholder="Street and apartment details"
            />
          </div>
        </label>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {message ? <p className="text-sm text-green-700">{message}</p> : null}

        <Button type="submit" className="border-none" disabled={isSaving}>
          {isSaving ? (
            <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" />Saving...</span>
          ) : (
            'Save Changes'
          )}
        </Button>
      </form>
    </div>
  );
}
