import { useEffect,useState } from "react";
import { useAppStore } from "@/stores/app-store";
/** Render persisted browser data only after the initial server/client render matches. */
export function useAppHydrated(){const [ready,setReady]=useState(false);useEffect(()=>{const off=useAppStore.persist.onFinishHydration(()=>setReady(true));setReady(useAppStore.persist.hasHydrated());return off},[]);return ready}
