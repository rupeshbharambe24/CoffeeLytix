"use client";

import { useEffect, useState } from "react";
import type { FirestoreError } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import * as db from "@/lib/db";
import type { Bean, Cafe, Entry, Equipment } from "@/lib/types";

interface ListState<T> {
  data: T[];
  loading: boolean;
  error: FirestoreError | null;
}

interface DocState<T> {
  data: T | null;
  loading: boolean;
  error: FirestoreError | null;
}

type ErrCb = (error: FirestoreError) => void;
type Unsub = () => void;
type ListSubscribe<T> = (uid: string, cb: (data: T[]) => void, onError?: ErrCb) => Unsub;
type DocSubscribe<T> = (
  uid: string,
  id: string,
  cb: (data: T | null) => void,
  onError?: ErrCb,
) => Unsub;

function useListSubscription<T>(
  uid: string | undefined,
  subscribe: ListSubscribe<T>,
): ListState<T> {
  const [state, setState] = useState<ListState<T>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!uid) return;
    let active = true;
    const unsubscribe = subscribe(
      uid,
      (data) => {
        if (active) setState({ data, loading: false, error: null });
      },
      (error) => {
        if (active) setState({ data: [], loading: false, error });
      },
    );
    return () => {
      active = false;
      unsubscribe();
    };
  }, [uid, subscribe]);

  return uid ? state : { data: [], loading: false, error: null };
}

function useDocSubscription<T>(
  uid: string | undefined,
  id: string | undefined,
  subscribe: DocSubscribe<T>,
): DocState<T> {
  const [state, setState] = useState<DocState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!uid || !id) return;
    let active = true;
    const unsubscribe = subscribe(
      uid,
      id,
      (data) => {
        if (active) setState({ data, loading: false, error: null });
      },
      (error) => {
        if (active) setState({ data: null, loading: false, error });
      },
    );
    return () => {
      active = false;
      unsubscribe();
    };
  }, [uid, id, subscribe]);

  return uid && id ? state : { data: null, loading: false, error: null };
}

/** Subscribe to entries — pass `uidOverride` to read a friend's (Compare page). */
export function useEntries(uidOverride?: string): ListState<Entry> {
  const { user } = useAuth();
  return useListSubscription(uidOverride ?? user?.uid, db.subscribeEntries);
}

export function useEntry(id: string | undefined): DocState<Entry> {
  const { user } = useAuth();
  return useDocSubscription(user?.uid, id, db.subscribeEntry);
}

export function useBeans(uidOverride?: string): ListState<Bean> {
  const { user } = useAuth();
  return useListSubscription(uidOverride ?? user?.uid, db.subscribeBeans);
}

export function useBean(id: string | undefined): DocState<Bean> {
  const { user } = useAuth();
  return useDocSubscription(user?.uid, id, db.subscribeBean);
}

export function useCafes(uidOverride?: string): ListState<Cafe> {
  const { user } = useAuth();
  return useListSubscription(uidOverride ?? user?.uid, db.subscribeCafes);
}

export function useCafe(id: string | undefined): DocState<Cafe> {
  const { user } = useAuth();
  return useDocSubscription(user?.uid, id, db.subscribeCafe);
}

export function useEquipment(uidOverride?: string): ListState<Equipment> {
  const { user } = useAuth();
  return useListSubscription(uidOverride ?? user?.uid, db.subscribeEquipment);
}
